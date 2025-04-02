/* eslint-disable no-undef */
//import "signalr";
import "signalr/jquery.signalR.min";

export default {
  install: (app) => {
    // Plugin code goes here
    let eventBus = app.config.globalProperties.$eventBus;
    let connection = null;
    let proxy = null;
    let startedPromise = null;
    let connected = false;

    connection = $.hubConnection(window.xmap.serverAddress);
    proxy = connection.createHubProxy("MainHub");

    connection.stateChanged(function(change) {
      console.log(change);
      if (change.newState === $.signalR.connectionState.reconnecting) {
        console.log("Re-connecting");
      } else if (change.newState === $.signalR.connectionState.connected) {
        console.log("The server is online");
      }else if (change.newState === 4) {
        setTimeout(() => {
          console.warn("attempting to reconnect");
          start();
        }, 5000);
      }
    });


    proxy.on("hubmessage", (data) => {
      var x = {};
      try {
        x = JSON.parse(data);
      } catch {
        //
      }
      eventBus.$emit(
        x.emit !== undefined ? x.emit : "hub-message",
        x.payload !== undefined ? x.payload : null
      );
    });

    function start() {
      startedPromise = connection
        .start({ jsonp: false, transport: ["webSockets", "longPolling"] })
        .done(() => {
          // console.log('Hub connection: ' + connection.id)
          connected = true;
          eventBus.$emit("hub-connected", connection.id);
        })
        .fail(() => {
          console.warn("Could not connect to hub");
        });
    }

    start();

    const SendMessage = (data) => {
      //console.warn("HUB SendMessage", !startedPromise, connected, data);
      if (!startedPromise) return; // to ensure no invocation happens until the connection is established

      if (connected) {
        proxy.invoke("SendMessage", data);
      }
    };

    app.provide("HubSend", SendMessage);
  },
};
