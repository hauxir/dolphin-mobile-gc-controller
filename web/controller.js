var ws = new WebSocket("ws://" + window.location.host);
var controller_no = parseInt(window.location.hash.substr(1)) || 1;
window.onhashchange = function() {
    window.location.reload();
}

function send_json(data) {
    ws.send(JSON.stringify(data));
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

$(".gc-control div").on('touchstart', function(e) {
    e.preventDefault();
    $(this).addClass("pressed")
});

$(".gc-control div").on('touchend', function(e) {
    e.preventDefault();
    $(this).removeClass("pressed")
});

$(".mainpad").on('touchmove', function(e) {
    e.preventDefault();
    var touchobj = e.changedTouches[0];
    console.log(touchobj.clientX, touchobj.clientY);
});

document.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, false);

$(".abtn").on('touchstart', function(e) {
    perform("press", controller_no, "a");
});

$(".abtn").on('touchend', function(e) {
    perform("release", controller_no, "a");
});

$(".bbtn").on('touchstart', function(e) {
    perform("press", controller_no, "b");
});

$(".bbtn").on('touchend', function(e) {
    perform("release", controller_no, "b");
});

$(".xbtn").on('touchstart', function(e) {
    perform("press", controller_no, "x");
});

$(".xbtn").on('touchend', function(e) {
    perform("release", controller_no, "x");
});

$(".ybtn").on('touchstart', function(e) {
    perform("press", controller_no, "y");
});

$(".ybtn").on('touchend', function(e) {
    perform("release", controller_no, "y");
});

$(".startbtn").on('touchstart', function(e) {
    perform("press", controller_no, "start");
});

$(".startbtn").on('touchend', function(e) {
    perform("release", controller_no, "start");
});

$(".lbtn").on('touchstart', function(e) {
    perform("press", controller_no, "l");
});

$(".lbtn").on('touchend', function(e) {
    perform("release", controller_no, "l");
});

$(".rbtn").on('touchstart', function(e) {
    perform("press", controller_no, "r");
});

$(".rbtn").on('touchend', function(e) {
    perform("release", controller_no, "r");
});

$(".zbtn").on('touchstart', function(e) {
    perform("press", controller_no, "z");
});

$(".zbtn").on('touchend', function(e) {
    perform("release", controller_no, "z");
});

$(".dpadup").on('touchstart', function(e) {
    perform("press", controller_no, "d_up");
});

$(".dpadup").on('touchend', function(e) {
    perform("release", controller_no, "d_up");
});

$(".dpaddown").on('touchstart', function(e) {
    perform("press", controller_no, "d_down");
});

$(".dpaddown").on('touchend', function(e) {
    perform("release", controller_no, "d_down");
});

$(".dpadleft").on('touchstart', function(e) {
    perform("press", controller_no, "d_left");
});

$(".dpadleft").on('touchend', function(e) {
    perform("release", controller_no, "d_left");
});

$(".dpadright").on('touchstart', function(e) {
    perform("press", controller_no, "d_right");
});

$(".dpadright").on('touchend', function(e) {
    perform("release", controller_no, "d_right");
});
