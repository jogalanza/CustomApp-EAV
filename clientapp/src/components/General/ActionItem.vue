<template>
    <q-card class="action-item">
        <q-toolbar v-if="item" style="height: 44px; min-height: 32px; padding-top: 8px;">
            <q-list dense>
                <q-item class="q-px-none" style="padding-left: 0px; padding-right: 0px">
                    <q-item-section avatar>
                        <q-avatar size="24px" style="background: #bbb">
                            <q-img :src="`${server.defaults.baseURL}api/account/adphoto/?acct=${item.Metadata?.Email}`" width="24px" height="24px">
                                <template v-slot:error>
                                    <div class="no-photo">

                                    </div>
                                </template>
                            </q-img>
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ item.Metadata.DisplayName }}</q-item-label>
                        <q-item-label v-if="item.Metadata?.Title" caption style="margin-top: 0px">{{ item.Metadata?.Title }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
            <q-space />

            <slot name="action-bar">
                <q-select v-if="item.Metadata" v-model="item.Metadata.Status" hide-dropdown-icon dense borderless :options="actionRegister.action_options.value" map-options emit-value style="margin-top: -8px;">
                    <template v-slot:option="{ opt, toggleOption }">
                        <q-item dense @click="toggleOption(opt)" clickable>
                            <q-item-section avatar>
                                <q-avatar :color="opt.color || 'primary'" size="16px"></q-avatar>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ opt.label }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                    <template v-slot:selected-item="{ opt }">
                        <q-avatar :color="opt.color || 'primary'" :size="badgeSize" style="margin-right: 8px;" ><q-tooltip>{{ opt.label }}</q-tooltip></q-avatar>
                    </template>
                </q-select>
                <q-btn v-if="item && item.dirty && item.Id > 0" icon="o_undo" size="16px" color="primary" dense flat @click="emit('undo', item)" />
                <q-btn v-if="item && item.dirty || item.Id == 0" icon="o_save" size="16px" color="primary" dense flat @click="emit('save', item)" />
                <q-btn v-if="!hideControl" icon="o_delete" size="16px" color="primary" dense flat @click="emit('delete', item)" />
            </slot>
        </q-toolbar>
        <q-card-section v-if="item" style="padding: 0px">
            <slot>
                <q-editor ref="editor" v-model="item.Message" min-height="2rem" autofocus :style="`border: none; width: 100%; height: 100%;`"></q-editor>
            </slot>
        </q-card-section>
    </q-card>
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
import server from "@/server";
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
