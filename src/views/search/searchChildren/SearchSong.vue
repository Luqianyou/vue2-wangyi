<template>
  <div class="SearchSong">
    <div class="tip">找到 {{ songCount }} 首单曲</div>
    <div class="multiMatch" v-if="multiMatch.artist && currentPage == 1">
      <div class="matchTitle">最佳匹配</div>
      <div
        class="matchResult"
        @click="goToSingerDetail(multiMatch.artist[0].id)"
      >
        <div class="matchCover">
          <img
            :src="multiMatch.artist[0].img1v1Url + '?param==200y200'"
            alt=""
          />
        </div>
        <div class="matchName">歌手：{{ multiMatch.artist[0].name }}</div>
        <i class="iconfont icon-arrow-right-bold"></i>
      </div>
    </div>
    <!-- 歌单表格 -->
    <el-table
      :data="searchSongList"
      size="mini"
      style="width: 100%"
      @row-dblclick="clickRow"
      @cell-click="clickCell"
      highlight-current-row
      stripe
    >
      <el-table-column
        label=""
        width="30"
        type="index"
        :index="handleIndex"
      ></el-table-column>
      <el-table-column label="" width="23">
        <i class="iconfont icon-download"></i>
      </el-table-column>
      <el-table-column prop="name" label="音乐标题" min-width="200">
      </el-table-column>
      <el-table-column prop="ar[0].name" label="歌手" min-width="100">
      </el-table-column>
      <el-table-column prop="al.name" label="专辑" min-width="170">
      </el-table-column>
      <el-table-column prop="dt" label="时长" min-width="60"> </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <div class="page" v-if="searchSongList.length != 0">
      <el-pagination
        background
        small
        :page-size="100"
        :current-page="currentPage"
        @current-change="pageChange"
        layout="prev, pager, next"
        :total="songCount"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { handleMusicTime } from 'plugins/utils'
export default {
  name: 'SearchSong',
  data () {
    return {
      // 搜索匹配数据
      multiMatch: {},
      // 单曲数量
      songCount: 0,
      // 搜索的歌曲列表
      searchSongList: [],
      currentPage: 1
    }
  },
  methods: {
    // 获取最佳匹配
    async getMultMath () {
      const res = await this.$request('/search/multimatch', {
        keywords: this.$route.params.id
      })
      // console.log(res);
      this.multiMatch = res.data.result
    },
    // 获取搜索的歌曲
    async getSearchSong () {
      const res = await this.$request('/cloudsearch', {
        keywords: this.$route.params.id,
        limit: 100,
        offset: 100 * (this.currentPage - 1)
      })
      // console.log(res);
      this.songCount = res.data.result.songCount
      this.searchSongList = res.data.result.songs
      // 对数据的音乐时长进行处理
      this.searchSongList.forEach((item, index) => {
        this.searchSongList[index].dt = handleMusicTime(item.dt)
      })
    },
    // 图片标签跳转
    goToSingerDetail (id) {
      this.$router.push({ name: 'singerDetail', params: { id } })
    },
    // index属性elementui中类型是一个方法
    handleIndex (index) {
      index = index + 1 + 100 * (this.currentPage - 1)
      if (index < 10) {
        return '0' + index
      } else {
        return index
      }
    },
    // 双击回调
    clickRow (row) {
      // 首先获取当前的歌单列表和歌曲索引
      const musicList = this.$store.state.musicList
      const currentIndex = this.$store.state.currentIndex
      // 先判断该歌曲是否已经在歌单中存在，避免重复点击导致歌单出现相同歌曲
      const isExist = musicList.find((item) => item.id === row.id)
      if (isExist) {
        // 如果已经存在 则只提交歌曲id并return出去
        this.$store.commit('updateMusicId', row.id)
        return
      }
      this.$store.commit('changePlayState', false)
      // 将请求到的歌曲详情插入到歌单对应位置并提交至vuex
      musicList.splice(currentIndex + 1, 0, row)
      this.$store.commit('updateMusicId', row.id)
      this.$store.commit('updateMusicList', {
        musicList,
        musicListId: this.$store.state.musicListId
      })
    },
    // 单击回调
    async clickCell (row, column, cell) {
      // console.log(cell);
      if (cell.querySelector('.icon-download')) {
        const res = await this.$request('/song/url', { id: row.id })
        if (res.data.data[0].url == null) {
          this.$message.warning('暂时无法获取该资源')
          return
        }

        // 匹配资源的域名
        const url = res.data.data[0].url.match(/http.*?\.net/)
        // console.log(url);
        // 匹配域名名称，并匹配对应的代理
        const serve = url[0].match(/http:\/(\S*).music/)[1]
        // console.log(serve);
        if (
          serve !== '/m7' &&
          serve !== '/m701' &&
          serve !== '/m8' &&
          serve !== '/m801'
        ) {
          // 没有对应的代理
          this.$message.error('匹配不到对应的代理,下载失败!')
          return
        }
        // 截取后面的参数
        const params = res.data.data[0].url.slice(url[0].length)
        // console.log(url[0], serve, params);

        const downloadMusicInfo = {
          url: serve + params,
          name:
            row.name +
            ' - ' +
            row.ar[0].name +
            '.' +
            res.data.data[0].type.toLowerCase()
        }
        // console.log(downloadMusicInfo);
        this.$store.commit('updateDownloadMusicInfo', downloadMusicInfo)
      }
    },
    // 单击页码回调
    pageChange (page) {
      this.currentPage = page
      this.searchSongList = []
      this.getSearchSong()
    }
  },
  created () {
    this.getMultMath()
    this.getSearchSong()
  }
}
</script>

<style scoped>
.SearchSong {
  padding: 0 15px;
}

.tip {
  font-weight: bold;
  color: rgb(34, 34, 34);
  margin-bottom: 10px;
}

.matchTitle {
  font-size: 12px;
  color: rgb(34, 34, 34);
  margin: 5px 0;
}

.matchResult {
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  background-color: #f4f4f4;
  width: 270px;
  height: 65px;
  margin-bottom: 20px;
}

.matchCover {
  width: 65px;
  height: 65px;
}

.matchCover img {
  width: 100%;
  height: 100%;
}

.matchName {
  font-size: 13px;
  color: rgb(31, 31, 31);
  margin-left: 10px;
}

.multiMatch i {
  position: absolute;
  transform: translateY(-50%);
  right: 15px;
  top: 50%;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
  margin: 20px 0;
}
</style>
