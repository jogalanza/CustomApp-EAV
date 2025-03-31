import { defineStore } from "pinia";
import api from "../api/cms";

export const useCMS = defineStore("cms", {
  state: () => ({
    trainings: [],
    announcements: [],
    faqs: [],
  }),

  getters: {
    Trainings: (state) => { return state.trainings },
    Announcements: (state) => { return state.announcements },
    FAQS: (state) => { return state.faqs }
  },

  actions: {
    LoadContents(){
      this.GetTrainings();
    },
    GetTrainings() {
      var _this = this;
      api.GetTrainings().then((response) => {
        console.warn("get trainings", response);
        _this.trainings = [...response.data.data];
      });
    },
    GetFAQS() {
      var _this = this;
      api.GetFAQS().then((response) => {
        _this.faqs = [...response.data.data];
      });
    },
  },
});
