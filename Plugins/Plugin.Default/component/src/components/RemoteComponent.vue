<template>
    <div>
      <h1>Hello from Remote Component 2!</h1>
      <p>Served from SamplePlugin.</p>
      <button @click="callHello">Say Hello</button>
      <button @click="fetchMenu">Fetch Menu</button>
      <p>{{ message }}</p>
      <ul>
        <li v-for="item in menuItems" :key="item.Path">{{ item.Name }} - {{ item.Path }}</li>
      </ul>
    </div>
  </template>
  
  <script>
  import { defineComponent, ref, inject } from 'vue';
  
  export default defineComponent({
    name: 'RemoteComponent',
    setup() {
      // Inject dependencies from parent app
      const appMethods = inject('appMethods');
      const axios = inject('axios');
  
      // Reactive state
      const message = ref('');
      const menuItems = ref([]);
  
      // Methods
      const callHello = () => {
        if (appMethods && appMethods.sayHello) {
          message.value = appMethods.sayHello();
        } else {
          message.value = 'appMethods not provided!';
        }
      };
  
      const fetchMenu = async () => {
        if (appMethods && appMethods.fetchData) {
          try {
            menuItems.value = await appMethods.fetchData();
            message.value = 'Menu fetched via appMethods!';
          } catch (error) {
            message.value = 'Error fetching menu: ' + error.message;
          }
        } else if (axios) {
          try {
            const response = await axios.get('/menu');
            menuItems.value = response.data;
            message.value = 'Menu fetched via axios!';
          } catch (error) {
            message.value = 'Error fetching menu with axios: ' + error.message;
          }
        } else {
          message.value = 'Neither appMethods nor axios provided!';
        }
      };
  
      // Expose reactive state and methods to template
      return {
        message,
        menuItems,
        callHello,
        fetchMenu
      };
    }
  });
  </script>
  
  <style scoped>
  h1 {
    color: #42b983;
  }
  button {
    margin: 5px;
  }
  </style>