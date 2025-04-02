<template>
  <MultiView title="Key Focus Areas" class="key-focus-area" @refresh="GetMaster" @save="Save" :dirty="true" :config="config" :with-history="false" style="min-height: 0px">
    <template v-slot:default-toolbar>
      <QToolbar class="chart-toolbar">
        <QBtn v-if="withHistory" flat icon="o_history" dense @click="localSlide = 'history'"><QTooltip>History</QTooltip></QBtn>
        <div class="card-title">
          <div>{{ title }}</div>
        </div>
        <QBtn v-if="dirty" flat icon="o_save" no-wrap no-caps dense @click="Save"><QTooltip>Save Changes</QTooltip></QBtn>
        <QBtn flat icon="o_content_copy" dense @click="CopyPrevious">
          <QTooltip>Copy from previous period</QTooltip>
        </QBtn>
        <QBtn flat icon="o_refresh" dense @click="GetMaster">
          <QTooltip>{{ `${(dirty ? 'Cancel changes' : 'Refresh')}` }}</QTooltip>
          <QBadge rounded floating color="red" />
        </QBtn>
        <QBtn icon="o_more_vert" flat dense>
          <QMenu auto-close>
            <QList>
              <QItem v-for="(m, i) in extramenu" :key="i" clickable @click="m.action" dense>
                <QItemSection>{{ m.label }}</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </QToolbar>
    </template>
    <QList class="" style="height: calc(100% - 60px)">
      <QItem style="padding: 8px">
        <QInput ref="editor" class="key-focus-editor" filled v-model="item.comment" style="min-height: 180px; width: 100%; height: 100%" type="textarea">

        </QInput>
        <!-- <div v-else @click="GoEdit" v-html="item" style="min-height: 120px; width: 100%; border-radius: 4px; box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.4);">

        </div> -->
      </QItem>
      <QItem v-if="resultMsg" :class="`q-px-sm q-mt-md q-mx-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense style="padding: 8px; overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
        <QItemSection>
          <QItemLabel class="text-white q-pa-sm">{{ resultMsg.message }}</QItemLabel>
        </QItemSection>
        <QItemSection side class="q-pa-none">
          <QBtn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
        </QItemSection>
      </QItem>
      <!-- <QItem v-if="dirty" >
        <QItemSection>

        </QItemSection>
        <QItemSection side>
          <QBtn color="green" :label="`Save changes`" no-wrap no-caps @click="Save" unelevated><QTooltip>Save Changes</QTooltip></QBtn>
        </QItemSection>

      </QItem> -->
    </QList>
  </MultiView>
</template>

<style lang="scss">
.key-focus-area{
  .multiview-card{
    min-height: 0px;
    height: 100%;

    .key-focus-editor{
      .q-field__control{
        height: 100%;
      }
    }
  }
}
</style>

<script>
import { computed, defineAsyncComponent, defineComponent, inject, nextTick, onMounted, ref, watch } from "vue";
import { useCalc } from "../composables/calc";
import axios from "axios";
import general from "../mixins/general";
import { useMainStore } from "../store/index";
import { useUser } from "../store/user"
import api from "../api/bowler";

export default defineComponent({
  name: "CommentCard",
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    title: {
      type: String,
      default: "Comment"
    },
    category: {
      type: String,
      default: ""
    }
  },
  components: {
    MultiView: defineAsyncComponent(() =>
      import("../components/General/MultiView.vue")
    ),
  },
  setup(props) {
    const { CalcGridData, CalcGridPeriodHeader } = useCalc();
    const mainStore = useMainStore();
    const { NotifyUser } = general();
    const dirty = ref(false);
    const slidePointer = ref(10);
    const resultMsg = ref(null);
    const user = useUser();
    const editMode = ref(false);
    const editor = ref(null);
    const cancelToken = ref(null);
    const eventBus = inject("eventBus");

    const history = ref([]);

    const item = ref(null);

    const CalcReadOnly = inject("CalcReadOnly");

    const extramenu = computed(() => {
      return [
        {
          label: "Show Edit History",
          action: ShowEditHistory
        }
      ];
    });

    watch(item, () => {
      nextTick(() => {
        dirty.value = true;
      });
      console.warn('item changed', item.value);
    }, { deep: true });

    watch(() => mainStore.SessionOptions, () => {
      GetMaster();
    }, { deep: true });

    const GetMaster = () => {
      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      api.GetComment({
        session: mainStore.SessionOptions,
        comment: {
          Category: props.category
        }
      }, cancelToken.value).then(response => {
        item.value = response.data;
        setTimeout(() => {
          dirty.value = false;
        }, 1000);
      });
    }

    const CopyPrevious = () => {
      if (cancelToken.value) cancelToken.value.cancel();

      cancelToken.value = axios.CancelToken.source();

      api.GetPreviousComment({
        session: mainStore.SessionOptions,
        comment: {
          Category: props.category
        }
      }, cancelToken.value).then(response => {
        item.value = response.data;
      });
    }

    const Save = () => {
      resultMsg.value = null;
      api.SaveComment({
        session: mainStore.SessionOptions,
        comment: item.value
      }).then(response => {
        if (response.data.success){
          NotifyUser(response.data);
          GetMaster();
        }
        else{
          resultMsg.value = response.data
        }
      });
    }

    const HandleBlankValue = (key) => {
      if (item.value[key] === undefined || item.value[key] === null || item.value[key] === '') {
        item.value[key] = 0;
      }
    }
    

    const GoEdit = () => {
      editMode.value = true;
      nextTick(() => {
        editor.value.focus();
      });
    }

    const ShowEditHistory = () => {
            eventBus.$emit("show-edit-history", {
                title: props.title,
                category: props.category,
            });
        }

    onMounted(() => {
      GetMaster();
    })

    return {
      user,
      mainStore,
      history,
      item,
      dirty,
      slidePointer,
      resultMsg,
      NotifyUser,
      editMode,
      editor,
      GoEdit,
      Save,
      CalcGridData,
      CalcGridPeriodHeader,
      CalcReadOnly,
      extramenu,
      HandleBlankValue,
      GetMaster,
      CopyPrevious,
      ShowEditHistory
    };
  },
});
</script>
