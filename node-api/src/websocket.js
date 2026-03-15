const WebSocket = require("ws");

let wss;

function initWebSocket(server) {

  wss = new WebSocket.Server({
    server,
    path: "/ws/images"
  });

  wss.on("connection", (ws, req) => {

    console.log("WebSocket client connected");

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });

    ws.on("error", (err) => {
      console.error("WebSocket error:", err.message);
    });

  });

}

function broadcastImage(data) {

  if (!wss) {
    console.warn("WebSocket not initialized");
    return;
  }

  const payload = JSON.stringify(data);

  wss.clients.forEach((client) => {

    if (client.readyState === WebSocket.OPEN) {

      try {
        client.send(payload);
      } catch (err) {
        console.error("Broadcast error:", err.message);
      }

    }

  });

}

// Socket.io ke getIO().emit() ki jagah — vehicle-detected events ke liye
function getIO() {
  return {
    emit: (event, data) => {
      if (!wss) {
        console.warn("WebSocket not initialized");
        return;
      }

      const payload = JSON.stringify({ event, data });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          try {
            client.send(payload);
          } catch (err) {
            console.error("Broadcast error:", err.message);
          }
        }
      });
    }
  };
}

module.exports = {
  initWebSocket,
  broadcastImage,
  getIO
};