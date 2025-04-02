import server from "../server";

export default {
  Export(info, _mode) {
    return server.post(`api/corporate/export/?mode=${_mode}`, info);
  },
};
