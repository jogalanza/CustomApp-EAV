<template>
    <EditDialog :dialog="dialog" :persistent="false" content-style="height: calc(100% - 50px);" :show-action="false" @ondialog="dialog = $event">
        <template #header>
            <q-toolbar>
                <q-toolbar-title class="clip text-bold q-pl-sm">{{ title }}</q-toolbar-title>
                <q-space />
                <q-btn flat round icon="r_close" @click="dialog = false" :disable="loading" />
            </q-toolbar>
        </template>

        <q-list style="width: 100%; height: 100%; overflow: auto;">
            <q-item v-if="items.length === 0" :class="`q-px-sm q-mt-md q-mx-sm`" dense style="overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
                <q-item-section>
                    <q-item-label class="q-pa-sm">No edit history data yet</q-item-label>
                </q-item-section>
                <!-- <q-item-section side class="q-pa-none">
                    <q-btn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
                </q-item-section> -->
            </q-item>
            <q-item v-for="(e, i) in items" :key="i">
                <template v-if="commentMode">
                    <q-item-section>
                        <q-card>
                            <q-list>
                                <q-item-label class="text-bold q-px-md q-py-sm q-pt-md">{{ `${e.Source}` }}</q-item-label>
                                <q-item>
                                    <q-item-section>
                                        <q-item-label v-html="e.NewValue"></q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-separator inset />
                                <q-item>
                                    <q-item-section avatar top>
                                        <q-icon name="o_account_circle" color="primary" size="sm" />
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>{{ e.EditedBy }}</q-item-label>
                                        <q-item-label caption>{{ `Updated ${e.Timestamp}` }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-card>
                    </q-item-section>
                </template>
                <template v-else>
                    <q-item-section>
                        <q-card style="width: 100%">
                            <q-list>
                                <q-item-label class="text-bold q-px-md q-py-sm q-pt-md">{{ `${e.Field}` }}</q-item-label>
                                <q-item>
                                    <q-item-section>
                                        <q-item-label v-html="formatNumber(e.OldValue)" caption style="font-size: 2.2rem; text-decoration: line-through; overflow: hidden; text-overflow: ellipsis;"></q-item-label>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label v-html="formatNumber(e.NewValue)" style="font-size: 2.2rem; overflow: hidden; text-overflow: ellipsis"></q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-separator inset />
                                <q-item>
                                    <q-item-section avatar top>
                                        <q-icon name="o_account_circle" color="primary" size="sm" />
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>{{ e.EditedBy }}</q-item-label>
                                        <q-item-label caption>{{ `Updated ${e.Timestamp}` }}</q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-card>
                    </q-item-section>

                    <!-- <q-item-section>
                        <q-item-label>{{ e.Field }}</q-item-label>
                        <q-item-label caption>{{ `Old value: ${e.OldValue}` }}</q-item-label>
                        <q-item-label caption>{{ `Updated by ${e.EditedBy} on ${e.Timestamp}` }}</q-item-label>
                    </q-item-section>
                    <q-item-section side top>
                        <q-item-label class="text-bold text-h6">{{ formatNumber(e.NewValue) }}</q-item-label>
                    </q-item-section> -->
                </template>

            </q-item>
        </q-list>
    </EditDialog>
</template>

<script>
import { defineComponent, inject, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import EditDialog from './General/EditDialog.vue';
import api from "@/api/audit";
import { useMainStore } from '@/store/index';
import general from "@/mixins/general";

export default defineComponent({
    props: {
        commentMode: {
            type: Boolean,
            default: false
        },
    },
    components: {
        EditDialog
    },
    emits: ["update"],
    setup(props) {
        const eventBus = inject("eventBus");
        const mainStore = useMainStore();
        const { formatNumber } = general();
        const dialog = ref(false);
        const loading = ref(false);
        const item = ref(null);
        const editor = ref(null);
        const resultMsg = ref(null);
        const title = ref(null);
        const items = ref([]);

        const Show = (data) => {
            items.value = [];
            title.value = data.title ? `Edit History: ${data.title}` : "Edit History";
            resultMsg.value = null;
            item.value = { ...data };
            dialog.value = true;
            nextTick(() => {
                LoadEditHistory();
            });
        }

        const LoadEditHistory = () => {
            api.GetEditHistory({
                session: mainStore.SessionOptions,
                category: item.value.category,
                commentMode: props.commentMode,
            }).then((response) => {
                items.value = [...response.data];
            }).catch((error) => {
                console.error(error);
            });
        }

        onMounted(() => {
            eventBus.$on("show-edit-history", Show);
        });

        onBeforeUnmount(() => {
            eventBus.$off("show-edit-history", Show);
        });

        return {
            editor,
            dialog,
            loading,
            item,
            items,
            resultMsg,
            title,
            formatNumber,
            Show
        }
    },
})
</script>
