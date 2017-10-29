(function() {
  var BUTTONS = [
    "a",
    "b",
    "x",
    "y",
    "z",
    "r",
    "l",
    "start",
    "dpadup",
    "dpaddown",
    "dpadleft",
    "dpadright"
  ];
  var PADS = ["main", "c"];
  var AR_WIDTH = 16;
  var AR_HEIGHT = 9;

  var MAINPAD_CENTER_X = 12,
    MAINPAD_CENTER_Y = 30,
    MAINPAD_RADIUS = 4,
    MAINPAD_WIDTH = 11.6,
    MAINPAD_HEIGHT = 20.4;

  var CPAD_CENTER_X = 61,
    CPAD_CENTER_Y = 75,
    CPAD_RADIUS = 2,
    CPAD_WIDTH = 10.7,
    CPAD_HEIGHT = 18.2;

  function ControllerClient(host) {
    this._controller_no = 1;
    this._host = host;
    this._ws = null;
    this._connect = function() {
      this._ws = new WebSocket("ws://" + this._host);
    };
    this._send = function(data) {
      if (!this._ws || this._ws.readyState === this._ws.CLOSED) {
        this._connect();
        return;
      } else if (this._ws.readyState !== this._ws.OPEN) {
        // Ignore all commands until socket opens
        return;
      } else {
        this._ws.send(data);
      }
    };
    this._send_json = function(data) {
      this._send(JSON.stringify(data));
    };
    this._perform = function(action, input_name, value) {
      this._send_json({
        controller: this._controller_no,
        action: action,
        input_name: input_name,
        value: value
      });
    };
    var self = this;
    BUTTONS.forEach(function(button) {
      self["press_" + button] = function() {
        self._perform("press", button);
      };
      self["release_" + button] = function() {
        self._perform("release", button);
      };
    });
    PADS.forEach(function(pad_name) {
      self["set_pad_" + pad_name] = function(x, y) {
        self._perform("set", pad_name, x + " " + y);
      };
    });
    this.set_controller = function(controller_no) {
      this._controller_no = controller_no;
    };
  }

  var controller_client = new ControllerClient(window.location.host);

  //Element definitions
  var controller = document.getElementById("controller");
  var buttons = document.querySelectorAll("#buttons > div");
  var mainpad = document.getElementById("mainpad");
  var cpad = document.getElementById("cpad");

  function maintain_aspect_ratio() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var aspect_ratio = width / height;
    if (aspect_ratio > AR_WIDTH / AR_HEIGHT) {
      width = height * AR_WIDTH / AR_HEIGHT;
    } else if (aspect_ratio < AR_WIDTH / AR_HEIGHT) {
      height = width * AR_HEIGHT / AR_WIDTH;
    }
    controller.style.width = width + "px";
    controller.style.height = height + "px";
  }

  function init_pad(pad_name, element, cx, cy, rad, width, height) {
    element.style.width = width + "%";
    element.style.height = height + "%";
    element.addEventListener("touchmove", function(e) {
      e.preventDefault();
      e.stopPropagation();
      var bottom_left = [cx - rad, cy - rad * AR_WIDTH / AR_HEIGHT];
      var top_right = [cx + rad, cy + rad * AR_WIDTH / AR_HEIGHT];
      var touchobj = e.changedTouches[0];
      var x_percentage = touchobj.clientX / window.innerWidth * 100 - width / 2;
      var y_percentage =
        touchobj.clientY / window.innerHeight * 100 - height / 2;
      x_percentage = Math.min(
        Math.max(x_percentage, bottom_left[0]),
        top_right[0]
      );
      y_percentage = Math.min(
        Math.max(y_percentage, bottom_left[1]),
        top_right[1]
      );
      var pad_value = [
        (x_percentage - bottom_left[0]) / (top_right[0] - bottom_left[0]),
        Math.abs(
          (y_percentage - bottom_left[1]) / (top_right[1] - bottom_left[1]) - 1
        )
      ];
      controller_client["set_pad_" + pad_name](
        pad_value[0].toFixed(3),
        pad_value[1].toFixed(3)
      );
      element.style.top = y_percentage + "%";
      element.style.left = x_percentage + "%";
    });
    element.addEventListener("touchend", function(e) {
      e.preventDefault();
      element.style.left = cx + "%";
      element.style.top = cy + "%";
      controller_client["set_pad_" + pad_name](0.5, 0.5);
    });
    element.dispatchEvent(new Event("touchend"));
  }

  function elements_intersecting_touch(selector, cx, cy, rad) {
    var elements = Array.from(document.querySelectorAll(selector));
    return elements.filter(function(element) {
      var x = element.offsetLeft;
      var y = element.offsetTop;
      var w = element.offsetWidth;
      var h = element.offsetHeight;

      var distX = Math.abs(cx - x - w / 2);
      var distY = Math.abs(cy - y - h / 2);

      if (distX > w / 2 + rad) return false;
      if (distY > h / 2 + rad) return false;
      if (distX <= w / 2) return true;
      if (distY <= h / 2) return true;

      var dx = distX - w / 2;
      var dy = distY - h / 2;
      return (dx * dx + dy * dy <= rad) ^ 2;
    });
  }

  function touch_handler(event) {
    event.preventDefault();
    var touches = Array.from(event.touches);
    var buttons = Array.from(document.querySelectorAll("#buttons div"));
    function pressedButtons() {
      return buttons
        .filter(function(el) {
          return el.classList.contains("pressed");
        })
        .map(function(el) {
          return el.id;
        });
    }
    var pressed_before_touch = pressedButtons();
    pressed_before_touch.forEach(function(button) {
      var el = document.getElementById(button);
      el.classList.remove("pressed");
    });
    touches.forEach(function(touch) {
      var x = touch.clientX,
        y = touch.clientY;
      var rad = touch.radiusX;
      var touched_buttons = elements_intersecting_touch(
        "#buttons div",
        x - controller.offsetLeft,
        y - controller.offsetTop,
        rad
      );
      touched_buttons.forEach(function(el) {
        el.classList.add("pressed");
      });
    });
    var currently_pressed = pressedButtons();
    var buttons_to_release = pressed_before_touch.filter(function(button) {
      return currently_pressed.indexOf(button) == -1;
    });
    var buttons_to_press = currently_pressed.filter(function(button) {
      return pressed_before_touch.indexOf(button) == -1;
    });
    buttons_to_release.forEach(function(button) {
      controller_client["release_" + button]();
    });
    buttons_to_press.forEach(function(button) {
      controller_client["press_" + button]();
    });
  }

  ["touchstart", "touchend", "touchmove"].forEach(function(event_name) {
    controller.addEventListener(event_name, touch_handler, false);
  });

  init_pad(
    "main",
    mainpad,
    MAINPAD_CENTER_X,
    MAINPAD_CENTER_Y,
    MAINPAD_RADIUS,
    MAINPAD_WIDTH,
    MAINPAD_HEIGHT
  );
  init_pad(
    "c",
    cpad,
    CPAD_CENTER_X,
    CPAD_CENTER_Y,
    CPAD_RADIUS,
    CPAD_WIDTH,
    CPAD_HEIGHT
  );

  window.onhashchange = function() {
    var controller_no = Math.min(
      parseInt(window.location.hash.substr(1)) || 1,
      4
    );
    controller_client.set_controller(controller_no);
  };
  window.dispatchEvent(new Event("hashchange"));
  window.addEventListener("resize", maintain_aspect_ratio);
  window.dispatchEvent(new Event("resize"));
})();
