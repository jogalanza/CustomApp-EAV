import server from "../server";

export default {
  GetAll(filter) {
    return server.post(`api/period/getall`, filter);
  },
  Save(data) {
    return server.post(`api/period/save`, data);
  },
};
