import server from "../server";

export default {
  GetAll(filter) {
    return server.post(`api/product/getall`, filter);
  },
  Save(data) {
    return server.post(`api/product/save`, data);
  },
  Delete(_ids) {
    return server.post(`api/product/delete`, _ids);
  },
};
