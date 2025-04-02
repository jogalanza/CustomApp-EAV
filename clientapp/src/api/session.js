import server from "../server";

export default {
  GetCompareSites(info) {
    return server.post(`api/session/get/compare/sites`, info);
  },
};
