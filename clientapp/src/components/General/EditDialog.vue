<template>
    <q-dialog v-model="_dialog" position="right" :persistent="persistent" @hide="_dialog = $event">
        <q-card class="edit-dialog" style="height: 100%; max-height: 100%; width: 100vw; overflow: hidden;" square>
            <slot name="header">
                <q-toolbar>
                    <q-toolbar-title></q-toolbar-title>
                    <q-space />
                    <q-btn flat round icon="r_close" @click="_dialog = false" :disable="loading" />
                </q-toolbar>
            </slot>
            <q-card-section class="content-section row" :style="`${contentStyle}`">
                <slot>

                </slot>
            </q-card-section>
            <q-card-actions v-if="showAction" class="action-section" :style="`${actionStyle}`">
                <slot name="action">
                    <q-btn label="Save" color="green" class="full-width" no-caps @click="context.emit('save')" />
                </slot>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<style lang="scss">
.edit-dialog {
    .q-toolbar {
        padding-left: 36px;
        padding-top: 8px;
        padding-right: 8px;
    }
}
</style>

<script>


import { ref, watch } from "vue";

export default {
    props: {
        dialog: {
            type: Boolean,
            default: false
        },
        persistent: {
            type: Boolean,
            default: true
        },
        actionStyle: {
            type: String,
            default: ""
        },
        contentStyle: {
            type: String,
            default: ""
        },
        showAction: {
            type: Boolean,
            default: true
        },
    },
    emits: ["ondialog", "save"],
    setup(props, context) {
        const _dialog = ref(false);

        watch(_dialog, (newVal) => {
            context.emit("ondialog", newVal)
        });

        watch(() => props.dialog, (newVal) => {
            _dialog.value = newVal;
        }, { immediate: true });

        return {
            context,
            _dialog
        }
    },
}
</script>