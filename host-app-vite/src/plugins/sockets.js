//import eventBus from "../bus/eventBus"

export default {
  install: (app) => {
    // Plugin code goes here

    let websocket = null;
    let wsConnected = false;
    let shouldCloseWs = false;
    let retry = 0;
    let eventBus = app.config.globalProperties.$eventBus;

    //console.log("eventHub", app, eventBus);

    const Connect = () => {
      retry = retry + 1;
      var wsurl = "wss://localhost:44300/Hubs/ws.ashx"; // process.env.NODE_ENV === 'production' ? 'wss://localhost:44301/Hubs/as.ashx' : 'wss://localhost:44301/';
      if (window.xmap.wss) wsurl = window.xmap.wss;

      websocket = new WebSocket(wsurl);

      websocket.onopen = function() {
        wsConnected = true;
        shouldCloseWs = false;
        console.log("websocket connected", new Date());
        SendMessage("ping");
        eventBus.$emit("ws-connected", true);
        Heartbeat();
        GetActiveConns();
      };

      websocket.onmessage = OnMessage;

      websocket.onclose = function() {
        //console.warn("ws close", new Date());
        wsConnected = false;
        eventBus.$emit("ws-connected", false);
        if (!shouldCloseWs)
          setTimeout(function() {
            Connect();
          }, 3000);
      };
    };

    const Heartbeat = () => {
      if (!websocket) return;
      if (websocket.readyState !== 1) return;
      websocket.send("ping");
      setTimeout(Heartbeat, 5000);
    };

    const IsConnected = () => {
        if (websocket && wsConnected){
            return true
        }
        return false
    }

    const OnMessage = (e) => {
      var data = null;
      try {
        data = JSON.parse(e.data);
      } catch (err) {
        //
      }
      //console.log('websocket on message', data)
      if (data && data.emit !== undefined) {
        //using WSMessage object from the server
        eventBus.$emit(data.emit, data.payload);
      } else {
        eventBus.$emit("on-ws-message", e.data);
      }
    };

    const SendMessage = (data) => {
      if (websocket && wsConnected) {
        websocket.send(data);
      }
    };

    const GetActiveConns = () => {
      var _data = {
        method: "StatActiveConns",
      };

      SendMessage(JSON.stringify(_data));
    };

    Connect();

    app.config.globalProperties.$socket = websocket;

    app.provide("WSConnect", Connect);
    app.provide("WSSend", SendMessage);
    app.provide("WSIsConnected", IsConnected);
  },
};
