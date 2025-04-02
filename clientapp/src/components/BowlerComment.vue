<template>
    <q-list class="bowler-comment" :style="`overflow: auto; width: 100%; height: auto; max-height: ${(extended ? '260px' : '60px')}`">
        <q-item class="comment-container-item q-pa-none">
            <q-item-section class="comment-container-section q-py-none">
                <q-item-label class="comment-container" :style="`border: none; overflow: auto; width: 100%; height: auto; max-height: ${(extended ? '128px;' : '56px')}`">
                    <Mentionable ref="mentionable" :keys="['@']" insert-space :items="mention.items.value" :loading="mention.loading.value" :mapInsert="MapInsert" @search="mention.SearchADUsers"
                        @input="MentionINput" @update-model="item.comment = $event">
                        <q-editor ref="editor" :class="`qeditor ${(paddedComment ? 'padded' : '')}`" v-model="item.comment" min-height="1rem" autofocus
                            :style="`border: none; width: 100%; height: auto;`" :readonly="readonly" :toolbar="null">
                        </q-editor>

                        <template v-slot:no-result>
                            <q-item class="user">
                                <q-item-section>
                                    <q-item-label>{{ mention.loading.value ? `Searching users...` : `No result` }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </template>

                        <template v-slot:item-parent="{ items, selectedIndex, setIndex, applyMention }">
                            <q-item v-for="(item, index) of items" :key="index" class="mention-item" :class="{
                                'mention-selected': selectedIndex === index,
                            }" @mouseover="setIndex(index)" @mousedown="applyMention(index)">
                                <q-item-section avatar>
                                    <q-avatar size="48px" style="background: #bbb">
                                        <q-img :src="`${server.defaults.baseURL}api/account/adphoto/?acct=${item.Email}`" width="48px" height="48px">
                                            <template v-slot:error>
                                                <div class="no-photo">
                                                    {{ ParseName(item.DisplayName) }}
                                                </div>
                                            </template>
                                        </q-img>
                                    </q-avatar>
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label>{{ item.DisplayName }}</q-item-label>
                                    <q-item-label caption>{{ item.Email }}</q-item-label>
                                    <q-item-label v-if="item.Title" caption>{{ item.Title }}</q-item-label>
                                </q-item-section>
                                <q-item-section side top style="z-index: 10000;">
                                    <q-btn flat round size="md" icon="o_call_to_action" @mousedown="InvokeAction($event, item)">
                                        <q-tooltip style="z-index: 10000;">Assign action item</q-tooltip>
                                    </q-btn>
                                </q-item-section>
                            </q-item>
                        </template>
                    </Mentionable>
                </q-item-label>

            </q-item-section>
            <q-item-section v-if="!hideControl" side top no-wrap class="control-bar q-pt-sm"
                style="flex-direction: row; align-content: flex-start; position: absolute; right: 10px; padding: 0px; border-radius: 4px;">
                <q-btn color="primary" :icon="extended ? 'o_expand_less' : 'o_expand_more'" size="sm" flat @click.stop="extended = !extended" padding="xs">
                    <q-tooltip>Toggle expanded view</q-tooltip>
                </q-btn>
                <q-btn color="primary" flat icon="o_fullscreen" dense @click="dialog = !dialog" size="sm" padding="xs"><q-tooltip>Toggle Fullscreen View</q-tooltip></q-btn>
                <q-btn v-if="dirty && !readonly" color="primary" icon="o_undo" size="sm" flat @click.stop="GetMaster" padding="xs" :disable="readonly">
                    <q-tooltip>Undo changes</q-tooltip>
                </q-btn>
                <q-btn v-if="dirty && !readonly" color="primary" icon="o_save" size="sm" flat @click.stop="InvokeSave(opts)" padding="xs" :disable="readonly">
                    <q-tooltip>Save changes</q-tooltip>
                </q-btn>
                <q-btn v-if="!readonly" icon="o_content_copy" color="primary" size="sm" flat @click.stop="CopyPrevious" padding="xs" :disable="readonly">
                    <q-tooltip>Copy from previous period</q-tooltip>
                </q-btn>
                <q-btn color="primary" icon="o_attach_file" size="sm" flat padding="xs">
                    <q-badge v-if="files.length > 0" floating rounded align="bottom">{{ files.length }}</q-badge>
                    <q-popup-proxy>
                        <q-card flat style="width: 380px">
                            <q-card-section>
                                <q-list separator style="max-height: 330px; overflow: auto;">
                                    <q-item class="q-pa-sm" style="padding: 8px; position: sticky; top: 0px; background: #fff; z-index: 2;">
                                        <q-item-section>
                                            <q-item-label class="text-bold text-h6">Attachments</q-item-label>
                                        </q-item-section>
                                        <q-item-section v-if="!readonly" side top>
                                            <q-btn color="primary" no-caps size="sm" icon="o_add" label="Upload file" @click="qfile.pickFiles()" style="margin-top: 4px" :disable="readonly" unelevated>
                                                <q-tooltip>Upload new attachment</q-tooltip>
                                            </q-btn>
                                        </q-item-section>
                                    </q-item>
                                    <q-item v-if="files.length === 0" class="q-px-sm">
                                        <q-item-section>
                                            <q-item-label>No attached files</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                    <q-item v-for="(f, i) in files" :key="i" class="q-px-sm" clickable style="padding-left: 8px; padding-right: 8px;" @click="OpenFile(f)">
                                        <q-item-section avatar top>
                                            <q-icon name="o_description" size="sm" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label>{{ f.FileName }}</q-item-label>
                                            <q-item-label caption>{{ `Uploaded by ${f.Uploader} on ${f.Timestamp}` }}</q-item-label>
                                        </q-item-section>
                                        <q-item-section side>
                                            <q-btn flat round size="sm" icon="o_close" @click.stop="DeleteFile(f)" />
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-card-section>
                        </q-card>
                    </q-popup-proxy>
                </q-btn>
                <q-btn icon="o_history" color="primary" size="sm" flat @click.stop="ShowEditHistory" padding="xs">
                    <q-tooltip>Show edit history</q-tooltip>
                </q-btn>
                <q-file v-model="file" ref="qfile" label="Pick one file" filled style="max-width: 300px; display: none;" dense accept="*/*" />
            </q-item-section>
        </q-item>
        <q-expansion-item v-if="!hideControl && actionRegister.items.value.length > 0" :key="actionRegister.renderKey" class="q-px-none" label="Action Items" dense icon="o_call_to_action"
            >
            <template v-slot:header>
                <!-- <q-item-section v-if="!hideControl" avatar style="padding-right: 8px;">
                    <q-avatar icon="o_call_to_action" size="24px" color="red" text-color="white" />
                </q-item-section> -->

                <q-item-section v-if="!hideControl" class="text-bold">
                    {{ `${actionRegister.items.value.length} Action Item${(actionRegister.items.value.length > 1 ? 's' : '')}` }}
                </q-item-section>

                <!-- <q-item-section v-if="!hideControl" side>
                    <q-badge rounded color="red">{{ actionRegister.items.value.length }}</q-badge>
                </q-item-section> -->
            </template>

            <q-item v-for="(action, i) in actionRegister.items.value" :key="`${i}-${actionRegister.renderKey}`" class="q-px-sm">
                <ActionItem :modelValue="action" style="width: 100%" @undo="actionRegister.RefreshItem($event, i)" @save="actionRegister.SaveItem($event, i)"
                    @delete="actionRegister.DeleteItem($event, i)" @dirty="action.dirty = true" :badge-size="`16px`" :hide-control="hideControl">
                    <q-editor v-model="action.Message" min-height="2rem" autofocus :style="`border: none; width: 100%; height: 100%;`" :toolbar="null"></q-editor>
                </ActionItem>
            </q-item>
        </q-expansion-item>
        <template v-else-if="hideControl && actionRegister.items.value.length > 0">
            &nbsp;Action Items
            <p v-for="(action, i) in actionRegister.items.value" :key="`${i}-${actionRegister.renderKey}`">
                &nbsp;{{ action.Metadata.DisplayName }} - {{ action.Message }}
            </p>
        </template>


        <q-dialog v-model="dialog" persistent>
            <q-card class="bowler-comment-fs comment-card-fs">
                <q-toolbar class="chart-toolbar">
                    <!-- <q-btn round flat icon="o_download" dense><q-tooltip>Download</q-tooltip></q-btn> -->
                    <div class="card-title" style="font-size: 2em;">{{ opts?.title || "Comment" }}</div>
                    <q-spinner v-if="loading > 0" color="white" size="30px" />
                    <q-btn v-if="dirty" round flat icon="o_save" dense @click="InvokeSave"><q-tooltip>Save Changes</q-tooltip></q-btn>
                    <q-btn round flat icon="o_refresh" dense @click="GetMaster"><q-tooltip>Refresh</q-tooltip></q-btn>
                    <q-btn round flat icon="o_close" dense @click="dialog = !dialog"><q-tooltip>Toggle Fullscreen View</q-tooltip></q-btn>
                </q-toolbar>
                <q-list class="" style="overflow: auto; height: calc(100% - 50px)">
                    <q-item v-if="resultMsg" :class="`q-px-sm q-mt-md q-mx-sm ${resultMsg.success ? 'bg-primary' : 'bg-negative'}`" dense
                        style="padding: 8px; overflow: auto; min-height: 60px; z-index: 10; border-radius: 4px;">
                        <q-item-section>
                            <q-item-label class="text-white q-pa-sm">{{ resultMsg.message }}</q-item-label>
                        </q-item-section>
                        <q-item-section side class="q-pa-none">
                            <q-btn flat round icon="o_close" dense @click="resultMsg = null" size="8px" text-color="white" />
                        </q-item-section>
                    </q-item>
                    <q-item style="padding: 8px; overflow:auto; height: 100%; max-height: calc(100%);">
                        <q-item-section style="justify-content: start;">
                            <div class="row" style="height: 100%">
                                <div :class="`col-12 ${(actionRegister.items.value.length > 0 ? 'col-md-8' : '')}`">
                                    <Mentionable ref="mentionable" :keys="['@']" insert-space :items="mention.items.value" :loading="mention.loading.value" :mapInsert="MapInsert"
                                        @search="mention.SearchADUsers" @input="MentionINput" @update-model="item.comment = $event">
                                        <q-editor ref="editor2" :class="`qeditor ${(paddedComment ? 'padded' : '')}`" v-model="item.comment" min-height="2rem" autofocus
                                            :style="`border: none; width: 100%; max-height: 100%; height: ${(actionRegister.items.value.length > 0 && collapseActions ? 'auto' : '100%')};`" :readonly="readonly" :toolbar="null">
                                        </q-editor>

                                        <template v-slot:no-result>
                                            <q-item class="user">
                                                <q-item-section>
                                                    <q-item-label>{{ mention.loading.value ? `Searching users...` : `No result` }}</q-item-label>
                                                </q-item-section>
                                            </q-item>
                                        </template>

                                        <template v-slot:item-parent="{ items, selectedIndex, setIndex, applyMention }">
                                            <q-item v-for="(item, index) of items" :key="index" class="mention-item" :class="{
                                                'mention-selected': selectedIndex === index,
                                            }" @mouseover="setIndex(index)" @mousedown="applyMention(index)">
                                                <q-item-section avatar>
                                                    <q-avatar size="48px" style="background: #bbb">
                                                        <q-img :src="`${server.defaults.baseURL}api/account/adphoto/?acct=${item.Email}`" width="48px" height="48px">
                                                            <template v-slot:error>
                                                                <div class="no-photo">
                                                                    {{ ParseName(item.DisplayName) }}
                                                                </div>
                                                            </template>
                                                        </q-img>
                                                    </q-avatar>
                                                </q-item-section>
                                                <q-item-section>
                                                    <q-item-label>{{ item.DisplayName }}</q-item-label>
                                                    <q-item-label caption>{{ item.Email }}</q-item-label>
                                                    <q-item-label v-if="item.Title" caption>{{ item.Title }}</q-item-label>
                                                </q-item-section>
                                                <q-item-section side top style="z-index: 10000;">
                                                    <q-btn flat round size="md" icon="o_call_to_action" @mousedown="InvokeAction($event, item)">
                                                        <q-tooltip style="z-index: 10000;">Assign action item</q-tooltip>
                                                    </q-btn>
                                                </q-item-section>
                                            </q-item>
                                        </template>
                                    </Mentionable>
                                </div>
                                <div v-if="actionRegister.items.value.length > 0" class="col-12 col-md-4" style="border-left: 1px solid #eee;">
                                    <q-list>
                                        <q-item-label class="q-px-md text-bold" style="font-size: 1.5em;">Action Items</q-item-label>
                                        <q-item v-for="(action, i) in actionRegister.items.value" :key="`${i}-${actionRegister.renderKey}`">
                                            <ActionItem :modelValue="action" style="width: 100%" @undo="actionRegister.RefreshItem($event, i)" @save="actionRegister.SaveItem($event, i)"
                                                @delete="actionRegister.DeleteItem($event, i)" @dirty="action.dirty = true">
                                                <q-editor v-model="action.Message" min-height="2rem" autofocus :style="`border: none; width: 100%; height: 100%;`" :toolbar="null"></q-editor>
                                            </ActionItem>
                                        </q-item>
                                    </q-list>
                                </div>
                            </div>

                        </q-item-section>

                    </q-item>
                </q-list>
            </q-card>
        </q-dialog>
    </q-list>
</template>

<style lang="scss">
.mention-item {
    display: flex;
}

.mention-selected {
    background: rgba(0, 0, 0, 0.1);
}

.bowler-comment {
    .control-bar {
        background: white;
    }

    .q-item {
        min-height: 24px !important;
    }

    .qeditor {
        .q-editor__content {
            height: 100%;
            padding-top: 2px;
        }

        &.padded {
            .q-editor__content {
                padding-top: 22px;
            }
        }
    }

    .no-photo {
        width: 48px;
        height: 48px;
        text-align: center;
        padding: 0px;
        line-height: 2em;
    }

    .q-editor__toolbars-container {
        display: none;
    }

    .q-field__bottom {
        padding: 0px;
    }

    .action-panel {
        -ms-flex-direction: row;
        flex-direction: row;
        // position: absolute;
        right: 8px;
        z-index: 2;
        bottom: 0px;
    }

    .q-textarea {
        .q-field__control {
            height: 100%;
            padding-right: 2px;
            padding-left: 8px;
        }

        .q-field__native {
            padding-top: 0px !important;
        }
    }

    .q-badge {
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 10px;
        line-height: 9px;
        min-height: 13px;
        right: 2px;
    }
}

.bowler-comment-fs {
    .mentionable {
        height: 100%;
    }
}

.body--dark {
    .bowler-comment {
        .control-bar {
            background: white;
        }
    }
}
</style>

<script>
import { computed, defineAsyncComponent, defineComponent, onMounted, ref, watch } from 'vue';
import { useMainStore } from '@/store/index';
import useComment from '@/composables/comment';
import useMention from '../composables/mention';
import useActionRegister from '../composables/actionRegister';
//import { Mentionable } from "vue-mention"
import Mentionable from './General/Mentionable.vue';
import server from "@/server";
import general from "@/mixins/general"
import { useHelper } from '../composables/helper';
import { useQuasar } from 'quasar';

export default defineComponent({
    props: {
        modelValue: {
            type: Object,
            default: () => ({})
        },
        category: {
            type: String,
            default: null
        },
        readonly: {
            type: Boolean,
            default: false
        },
        padOffset: {
            type: Number,
            default: 40
        },
        opts: {
            type: Object,
            default: () => ({})
        },
        hideControl: {
            type: Boolean,
            default: false
        },
    },
    components: {
        Mentionable,
        ActionItem: defineAsyncComponent(() => import("./General/ActionItem.vue"))
    },
    setup(props) {
        const { renderKey, UpRender } = useHelper();
        const mainStore = useMainStore();
        const q = useQuasar();
        const {
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
            SetCategory,
            SetItem,
            SubmitFile,
            FetchUsers
        } = useComment();
        const { ParseName } = general();
        const mention = useMention();
        const actionRegister = useActionRegister(props.opts);
        const editMode = ref(false);
        const extended = ref(false);

        const dialog = ref(false);
        const file = ref(null);
        const qfile = ref(null);
        const mentionable = ref(null);

        const paddedComment = computed(() => {
            return item.value && item.value.comment && item.value.comment.length > props.padOffset;
        });

        const collapseActions = computed(() => {
            return q.screen.width < 1024;
        })


        watch(() => props.modelValue, (val) => {
            if (val.Category !== undefined) {
                item.value = { ...val };
                setTimeout(() => {
                    dirty.value = false;
                    GetFiles();
                    actionRegister.GetActionRegisters(item.value.Category);
                }, 800);
            }
        }, { immediate: true, deep: true });

        watch(file, (newVal) => {
            if (newVal) {
                SubmitFile(file.value);
                setTimeout(() => {
                    file.value = null;
                }, 800);
            }
        });

        const MapInsert = (key, val) => {
            return `${key}${val.DisplayName}`
        }

        const MentionINput = (data) => {
            console.warn(data)
        }

        const InvokeAction = (evt, _selected) => {
            evt.stopPropagation();
            console.warn("InvokeAction", evt, _selected);
            if (mentionable.value) mentionable.value.omitMention();

            actionRegister.Add(item.value.Category, _selected);
            UpRender();
        }


        onMounted(() => {
            console.warn("BowlerComment mounted", props.category)
            if (props.category) {
                item.value = {
                    Category: props.category,
                    comment: null,
                    highlights: null,
                    lowlights: null
                }
                GetMaster();
            }

            setTimeout(() => {
                dirty.value = false;
            }, 800);
        });

        return {
            item,
            mainStore,
            dirty,
            editMode,
            files,
            extended,
            file,
            qfile,
            InvokeSave,
            GetMaster,
            CopyPrevious,
            OpenFile,
            GetFiles,
            DeleteFile,
            ShowEditHistory,
            SetCategory,
            SetItem,
            FetchUsers,
            MapInsert,
            mention,
            MentionINput,
            server,
            ParseName,
            paddedComment,
            dialog,
            InvokeAction,
            mentionable,
            actionRegister,
            renderKey, UpRender,
            collapseActions
        }
    },
})
</script>
