import axios from 'axios'
import { Cookies, SessionStorage } from 'quasar'

var server_address = `${window.location.origin}${window.location.pathname.replace('clientapp/dist/', '')}`;
if (server_address[server_address.length - 1] !== "/"){
    server_address = `${server_address}/`
}

if (process.env.DEVDEBUG === '1'){
    server_address = "https://localhost:44300"
}

axios.defaults.baseURL = window.xmap.serverAddress ? window.xmap.serverAddress : server_address
axios.defaults.withCredentials = false;
// axios.defaults.httpsAgent = new https.Agent({
//     rejectUnauthorized: false
// })

axios.interceptors.request.use(function(config) {
    
    //update timeout cookie
    if (config.url !== 'user/auth') Cookies.set('_t', "a", { expires: window.xmap.to !== undefined && window.xmap.to !== null ? window.xmap.to : '5m' });

    //get session user info
    var uid = SessionStorage.getItem('uid');
    var hubid = SessionStorage.getItem('hubid');
 
    if (uid) {
        config.headers["X-UID"] = uid;   
     }

    if (hubid){
        config.headers["X-HubId"] = hubid;   
    }

   

    if (process.env.DEVDEBUG === '1'){
        config.headers["X-DEBUG"] = "1";
    }
    
    // var x = window.localStorage.getItem("xmap_locale");
    // if (x && config.data !== undefined){
    //     try{
    //         if (config.data.locale === undefined){
    //             config.data.locale = x;
    //         }            
    //     }catch(e){
    //         console.error("INTERCEPTOR", e)
    //      }        
    // }

    //console.log('axios inerceptor', config, window.location.hash)
    // Get the token from session storage
    //var token = SessionStorage.getItem('token');
 
    // Check valid token
    // if (token === null) {
    //     let publicPath = ['#/login', '#/forget-password'];
     
    //     // Redirect to Login if login required
    //     if (publicPath.indexOf(window.location.hash) === -1) {
    //         window.location.href = '/#/login'
    //     }
     
    //  } else {
    //     // Set token
    //     token = JSON.parse(token)
    //     if (token) {
    //         config.headers.Authorization = 'Bearer ' + token
    //     }
    //  }

     return config;
 });

export default axios