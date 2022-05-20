<template>
  <div class="hotComments">
    <!-- 输入框 -->
    <div
      class="comments"
      v-if="commentType != '' && commentType != 'music' && isHotComment"
    >
      <el-input
        type="textarea"
        class="commentArea"
        maxlength="150"
        show-word-limit
        v-model="commentInput"
        placeholder="请留下你的评论"
        @input="inputComment"
      >
      </el-input>
      <div class="submitCommentButton">
        <el-button
          size="mini"
          round
          @click="commentMode ? submitComment() : submitFloorComment()"
          class="submitComment"
          >评论</el-button
        >
      </div>
    </div>
    <!-- 评论内容区 -->
    <div class="commentHeader"><slot name="title"></slot></div>
    <div class="commentItem" v-for="(item, index) in comments" :key="index">
      <!-- 用户头像 -->
      <div class="commentCreatorAvatar">
        <img :src="item.user.avatarUrl + '?param=100y100'" alt="" />
      </div>
      <!-- 评论内容 -->
      <div class="commentMain">
        <div class="commentContent">
          <span class="commentUserNickName">
            {{ item.user.nickname }}:&nbsp;&nbsp;
          </span>
          <span>{{ item.content }}</span>
        </div>
        <!-- 消息回复 -->
        <div class="replied">
          <div
            class="repliedItem"
            v-for="(item1, index1) in item.beReplied"
            :key="index1"
          >
            <span class="repliedUser">@{{ item1.user.nickname }}:&nbsp;</span>
            <span class="repliedContent">{{ item1.content }}</span>
          </div>
        </div>
        <div class="commentBottom">
          <div class="commentCreatedTime">
            {{ item.time | showDate }}
          </div>
          <div class="commentButtons">
            <div
              @click="likeCurrentComment(item.liked, item.commentId)"
              :class="item.liked ? 'likeCurrentComment' : ''"
            >
              <i class="iconfont icon-good"></i> {{ item.likedCount }}
            </div>
            <div><i class="iconfont icon-zhuanfa"></i></div>
            <div>
              <i
                class="iconfont icon-pinglun"
                @click="floorComment(item.commentId, item.user.nickname)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from "plugins/utils";

export default {
  name: "Comment",
  props: {
    // 评论数据
    comments: {
      type: Array,
      default() {
        return [];
      },
    },
    // 评论对象的ID
    commentId: {
      type: String,
      default() {
        return "";
      },
    },
    // 评论的视频类型
    commentType: {
      type: String,
      default() {
        return "";
      },
    },
    // 判断是否为热门评论
    isHotComment: {
      type: Boolean,
      default() {
        return true;
      },
    },
  },
  data() {
    return {
      commentInput: "",
      // 评论模式 true是普通评论 false是楼层评论
      commentMode: true,
      // 楼层回复前面几个字的长度
      floorCommentInputLength: 0,
      // 用于暂存楼层评论id
      floorCommentId: "",
    };
  },
  methods: {
    // 监听键盘事件
    inputComment() {
      // 是否为楼层回复
      if(this.commentMode == false){
        // 如果删除了回复人信息，就默认为最新评论
        if(this.commentInput.length < this.floorCommentInputLength){
          // 当长度小于当前楼层评论前面默认的字时
          this.commentMode = true;
        }
      }
    },
    // 点击提交评论的回调
    async submitComment() {
      if (!this.$store.state.isLogin) {
        this.$message.warning("只有登录后才能评论");
        return;
      }

      // 判断评论内容是否为空
      if (this.commentInput == "") {
        this.$message.warning("评论内容不能为空");
        return;
      }

      // 判断视屏的类型
      let type;
      switch (this.commentType) {
        case "album":
          type = 3;
          break;
        case "musicList":
          type = 2;
          break;
        case "music":
          type = 0;
          break;
        case "mv":
          type = 1;
          break;
        case "video":
          type = 5;
          break;
      }
      let res = await this.$request("/comment", {
        t: 1,
        id: this.commentId,
        type,
        content: this.commentInput,
      }).catch((err) => {
        this.$message.error(err.response.data.msg);
      });

      if (!res) {
        return;
      }

      if (res.data.code == 200) {
        this.commentInput = "";
        this.$emit("getComment");
      } else {
        this.$message.error("评论失败，请稍后重试！");
      }
    },
    // 点击楼层评论图标的回调
    floorComment(commentId, nickName) {
      // isHotComment为false 说明没有文本框
      if (this.isHotComment == false) {
        // 将其转给hotComment处理
        this.$emit("transToHotComment", { commentId, nickName });
      }
      this.$emit("scrollToComment");
      // 让评论框获得焦点
      let input = document.querySelector(".commentArea");
      // 阻止focus定位
      input.children[0].focus({ preventScroll: true });
      this.commentInput = "回复" + nickName + ":";
      this.floorCommentInputLength = this.commentInput.length;
      // 将评论模式改为楼层评论
      this.commentMode = false;
      this.floorCommentId = commentId;
    },
    // 点击提交楼层评论的回调
    async submitFloorComment() {
      if (!this.$store.state.isLogin) {
        this.$message.warning("只有登录后才能评论");
        return;
      }

      if (this.commentInput.length == this.floorCommentInputLength) {
        this.$message.error("评论内容不能为空");
        return;
      }
      // 判断评论的类型
      let type;
      switch (this.commentType) {
        case "album":
          type = 3;
          break;
        case "musicList":
          type = 2;
          break;
        case "music":
          type = 0;
          break;
        case "mv":
          type = 1;
          break;
        case "video":
          type = 5;
          break;
      }
      let res = await this.$request("/comment", {
        t: 2,
        id: this.commentId,
        type,
        content: this.commentInput,
        commentId: this.floorCommentId,
      }).catch((err) => {
        this.$message.error(err.response.data.msg);
      });

      if (!res) {
        return;
      }

      if (res.data.code == 200) {
        this.commentInput = "";
        this.commentMode = true;
        this.floorCommentInputLength = 0;
        this.floorCommentId = "";
        this.$emit("getComment");
      } else {
        this.$message.error("评论失败，请稍后重试");
      }
    },
    // 给评论点赞
    async likeCurrentComment(like, cid) {
      if (!this.$store.state.isLogin) {
        this.$message.warning("只有登录后才能点赞");
        return;
      }
      let timestamp = Date.parse(new Date());

      let type;
      switch (this.commentType) {
        case "album":
          type = 3;
          break;
        case "musicList":
          type = 2;
          break;
        case "music":
          type = 0;
          break;
        case "mv":
          type = 1;
          break;
        case "video":
          type = 5;
          break;
      }
      let res = await this.$request("/comment/like", {
        id: this.commentId,
        cid,
        t: like ? 0 : 1,
        type,
        timestamp,
      });
      if (res.data.code == 200) {
        this.$emit("getComment");
      } else {
        this.$message.error("点赞失败,请稍后重试!");
      }
    },
  },
  filters: {
    showDate(value) {
      // 将时间戳转成Date对象
      let date = new Date(value);
      // 将date格式化
      return formatDate(date, "yyyy-MM-dd");
    },
  },
    watch: {
    // 评论数据发生变化时 重置所有发表评论的数据
    comments(current) {
      this.commentInpt = "";
      this.isCommentDialogShow = false;
      this.commentMode = true;
      this.floorCommentInputLength = 0;
      this.floorCommentId = "";
    },
  },
};
</script>

<style scoped>
.hotComments {
  margin-bottom: 20px;
  width: 100%;
}

.commentHeader {
  font-size: 14px;
  color: rgb(26, 26, 26);
  font-weight: 600;
  padding: 10px 0;
}
.commentItem {
  display: flex;
  margin: 5px 0;
  padding: 10px 0 20px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
}

.commentCreatorAvatar {
  width: 35px;
  height: 35px;
  margin: 0px 10px 0 0;
}

.commentCreatorAvatar img {
  width: 100%;
  border-radius: 50%;
}

.commentMain {
  width: calc(100% - 50px);
}

.commentUserNickName {
  color: #5a8ab9;
}

.commentBottom {
  margin-top: 2px;
  color: rgb(172, 172, 172);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.commentButtons {
  display: flex;
  align-items: center;
}
.commentButtons div {
  margin-top: -3px;
  padding: 0 8px;
  transform: scale(0.85);
}

.commentButtons div:nth-child(1) {
  font-size: 14px;
}

.replied {
  background-color: #f4f4f4;
  margin: 7px 0;
  border-radius: 5px;
}

.repliedItem {
  padding: 7px 10px;
  line-height: 20px;
}

.repliedUser {
  color: #5a8ab9;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
}

.commentContent > span {
  line-height: 20px;
}

.el-textarea /deep/ .el-textarea__inner {
  height: 65px !important;
  font-size: 12px;
  resize: none;
}

.el-textarea /deep/ .el-textarea__inner:focus {
  border-color: #aaa;
}

.el-textarea /deep/ .el-input__count {
  transform: scale(0.9);
}

.submitCommentButton {
  width: 100%;
  text-align: right;
  margin: 10px 0;
}

.el-button:hover {
  background-color: #f2f2f2;
}

.el-button {
  transform: scale(0.9) translateX(5%);
}

.submitComment:focus {
  background-color: #fff;
}

.commentCardSwitch {
  position: fixed;
  left: 50%;
  top: calc(100vh - 105px);
  transform: translateX(-50%) scale(0.9);
  border: none;
  background-color: #f1f1f1;
  line-height: 15px;
  padding: 10px 10px 10px 30px;
}

.commentCardSwitch:hover {
  background-color: #e1e1e1;
}

.commentCardSwitch i {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
}

.musicTitle {
  width: 100%;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 10px;
}

.musicCommentArea /deep/ .el-textarea__inner {
  height: 110px !important;
}

.musicSubmitComment {
  padding: 8px 20px;
  font-size: 13px;
  background-color: #ec4141;
  color: white;
  border: none;
}

.musicSubmitComment:hover {
  background-color: #eb2e2e;
  color: white;
}

.musicSubmitComment:focus {
  color: white;
  background-color: #ec4141;
}

.commentDialog /deep/ .el-dialog__body {
  padding-bottom: 5px !important;
}

.likeCurrentComment,
.likeCurrentComment i {
  color: #ec4141 !important;
}
</style>‘