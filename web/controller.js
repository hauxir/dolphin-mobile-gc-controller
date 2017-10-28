(function() {
  window.onhashchange = function() {
    window.location.reload();
  };

  var ws;
  var controller_no = Math.min(
    parseInt(window.location.hash.substr(1)) || 1,
    4
  );

  function init_ws() {
    ws = new WebSocket("ws://" + window.location.host);
  }

  init_ws();

  function send(data) {
    if (ws.readyState === ws.CLOSED) {
      init_ws();
      return;
    } else if (ws.readyState !== ws.OPEN) {
      // Ignore all commands until socket opens
      return;
    } else {
      ws.send(data);
    }
  }

  function send_json(data) {
    send(JSON.stringify(data));
  }

  function perform(action, ctrlno, button, value) {
    send_json({
      controller: ctrlno,
      action: action,
      button: button,
      value: value
    });
  }

  // ELEMENT DEFINITIONS

  var b = document.body;
  var controller = document.getElementById("controller");
  var buttons = document.querySelectorAll("#buttons > div");

  var mainpad = document.querySelector(".mainpad");
  var mainpad_center = [12, 30];
  var mainpad_dimensions = [11.6, 20.4];
  mainpad.style.width = mainpad_dimensions[0] + "%";
  mainpad.style.height = mainpad_dimensions[1] + "%";

  function resetMainPad() {
    mainpad.style.left = mainpad_center[0] + "%";
    mainpad.style.top = mainpad_center[1] + "%";
  }

  var cpad = document.querySelector(".cpad");
  var cpad_center = [61, 75];
  var cpad_dimensions = [10.7, 18.2];
  cpad.style.width = cpad_dimensions[0] + "%";
  cpad.style.height = cpad_dimensions[1] + "%";

  function resetCPad() {
    cpad.style.left = cpad_center[0] + "%";
    cpad.style.top = cpad_center[1] + "%";
  }

  function onResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var gc_width = width;
    var gc_height = 9 / 16 * width;
    if (width / height > 16 / 9) {
      width = height * 16 / 9;
    } else if (width / height < 16 / 9) {
      height = width * 9 / 16;
    }
    controller.style.width = width + "px";
    controller.style.height = height + "px";
    resetMainPad();
    resetCPad();
  }
  window.addEventListener("resize", onResize);
  onResize();

  function addPadListener(
    element,
    cx,
    cy,
    rad,
    width,
    height,
    ctrl_name,
    reset_cb
  ) {
    element.addEventListener("touchmove", function(e) {
      e.preventDefault();
      e.stopPropagation();
      var bottom_left = [cx - rad, cy - rad * 16 / 9];
      var top_right = [cx + rad, cy + rad * 16 / 9];
      var touchobj = e.changedTouches[0];
      var x_percentage = touchobj.clientX / window.innerWidth * 100 - width / 2;
      var y_percentage = touchobj.clientY / window.innerHeight * 100 - height / 2;
      x_percentage = Math.min(
        Math.max(x_percentage, bottom_left[0]),
        top_right[0]
      );
      y_percentage = Math.min(
        Math.max(y_percentage, bottom_left[1]),
        top_right[1]
      );

      var pad_values = [
        (x_percentage - bottom_left[0]) / (top_right[0] - bottom_left[0]),
        Math.abs(
          (y_percentage - bottom_left[1]) / (top_right[1] - bottom_left[1]) - 1
        )
      ];
      perform(
        "set",
        controller_no,
        ctrl_name,
        pad_values[0] + " " + pad_values[1]
      );
      element.style.top = y_percentage + "%";
      element.style.left = x_percentage + "%";
    });
    element.addEventListener("touchend", function(e) {
      e.preventDefault();
      reset_cb();
      perform("set", controller_no, ctrl_name, 0.5 + " " + 0.5);
    });
  }

  addPadListener(
    mainpad,
    mainpad_center[0],
    mainpad_center[1],
    4,
    mainpad_dimensions[0],
    mainpad_dimensions[1],
    "main",
    resetMainPad
  );

  addPadListener(
    cpad,
    cpad_center[0],
    cpad_center[1],
    2,
    cpad_dimensions[0],
    cpad_dimensions[1],
    "c",
    resetCPad
  );

  function elementsIntersectingTouch(selector, cx, cy, rad) {
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

  function updateTouch(event) {
    event.preventDefault();
    var touches = Array.from(event.touches);
    var buttons = Array.from(document.querySelectorAll("#buttons div"));
    function pressedButtons() {
      return buttons
        .filter(function(button) {
          return button.classList.contains("pressed");
        })
        .map(function(button) {
          return button.id;
        });
    }
    var pressed_before_touch = pressedButtons();
    pressed_before_touch.forEach(function(button) {
      var el = document.getElementById(button);
      el.classList.remove("pressed");
    });
    touches.forEach(function(touch) {
      var x = touch.clientX;
      var y = touch.clientY;
      var rad = touch.radiusX;
      var touched_buttons = elementsIntersectingTouch(
        "#buttons div",
        x - controller.offsetLeft,
        y - controller.offsetTop,
        rad
      );
      touched_buttons.forEach(function(button) {
        button.classList.add("pressed");
      });
    });
    var currently_pressed = pressedButtons();
    pressed_before_touch.forEach(function(button) {
      if (currently_pressed.indexOf(button) == -1) {
        perform("release", controller_no, button);
      }
    });
    currently_pressed.forEach(function(button) {
      if (pressed_before_touch.indexOf(button) == -1) {
        perform("press", controller_no, button);
      }
    });
  }

  controller.addEventListener("touchstart", updateTouch, false);
  controller.addEventListener("touchend", updateTouch, false);
  controller.addEventListener("touchmove", updateTouch, false);
})();
