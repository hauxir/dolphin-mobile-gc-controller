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
      if(!(json.action && json.input_name)) return;
      var input_string = json.action + " " + json.input_name;
      if (json.value) {
        input_string = input_string + " " + json.value;
      }
      var process = exec(
        "echo '" +
          input_string.toUpperCase() +
          "' > '" +
          os.homedir() +
          "/Library/Application Support/Dolphin/Pipes/ctrl" +
          json.controller +
          "'"
      );
      process.stdout.on("data", function(data) {
        console.log(data);
      });
      process.stderr.on("data", function(data) {
        console.log(data);
      });
    }
  });
});
