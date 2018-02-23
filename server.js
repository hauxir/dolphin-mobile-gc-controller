var finalhandler = require("finalhandler");
var WebSocketServer = require("websocket").server;
var exec = require("child_process").exec;
var os = require("os");
var stoppable = require("stoppable");
var serveStatic = require("serve-static");
var http = require("http");

module.exports = function(port, successcb, errcb, ctrlcb) {
  var files = serveStatic("web", { index: ["index.html"] });

  var server = stoppable(
    http.createServer(function(request, response) {
      files(request, response, finalhandler(request, response));
    })
  );

  server.listen(port);

  if (server.listening) {
    var ip = require("ip");
    console.log(
      "Listening on http://" + ip.address() + (port == 80 ? "" : ":" + port)
    );
    successcb && successcb(ip.address(), port);
  }

  server.on("error", function(e) {
    console.log(e);
    errcb && errcb(e);
  });

  wsServer = new WebSocketServer({
    httpServer: server
  });

  wsServer.on("request", function(request) {
    var connection = request.accept();
    connection.on("message", function(message) {
      if (message.type === "utf8") {
        var json = JSON.parse(message.utf8Data);
        if (!(json.action && json.input_name)) return;
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
            "'",
          { timeout: 1000 }
        );
        console.log(
          "echo '" +
            input_string.toUpperCase() +
            "' > '" +
            os.homedir() +
            "/Library/Application Support/Dolphin/Pipes/ctrl" +
            json.controller +
            "'",
          { timeout: 1000 }
        );
        process.stdout.on("data", function(data) {
          console.log(data);
        });
        process.stderr.on("data", function(data) {
          console.log(data);
        });
        ctrlcb && ctrlcb(json);
      }
    });
  });
  return server;
};
