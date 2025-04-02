import server from "../server";

export default {
  Export(info, _mode) {
    return server.post(`api/supplychain/export/?mode=${_mode}`, info);
  },
};
