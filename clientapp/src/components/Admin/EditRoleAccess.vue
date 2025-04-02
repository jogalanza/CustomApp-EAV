<template>
  <q-card flat>
    <q-card-section class="q-py-none" style="height: calc(100% - 52px)">
      <q-list
        :disable="loading"
        style="
          height: 100%;
          overflow-y: auto;
          padding-right: 8px;
          margin-right: -16px;
        "
      >
        <q-item class="q-px-none">
          <q-item-section>
            <q-input
              v-model="item.RoleName"
              filled
              dense
              label="Role"
              :disable="loading"
            />
          </q-item-section>
        </q-item>
        <q-item class="q-px-none">
          <q-item-section>
            <q-input
              v-model="item.Description"
              filled
              dense
              label="Description"
              :disable="loading"
            />
          </q-item-section>
        </q-item>
        <q-item class="q-px-none">
          <q-item-section>
            <q-item-label>Side Panel Access</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="item.SidePanelAccess" dense />
          </q-item-section>
        </q-item>
        <q-item-label v-if="item.SidePanelAccess" class="q-py-md" caption
          >Configure System Access</q-item-label
        >
        <q-item
          v-if="item.SidePanelAccess"
          class="q-px-none items-start"
          style="height: calc(100% - 180px)"
        >
          <q-item-section class="items-start" style="height: 100%">
            <q-tree
              ref="treeView"
              :nodes="user.ManageMenu"
              v-model:ticked="ticked"
              v-model:expanded="expanded"
              node-key="key"
              label-key="label"
              children-key="items"
              dense
              tick-strategy="leaf"
              style="
                min-height: 350px;
                height: 100%;
                width: 100%;
                overflow-y: auto;
              "
              :disable="loading"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-actions>
      <q-space />
      <q-btn label="Cancel" flat @click="$emit('close')" :disable="loading" />
      <q-btn
        label="Save"
        color="primary"
        @click="SaveRole"
        :disable="loading"
        :loading="loading"
      />
    </q-card-actions>
  </q-card>
</template>

<style scoped lang="scss">
.no-photo {
  width: 62px;
  height: 62px;
  text-align: center;
  padding: 0px;
  line-height: 2em;
}
</style>

<script>
import { defineComponent, ref, inject, onMounted } from "vue";
import general from "@/mixins/general";
import api from "@/api/index";
import server from "@/server";
import { useMainStore } from "../../store";
import { useUser } from "../../store/user";

export default defineComponent({
  name: "EditRoleAccess",
  emits: ["update", "done"],
  setup(props, ctx) {
    const GetLocaleString = inject("GetLocaleString");
    const mainStore = useMainStore();
    const user = useUser();

    const { NotifyUser } = general();
    const loading = ref(false);
    const item = ref({});
    const ticked = ref([]);
    const expanded = ref([]);

    const GetMaster = () => {
      //
    };

    const SaveRole = () => {
      loading.value = true;
      api
        .RoleSave(item.value, ticked.value)
        .then((response) => {
          NotifyUser(response.data);
          loading.value = false;
          if (response.data.success) {
            ctx.emit("update");
            //ctx.emit("done");
          }
        })
        .catch(() => {
          loading.value = false;
        });
    };

    const Edit = (data) => {
      item.value = { ...data };
      expanded.value = [];
      GetAccessMenu();
    };

    const AddNew = () => {
      item.value = {
        ID: 0,
        RoleName: null,
        Description: null,
      };
      expanded.value = [];
      GetAccessMenu();
    };

    const GetAccessMenu = () => {
      loading.value = true;
      api
        .RoleAccessMenu(item.value.ID)
        .then((response) => {
          loading.value = false;
          ticked.value = [...response.data];
        })
        .catch(() => {
          loading.value = false;
        });
    };

    onMounted(() => {
      //GetMaster();
      console.error("EditROleAccess mounted");
    });

    return {
      GetLocaleString,
      loading,
      GetMaster,
      server,
      Edit,
      item,
      mainStore,
      user,
      ticked,
      expanded,
      SaveRole,
      AddNew,
    };
  },
});
</script>