import { defineStore } from "pinia";
import api from "../api/index";
import { useUser } from "../store/user";

export const useEmbeddables = defineStore("embed", {
  state: () => ({
    items: [],
  }),

  getters: {
    Reports: (state) => {
      return state.items;
    },
    ShareLink: (state) => {
      return (index) => {
        if (state.items.length > 0){
          return state.items[index].Url
        }
        return null;
      }
    }
  },

  actions: {
    GetEmbedReports(_report) {
      const user = useUser();

      //console.warn("get reports", _report, user)

      if (_report !== undefined && user.ActiveUser.ID !== undefined) {
        var _this = this;
        api
          .EmbedReports_Get(user.ActiveUser.ID, _report)
          .then((response) => {
            if (response.data.success) {
              _this.items = [...response.data.payload];
            }
          });
      }
    },
    AddEmbedReports(_url, _page, _public) {
      const user = useUser();

      console.warn(user);

      if (user.ActiveUser && user.ActiveUser.ID !== undefined) {
        var payload = {
          Url: _url,
          UserId: user.ActiveUser.ID,
          Report: _page,
          IsPublic: _public
        };

        var _this = this;

        return new Promise((resolve) => {
          api.EmbedReports_Save(payload).then((response) => {
            if (response.data.success) {
              _this.GetEmbedReports(_page);
              resolve(response.data);
            } else {
              reject(response.data);
            }
          });
        });
      }

      return Promise.reject(null);
    },
    RemoveEmbed(index, _page) {
      if (this.items && this.items.length > 0) {
        var id = this.items[index].ID;
        var _this = this;

        return new Promise((resolve) => {
          api.EmbedReports_Remove(id).then((response) => {
            if (response.data.success) {
              _this.GetEmbedReports(_page);
              resolve(response.data);
            }else{
              reject(response.data);
            }
          });
        });
      }

      return Promise.reject(null);
    },
  },
});
