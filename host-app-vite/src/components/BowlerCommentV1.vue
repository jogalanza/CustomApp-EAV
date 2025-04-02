<template>
    <QList class="bowler-comment">
        <QItem class="q-pa-none">
            <QItemSection>
                <q-input ref="editor" class="key-focus-editor" borderless v-model="_item.comment" :style="`width: 100%; height: ${(extended ? '128px' : '52px')}`" type="textarea" autofocus
                    :readonly="readonly">
                </q-input>
            </QItemSection>
            <QItemSection side top no-wrap class="q-pt-sm" style="flex-direction: row; align-content: flex-start;">
                <QBtn color="primary" :icon="extended ? 'o_expand_less' : 'o_expand_more'" size="sm" flat @click.stop="extended = !extended" padding="xs">
                    <QTooltip>Toggle expanded view</QTooltip>
                </QBtn>
                <QBtn v-if="dirty && !readonly" color="primary" icon="o_undo" size="sm" flat @click.stop="GetMaster" padding="xs" :disable="readonly">
                    <QTooltip>Undo changes</QTooltip>
                </QBtn>
                <QBtn v-if="dirty && !readonly" color="primary" icon="o_save" size="sm" flat @click.stop="InvokeSave" padding="xs" :disable="readonly">
                    <QTooltip>Save changes</QTooltip>
                </QBtn>
                <QBtn v-if="!readonly" icon="o_content_copy" color="primary" size="sm" flat @click.stop="CopyPrevious" padding="xs" :disable="readonly">
                    <QTooltip>Copy from previous period</QTooltip>
                </QBtn>
                <QBtn color="primary" icon="o_attach_file" size="sm" flat padding="xs">
                    <QBadge v-if="files.length > 0" floating rounded align="bottom">{{ files.length }}</QBadge>
                    <QPopupProxy>
                        <QCard flat style="width: 380px">
                            <QCardSection>
                                <QList separator style="max-height: 330px; overflow: auto;">
                                    <QItem class="q-pa-sm" style="padding: 8px; position: sticky; top: 0px; background: #fff; z-index: 2;">
                                        <QItemSection>
                                            <QItemLabel class="text-bold text-h6">Attachments</QItemLabel>
                                        </QItemSection>
                                        <QItemSection v-if="!readonly" side top>
                                            <QBtn color="primary" no-caps size="sm" icon="o_add" label="Upload file" @click="qfile.pickFiles()" style="margin-top: 4px" :disable="readonly" unelevated>
                                                <QTooltip>Upload new attachment</QTooltip>
                                            </QBtn>
                                        </QItemSection>
                                    </QItem>
                                    <QItem v-if="files.length === 0" class="q-px-sm">
                                        <QItemSection>
                                            <QItemLabel>No attached files</QItemLabel>
                                        </QItemSection>
                                    </QItem>
                                    <QItem v-for="(f, i) in files" :key="i" class="q-px-sm" clickable style="padding-left: 8px; padding-right: 8px;" @click="OpenFile(f)">
                                        <QItemSection avatar top>
                                            <QIcon name="o_description" size="sm" />
                                        </QItemSection>
                                        <QItemSection>
                                            <QItemLabel>{{ f.FileName }}</QItemLabel>
                                            <QItemLabel caption>{{ `Uploaded by ${f.Uploader} on ${f.Timestamp}` }}</QItemLabel>
                                        </QItemSection>
                                        <QItemSection side>
                                            <QBtn flat round size="sm" icon="o_close" @click.stop="DeleteFile(f)" />
                                        </QItemSection>
                                    </QItem>
                                </QList>
                            </QCardSection>
                        </QCard>
                    </QPopupProxy>
                </QBtn>
                <QBtn icon="o_history" color="primary" size="sm" flat @click.stop="ShowEditHistory" padding="xs">
                    <QTooltip>Show edit history</QTooltip>
                </QBtn>
                <q-file v-model="file" ref="qfile" label="Pick one file" filled style="max-width: 300px; display: none;" dense accept="*/*" />
            </QItemSection>
        </QItem>

        <!-- <QItem class="q-pa-none">
            <QItemSection>
                <QItemLabel>
                    <q-input ref="editor" class="key-focus-editor" borderless v-model="_item.comment" :style="`min-height: 52px; width: 100%; height: ${(extended ? '128px' : '52px')}`" type="textarea"
                        autofocus :readonly="readonly">
                    </q-input>
                    <div class="action-panel row no-wrap">
                        <QSpace />
                        <QBtn color="primary" :icon="extended ? 'o_expand_less' : 'o_expand_more'" size="sm" flat @click.stop="extended = !extended" padding="xs">
                            <QTooltip>Toggle expanded view</QTooltip>
                        </QBtn>
                        <QBtn v-if="dirty && !readonly" color="primary" icon="o_undo" size="sm" flat @click.stop="GetMaster" padding="xs" :disable="readonly">
                            <QTooltip>Undo changes</QTooltip>
                        </QBtn>
                        <QBtn v-if="dirty && !readonly" color="primary" icon="o_save" size="sm" flat @click.stop="InvokeSave" padding="xs" :disable="readonly">
                            <QTooltip>Save changes</QTooltip>
                        </QBtn>
                        <QBtn v-if="!readonly" icon="o_content_copy" color="primary" size="sm" flat @click.stop="CopyPrevious" padding="xs" :disable="readonly">
                            <QTooltip>Copy from previous period</QTooltip>
                        </QBtn>
                        <QBtn color="primary" icon="o_attach_file" size="sm" flat padding="xs">
                            <QBadge v-if="files.length > 0" floating rounded align="bottom">{{ files.length }}</QBadge>
                            <QPopupProxy>
                                <QCard flat style="width: 380px">
                                    <QCardSection>
                                        <QList separator style="max-height: 330px; overflow: auto;">
                                            <QItem class="q-pa-sm" style="padding: 8px; position: sticky; top: 0px; background: #fff; z-index: 2;">
                                                <QItemSection>
                                                    <QItemLabel class="text-bold text-h6">Attachments</QItemLabel>
                                                </QItemSection>
                                                <QItemSection v-if="!readonly" side top>
                                                    <QBtn color="primary" no-caps size="sm" icon="o_add" label="Upload file" @click="qfile.pickFiles()" style="margin-top: 4px" :disable="readonly"
                                                        unelevated>
                                                        <QTooltip>Upload new attachment</QTooltip>
                                                    </QBtn>
                                                </QItemSection>
                                            </QItem>
                                            <QItem v-if="files.length === 0" class="q-px-sm">
                                                <QItemSection>
                                                    <QItemLabel>No attached files</QItemLabel>
                                                </QItemSection>
                                            </QItem>
                                            <QItem v-for="(f, i) in files" :key="i" class="q-px-sm" clickable style="padding-left: 8px; padding-right: 8px;" @click="OpenFile(f)">
                                                <QItemSection avatar top>
                                                    <QIcon name="o_description" size="sm" />
                                                </QItemSection>
                                                <QItemSection>
                                                    <QItemLabel>{{ f.FileName }}</QItemLabel>
                                                    <QItemLabel caption>{{ `Uploaded by ${f.Uploader} on ${f.Timestamp}` }}</QItemLabel>
                                                </QItemSection>
                                                <QItemSection side>
                                                    <QBtn flat round size="sm" icon="o_close" @click.stop="DeleteFile(f)" />
                                                </QItemSection>
                                            </QItem>
                                        </QList>
                                    </QCardSection>
                                </QCard>
                            </QPopupProxy>
                        </QBtn>
                        <QBtn icon="o_history" color="primary" size="sm" flat @click.stop="ShowEditHistory" padding="xs">
                            <QTooltip>Show edit history</QTooltip>
                        </QBtn>
                        <q-file v-model="file" ref="qfile" label="Pick one file" filled style="max-width: 300px; display: none;" dense accept="*/*" />
                    </div>
                </QItemLabel>
            </QItemSection>
        </QItem> -->
    </QList>
</template>

<style lang="scss">
.bowler-comment {
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

    .QBadge {
        padding: 2px 4px;
        border-radius: 4px;
        font-size: 10px;
        line-height: 9px;
        min-height: 13px;
        right: 2px;
    }
}
</style>

<script>
import { defineComponent, onMounted, ref, watch } from 'vue';
import { useMainStore } from '../store/index';
import api from "../api/bowler";
import apiFile from "../api/file";
import general from "../mixins/general";
import axios from 'axios';
import { inject } from 'vue';

export default defineComponent({
    props: {
        item: {
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
        }
    },
    setup(props, context) {
        const mainStore = useMainStore();
        const { NotifyUser, base64ToArrayBuffer, ConfirmAction,
            saveByteArray } = general();
        const _item = ref(null);
        const dirty = ref(false);
        const editMode = ref(false);
        const cancelToken = ref(null);
        const files = ref([]);
        const extended = ref(false);
        const eventBus = inject("eventBus");

        const file = ref(null);
        const qfile = ref(null);

        watch(() => props.item, (val) => {
            if (val.Category !== undefined) {
                _item.value = { ...val };
                setTimeout(() => {
                    dirty.value = false;
                    GetFiles();
                }, 800);
            }
        }, { immediate: true, deep: true });

        watch(() => _item.value, () => {
            dirty.value = true;
        }, { deep: true });

        watch(file, (newVal) => {
            if (newVal) {
                SubmitFile();
            }
        });

        const InvokeSave = () => {
            api.SaveComment({
                session: mainStore.SessionOptions,
                comment: _item.value
            }).then(response => {
                if (response.data.success) {
                    context.emit("update");
                    dirty.value = false;
                }

                NotifyUser(response.data);
            })
        }

        const GetMaster = () => {
            if (cancelToken.value) cancelToken.value.cancel();

            cancelToken.value = axios.CancelToken.source();

            api.GetComment({
                session: mainStore.SessionOptions,
                comment: {
                    Category: _item.value.Category !== undefined ? _item.value.Category : props.category
                }
            }, cancelToken.value).then(response => {
                _item.value = { ...response.data };
                setTimeout(() => {
                    dirty.value = false;
                }, 400);
            });
        }

        const CopyPrevious = () => {
            if (cancelToken.value) cancelToken.value.cancel();

            cancelToken.value = axios.CancelToken.source();

            api.GetPreviousComment({
                session: mainStore.SessionOptions,
                comment: {
                    Category: _item.value.Category !== undefined ? _item.value.Category : props.category
                }
            }, cancelToken.value).then(response => {
                _item.value = response.data;
            });
        }

        const GetFiles = () => {
            apiFile.GetFiles({
                session: JSON.stringify(mainStore.SessionOptions),
                category: _item.value.Category
            }).then(response => {
                files.value = response.data;
            });
        }

        const SubmitFile = () => {
            try {
                let formData = new FormData()
                formData.append('file', file.value)
                formData.append('session', JSON.stringify(mainStore.SessionOptions));
                formData.append('category', _item.value.Category);

                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: function (progressEvent) {
                        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        console.log(percentCompleted);
                    }
                }

                setTimeout(() => {
                    file.value = null;
                }, 1000);

                apiFile.Upload(formData, config).then(response => {
                    NotifyUser(response.data);
                    GetFiles();
                }).catch(() => {
                    //
                });
            }
            catch {
                //
            }
        }

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
        }

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
        }

        const ShowEditHistory = () => {
            eventBus.$emit("show-edit-history", {
                category: _item.value.Category,
            });
        }



        onMounted(() => {
            console.warn("BowlerComment mounted", props.category)
            if (props.category) {
                _item.value = {
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
            _item,
            mainStore,
            dirty,
            editMode,
            files,
            extended,
            file,
            qfile,
            InvokeSave,
            GetMaster,
            OpenFile,
            DeleteFile,
            CopyPrevious,
            ShowEditHistory
        }
    },
})
</script>
