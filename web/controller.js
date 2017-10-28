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

  function perform(action, ctrlno, button) {
    send_json({
      controller: ctrlno,
      action: action,
      button: button
    });
  }

  // ELEMENT DEFINITIONS

  var b = document.body;
  var controller = document.getElementById("controller");
  var buttons = document.querySelectorAll("#buttons > div");
  var mainpad = document.querySelector(".mainpad");

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
  }
  window.addEventListener("resize", onResize);
  onResize();

  mainpad.addEventListener("touchmove", function(e) {
    e.preventDefault();
    var touchobj = e.changedTouches[0];
    console.log(touchobj.clientX, touchobj.clientY);
  });

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
