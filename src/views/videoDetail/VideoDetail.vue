<template>
  <div class="videoDetail" v-if="videoUrl">
    <div class="left">
      <div class="title">
        {{ $route.params.type == "mv" ? "MV详情" : "视频详情" }}
      </div>
      <!-- poster 属性规定视频下载时显示的图像，或者在用户点击播放按钮前显示的图像。
       如果未设置该属性，则使用视频的第一帧来代替。 -->
      <!-- 视频和mv的存储方式是不同的 -->
      <video
        class="videoPlayer"
        :src="videoUrl"
        controls
        width="496px"
        height="284px"
        @play="playVideo"
        :poster="
          $route.params.type == 'mv' ? videoInfo.cover : videoInfo.coverUrl
        "
      ></video>
      <!-- 视频详细信息 -->
      <div
        class="videoInfo"
        v-if="$route.params.type == 'mv' ? videoInfo.cover : videoInfo.coverUrl"
      >
        <!-- 人物信息 -->
        <div class="user">
          <div class="avatar">
            <img
              :src="
                ($route.params.type == 'mv'
                  ? videoInfo.artists[0].img1v1Url
                  : videoInfo.avatarUrl) + '?param=100y100'
              "
              alt=""
            />
          </div>
          <div class="userName">
            {{
              $route.params.type == "mv"
                ? videoInfo.artists[0].name
                : videoInfo.creator.nickname
            }}
          </div>
        </div>
        <!-- 视频信息 -->
        <div class="videoTitle">
          {{ $route.params.type == "mv" ? videoInfo.name : videoInfo.title }}
        </div>
        <div class="otherInfo">
          <div>
            发布:{{
              $route.params.type == "mv"
                ? videoInfo.publishTime
                : videoInfo.publishTime | showDate
            }}
          </div>
          <div>
            播放：{{
              ($route.params.type == "mv"
                ? videoInfo.playCount
                : videoInfo.playTime) | handleNum
            }}
          </div>
        </div>
        <div class="buttons">
          <div class="buttonItem" @click="likeVideo">
            <i class="iconfont icon-good" :class="isLike ? 'red' : ''"></i
            >{{ isLike ? "已赞" : "赞" }}
          </div>
          <div class="buttonItem" @click="subVideo">
            <i class="iconfont icon-xihuan" :class="isSub ? 'red' : ''"></i
            >{{ isSub ? "已收藏" : "收藏" }}
          </div>
          <div class="buttonItem">
            <i class="iconfont icon-zhuanfa"></i>分享
          </div>
        </div>
      </div>
      <!-- 视频评论区 -->
      <div class="comment">
        <div class="title commentTitle">评论</div>
        <div class="commentList" v-loading="isCommentLoading">
          <!-- 精彩评论组件 -->
          <comment
            :comments="comments.hotComments"
            :commentId="$route.params.id + ''"
            v-if="comments.hotComments"
            :commentType="$route.params.type == 'mv' ? 'mv' : 'video'"
            @getComment="
              $route.params.type == 'mv' ? getMvComment() : getVideoComment()
            "
            @scrollToComment="scrollToComment"
            ref="hotComments"
          >
            <div slot="title">精彩评论</div>
          </comment>
          <!-- 最新评论 -->
          <!-- :isHotComment="comments.hotComments ? false : true"精彩评论隐藏换true -->
          <comment
            :comments="comments.comments"
            :commentId="$route.params.id + ''"
            v-if="comments.comments"
            :isHotComment="comments.hotComments ? false : true"
            :commentType="$route.params.type == 'mv' ? 'mv' : 'video'"
            @getComment="
              $route.params.type == 'mv' ? getMvComment() : getVideoComment()
            "
            @scrollToComment="scrollToComment"
            @transToHotComment="
              (info) =>
                $refs.hotComments.floorComment(info.commentId, info.nickName)
            "
          >
            <div slot="title">最新评论</div>
          </comment>
        </div>
        <div class="page">
          <el-pagination
          background
            layout="prev, pager, next"
            :total="comments.total"
            small
            :page-size="20"
            :current-page="commentsPage"
            @current-change="commentPageChange">
          </el-pagination>
        </div>
      </div>
    </div>
    <!-- 相关推荐 -->
    <div class="right" v-if="relatedVideo.length != 0">
      <div class="title">相关推荐</div>
      <div
        class="relatedVideoItem"
        v-for="(item, index) in relatedVideo"
        :key="index"
        @click="goToRelatedVideo(item.vid)"
      >
        <div class="relatedVideoItemCover">
          <img :src="item.coverUrl + '?param=300y180'" alt="" />
          <div class="relatedVideoItemPlayCount">
            <i class="iconfont icon-shipin"></i> {{ item.playTime | handleNum }}
          </div>
          <div class="relatedVideoItemTime">
            {{ item.durationms | handleMusicTime }}
          </div>
        </div>
        <div class="relatedVideoItemInfo">
          <div class="relatedVideoItemTitle">{{ item.title }}</div>
          <div class="creator">by {{ item.creator[0].userName }}</div>
        </div>
      </div>
    </div>
    <!-- 返回顶部 -->
    <go-top scrollObj=".videoDetail"></go-top>
  </div>
</template>

<script>
import { handleNum, handleMusicTime, formatDate } from 'plugins/utils.js'
import Comment from 'components/comment/Comment.vue'
import GoTop from 'components/goTop/GoTop.vue'

export default {
  name: 'VideoDetail',
  components: {
    Comment,
    GoTop
  },
  data () {
    return {
      // 视频数据
      videoInfo: {},
      // 视频地址
      videoUrl: '',
      // 相关的视频数据
      relatedVideo: [],
      // 评论
      comments: {},
      // 评论页数
      commentsPage: 1,
      // 用户是否收藏了视频
      isSub: false,
      // 是否正在加载评论
      isCommentLoading: false,
      // 用户是否喜欢该视屏
      isLike: false
    }
  },
  methods: {
    // 左侧所需数据
    // 根据id获得mv详情
    async getMvDetail () {
      const res = await this.$request('/mv/detail', {
        mvid: this.$route.params.id
      })
      // console.log(res);
      this.videoInfo = res.data.data
    },
    // 请求mv地址
    async getMvUrl () {
      const res = await this.$request('/mv/url', {
        id: this.$route.params.id
      })
      this.videoUrl = res.data.data.url
    },
    // 请求mv评论数据
    async getMvComment (change) {
      const timestamp = Date.parse(new Date())
      this.isCommentLoading = true
      if (change === 'changePage') {
        this.scrollToComment()
      }
      const res = await this.$request('/comment/mv', {
        id: this.$route.params.id,
        offset: 20 * (this.commentsPage - 1),
        timestamp
      })
      if (res.data.code !== 200) {
        this.$message.error('获取评论信息失败，请稍后重试!')
        return
      }
      this.comments = res.data
      this.isCommentLoading = false
    },
    // 根据id获得video地址
    async getVideoDetail () {
      const res = await this.$request('/video/detail', {
        id: this.$route.params.id
      })
      // console.log(res);
      this.videoInfo = res.data.data
    },
    // 获取视频的播放地址
    async getVideoUrl () {
      const res = await this.$request('/video/url', {
        id: this.$route.params.id
      })
      // console.log(res)
      this.videoUrl = res.data.urls[0].url
    },
    // 请求视屏评论数据
    async getVideoComment (change) {
      const timestamp = Date.parse(new Date())
      this.isCommentLoading = true
      if (change === 'changePage') {
        this.scrollToComment()
      }
      const res = await this.$request('/comment/video', {
        id: this.$route.params.id,
        offset: 20 * (this.commentsPage - 1),
        timestamp
      })
      this.isCommentLoading = false
      if (res.data.code !== 200) {
        this.$message.error('获取评论失败，请稍后重试!')
        return
      }
      this.comments = res.data
    },
    // 监听video播放的事件
    playVideo () {
      this.$store.commit('changePlayState', false)
    },
    // 跳转到评论输入框
    scrollToComment () {
      const videoDetail = document.querySelector('.videoDetail')
      const commentTitle = document.querySelector('.commentTitle')
      videoDetail.scrollTo({
        behavior: 'smooth', // 正常滚动
        top: commentTitle.offsetTop - 70
      })
    },
    // 评论翻页
    commentPageChange (page) {
      this.commentsPage = page
      if (this.$route.params.type === 'mv') {
        this.getMvComment('changePage')
      } else if (this.$route.params.type === 'video') {
        this.getVideoComment('changePage')
      }
    },
    // 请求用户点赞过的视频列表
    async getLikeVideoList () {
      const timestamp = Date.parse(new Date())
      const res = await this.$request('/playlist/mylike', {
        limit: 1000,
        timestamp
      })
      // console.log(res);
      if (res.data.code !== 200) {
        this.$message.error('获取用户点赞视频失败,请稍后重试!')
        return
      }
      this.$store.commit('updateLikeVideoList', res.data.data.feeds)
    },
    // 请求用户收藏的视频列表
    async getSubVideoList () {
      const timestamp = Date.parse(new Date())
      const res = await this.$request('/mv/sublist', {
        limit: 1000,
        timestamp
      })
      if (res.data.code !== 200) {
        this.$message.error('获取用户收藏视频失败,请稍后重试!')
        return
      }
      this.$store.commit('updateSubVideoList', res.data.data)
    },
    // 用户点击点赞按钮
    async likeVideo () {
      this.isLike = !this.isLike
      // Date.parse() 函数用于分析一个包含日期的字符串，并返回该日期与 1970 年 1 月 1 日午夜之间相差的毫秒数
      const timestamp = Date.parse(new Date())
      // type点赞接口type：1为mv，5为视频
      const type = this.$route.params.type === 'mv' ? 1 : 5
      // 请求点赞接口
      const res = await this.$request('/resource/like', {
        type,
        id: this.$route.params.id,
        t: this.isLike ? 1 : 0,
        timestamp
      })
      // console.log(res);
      this.getLikeVideoList()
    },
    // 用户点击了收藏按钮的回调
    async subVideo () {
      this.isSub = !this.isSub
      const timestamp = Date.parse(new Date())
      // 请求收藏接口
      if (this.$route.params.type === 'video') {
        await this.$request('/video/sub', {
          id: this.$route.params.id,
          t: this.isSub ? 1 : 0,
          timestamp
        })
      }
      this.getSubVideoList()
    },
    // 判断用户是否收藏了该视屏
    // find()方法
    // find()函数用来查找目标元素，找到就返回该元素，找不到返回undefined。
    // findIndex()方法
    // findIndex()函数也是查找目标元素，找到就返回元素的位置，找不到就返回-1
    getIsSub () {
      this.isSub = this.$store.state.subVideoList.find(
        (item) => item.vid === this.$route.params.id
      )
    },

    // 判断用户是否点赞了该视频
    getIsLike () {
      if (this.$route.params.type === 'mv') {
        this.isLike = this.$store.state.likeVideoList.find(
          (item) => item.mlogBaseData.id === this.$route.params.id
        )
      } else {
        // 因为请求的喜欢列表中的视频id是mlogid 要获取vid还需要另外单独请求  这里我直接对比标题和时长 若都对的上则认定为是同一个视频
        this.isLike = this.$store.state.likeVideoList.find(
          (item) =>
            item.mlogBaseData.desc === this.videoInfo.description &&
            item.mlogBaseData.dration === this.videoInfo.durationms
        )
      }
    },
    // 右侧数据
    // 获取相关视频
    async getRelatedVideo () {
      const res = await this.$request('/related/allvideo', { id: this.$route.params.id })
      this.relatedVideo = res.data.data
    },
    // 点击视频回调
    goToRelatedVideo (id) {
      this.$router.push({ name: 'videoDetail', params: { id, type: 'video' } })
    }
  },
  async created () {
    this.getRelatedVideo()
    // mv和视频分别调用
    if (this.$route.params.type === 'mv') {
      await this.getMvDetail()
      this.getMvUrl()
      this.getMvComment()
    } else if (this.$route.params.type === 'video') {
      await this.getVideoDetail()
      this.getVideoUrl()
      this.getVideoComment()
    }

    if (this.$store.state.subVideoList == null) {
      await this.getSubVideoList()
    }
    this.getIsSub()
    if (this.$store.state.likeVideoList == null) {
      await this.getLikeVideoList()
    }
    this.getIsLike()
  },
  filters: {
    handleNum,
    handleMusicTime,
    showDate (value) {
      // 将时间戳转换成Data对象
      const date = new Date(value)
      // 将date格式化
      return formatDate(date, 'yyyy-MM-dd')
    }
  }
}
</script>

<style scoped>
.videoDetail {
  display: flex;
  justify-content: center;
  height: calc(100vh - 105px);
  overflow-y: scroll;
}

.left {
  width: 500px;
}

.right {
  margin-left: 20px;
}

.title {
  margin: 10px 0;
  color: black;
  font-weight: 600;
}

.relatedVideoItem {
  display: flex;
  margin-bottom: 5px;
  cursor: pointer;
}

.relatedVideoItemCover {
  position: relative;
  margin-right: 10px;
}

.relatedVideoItemCover img {
  width: 150px;
  height: 90px;
  border-radius: 10px;
}

.relatedVideoItemPlayCount {
  position: absolute;
  top: 0;
  right: 5px;
  font-size: 12px;
  color: white;
  transform: scale(0.9);
}

.relatedVideoItemTime {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 12px;
  color: white;
  transform: scale(0.9);
}

.relatedVideoItemInfo {
  font-size: 12px;
  color: rgb(31, 30, 30);
  margin: 12px 0;
  width: 140px;
}

.relatedVideoItemTitle {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.creator {
  color: rgb(156, 156, 156);
  margin-top: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: scale(0.9) translateX(-5%);
}

.user {
  display: flex;
  margin: 10px 0;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
}

.avatar img {
  width: 100%;
  border-radius: 50%;
}

.userName {
  font-size: 12px;
  margin-left: 10px;
  color: rgb(36, 36, 36);
}

.videoTitle {
  color: #1b1b1b;
  font-size: 20px;
  margin: 20px 0 10px;
  font-weight: bold;
}

.otherInfo {
  display: flex;
  color: #aaa;
  font-size: 12px;
}

.otherInfo div {
  margin-right: 20px;
  transform: scale(0.9) translateX(-5%);
}

.buttons {
  display: flex;
  font-size: 12px;
  margin: 20px 0;
  color: #252525;
}

.buttonItem {
  padding: 5px 20px;
  border: 1px solid #ccc;
  border-radius: 20px;
  margin-right: 10px;
}

.buttonItem i {
  font-size: 12px;
  margin-right: 3px;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
}

.videoPlayer {
  background-color: black;
}

.red {
  color: #ec4141;
}

.videoDetail /deep/ .el-loading-spinner {
  top: 40px;
}
</style>
