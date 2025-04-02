<template>
  <QItem :key="key" class="q-px-none">
    <QItemSection avatar top>
      <QAvatar size="32px" style="background: transparent; margin-top: 4px">
        <QImg
          :src="`${server.defaults.baseURL}/user/photo/?id=${item.UserID}`"
          width="32px"
          height="32px"
        >
          <!-- :src="`data:image/png;base64,${props.row.Photo}`" -->
          <template v-slot:error>
            <QIcon name="o_account_circle" size="32px" />
          </template>
        </QImg>
      </QAvatar>
    </QItemSection>

    <QItemSection style="justify-content: flex-start; padding-top: 4px">
      <QItemLabel class="QCard q-pa-sm" style="border-radius: 8px">
        <div class="q-mb-sm">
          <span class="text-bold">{{ item.DisplayName || "User" }}</span>
          <span class="q-ml-md text-grey" style="font-size: 0.8em">{{
            moment(moment.utc(item.Timestamp)).local().fromNow()
          }}</span>
          <QBtn
            v-if="item.UserID === user.ActiveUser.ID"
            icon="o_more_horiz"
            flat
            round
            size="sm"
            style="position: absolute; right: 4px; top: 4px"
          >
            <QMenu auto-close>
              <QList dense>
                <QItem
                  dense
                  clickable
                  @click="InvokeEditReply(item.Message, item.ID)"
                  >Edit</QItem
                >
                <QItem dense clickable @click="DeleteComment(item.ID)"
                  >Delete</QItem
                >
              </QList>
            </QMenu>
          </QBtn>
        </div>
        <div
          v-if="!replyEditMode"
          class="reply-message"
          v-html="item.Message"
        ></div>
        <Mentionable
          v-else
          :keys="['@']"
          :items="mentions"
          offset="6"
          insert-space
        >
          <q-editor
            v-model="comment"
            auto
            dense
            :definitions="{
              send: {
                tip: 'Save Changes',
                icon: 'o_save',
                label: 'Save',
                handler: SaveReplyUpdate,
              },
              cancel: {
                tip: 'Cancel Reply',
                icon: 'r_close',
                handler: CancelReplyUpdate,
              },
            }"
            :toolbar="[
              ['bold', 'italic', 'strike', 'underline'],
              ['send', 'cancel'],
            ]"
            min-height="2rem"
            class="reply-editor"
            style="border-radius: 16px"
          />
        </Mentionable>
      </QItemLabel>
    </QItemSection>
  </QItem>
</template>

<script>
import { defineComponent, inject, onBeforeUnmount, onMounted, ref } from "vue";
import api from "../api/index";
import server from "../server";
import moment from "moment";
import { Mentionable } from "vue-mention";
import { useUser } from "../../store/user";
import general from "../mixins/general";

export default defineComponent({
  name: "ReplyCard",
  props: {
    ID: {
      type: Number,
      default: -1,
    },
    key: {
      type: Number,
      default: 0,
    },
  },
  components: {
    Mentionable,
  },
  setup(props) {
    const eventBus = inject("eventBus");
    const user = useUser();
    const { ConfirmAction, NotifyUser } = general();
    const item = ref({});
    const comment = ref(null);
    const replyEditMode = ref(false);

    const GetMaster = () => {
      api.CommentReplyGetById(props.ID).then((response) => {
        item.value = { ...response.data };
      });
    };

    const DeleteComment = () => {
      ConfirmAction("Are you sure you want to delete comment?", () => {
        api.CommentDelete(props.ID).then((response) => {
          if (!response.data.success) {
            NotifyUser(response.data);
          }
        });
      });
    };

    const InvokeEditReply = (_data) => {
      comment.value = _data;
      replyEditMode.value = true;
    };

    const SaveReplyUpdate = () => {
      var payload = {
        ID: props.ID,
        Message: comment.value,
        isReply: true,
      };
      api.DashboardCommentSave(payload).then((response) => {
        if (response.data.success) {
          comment.value = null;
          replyEditMode.value = false;
        } else {
          NotifyUser(response.data);
        }
      });
    };

    const CancelReplyUpdate = () => {
      comment.value = null;
      replyEditMode.value = false;
    };

    const EvalUpdateReplies = (_id) => {
        if (props.ID == _id){
            GetMaster();
        }
    }

    onMounted(() => {
      eventBus.$on("hub-update-comment", EvalUpdateReplies);
      GetMaster();
    });

    onBeforeUnmount(() => {
        eventBus.$off("hub-update-comment", EvalUpdateReplies);
    })

    return {
      user,
      item,
      server,
      moment,
      comment,
      replyEditMode,
      InvokeEditReply,
      DeleteComment,
      SaveReplyUpdate,
      CancelReplyUpdate,
    };
  },
});
</script>