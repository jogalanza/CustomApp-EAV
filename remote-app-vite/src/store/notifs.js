import { defineStore } from "pinia";
import api from "../api/lookup";
import moment from "moment";

export const useNotifs = defineStore("notifs", {
  state: () => ({
    items: [],
  }),

  getters: {
    count: (state) => { return state.items.length }
  },

  actions: {
    GetItems() {
      var _this = this;
      api.GetNotifs().then((response) => {
        _this.items = [...response.data.payload];
      });
    },
    AddItem(item) {
      item.timestamp = moment().format("MM/DD/yyyy HH:mm:ss");
      this.items.unshift(item);
    },
    Remove(index) {
      this.items.splice(index, 1);
    },
    ClearAll(){
        this.items = []
    }
  },
});
