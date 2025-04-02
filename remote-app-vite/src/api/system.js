import server from "../server";

export default {
  GetUsage() {
    return server.get(`api/system/usage`);
  },
};
