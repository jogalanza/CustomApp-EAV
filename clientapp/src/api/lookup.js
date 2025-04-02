import server from "../server";

export default {
  GetSites() {
    return server.post(`api/lookup/sites`);
  },
  GetProducts() {
    return server.post(`opts/products`);
  },
  GetDashboards() {
    return server.post(`opts/dashboards`);
  },
  GetNotifs(){
    return server.post("lookup/notifs")
  },
  GetADUsers(payload){
    return server.post(`api/lookup/adusers/?name=${payload}`)
  },
  GetProductsSelect(){
    return server.post(`api/lookup/products`)
  }
};
