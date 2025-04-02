import eventBus from '../bus/eventBus'

export default {
    install: (app) => {
      // Plugin code goes here
    
        
      app.config.globalProperties.$eventBus = eventBus;
      app.provide("eventBus", eventBus);
    }
  }