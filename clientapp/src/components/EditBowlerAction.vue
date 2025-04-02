<template>
    <EditDialog :dialog="dialog" @save="InvokeSave" content-style="height: calc(100% - 110px);">
        <template #header>
            <q-toolbar>
                <q-toolbar-title class="clip">{{ title }}</q-toolbar-title>
                <q-space />
                <q-btn flat round icon="r_close" @click="dialog = false" :disable="loading" />
            </q-toolbar>
        </template>

        <q-list style="width: 100%">
            <q-item class="q-px-sm">
                <q-input ref="editor" class="key-focus-editor" filled v-model="item.comment" style="min-height: 120px; width: 100%; height: 100%" type="textarea" autofocus>

                </q-input>
            </q-item>
            <q-item v-if="resultMsg" :class="`q-px-sm q-mt-md q-mx-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense
                style="overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
                <q-item-section>
                    <q-item-label class="text-white q-pa-sm">{{ resultMsg.message }}</q-item-label>
                </q-item-section>
                <q-item-section side class="q-pa-none">
                    <q-btn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
                </q-item-section>
            </q-item>
        </q-list>
    </EditDialog>
</template>

<script>
import { defineComponent, ref } from 'vue'
import EditDialog from './General/EditDialog.vue';
import api from "@/api/bowler";
import { useMainStore } from '@/store/index';
import general from "@/mixins/general";

export default defineComponent({
    components: {
        EditDialog
    },
    emits: ["update"],
    setup(props, context) {
        const mainStore = useMainStore();
        const { NotifyUser } = general();
        const dialog = ref(false);
        const loading = ref(false);
        const item = ref(null);
        const editor = ref(null);
        const resultMsg = ref(null);
        const title = ref(null);

        const Show = (data, _title) => {
            title.value = _title ? `Edit ${_title} Comment` : "Edit Comment";
            resultMsg.value = null;
            item.value = { ...data };
            dialog.value = true;
        }

        const InvokeSave = () => {
            resultMsg.value = null;

            api.SaveComment({
                session: mainStore.SessionOptions,
                comment: item.value
            }).then(response => {
                if (response.data.success) {
                    dialog.value = false;
                    NotifyUser(response.data);
                    context.emit("update");
                }else{
                    resultMsg.value = response.data;
                }
            })
        }

        return {
            editor,
            dialog,
            loading,
            item,
            resultMsg,
            title,
            InvokeSave,
            Show
        }
    },
})
</script>
