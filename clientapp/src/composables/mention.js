import { ref  } from "vue";
import apiAcct from "@/api/account";
import axios from "axios";


export default function useMention() {
  const loading = ref(false);
  const items = ref([
    {value: "test", firstName: 'test'}
  ]);
  const cancelToken = ref(null);
  

  const SearchADUsers = (searchText) => {
    loading.value = true;

    if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

    return new Promise(resolve => {
      apiAcct.SearchInAD(searchText, cancelToken.value.token).then(response => {
        loading.value = false;
        resolve(response.data);
        items.value = [...response.data];
      }).catch(() => {
        //loading.value = false;
      });
    });
  }

  return {
    loading,
    items,
    SearchADUsers
  };
}
