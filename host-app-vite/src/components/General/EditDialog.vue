<template>
    <q-dialog v-model="_dialog" position="right" :persistent="persistent" @hide="_dialog = $event">
        <QCard class="edit-dialog" style="height: 100%; max-height: 100%; width: 100vw; overflow: hidden;" square>
            <slot name="header">
                <QToolbar>
                    <QToolbarTitle></QToolbarTitle>
                    <QSpace />
                    <QBtn flat round icon="r_close" @click="_dialog = false" :disable="loading" />
                </QToolbar>
            </slot>
            <QCardSection class="content-section row" :style="`${contentStyle}`">
                <slot>

                </slot>
            </QCardSection>
            <QCard-actions v-if="showAction" class="action-section" :style="`${actionStyle}`">
                <slot name="action">
                    <QBtn label="Save" color="green" class="full-width" no-caps @click="context.emit('save')" />
                </slot>
            </QCard-actions>
        </QCard>
    </q-dialog>
</template>

<style lang="scss">
.edit-dialog {
    .QToolbar {
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