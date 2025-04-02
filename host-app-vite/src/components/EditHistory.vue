<template>
    <EditDialog :dialog="dialog" :persistent="false" content-style="height: calc(100% - 50px);" :show-action="false" @ondialog="dialog = $event">
        <template #header>
            <QToolbar>
                <QToolbarTitle class="clip text-bold q-pl-sm">{{ title }}</QToolbarTitle>
                <QSpace />
                <QBtn flat round icon="r_close" @click="dialog = false" :disable="loading" />
            </QToolbar>
        </template>

        <QList style="width: 100%; height: 100%; overflow: auto;">
            <QItem v-if="items.length === 0" :class="`q-px-sm q-mt-md q-mx-sm`" dense style="overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
                <QItemSection>
                    <QItemLabel class="q-pa-sm">No edit history data yet</QItemLabel>
                </QItemSection>
                <!-- <QItemSection side class="q-pa-none">
                    <QBtn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
                </QItemSection> -->
            </QItem>
            <QItem v-for="(e, i) in items" :key="i">
                <template v-if="commentMode">
                    <QItemSection>
                        <QCard>
                            <QList>
                                <QItemLabel class="text-bold q-px-md q-py-sm q-pt-md">{{ `${e.Source}` }}</QItemLabel>
                                <QItem>
                                    <QItemSection>
                                        <QItemLabel v-html="e.NewValue"></QItemLabel>
                                    </QItemSection>
                                </QItem>
                                <QSeparator inset />
                                <QItem>
                                    <QItemSection avatar top>
                                        <QIcon name="o_account_circle" color="primary" size="sm" />
                                    </QItemSection>
                                    <QItemSection>
                                        <QItemLabel>{{ e.EditedBy }}</QItemLabel>
                                        <QItemLabel caption>{{ `Updated ${e.Timestamp}` }}</QItemLabel>
                                    </QItemSection>
                                </QItem>
                            </QList>
                        </QCard>
                    </QItemSection>
                </template>
                <template v-else>
                    <QItemSection>
                        <QCard style="width: 100%">
                            <QList>
                                <QItemLabel class="text-bold q-px-md q-py-sm q-pt-md">{{ `${e.Field}` }}</QItemLabel>
                                <QItem>
                                    <QItemSection>
                                        <QItemLabel v-html="formatNumber(e.OldValue)" caption style="font-size: 2.2rem; text-decoration: line-through; overflow: hidden; text-overflow: ellipsis;"></QItemLabel>
                                    </QItemSection>
                                    <QItemSection>
                                        <QItemLabel v-html="formatNumber(e.NewValue)" style="font-size: 2.2rem; overflow: hidden; text-overflow: ellipsis"></QItemLabel>
                                    </QItemSection>
                                </QItem>
                                <QSeparator inset />
                                <QItem>
                                    <QItemSection avatar top>
                                        <QIcon name="o_account_circle" color="primary" size="sm" />
                                    </QItemSection>
                                    <QItemSection>
                                        <QItemLabel>{{ e.EditedBy }}</QItemLabel>
                                        <QItemLabel caption>{{ `Updated ${e.Timestamp}` }}</QItemLabel>
                                    </QItemSection>
                                </QItem>
                            </QList>
                        </QCard>
                    </QItemSection>

                    <!-- <QItemSection>
                        <QItemLabel>{{ e.Field }}</QItemLabel>
                        <QItemLabel caption>{{ `Old value: ${e.OldValue}` }}</QItemLabel>
                        <QItemLabel caption>{{ `Updated by ${e.EditedBy} on ${e.Timestamp}` }}</QItemLabel>
                    </QItemSection>
                    <QItemSection side top>
                        <QItemLabel class="text-bold text-h6">{{ formatNumber(e.NewValue) }}</QItemLabel>
                    </QItemSection> -->
                </template>

            </QItem>
        </QList>
    </EditDialog>
</template>

<script>
import { defineComponent, inject, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import EditDialog from './General/EditDialog.vue';
import api from "../api/audit";
import { useMainStore } from '../store/index';
import general from "../mixins/general";

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
