<template>
  <!-- 设置ref方便获取改标签内容 使用$refs获取 -->
  <div class="bottomControl">
    <audio
      :src="musicUrl"
      ref="audioPlayer"
      autoplay
      @play="changeState(true)"
      @pause="changeState(false)"
      @ended="changeMusic('next')"
      @timeupdate="timeupdate"
    ></audio>
    <!-- 左侧歌曲信息及图标 -->
    <div class="left">
      <!-- 点击图片切换音乐卡片的显隐 -->
      <div class="avatar" @click="$store.commit('changeMusicDetailCardState')">
        <!-- 有就显示，没有默认图片 -->
        <img :src="musicDetail.al.picUrl" alt="" v-if="musicDetail.al" />
        <img src="~assets/img/test.jpg" alt="" v-else />
      </div>
      <!-- 歌曲信息 -->
      <div class="musicInfo">
        <div class="musicName" v-if="musicDetail && musicDetail.name">
          {{ musicDetail.name }}
        </div>
        <div class="singer" v-if="musicDetail && musicDetail.name">
          {{ musicDetail.ar[0].name }}
        </div>
      </div>
      <div class="downloadContainer" v-if="musicDetail.name">
        <i class="iconfont icon-download" @click="downloadCurrentMusic"></i>
      </div>
    </div>

    <!-- 中间歌曲控制部分 -->
    <div class="center">
      <!-- 歌曲操作按钮 -->
      <div class="buttons">
        <span><i class="iconfont icon-xunhuan"></i></span>
        <span @click="musicList.length != 0 ? changeMusic('pre') : ''"
          ><i class="iconfont icon-shangyishou"></i
        ></span>
        <span @click="musicList.length != 0 ? changePlayState() : ''">
          <i
            class="iconfont icon-icon_play"
            v-if="!this.$store.state.isPlay"
          ></i>
          <i class="iconfont icon-zantingtingzhi" v-else></i>
        </span>
        <span @click="musicList.length != 0 ? changeMusic('next') : ''"
          ><i class="iconfont icon-xiayishou"></i
        ></span>
        <span
          ><i
            class="iconfont icon-xihuan"
            :class="isUserLikeCurrentMusic ? 'like' : ''"
            @click="musicList.length != 0 ? likeIt() : ''"
          ></i
        ></span>
      </div>
      <!-- 进度条 -->
      <div class="progressBar">
        <span class="currentTime">{{ currentTime | handleMusicTime }}</span>
        <!-- :value 是单向的  要实现双向要v-model -->
        <el-slider
          class="progressSlider"
          v-model="timeProgress"
          :show-tooltip="false"
          @change="changeProgress"
          :disabled="musicList.length == 0"
        ></el-slider>
        <span class="totalTime">{{ duration }}</span>
      </div>
    </div>

    <!-- 右侧音量控制 -->
     <div class="right">
      <div class="volumeControl">
        <i class="iconfont icon-yinliang" @click="changeMutedState"></i>
        <el-slider
          class="volumeSlider"
          v-model="volume"
          @input="changeVolume"
          :show-tooltip="false"
        ></el-slider>
      </div>
      <div class="playList" @click="openDrawer">
        <i class="iconfont icon-bofangliebiao"></i>
      </div>
    </div>

    <!-- 抽屉样式播放歌单 -->
    <el-drawer :visible.sync="drawer" :with-header="false" width="300">
      <div class="drawerHeader">总{{ musicList.length }}首</div>
      <el-table
        :data="musicList"
        stripe
        style="width: 100%"
        :show-header="false"
        @row-dblclick="clickRow"
        highlight-current-row
        lazy
      >
        <el-table-column prop="name" width="150px"> </el-table-column>
        <el-table-column prop="ar[0].name" width="80px"> </el-table-column>
        <el-table-column prop="dt" width="70px"> </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script>
import { handleMusicTime, returnSecond } from 'plugins/utils'
let lastSecond = 0
// 总时长的秒数
let durationNum = 0
// 保存当前音量
let volumeSave = 0
// 当前音乐类型，用于下载
let musicType = ''
export default {
  data () {
    return {
      // 音乐地址
      musicUrl: '',
      // 音乐详情
      musicDetail: {},
      musicList: [],
      currentMusicIndex: 0,
      drawer: false,
      // 音乐总时长
      duration: '00:00',
      // 当前播放时间位置
      currentTime: 0,
      // 进度条的位置
      timeProgress: 0,
      // 音量
      volume: 30,
      // 是否静音
      isMuted: false,
      // 抽屉是否被打开过（如果没打开过，里面的数据是不会渲染的）
      hasDrawerOpend: false,
      // 用户的喜欢音乐列表
      likeMuiscList: [],
      // 用户是否喜欢当前音乐
      isUserLikeCurrentMusic: false
    }
  },
  // 播放音乐的信息主要通过vuex中存储的信息来获取
  // 通过watch来监听数据的变化
  watch: {
    '$store.state.musicId' (id) {
      // 先暂停当前播放的音乐
      this.pauseMusic()
      // 获取存入vuex的音乐列表
      this.musicList = this.$store.state.musicList
      this.getMusicDetailFromMusicList()
      this.getMusicDetail(id)
      durationNum = returnSecond(this.duration)
      // 判断用户是否喜欢当前音乐
      this.getIsUserLikeCurrentMusic()
    },
    // 监听currentIndex的变化
    '$store.state.currentIndex' (currentIndex, lastIndex) {
      if (this.hasDrawerOpend) {
        this.handleDrawerListDOM(currentIndex, lastIndex)
      }
    },
    // 监听播放状态
    '$store.state.isPlay' (isPlay) {
      if (isPlay) {
        this.playMusic()
      } else {
        this.pauseMusic()
      }
    }
  },
  methods: {
    // 请求
    // 请求歌曲的url
    async getMusicDetail (id) {
      this.$store.commit('updateMusicLoadState', true)
      const result = await this.$request('/song/url', { id, br: 320000 })
      // console.log(musicDetail);
      // console.log(result);
      // 获取不到url
      if (result.data.data[0].url == null) {
        this.$message.error('该歌曲暂无版权，将为您播放下一首歌曲')
        this.changeMusic('next')
        return
      }
      this.musicUrl = result.data.data[0].url
      musicType = result.data.data[0].type.toLowerCase()
      this.$store.commit('updateMusicLoadState', false)
    },
    // 喜欢该音乐
    // like参数:是否喜欢该音乐
    async likeMusic (id, like) {
      const res = await this.$request('/like', { id, like })

      if (res.data.code == 200) {
        alert('喜欢操作成功')
      } else {
        alert('喜欢操作失败')
      }
    },
    // 获取喜欢音乐列表
    async getLikeMusicList () {
      // 获取时间戳
      var timestamp = Date.parse(new Date())
      // 因为喜欢音乐列表实时性较高，为了避免接口缓存，在请求后面加上一个时间戳
      const res = await this.$request('/likelist', {
        uid: JSON.parse(window.localStorage.getItem('userInfo')).userId,
        timestamp
      })
      this.likeMuiscList = res.data.ids
      // 将喜欢列表提交到vuex 供歌单中显示喜欢使用 （因为性能问题暂时没做）
      this.$store.commit('updataLikeMuiscList', this.likeMuiscList)
    },

    // 点击播放键的回调
    changePlayState () {
      !this.$store.state.isPlay ? this.playMusic() : this.pauseMusic()
    },
    // 播放音乐的函数
    playMusic () {
      this.$refs.audioPlayer.play()
    },
    // 暂停音乐的函数
    pauseMusic () {
      this.$refs.audioPlayer.pause()
    },
    // audio开始或暂停播放的回调  在vuex中改变状态
    changeState (state) {
      this.$store.commit('changePlayState', state)
    },
    // 根据id找到 musicList中对应的musicDetail
    getMusicDetailFromMusicList () {
      // console.log(this.musicList);
      this.musicList.forEach((item, index) => {
        // console.log(index);
        if (item.id == this.$store.state.musicId) {
          // 记录当前音乐的index
          this.currentMusicIndex = index
          // 将索引传至vuex
          this.$store.commit('updateCurrentIndex', index)
          this.musicDetail = item
          // 直接从audio标签中的duration属性拿时长会有请求时差问题，所以直接在musicInfo中拿
          this.duration = this.musicList[index].dt
        }
      })
    },
    // 切歌函数
    changeMusic (type, id) {
      if (type == 'click') {
        // 点击抽屉row进行切歌
        this.$store.commit('updateMusicId', id)
      } else if (type == 'pre') {
        const currentMusicIndex = this.currentMusicIndex
        const preIndex =
          currentMusicIndex - 1 < 0
            ? this.musicList.length - 1
            : currentMusicIndex - 1
        // console.log(this.musicList[preIndex].id);
        this.$store.commit('updateMusicId', this.musicList[preIndex].id)
      } else if (type == 'next') {
        const currentMusicIndex = this.currentMusicIndex
        const nextIndex =
          currentMusicIndex + 1 == this.musicList.length
            ? 0
            : currentMusicIndex + 1
        // console.log(this.musicList[nextIndex].id);
        this.$store.commit('updateMusicId', this.musicList[nextIndex].id)
      }
    },
    // 双击抽屉列表中的row的回调
    clickRow (row) {
      // console.log(row.id);
      this.changeMusic('click', row.id)
    },
    // 当前播放时间位置
    timeupdate () {
      // console.log(e);
      // console.log(this.$refs.audioPlayer.currentTime);
      // 节流
      let time = this.$refs.audioPlayer.currentTime
      // 将当前播放时间保存到vuex  如果保存到vuex这步节流,会导致歌词不精准,误差最大有1s
      this.$store.commit('updateCurrentTime', time)

      time = Math.floor(time)
      if (time !== lastSecond) {
        // console.log(time);
        lastSecond = time
        this.currentTime = time
        // 计算进度条的位置
        this.timeProgress = Math.floor((time / durationNum) * 100)
        // console.log(this.timeProgress);
      }
    },
    // 拖动进度条的回调
    changeProgress (e) {
      // console.log(e);
      // 修改当前播放时间
      this.currentTime = Math.floor((e / 100) * durationNum)
      // 改变audio的实际当前播放时间
      this.$refs.audioPlayer.currentTime = this.currentTime
    },
    // 拖动音量条的回调
    changeVolume (e) {
      // 改变audio的音量
      // input事件 实时触发
      this.$refs.audioPlayer.volume = e / 100
      if (this.isMuted && e > 0) {
        this.isMuted = false
      } else if (e === 0 && this.isMuted === false) {
        this.isMuted = true
      }
    },
    // 点击小喇叭的回调 （切换静音状态）
    changeMutedState () {
      if (this.isMuted) {
        this.volume = volumeSave
      } else {
        volumeSave = this.volume
        this.volume = 0
      }
      // console.log(volumeSave, this.isMuted);
      this.isMuted = !this.isMuted
    },
    // 操作drawerList中DOM的函数
    handleDrawerListDOM (currentIndex, lastIndex) {
      // 目前没什么好思路 直接操作原生DOM
      this.$nextTick(() => {
        const tableRows = document
          .querySelector('.bottomControl')
          .querySelectorAll('.el-table__row')
        // // 直接修改dom样式的颜色无效  可能是因为第三方组件 style scoped的原因
        // // 通过引入全局样式解决
        if (tableRows[currentIndex]) {
          tableRows[currentIndex].children[0]
            .querySelector('.cell')
            .classList.add('currentRow')
          tableRows[currentIndex].children[1]
            .querySelector('.cell')
            .classList.add('currentRow')
        }
        if (
          (lastIndex && lastIndex != -1 && tableRows[lastIndex]) ||
          lastIndex == 0
        ) {
          // 将上一首的类名删掉
          tableRows[lastIndex].children[0]
            .querySelector('.cell')
            .classList.remove('currentRow')
          tableRows[lastIndex].children[1]
            .querySelector('.cell')
            .classList.remove('currentRow')
        }
      })
    },
    // 点击打开抽屉的回调
    openDrawer () {
      // 关闭也是这个回调，所以直接取反
      this.drawer = !this.drawer
      this.hasDrawerOpend = true
      this.handleDrawerListDOM(this.currentMusicIndex)
    },

    // 判断用户是否喜欢该音乐
    getIsUserLikeCurrentMusic () {
      this.isUserLikeCurrentMusic = this.likeMuiscList.find(
        (item) => item === this.$store.state.musicId
      )
    },
    // 用户点击喜欢该音乐的回调
    async likeIt () {
      if (!window.localStorage.getItem('userInfo')) {
        this.$message.error('请先登录!')
        return
      }
      this.isUserLikeCurrentMusic = !this.isUserLikeCurrentMusic
      await this.likeMusic(
        this.$store.state.musicId,
        this.isUserLikeCurrentMusic
      )
      await this.getLikeMusicList()
    },

    // 点击下载按钮的回调
    downloadCurrentMusic () {
      // console.log("download");
      // console.log(this.musicDetail, this.musicUrl);

      // 匹配资源的域名
      const url = this.musicUrl.match(/\http.*?\.net/)
      // 匹配域名名称，并匹配对应的代理
      const serve = url[0].match(/http:\/(\S*).music/)[1]
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
      const params = this.musicUrl.slice(url[0].length)

      const downloadMusicInfo = {
        url: serve + params,
        name:
          this.musicDetail.name +
          ' - ' +
          this.musicDetail.ar[0].name +
          '.' +
          musicType
      }

      console.log(downloadMusicInfo)
      this.$store.commit('updateDownloadMusicInfo', downloadMusicInfo)
    }
  },
  filters: {
    handleMusicTime
  },
  created () {
    // 先判断用户是否登录
    if (window.localStorage.getItem('userInfo')) {
      {
        this.getLikeMusicList()
      }
    }
  }
}
</script>

<style scoped>
.bottomControl {
  /* background-color: pink; */
  border-top: 1px solid #ddd;
  width: 100%;
  height: 55px;
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  z-index: 100000000000;
  background-color: #fff;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 5px;
  overflow: hidden;
  margin-right: 10px;
  cursor: pointer;
}

.avatar img {
  width: 100%;
}

.left {
  display: flex;
  align-items: center;
  width: 123px;
}

.musicInfo {
  color: rgb(37, 37, 37);
  font-size: 12px;
  width: 70px;
}

.musicName {
  margin-bottom: 4px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.singer {
  transform: scale(0.9);
  margin-left: -3px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.center {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.buttons {
  display: flex;
  align-items: center;
  height: 13px;
}

.buttons i {
  font-size: 20px;
  color: #313131;
}

.buttons span:nth-child(3) i {
  font-size: 25px;
}

.center .icon-xunhuan {
  font-size: 17px;
}
.center .icon-xihuan {
  font-size: 15px;
}

.right {
  display: flex;
  align-items: center;
}

.volumeControl {
  display: flex;
  align-items: center;
  margin-right: 15px;
}

.icon-yinliang {
  font-size: 18px;
  margin-right: 7px;
}

.volumeSlider {
  width: 55px;
}

.icon-bofangliebiao {
  font-size: 18px;
  margin-right: 10px;
}

.progressSlider {
  width: 300px;
}

.buttons span {
  display: inline-block;
  width: 50px;
  box-sizing: border-box;
  text-align: center;
}

.icon-zantingtingzhi {
  font-size: 35px !important;
}

.drawerHeader {
  font-size: 12px;
  transform: scale(0.9);
  color: #aaa;
  padding: 15px 0;
}

.progressBar {
  display: flex;
  align-items: center;
}

.currentTime,
.totalTime {
  font-size: 12px;
  transform: scale(0.85);
  color: #aaa;
  margin: 0 5px;
  width: 30px;
  text-align: center;
}

.progressBar {
  height: 10px;
  margin-top: 12px;
  overflow: hidden;
}

.like {
  color: #ec4141 !important;
}

.downloadContainer {
  height: 100%;
  position: relative;
}

.downloadContainer i {
  position: absolute;
  bottom: 5px;
}
</style>
