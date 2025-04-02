<template>
  <QAvatar
    :class="`profile-avatar items-center bg-${color}`"
    :size="listmode ? '38px !important' : '180px'"
    @click="listmode ? emitClick() : uploader ? file.click() : null"
  >
    <!-- style="display: block; margin: auto" -->
    <img
      v-if="!selected && src"
      :src="`${$http.defaults.baseURL}images/Profile/${src}`"
    />
    <img
      v-else-if="!selected && thumbnail"
      :src="`data:image/png;base64,${thumbnail}`"
    />
    <QIcon
      v-else-if="!selected && icon"
      size="lg"
      color="white"
      :name="icon"
    />
    <div
      v-else-if="!selected"
      :class="`text-white text-h4 ${textClass}`"
      :style="{
        'font-size': listmode ? '1.1em' : '1em', 'line-height': 'inherit'
      }"
    >
      {{
        `${text1 ? text1.toUpperCase().charAt(0) : ""}${
          text2 ? text2.toUpperCase().charAt(0) : ""
        }`
      }}
    </div>
    <QIcon v-else name="r_done" size="md" color="white" />
    <QTooltip v-if="!listmode && uploader">Click to Update</QTooltip>
    <input
      type="file"
      multiple
      name="fields[assetsFieldHandle][]"
      id="assetsFieldHandle"
      class="w-px h-px opacity-0 overflow-hidden absolute"
      @change="FileUpload"
      ref="file"
      accept="image/png, image/jpeg"
      style="display: none"
    />
  </QAvatar>
</template>

<style lang="scss">
.profile-avatar{
    box-shadow: 0px 0px 2px #222;
}
</style>

<script>
import { ref } from "vue";
//import userApi from "../../api/user";

export default {
  name: "ProfileAvatar",
  props: {
    src: {
      type: String,
      default: null,
    },
    text1: {
      type: String,
      default: null,
    },
    text2: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    empid: {
      type: Number,
      default: 0,
    },
    listmode: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    uploader: {
      type: Boolean,
      default: true
    },
    color: {
      type: String,
      default: "green"
    },
    textClass: {
      type: String,
      default: ""
    }
  },
  emits: ["refresh", "click"],
  setup(props, context) {
    const file = ref(null);
    const filelist = ref([]);

    const FileUpload = () => {
      filelist.value = [...file.value.files];
      let formData = new FormData();
      formData.append("file", filelist.value[0]);

      // userApi.UploadProfilePhoto(formData, props.empid).then((response) => {
      //   if (response.data.result.success) {
      //     context.emit("refresh");
      //   }
      // });
    };

    const emitClick = () => {
      context.emit("click");
    };

    return {
      file,
      filelist,
      FileUpload,
      emitClick,
    };
  },
};
</script>