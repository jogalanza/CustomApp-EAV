import server from "../server";

export default {
  GetTargets(id) {
    return server.post(`api/targets/get/${id}`);
  },
  SaveTargets(data) {
    return server.post(`api/targets/save`, data);
  },
};
