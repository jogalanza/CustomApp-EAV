import * as signalR from "@microsoft/signalr";

const SignalRPlugin = {
  install(app, options) {
    let eventBus = app.config.globalProperties.$eventBus;
    //console.log("SignalRPlugin", eventBus);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(options.hubUrl)
      .withAutomaticReconnect()
      .build();

    // Handle WebSocket connection events
    const handleConnectionEvents = () => {
      connection.onclose((error) => {
        console.log("WebSocket connection closed:", error);
        eventBus.$emit("on-ws-status-change", false);
      });

      connection.onreconnected((connectionId) => {
        console.log("WebSocket reconnected. Connection ID:", connectionId);
        eventBus.$emit("on-ws-status-change", true);
      });
    };

    const hub = {
      startConnection: () => {
        connection
          .start()
          .then(() => {
            console.log("SignalR Connected");

            if (connection.connectionId) {
              window.sessionStorage.setItem("hubid", connection.connectionId);
              eventBus.$emit("on-ws-connect", connection.connectionId);
            }

            connection.on("ReceiveMessage", (data) => {
              if (data) {
                try {
                  var x = JSON.parse(data);

                  if (x) {
                    if (x.emit) {
                      eventBus.$emit(x.emit, x.payload);
                    } else {
                      eventBus.$emit("on-ws-message", x);
                    }
                  }
                } catch {
                  //
                }
              }
            });

            handleConnectionEvents();
          })
          .catch((err) => console.error("Error connecting to SignalR:", err));
      },

      sendMessage: (obj) => {
        var payload = JSON.stringify({});
        try {
          payload = JSON.stringify(obj);
        } catch {
          //
        }
        connection.invoke("SendMessage", payload).catch((err) => {
          console.error("Error invoking SendMessage:", err);
        });
      },
    };

    app.config.globalProperties.$signalR = hub;
    app.provide("hub", hub);
    app.provide("HubSend", hub.sendMessage);
    hub.startConnection();
  },
};

export default SignalRPlugin;
