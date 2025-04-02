import { useMainStore } from "../store/index";
import general from "../mixins/general";
import { ref, watch, inject } from "vue";
import api from "../api/bowler";
import apiFile from "../api/file";
import apiAcct from "../api/account";
import axios from "axios";

export default function useComment(_category = null, _title = null) {
  const mainStore = useMainStore();
  const { NotifyUser, base64ToArrayBuffer, ConfirmAction, saveByteArray } =
    general();
  const item = ref({
    Category: _category,
  });
  const dirty = ref(false);
  const cancelToken = ref(null);
  const files = ref([]);
  const eventBus = inject("eventBus");
  const category = ref(_category);
  const title = ref(_title);

  //const file = ref(null);

  watch(
    () => item.value,
    () => {
      dirty.value = true;
    },
    { deep: true }
  );

  //   watch(file, (newVal) => {
  //     if (newVal) {
  //       SubmitFile();
  //     }
  //   });

  const InvokeSave = (_opts) => {
    return new Promise((resolve) => {
      api
        .SaveComment({
          session: mainStore.SessionOptions,
          comment: item.value,
          opts: _opts
        })
        .then((response) => {
          if (response.data.success) {
            dirty.value = false;
          }

          NotifyUser(response.data);
          resolve(response.data);
        });
    });
  };

  const GetMaster = () => {
    if (cancelToken.value) cancelToken.value.cancel();

    cancelToken.value = axios.CancelToken.source();

    return new Promise((resolve) => {
      api
        .GetComment(
          {
            session: mainStore.SessionOptions,
            comment: {
              Category:
                item.value.Category !== undefined
                  ? item.value.Category
                  : category.value,
            },
          },
          cancelToken.value
        )
        .then((response) => {
          item.value = { ...response.data };
          setTimeout(() => {
            dirty.value = false;
          }, 400);

          resolve(item.value);
        });
    });
  };

  const CopyPrevious = (_session) => {
    if (cancelToken.value) cancelToken.value.cancel();

    cancelToken.value = axios.CancelToken.source();

    return new Promise((resolve) => {
      api
        .GetPreviousComment(
          {
            session: _session !== undefined ? _session : mainStore.SessionOptions,
            comment: {
              Category:
                item.value.Category !== undefined
                  ? item.value.Category
                  : category.value,
            },
          },
          cancelToken.value
        )
        .then((response) => {
          item.value = response.data;
          resolve(response.data);
        });
    });
  };

  const GetFiles = () => {
    apiFile
      .GetFiles({
        session: JSON.stringify(mainStore.SessionOptions),
        category: item.value.Category,
      })
      .then((response) => {
        files.value = response.data;
      });
  };

  const SubmitFile = (file) => {
    try {
      let formData = new FormData();
      formData.append("file", file);
      formData.append("session", JSON.stringify(mainStore.SessionOptions));
      formData.append("category", item.value.Category);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: function (progressEvent) {
          var percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(percentCompleted);
        },
      };

      //   setTimeout(() => {
      //     file.value = null;
      //   }, 1000);

      apiFile
        .Upload(formData, config)
        .then((response) => {
          NotifyUser(response.data);
          GetFiles();
        })
        .catch(() => {
          //
        });
    } catch {
      //
    }
  };

  const OpenFile = (data) => {
    apiFile
      .GetFile(data.Uuid)
      .then((response) => {
        if (response.data.success) {
          var byteArr = base64ToArrayBuffer(response.data.payload);
          saveByteArray(response.data.message, byteArr);
        } else {
          NotifyUser(response.data);
        }
      })
      .catch(() => {
        //
      });
  };

  const DeleteFile = (data) => {
    ConfirmAction("Are you sure you want to delete this file?", () => {
      apiFile
        .DeleteFile(data.Uuid)
        .then((response) => {
          NotifyUser(response.data);
          GetFiles();
        })
        .catch(() => {
          //
        });
    });
  };

  const ShowEditHistory = () => {
    eventBus.$emit("show-edit-history", {
      title: title.value,
      category: item.value.Category,
    });
  };

  const SetCategory = (value) => {
    category.value = value;
    item.value.Category = value;
  };

  const SetItem = (value) => {
    item.value = { ...value };
  };

  const FetchUsers = (searchText) => {
    return new Promise(resolve => {
      apiAcct.SearchUser(searchText).then(response => {
        resolve(response.data);
      })
    });
  }

  return {
    dirty,
    files,
    item,
    GetMaster,
    CopyPrevious,
    InvokeSave,
    OpenFile,
    GetFiles,
    DeleteFile,
    ShowEditHistory,
    SubmitFile,
    SetCategory,
    SetItem,
    FetchUsers
  };
}
