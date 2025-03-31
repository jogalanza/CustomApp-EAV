//import lookup from "../api/lookup"
import { defineStore } from "pinia"

export const useLocale = defineStore("locale", {

  state: () => ({
    locale: "EN",
    repo: null,  
  }),

  getters: {
    Locale: (state) => {
      return state.locale
    },
    Repo: (state) => {
      return state.repo
    },
    Langs: () => {
      return [
        { value: "EN", label: "English" },
        { value: "CN", label: "Chinese" },
        { value: "DE", label: "Deutsch" }
      ]
    }
  },

  actions: {
    GetLocaleText() {
      return;
      // lookup.LoadLocaleText(payload).then((response) => {
      //   var x = [...response.data];
      //   var y = {};
      //   x.map(a => {
      //     y[a.Keyword] = a.Label
      //   });
  
      //   this.repo = Object.assign({}, y);
      // });
    },
    SetLocale(payload){
      window.localStorage.setItem("xmap_locale", payload);
      this.locale = payload;
      this.GetLocaleText(payload)
    }
  }
});