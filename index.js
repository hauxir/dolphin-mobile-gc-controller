var finalhandler = require("finalhandler");
var WebSocketServer = require("websocket").server;
var exec = require("child_process").exec;
var os = require("os");
var serveStatic = require("serve-static");

var http = require("http");

var files = serveStatic("web", { index: ["index.html"] });

var server = http.createServer(function(request, response) {
  files(request, response, finalhandler(request, response));
});
server.listen(1889, function() {});

wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on("request", function(request) {
  var connection = request.accept();

  connection.on("message", function(message) {
    if (message.type === "utf8") {
      var json = JSON.parse(message.utf8Data);
      var echostring = json.action + " " + json.button;

      // Hack to enable controlling the mainpad with basic U D R L commands, remove soon
      if (json.button == "left") {
        echostring = "set main 0 0.5";
      } else if (json.button == "right") {
        echostring = "set main 1 0.5";
      } else if (json.button == "up") {
        echostring = "set main 0.5 1";
      } else if (json.button == "down") {
        echostring = "set main 0.5 0";
      }
      if (
        ["up", "down", "left", "right"].indexOf(json.button) != -1 &&
        json.action == "release"
      ) {
        echostring = "set main 0.5 0.5";
      }


      exec(
        "echo '" +
          echostring.toUpperCase() +
          "' > '" +
          os.homedir() +
          "/Library/Application Support/Dolphin/Pipes/ctrl" +
          json.controller +
          "'"
      );
    }
  });
  connection.on("close", function(connection) {});
});
