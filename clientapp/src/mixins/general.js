import router from "../router/index";
import { Notify, Dialog, useQuasar } from "quasar";
import moment from "moment";
import { computed } from "vue";

const currentFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "PHP",
});

const browserLocale = navigator.language || navigator.languages[0];

//const numberFormatter = new Intl.NumberFormat(window.xmap.numberFormatLocale | "en-US");

const q = useQuasar();

export default function() {
  const mobileView = computed(() => q.screen.width < 600);

  function navigateTo(item, replace = false) {
    console.warn("navigateTo", item, replace)
    if (item.name) {
      if (replace) {
        router.replace(item);
      } else {
        router.push(item);
      }
    }
  }

  function NotifyUser(data, actions, opts) {
    Notify.create({
      type: opts !== undefined ? opts.type !== undefined ? opts.type : data.success ? "positive" : "negative" : data.success ? "positive" : "negative",
      message: data.message,
      multiLine: opts !== undefined ? opts.multiLine !== undefined ? opts.multiLine : false : false,
      position: opts !== undefined ? opts.position !== undefined ? opts.position : 'top' : 'top',
      icon: opts !== undefined ? opts.icon !== undefined ? opts.icon : undefined : undefined,
      html: true,
      actions: actions !== undefined ? actions : undefined,
      progress: opts !== undefined ? opts.progress !== undefined ? opts.progress : false : false,
      timeout: opts !== undefined ? opts.timeout !== undefined ? opts.timeout : 6000 : 6000
    });
  }

  function ConfirmDelete(size, okCallback) {
    Dialog.create({
      title: "Confirm",
      message: `Would you like to delete ${size > 1 ? "these" : "this"} record${
        size > 1 ? "s" : ""
      }?`,
      cancel: true,
      ok: {
        label: "Yes",
      },
      persistent: true,
    }).onOk(() => {
      okCallback();
    });
  }

  function ConfirmAction(msg, okCallback) {
    Dialog.create({
      title: "Confirm",
      message: msg,
      cancel: true,
      ok: {
        label: "Yes",
      },
      persistent: true,
    }).onOk(() => {
      okCallback();
    });
  }

  function UseLightTheme() {
    var x = window.localStorage.getItem("pdcs_theme");
    if (x !== null) {
      return x === "1";
    }
    return false;
  }

  function getObjValue(arr, key, value) {
    var x = null;
    var b = false;
    
    if (value !== undefined && value !== null) {
      arr.forEach((element) => {
        if ((key === undefined ? element : element[key]) === value && !b) {
          x = element;
          b = true;
        }
      });
    }
    return x;
  }

  function getObjLabel(arr, key, value, label) {
    var x = "";
    var b = false;
    if (value !== undefined && value !== null) {
      arr.forEach((element) => {
        if (element[key] !== undefined) {
          if (element[key] === value && !b) {
            if (element[label] !== undefined) x = element[label];
            b = true;
          }
        }
      });
    }

    return x;
  }

  function hasSelectedItem(arr) {
    var x = false;
    arr.every((element) => {
      if (element.isSelected) {
        x = true;
        return false;
      }
      return true;
    });

    return x;
  }

  function formatCurrency(data) {
    return currentFormatter.format(parseFloat(data));
  }

  function formatNumber(data, decimal = 0, opts) {
    const formatter = new Intl.NumberFormat(browserLocale, {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal,
    });

    if (opts !== undefined && opts.accounting !== undefined && opts.accounting) {
      let number = parseFloat(data || "0");
      if (number < 0) {
        return `(${formatter.format(Math.abs(number))}${(opts.suffix ? opts.suffix : "")})`;
      }
    }

    return `${formatter.format(parseFloat(data || "0"))}${(opts !== undefined && opts.suffix !== undefined ? opts.suffix : "")}`;
  }

  function getMoment() {
    return moment();
  }

  function formatDate(data, format = "DD MMM YYYY") {
    if (format === undefined || format === null) format = "DD MMM YYYY";
    if (!data || data == null || data == "/Date(-62135596800000)/") {
      return "";
    } else if (moment(data).isValid()) {
      return moment(data).format(format);
    } else {
      return "";
    }
  }

  function formatValue(val, options) {
    if (options !== undefined) {
      if (options.type !== undefined && options.type === "date") {
        return formatDate(val, options.dateFormat);
      }
    }
    return val;
  }

  function selectAll(data) {
    data.map((e) => {
      e.isSelected = true;
    });
  }

  function unSelectAll(data) {
    data.map((e) => {
      e.isSelected = false;
    });
  }

  function toggleDarkMode() {
    var x = window.localStorage.getItem("pdcs_theme");

    if (x === "1") {
      window.localStorage.setItem("pdcs_theme", "0");
      //q.dark.set(true);
    } else {
      window.localStorage.setItem("pdcs_theme", "1");
      //q.dark.set(false);
    }
  }

  function hasKey(arr, key) {
    if (!arr) return true;
    var x = false;
    if (key !== undefined && key !== null) {
      arr.every((element) => {
        if (element.toLowerCase().substring(0, key.length) === key.toLowerCase()) { //element.toLowerCase().indexOf(key.toLowerCase()
          x = true;
          return false;
        }
        return true;
      });
    }else{
      x = true;
    }

    return x;
  }

  //password test
  function pwMinChars(data){
    let check = new RegExp('(?=.{8,})');
    return check.test(data);
  }

  function pwUppercase(data){
    let check = new RegExp('(?=.*[A-Z])');
    return check.test(data);
  }

  function pwLowercase(data){
    let check = new RegExp('(?=.*[a-z])');
    return check.test(data);
  }

  function pwHasDigit(data){
    let check = new RegExp('(?=.*[0-9])');
    return check.test(data);
  }

  function pwMatch(data, data2){
    return data === data2;
  }

  function ParseName(r) {
    if (r === undefined) return "";
    var x = r.split(" ");
    if (x.length > 1){
      return x[0].substring(0, 1) + x[1].substring(0, 1)
    }

    return x[0].substring(0, 2);
  }

  function SetValueToArr(arr, value, key){
    //console.warn("SetValueToArr", arr, value, key);
    if (!arr) return;
    var i = arr.indexOf(key ? value[key] : value);
    if (i === -1){
      arr.push(key ? value[key] : value);
    }else{
      arr.splice(i, 1);
    }
  }

  function FillArr(arr, opts, key, config){
    if (!arr) return;
    if (!opts) return;
    opts.forEach(e => {
      console.warn("FillArr", arr, arr.indexOf(key !== undefined ? e[key] : e))
      if (arr.indexOf(key !== undefined ? e[key] : e) == -1){
        if (config !== undefined && config.pushObj){
          arr.push(e);
        }else{
          arr.push(key ? e[key] : e);
        }
      }
    });
  }

  function getMultiObjValue(arr, key, value, evalAsString = true) {
    var x = [];
    if (value !== undefined && value !== null) {
      value.forEach((v) => {
        arr.forEach((element) => {
          if (((key !== undefined && element[key] !== undefined ? element[key] : element ) === (key !== undefined && v[key] !== undefined ? v[key] : v ) || (evalAsString && (key === undefined ? element : element[key]).toString() === v.toString()))) {
            x.push(element);
          }
        });
      })
    }

    return x;
  }

  function StripHTML(txt){
    var x = ""
    try{
      const regexForStripHTML = /<([^</> ]+)[^<>]*?>[^<>]*?<\/\1> */gi;
      x = txt.replaceAll(regexForStripHTML, '');
    }catch{
      //
    }
    
    return x;
  }

  function base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  function saveByteArray(reportName, byte) {
    var blob = new Blob([byte], { type: "application/octet-stream" });
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
  }

  return {
    mobileView,
    navigateTo,
    getObjValue,
    getObjLabel,
    getMoment,
    NotifyUser,
    ConfirmDelete,
    hasSelectedItem,
    formatCurrency,
    selectAll,
    unSelectAll,
    formatDate,
    UseLightTheme,
    formatValue,
    toggleDarkMode,
    ConfirmAction,
    hasKey,
    pwMinChars,
    pwUppercase,
    pwLowercase,
    pwHasDigit,
    pwMatch,
    formatNumber,
    ParseName,
    SetValueToArr,
    FillArr,
    getMultiObjValue,
    StripHTML,
    base64ToArrayBuffer,
    saveByteArray
  };
}
