import axios from "axios";

const instance = axios.create();

const token = `Bearer ${window.xmap.exp ? window.xmap.exp : "x"}`;
instance.defaults.baseURL = window.xmap.cms
  ? `${window.xmap.cms}api`
  : "http:localhost:1338/api/";
instance.defaults.withCredentials = false;
instance.defaults.headers.common["Authorization"] = token;

export default {
  GetTrainings() {
    var k = new Date().getTime();
    return instance.get(`trainings?populate=%2A&t=${k}`);
  },
  GetFAQS() {
    var k = new Date().getTime();
    return instance.get(`enquiries?populate=%2A&t=${k}`);
  },
};
