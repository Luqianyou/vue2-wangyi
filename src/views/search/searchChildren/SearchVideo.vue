<template>
  <div class="SearchVideo">
    <div class="tip">找到{{ videoCount }}个视频</div>
    <video-list-card
      :videoList="searchVideoList"
      :videoType="'video'"
      @clickListCardItem="clickListCardItem"
    ></video-list-card>
    <!-- 分页 -->
    <div class="page" v-if="searchVideoList.length !== 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="videoCount"
        small
        :page-size="30"
        :current-page="currentPage"
        @current-change="pageChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import VideoListCard from 'components/videoListCard/VideoListCard.vue'

export default {
  name: 'SearchVideo',
  components: { VideoListCard },
  data () {
    return {
      videoCount: 0,
      searchVideoList: [],
      currentPage: 1
    }
  },
  methods: {
    // 请求视屏信息
    async getSearchVideo () {
      const res = await this.$request('/cloudsearch', {
        keywords: this.$route.params.id,
        offset: 30 * (this.currentPage - 1),
        type: 1014
      })
      // console.log(res);
      this.videoCount = res.data.result.videoCount
      this.searchVideoList = res.data.result.videos
    },
    clickListCardItem ({ id, type }) {
      // mv type=0 || video  type=1
      // console.log(id,type);
      // 传递参数方便过后的视频或是mv的判断
      if (type === 0) {
        this.$router.push({ name: 'videoDetail', params: { id, type: 'mv' } })
      } else {
        this.$router.push({ name: 'videoDetail', params: { id, type: 'video' } })
      }
    },
    pageChange (page) {
      this.currentPage = page
      // 重新获取
      this.searchVideoList = []
      this.getSearchVideo()
    }
  },
  created () {
    this.getSearchVideo()
  }
}
</script>

<style scoped>
.SearchVideo {
  padding: 0 15px;
}
.tip {
  font-weight: bold;
  color: rgb(34, 34, 34);
  margin-bottom: 10px;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
  margin: 20px 0;
}
</style>
