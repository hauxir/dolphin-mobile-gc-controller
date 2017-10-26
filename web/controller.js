(function() {

    window.onhashchange = function() {
        window.location.reload();
    }

    var ws;
    var controller_no = Math.min( parseInt(window.location.hash.substr(1)) || 1, 4);

    function init_ws() {
        ws = new WebSocket("ws://" + window.location.host);
    };

    init_ws();

    function send(data) {
        if(ws.readyState === ws.CLOSED) {
            init_ws();
            return;
        } else if(ws.readyState !== ws.OPEN) {
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
    var gc_control = document.querySelector('.gc-control');
    var buttons = document.querySelectorAll('.gc-control div');
    var mainpad = document.querySelector('.mainpad');

    function onResize() {
      var width = window.innerWidth;
      var height = window.innerHeight;
      var gc_width = width;
      var gc_height = 9/16 * width;
      if(width/height > 16/9) {
          width = height * 16/9;
      } else if(width/height < 16/9) {
          height = width * 9/16;
      }
      gc_control.style.width = width+'px';
      gc_control.style.height = height+'px';
    }
    window.addEventListener('resize', onResize);
    onResize();

    buttons.forEach(function(button) {
      button.addEventListener('touchend', function(e) {
        e.preventDefault();
        button.classList.remove('pressed');
      })
    });

    mainpad.addEventListener('touchmove', function(e) {
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

        if (distX > (w/2 + rad)) return false;
        if (distY > (h/2 + rad)) return false;
        if (distX <= (w/2)) return true;
        if (distY <= (h/2)) return true;

        var dx = distX-w/2;
        var dy = distY-h/2;
        return (dx*dx+dy*dy <= rad^2);
      });
    }

    b.addEventListener('touchstart', function(event) {
        event.preventDefault();
        var touches = Array.from(event.touches);
        touches.forEach(function(touch) {
          var x = touch.clientX;
          var y = touch.clientY;
          var rad = touch.radiusX;
          console.log(elementsIntersectingTouch(".gc-control div", x, y, rad));
        });
    }, false);

    function bind_button(id, button) {
        var button = document.querySelector(id);
        button.addEventListener('touchstart', function(e) {
          perform("press", controller_no, button);
        });
        button.addEventListener('touchend', function(e) {
          perform("release", controller_no, button);
        });
    }

    /*
    bind_button(".abtn", "a");
    bind_button(".bbtn", "b");
    bind_button(".xbtn", "x");
    bind_button(".ybtn", "y");
    bind_button(".lbtn", "l");
    bind_button(".rbtn", "r");
    bind_button(".zbtn", "z");
    bind_button(".dpadup", "d_up");
    bind_button(".dpaddown", "d_down");
    bind_button(".dpadleft", "d_left");
    bind_button(".dpadright", "d_right");
    bind_button(".startbtn", "start");
    */

})();
