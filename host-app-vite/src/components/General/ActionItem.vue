<template>
    <QCard class="action-item">
        <QToolbar v-if="item" style="height: 44px; min-height: 32px; padding-top: 8px;">
            <QList dense>
                <QItem class="q-px-none" style="padding-left: 0px; padding-right: 0px">
                    <QItemSection avatar>
                        <QAvatar size="24px" style="background: #bbb">
                            <QImg :src="`${server.defaults.baseURL}api/account/adphoto/?acct=${item.Metadata?.Email}`" width="24px" height="24px">
                                <template v-slot:error>
                                    <div class="no-photo">

                                    </div>
                                </template>
                            </QImg>
                        </QAvatar>
                    </QItemSection>
                    <QItemSection>
                        <QItemLabel>{{ item.Metadata.DisplayName }}</QItemLabel>
                        <QItemLabel v-if="item.Metadata?.Title" caption style="margin-top: 0px">{{ item.Metadata?.Title }}</QItemLabel>
                    </QItemSection>
                </QItem>
            </QList>
            <QSpace />

            <slot name="action-bar">
                <q-select v-if="item.Metadata" v-model="item.Metadata.Status" hide-dropdown-icon dense borderless :options="actionRegister.action_options.value" map-options emit-value style="margin-top: -8px;">
                    <template v-slot:option="{ opt, toggleOption }">
                        <QItem dense @click="toggleOption(opt)" clickable>
                            <QItemSection avatar>
                                <QAvatar :color="opt.color || 'primary'" size="16px"></QAvatar>
                            </QItemSection>
                            <QItemSection>
                                <QItemLabel>{{ opt.label }}</QItemLabel>
                            </QItemSection>
                        </QItem>
                    </template>
                    <template v-slot:selected-item="{ opt }">
                        <QAvatar :color="opt.color || 'primary'" :size="badgeSize" style="margin-right: 8px;" ><QTooltip>{{ opt.label }}</QTooltip></QAvatar>
                    </template>
                </q-select>
                <QBtn v-if="item && item.dirty && item.Id > 0" icon="o_undo" size="16px" color="primary" dense flat @click="emit('undo', item)" />
                <QBtn v-if="item && item.dirty || item.Id == 0" icon="o_save" size="16px" color="primary" dense flat @click="emit('save', item)" />
                <QBtn v-if="!hideControl" icon="o_delete" size="16px" color="primary" dense flat @click="emit('delete', item)" />
            </slot>
        </QToolbar>
        <QCardSection v-if="item" style="padding: 0px">
            <slot>
                <q-editor ref="editor" v-model="item.Message" min-height="2rem" autofocus :style="`border: none; width: 100%; height: 100%;`"></q-editor>
            </slot>
        </QCardSection>
    </QCard>
</template>

<style lang="scss">
.action-item {
    .q-field--dense {
        .q-field__control {
            min-height: 30px;
            height: 34px;
        }
    }
}
</style>

<script>
import { defineComponent, ref, watch } from 'vue'
import server from "../server";
import { useHelper } from '../../composables/helper';
import useActionRegister from '../../composables/actionRegister';

export default defineComponent({
    props: {
        modelValue: {
            type: Object,
            default: () => ({})
        },
        badgeSize: {
            type: String,
            default: "24px"
        },
        hideControl: {
            type: Boolean,
            default: false
        },
    },
    emits: ["update:modelValue", "dirty"],
    setup(props, { emit }) {
        const { renderKey, UpRender } = useHelper();
        const actionRegister = useActionRegister();
        const dirty = ref(false);

        const item = ref({});
        watch(props.modelValue, () => {
            item.value = { ...props.modelValue }
            console.warn("watch poop model", props.modelValue)
            setTimeout(() => {
                dirty.value = item.value.dirty;
            }, 1200)
            
        }, { deep: true, immediate: true });

        watch(item, () => {
            item.value.dirty = true;
            emit("update:modelValue", item.value);
            //emit("dirty");            
            dirty.value = true;
        }, { deep: true });

        return {
            item,
            dirty,
            server,
            renderKey,
            actionRegister,
            UpRender,
            emit
        }
    },
})
</script>
