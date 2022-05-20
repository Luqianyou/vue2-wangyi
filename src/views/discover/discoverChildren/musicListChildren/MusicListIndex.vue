<template>
  <div class="musicListIndex">
    <!-- 头部歌单入口展示 -->
    <div class="highqualityEntry">
      <img :src="theHighquality.coverImgUrl" alt="" class="backgroundImg" />
      <div class="cover">
        <img :src="theHighquality.coverImgUrl" alt="" />
      </div>
      <div class="EntryInfo">
        <div class="tag"><i class="iconfont icon-good"></i>精品歌单</div>
        <div class="name">{{ theHighquality.name }}</div>
        <div class="desc">{{ theHighquality.copywriter }}</div>
      </div>
    </div>
    <!-- 歌单列表 -->
    <div class="musicListNavBar">
      <!-- 左侧提示标签 -->
      <div class="left">
        <div>
          {{ currentTag.name }} <i class="iconfont icon-arrow-right-bold"></i>
        </div>
      </div>
      <!-- 右侧tag选项 -->
      <div class="right">
        <!-- 父组件将数组传给子组件 -->
        <second-nav-bar
          :SecondNavBarData="categorylist"
          @clickSecondBarItem="clickSecondBarItem"
          :itemWidth="0"
        ></second-nav-bar>
      </div>
    </div>
    <!-- 歌单列表展示 -->
    <list-card
      :listCardData="musicList.playlists"
      @clickListCardItem="clickListCardItem"
    ></list-card>
    <!-- 分页按钮 -->
    <div class="page" v-if="musicList.playlists">
      <el-pagination
        :current-page="currentPage"
        background
        layout="prev,pager,next"
        :total="musicList.total"
        :page-size="50"
        small
        @current-change="pageChange"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import SecondNavBar from 'components/secondNavbar/SecondNavbar.vue'
import ListCard from 'components/listCard/listCard.vue'
export default {
  data () {
    return {
      theHighquality: [],
      categorylist: [],
      currentTag: {},
      currentPage: 1,
      musicList: {}
    }
  },
  methods: {
    // 获取歌单头部数据
    async getTheHighquality () {
      const res = await this.$request('/top/playlist/highquality', { limit: 1 })
      // console.log(res);
      this.theHighquality = res.data.playlists[0]
      // console.log(this.theHighquality);
    },
    // 获取歌单category种类标签
    async getHotTag () {
      const res = await this.$request('/playlist/hot')
      // console.log(res);
      this.currentTag = res.data.tags[0]
      this.categorylist = res.data.tags
    },
    // 处理点击事件，接收子元素的index
    clickSecondBarItem (index) {
      // 切换左边小标签名
      this.currentTag = this.categorylist[index]
      this.currentPage = 1
      // 清空musicList
      this.getMusicList()
    },
    // 根据tag标签名获取歌单列表
    async getMusicList () {
      // 获取到了先清除歌单列表
      this.musicList = {}
      const res = await this.$request('/top/playlist', {
        cat: this.currentTag.name,
        offset: 50 * (this.currentPage - 1)
      })
      // console.log(res);
      // 内含total值可用于判断分页
      this.musicList = res.data
    },
    // 页码发生改变时触发
    pageChange (page) {
      // console.log(page);
      this.currentPage = page
      // 清空并重新获取
      this.getMusicList()
    },
    // 歌单列表点击事件
    clickListCardItem (id) {
      // console.log(id);
      this.$router.push({ name: 'musicListDetail', params: { id } })
    }
  },
  // 异步处理跳过await先执行后边的
  async created () {
    this.getTheHighquality()
    await this.getHotTag()
    this.getMusicList()
  },
  components: {
    SecondNavBar,
    ListCard
  }
}
</script>

<style lang="scss" scoped>
.highqualityEntry {
  position: relative;
  width: 100%;
  height: 160px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  .backgroundImg {
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    width: 100%;
    transform: translateY(-80px);
    filter: blur(30px) brightness(70%);
  }
  .cover {
    width: 120px;
    height: 120px;
    margin: 10px;
  }

  .cover img {
    border-radius: 10px;
    width: 100%;
  }

  .tag {
    color: #d59e54;
    border: 1px solid #d59e54;
    padding: 5px 10px;
    width: 88px;
    font-size: 12px;
    margin: 20px 10px 15px;
    border-radius: 15px;
  }

  .tag i {
    font-size: 14px;
  }

  .name {
    color: white;
    font-size: 14px;
    margin: 10px 0;
  }

  .desc {
    color: rgba(255, 255, 255, 0.5);
    /* 字体直接写小于12没有效果 */
    font-size: 12px;
    transform: scale(0.9, 0.9);
  }
}

.musicListNavBar {
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  .left {
    div {
      padding: 5px 10px;
      border: 1px solid #ddd;
      border-radius: 20px;
    }
    i {
      font-size: 12px;
    }
  }
}

.page{
  padding-left: 70%;
}
</style>
