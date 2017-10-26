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

    $(window).resize(function() {
        var gc_control = $(".gc-control");
        var width = $(window).width();
        var height = $(window).height();
        var gc_width = width;
        var gc_height = 9/16 * width;
        if(width/height > 16/9) {
            width = height * 16/9;
        } else if(width/height < 16/9) {
            height = width * 9/16;
        }
        gc_control.width(width);
        gc_control.height(height);
    });
    $(window).resize();


    $(".gc-control div").on('touchend', function(e) {
        e.preventDefault();
        $(this).removeClass("pressed")
    });

    $(".mainpad").on('touchmove', function(e) {
        e.preventDefault();
        var touchobj = e.changedTouches[0];
        console.log(touchobj.clientX, touchobj.clientY);
    });

    function rectangleSelect(selector, x1, y1, x2, y2) {
    var elements = [];
    jQuery(selector).each(function() {
        var $this = jQuery(this);
        var offset = $this.offset();
        var x = offset.left;
        var y = offset.top;
        var w = $this.width();
        var h = $this.height();

        if (x >= x1 
        && y >= y1 
        && x + w <= x2 
        && y + h <= y2) {
        // this element fits inside the selection rectangle
        elements.push($this.get(0));
        }
    });
    return elements;
    }

    document.body.addEventListener('touchstart', function(event) {
        event.preventDefault();
        var elements = event.targetTouches;
        for(var i =0; i < event.touches.length; i++) {
            var touch = event.touches[i];
            var x = touch.clientX, y = touch.clientY, rx = touch.radiusX, ry = touch.radiusY;

            var x1 = x-rx;
            var y1 = y-ry;

            var x2 = x+rx;
            var y2 = y+ry;
            console.log(rectangleSelect(".gc-control div", x1, y1, x2, y2));
        }
    }, false);

    function bind_button(id, button) {
        $(id).on('touchstart', function(e) {
            perform("press", controller_no, button);
        });
        $(id).on('touchend', function(e) {
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
