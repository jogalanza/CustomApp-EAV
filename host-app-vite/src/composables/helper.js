import { ref } from "vue";

export function useHelper() {
  const renderKey = ref(0);

  const UpRender = () => {
    renderKey.value++;
    if (renderKey.value > 32767) {
      renderKey.value = 1;
    }
  };

  const SelectInput = (e) => {
    if (e.srcElement) {
      if (e.srcElement.select !== undefined) {
        e.srcElement.select();
      }
      if (e.srcElement.focus !== undefined) {
        e.srcElement.focus();
      }
    }
  };

  const Base64ToArrayBuffer = (base64) => {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  };

  const SaveByteArray = (reportName, byte) => {
    var blob = new Blob([byte], { type: "application/octet-stream" });
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
  };

  const getFilenameFromUrl = (url) => {
    // Remove query parameters and fragment identifiers
    const cleanUrl = url.split("?")[0].split("#")[0];

    // Extract the filename from the URL
    const segments = cleanUrl.split("/");
    const filename = segments.pop() || null; // Ensure a filename exists

    return filename;
  };

  const DownloadFile = (url) => {
    var filename = getFilenameFromUrl(url);
    if (filename) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename || "";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }else{
      console.error("Invalid filename", url)
    }
  };

  return {
    renderKey,
    UpRender,
    SelectInput,
    Base64ToArrayBuffer,
    SaveByteArray,
    DownloadFile,
  };
}
