import server from "../server";

export default {
  Export(info, _mode) {
    return server.post(`api/opex/export/?mode=${_mode}`, info);
  },
};
