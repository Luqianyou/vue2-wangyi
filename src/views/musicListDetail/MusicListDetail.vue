<template>
  <div class="musicListDetail" v-if="musicListDetail">
    <!-- 歌单信息 -->
    <div class="listInfo">
      <!-- 歌单封面图片 -->
      <div class="listAvatar">
        <img :src="musicListDetail.coverImgUrl" alt="" />
      </div>
      <div class="right">
        <!-- 标题 -->
        <div class="title">
          <div class="titleTag">歌单</div>
          <div class="titleContent">{{ musicListDetail.name }}</div>
        </div>
        <!-- 用户信息 -->
        <div class="user">
          <div class="userAvatar">
            <img :src="musicListDetail.creator.avatarUrl" alt="" />
          </div>
          <div class="userName">{{ musicListDetail.creator.nickname }}</div>
          <div class="createTime">
            {{ musicListDetail.createTime | showDate }}创建
          </div>
        </div>
        <!-- 操作按钮 -->
        <div class="buttons">
          <div class="buttonItem playAll" @click="playAll">
            <i class="iconfont icon-bofang playAll"></i>
            <span>播放全部</span>
          </div>
          <div class="buttonItem" v-if="!isCreated" @click="collectList">
            <i class="iconfont icon-xihuan" :class="isSub ? 'red' : ''"></i>
            <span>{{ isSub ? "已收藏" : "收藏" }}</span>
          </div>
          <div class="buttonItem">
            <i class="iconfont icon-zhuanfa"></i>
            <span>分享</span>
          </div>
        </div>
        <!-- 标签 -->
        <div class="tags">
          标签:
          <div
            class="tagItem"
            v-for="(item, index) in musicListDetail.tags"
            :key="index"
          >
            {{ item }}
          </div>
        </div>
        <!-- 歌曲列表的歌曲数量和播放量 -->
        <div class="otherInfo">
          <div class="musicNum">
            歌曲:{{ musicListDetail.trackCount | handleNum }}
          </div>
          <div class="playCount">
            播放:{{ musicListDetail.playCount | handleNum }}
          </div>
        </div>
        <!-- 简介 -->
        <div class="desc">简介:{{ musicListDetail.description }}</div>
      </div>
    </div>
    <!-- 歌单列表 -->
    <div class="musicList">
      <el-tabs value="first" @tab-click="clicktab">
        <!-- 歌曲列表 -->
        <el-tab-pane label="歌曲列表" name="first">
          <!-- 歌单表格 -->
          <el-table
            :data="musicListDetail.tracks"
            size="mini"
            style="width: 100%"
            @row-dblclick="clickRow"
            @cell-click="clickCell"
            highlight-current-row
            stripe
            lazy
            :row-key="
              (row) => {
                return row.id;
              }
            "
          >
            <el-table-column
              label=""
              width="30"
              type="index"
              :index="handleIndex"
            >
            </el-table-column>
            <el-table-column label="" width="23">
              <!-- 下载按钮 -->
              <i class="iconfont icon-download"></i>
            </el-table-column>
            <el-table-column prop="name" label="音乐标题" min-width="350">
            </el-table-column>
            <el-table-column prop="ar[0].name" label="歌手" min-width="120">
            </el-table-column>
            <el-table-column prop="al.name" label="专辑" min-width="170">
            </el-table-column>
            <el-table-column prop="dt" label="时长" min-width="100">
            </el-table-column>
          </el-table>
          <div class="loadMore" v-if="isMore" @click="loadMore">
            点击加载所有音乐
          </div>
          <div class="placeholder" v-else></div>
        </el-tab-pane>
        <!-- 评论 -->
        <el-tab-pane label="评论" name="second"></el-tab-pane>
        <!-- 收藏者 -->
        <el-tab-pane label="收藏者" name="third"></el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
// 按需导入
import { handleNum, formatDate, handleMusicTime } from 'plugins/utils.js'
export default {
  data () {
    return {
      musicListDetail: null,
      // 评论内容
      comments: {},
      // 当前评论页数
      currentCommentPage: 1,
      // 是否还有更多音乐
      isMore: false,
      // 用户是否收藏了当前歌单
      isSub: false,
      // 是否是用户创建的歌单
      isCreated: false
    }
  },
  methods: {
    // 根据传过来的 id 值来判断查询相应的歌单
    async getMusicListDetail () {
      const timestamp = Date.parse(new Date())
      // 因为用了name params实现了路由的跳转,所以获取id值得方式如下
      // console.log(this.$route.params.id);
      const result = await this.$request('/playlist/detail', {
        id: this.$route.params.id,
        timestamp
      })
      // console.log(result);
      this.musicListDetail = result.data.playlist
      // console.log(this.musicListDetail);
      //   // 判断是否有更多音乐
      if (
        this.musicListDetail.tracks.length !=
        this.musicListDetail.trackIds.length
      ) {
        this.isMore = true
      }
      //   // 处理播放时间
      this.musicListDetail.tracks.forEach((item, index) => {
        this.musicListDetail.tracks[index].dt = handleMusicTime(item.dt)
      })
    },

    // 播放全部 将所有的歌曲信息存入到vuex中
    playAll () {
      // 将第一首歌曲传入播放的存储变量中
      this.$store.commit('updateMusicId', this.musicListDetail.tracks[0].id)
      // 将其他的歌曲存入播放列表中
      this.$store.commit('updateMusicList', {
        musicList: this.musicListDetail.tracks,
        musicListId: this.musicListDetail.id
      })
    },

    // 收藏
    async collectList () {
      if (!this.$store.state.isLogin) {
        this.$message.error('请先登录账号!')
        return
      }
      this.isSub = !this.isSub
      //  请求收藏接口
      const timestamp = Date.parse(new Date())
      await this.$request('playlist/subscribe', {
        id: this.$route.params.id,
        t: this.isSub ? 1 : 2,
        timestamp
      })
      // 请求收藏歌单列表并保存至vuex
      this.getUserMusicList()
    },

    // 请求用户歌单
    async getUserMusicList () {
      const timestamp = Date.parse(new Date())
      // 先从localStorage里面读取用户信息 如果登录成功是有存的
      this.userInfo =
        window.localStorage.getItem('userInfo') &&
        JSON.parse(window.localStorage.getItem('userInfo'))
      let res = await this.$request('/user/playlist', {
        uid: this.userInfo.userId,
        timestamp
      })
      // 获取歌单列表
      res = res.data.playlist
      const index = res.findIndex((item) => item.subscribed == true)
      this.collectedMusicList = res.slice(index)
      // 将收藏的歌单上传至vuex
      this.$store.commit('updateCollectMusicList', this.collectedMusicList)
    },

    // el-tab-pane的回调，切换tab标签
    clicktab (e) {},

    //  双击表格中的歌曲单行
    async clickRow (row) {
      // console.log(row)
      // 将musicId提交到vuex中 供bottomContril查询歌曲url
      this.$store.commit('updateMusicId', row.id)
      // 如果歌单发生变化，则当前歌单到vuex
      if (this.musicListDetail.id != this.$store.state.musicListId) {
        // 将歌单传到vuex
        this.$store.commit('updateMusicList', {
          musicList: this.musicListDetail.tracks,
          musicListId: this.musicListDetail.id
        })
      }
    },

    //  单击表格中的歌曲单行
    async clickCell (row, column, cell) {
      // 判断点击的是下载按钮
      if (cell.querySelector('.icon-download')) {
        // 请求该歌曲的url
        const res = await this.$request('/song/url', { id: row.id })
        if (res.data.data[0].url == null) {
          this.$message.warning('暂时无法获取该资源!')
          return
        }
        // console.log(res)

        // 匹配资源的域名
        const url = res.data.data[0].url.match(/\http.*?\.net/)
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

    // 点击加载更多音乐
    loadMore () {
      if (!this.$store.state.isLogin) {
        this.$message.error('请先进行登录操作!')
        return
      }
      // 加载所有音乐
      this.isMore = false
      const arr = this.musicListDetail.trackIds.slice(20)
      let ids = ''
      arr.forEach((item) => {
        ids += item.id + ','
      })
      ids = ids.substr(0, ids.length - 1)
      this.getMusicDetail(ids)
    },

    // 获取加载出来的歌曲的详情
    async getMusicDetail (ids) {
      const res = await this.$request('/song/detail', { ids })
      // 处理歌曲时间
      res.data.songs.forEach((item, index) => {
        res.data.songs[index].dt = handleMusicTime(item.dt)
      })
      // 将歌曲加入可选歌曲列表
      this.musicListDetail.tracks.push(...res.data.songs)
    },

    // 切换正在播放歌曲的样式
    handleDOM (current, last) {
      if (document.querySelector('.musicListDetail')) {
        const tableRows = document
          .querySelector('.musicListDetail')
          .querySelectorAll('.el-table__row')
        // 遍历当前musicList 找到当前播放的index的行进行渲染
        // console.log(tableRows);
        const index = this.musicListDetail.tracks.findIndex(
          (item) => item.id == current
        )
        // console.log(index);
        if (index != -1) {
          // 直接修改dom样式的颜色无效  可能是因为第三方组件的原故
          // 通过引入全局样式解决
          // 将正在播放的音乐前面的索引换成小喇叭
          tableRows[index].children[0].querySelector(
            '.cell'
          ).innerHTML = '<div><i class="iconfont icon-yinliang"></i></div>'
          tableRows[index].children[0]
            .querySelector('.iconfont')
            .classList.add('currentRow')
          tableRows[index].children[2]
            .querySelector('.cell')
            .classList.add('currentRow')
        }
        // 清除上一首的样式
        if (last != -1) {
          const lastIndex = this.musicListDetail.tracks.findIndex(
            (item) => item.id == last
          )
          if (lastIndex != -1) {
            // 将上一个播放的dom的小喇叭换回索引
            tableRows[lastIndex].children[0].querySelector(
              '.cell'
            ).innerHTML = `<div>${
              lastIndex + 1 < 10 ? '0' + (lastIndex + 1) : lastIndex + 1
            }</div>`

            // 将上一首的类名删掉  小喇叭的html已经被替换了，不需要再还原
            tableRows[lastIndex].children[2]
              .querySelector('.cell')
              .classList.remove('currentRow')
          }
        }
      }
    },

    // 判断用户是否收藏了该歌单
    getIsSub () {
      this.isSub = this.$store.state.collectMusicList.find(
        (item) => item.id == this.$route.params.id
      )
    },

    // 判断是否是用户创建的歌单
    getIsCreated () {
      this.isCreated = this.$store.state.createdMusicList.find(
        (item) => item.id == this.$route.params.id
      )
    }
  },
  // 过滤器设置时间格式
  filters: {
    showDate (value) {
      // 1、先将时间戳转成Date对象
      const date = new Date(value)

      // 2、将date进行格式化
      return formatDate(date, 'yyyy-MM-dd')
    },
    handleNum
  },
  computed: {
    // 计算歌曲的序列号
    handleIndex () {
      return function (index) {
        index += 1
        if (index < 10) {
          return '0' + index
        } else {
          return index
        }
      }
    }
  },
  watch: {
    '$store.state.musicId' (current, last) {
      this.handleDOM(current, last)
    },
    // 监听createdMusicList的变化
    '$store.state.createdMusicList' (current, last) {
      // 如果在收藏页面刷新，收藏歌单还没获取到，但是收藏按钮已经渲染了，所以在第一次获取到数据时，再渲染一次
      // 如果是刚刷新，last则为空
      if (last.length == 0) {
        this.getIsSub()
      }
    }
  },
  // 放在mounted中相当与有一个缓存的效果，来回切换的时候就不用重新创建一遍虚拟DOM了
  async mounted () {
    if (this.$store.state.isLogin) {
      // 先判断是否是用户创建的歌单
      this.getIsCreated()
      // 如果不是 再判断是否是收藏的歌单
      if (!this.isCreated) {
        this.getIsSub()
      }
    }
    await this.getMusicListDetail()
    // 判断是否和上一次打开的歌单相同
    if (this.$route.params.id == this.$store.state.musicListId) {
      this.handleDOM(this.$store.state.musicId)
    }
  }
}
</script>

<style scoped>
.listInfo {
  display: flex;
  padding: 25px 15px;
  align-items: center;
}

.listAvatar {
  width: 150px;
  height: 150px;
  overflow: hidden;
  border-radius: 10px;
  margin-right: 15px;
}

.listAvatar img {
  width: 100%;
}

.right {
  width: calc(100% - 200px);
}

.title {
  display: flex;
  align-items: center;
}

.titleTag {
  font-size: 12px;
  color: #ec4141;
  border: 1px solid #ec4141;
  padding: 1px 2px;
  border-radius: 2px;
  margin-right: 5px;
  transform: scale(0.8);
}

.titleContent {
  font-size: 20px;
  font-weight: 600;
  color: #373737;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 90%;
}

.user {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
}

.userAvatar {
  height: 25px;
  width: 25px;
  margin-right: 8px;
}

.userAvatar img {
  width: 100%;
  border-radius: 50%;
}

.userName {
  color: #6191c2;
  margin-right: 8px;
}

.createTime {
  transform: scale(0.9);
}

.buttons {
  margin: 8px 0 0 -5px;
  display: flex;
}

.buttonItem {
  font-size: 12px;
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  transform: scale(0.9);
}

.buttonItem i {
  font-size: 12px;
  margin-right: 3px;
  transform: scale(0.9);
}

.playAll {
  background-color: #ec4141;
  color: white;
}

.tags {
  margin: 8px 0 0 -30px;
  display: flex;
  font-size: 12px;
  transform: scale(0.9);
}

.tagItem {
  color: #6191c2;
  margin-right: 5px;
}

.otherInfo {
  margin: 5px 0 0 -30px;
  display: flex;
  font-size: 12px;
  transform: scale(0.9);
}

.musicNum {
  margin-right: 13px;
}

.desc {
  margin: 5px 0 0 -30px;
  font-size: 12px;
  transform: scale(0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.musicList {
  margin: -15px 15px 0;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
}

.placeholder {
  width: 100%;
  height: 50px;
}

.loadMore {
  width: 100%;
  height: 50px;
  font-size: 12px;
  color: #aaa;
  text-align: center;
  line-height: 50px;
}

.red {
  color: #ec4141;
}
</style>
