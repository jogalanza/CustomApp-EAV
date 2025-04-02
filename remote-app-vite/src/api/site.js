import server from "../server";

export default {
  GetAll(filter) {
    return server.post(`api/site/getall`, filter);
  },
  Save(data) {
    return server.post(`api/site/save`, data);
  },
  Delete(_ids) {
    return server.post(`api/site/delete`, _ids);
  },
};
