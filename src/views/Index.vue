<template>
  <!-- 外层容器 -->
  <el-container>
    <!-- 容器头部 全部子元素会垂直上下排列-->
    <el-header>
      <!-- 使用头部组件 -->
      <header-bar></header-bar>
    </el-header>
    <!--内层容器 没有<el-header> 或 <el-footer> 时，全部子元素会水平左右排列 -->
    <el-container>
      <!-- 左侧侧边栏 -->
      <el-aside width="160px">
        <!-- 菜单 -->
        <!-- router激活vue-router跳转
              启用该模式会在激活导航时以 index 作为 path 进行路由跳转
               default-active被激活的index -->
        <el-menu
          active-text-color="black"
          router
          :default-active="defaultActive"
        >
          <!--  slot="title"为具名插槽，用span标签得写成具名插槽形式 -->
          <el-menu-item index="/discover">
            <i class="iconfont icon-yinle"></i>
            <span slot="title">发现音乐</span>
          </el-menu-item>
          <el-menu-item index="/video">
            <i class="iconfont icon-shipin"></i>
            <span slot="title">私人FM</span>
          </el-menu-item>
          <el-menu-item index="/mycollect">
            <i class="iconfont icon-more"></i>
            <span slot="title">我的收藏</span>
          </el-menu-item>
          <el-menu-item index="/recommend">
            <i class="iconfont icon-good"></i>
            <span slot="title">每日推荐</span>
          </el-menu-item>
          <!-- 设置组 -->
          <el-submenu index="1">
            <template slot="title" class="groupTitle">创建的歌单</template>
            <el-menu-item
              v-for="(item, index) in createdMusicList"
              :key="index"
              :index="'/musiclistdetail/' + item.id"
              ><i class="iconfont icon-gedan"></i>{{ item.name }}</el-menu-item
            >
          </el-submenu>
          <el-submenu index="2">
            <template slot="title" class="groupTitle">收藏的歌单</template>
            <el-menu-item
              v-for="(item, index) in collectedMusicList"
              :key="index"
              :index="'/musiclistdetail/' + item.id"
            >
              <i class="iconfont icon-gedan"></i>{{ item.name }}</el-menu-item
            >
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体内容 -->
      <el-main>
        <!-- 例 从/page/1 => /page/2, 由于这两个路由的$route.fullPath并不一样,
       所以组件被强制不复用, 相关钩子加载顺序为:
       beforeRouteUpdate => created => mounted -->
        <!-- 路由容器 显示子类路由-->
        <router-view class="routerView" :key="$route.fullPath"></router-view>
        <a
          :href="downloadMusicInfo.url"
          :download="downloadMusicInfo.name"
          target="_blank"
          id="downloadCurrentMusic"
        ></a>
      </el-main>
    </el-container>
    <bottom-control></bottom-control>
  </el-container>
</template>

<script>
// 引入axios
import axios from 'axios'

// 引入组件
// 引入头部组件
import HeaderBar from '../components/headerBar/HeaderBar.vue'
// 引入底部播放栏组件
import BottomControl from '../components/bottomControl/BottomControl.vue'
export default {
  data () {
    return {
      // 用户信息
      // 存储页面的index值，判断菜单
      defaultActive: '',
      // 创建歌单
      createdMusicList: [],
      // 收藏歌单
      collectedMusicList: [],
      // 下载的音乐的信息
      downloadMusicInfo: {
        name: '',
        url: ''
      }
    }
  },
  methods: {
    async getUserMusicList () {
      if (!this.$store.state.isLogin) {
        //   不为true说明已经退出登录
        this.$message.error('请先登录用户')
        // 停止后面方法的执行
        return
      }
      // 格式化时间，转化为时间戳
      const timestamp = Date.parse(new Date())
      //   从localStorage里读取用户信息
      this.userInfo =
        window.localStorage.getItem('userInfo') &&
        JSON.parse(window.localStorage.getItem('userInfo'))
      // 获取用户歌曲信息
      let res = await this.$request('/user/playlist', {
        uid: this.userInfo.userId,
        timestamp
      })
      // console.log(res);
      // 对接收来的数据进行处理
      res = res.data.playlist
      // 通过findIndex来判断item.subscribed的值，得到第一个符合条件元素的位置，停止往后获取
      const index = res.findIndex((item) => item.subscribed === true)
      // 取0-index不包括index，存入createdMusicList中
      this.createdMusicList = res.slice(0, index)
      // 从不符合index开始取值直至结束
      this.collectedMusicList = res.slice(index)
      // 网易云自带歌单无name
      this.createdMusicList[0].name = '我喜欢的音乐'
      // console.log(this.createdMusicList,this.collectedMusicList)
      // 将收藏的歌单上传值vuex
      this.$store.commit('updateCollectMusicList', this.collectedMusicList)
      // 将创建的歌单上传至vuex
      this.$store.commit('updateCreatedMusicList', this.createdMusicList)
    }
  },
  created () {
    // 取路由中的首地址 用于侧边栏的导航active
    this.defaultActive = '/' + this.$route.path.split('/')[1]
    // 登录用户刷新会有延迟，设置500等待一会儿在执行，获取用户数据存入vuex中
    setTimeout(() => {
      this.getUserMusicList()
    }, 500)
  },
  // 使用组件
  components: {
    HeaderBar,
    BottomControl
  },
  watch: {
    // 监听收藏歌单的变化
    '$store.state.collectMusicList' (current) {
      this.collectedMusicList = current
    },
    '$route.path' () {
      // 取路由中的首地址 用于侧边栏的导航active
      this.defaultActive = '/' + this.$route.path.split('/')[1]
    },

    // 监听当前下载音乐信息
    '$store.state.downloadMusicInfo' (current) {
      // console.log(current)
      axios
        .get(current.url, { responseType: 'blob' })
        .then((res) => {
          const blob = res.data
          const url = URL.createObjectURL(blob)
          // console.log(url);
          const a = document.querySelector('#downloadCurrentMusic')
          this.downloadMusicInfo.url = url
          this.downloadMusicInfo.name = current.name
          this.$nextTick(() => {
            a.click()
            // 用完释放URL对象
            URL.revokeObjectURL(url)
          })
        })
        .catch((err) => {
          console.log(err)
          this.$message.error('下载失败,请稍后重试!')
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.is-active {
  background-color: #f6f6f7;
  font-size: 14px;
  font-weight: 600;
}

.iconfont {
  font-size: 14px;
  margin: 5px !important;
}

.el-header {
  background-color: #ec4141;
  height: 50px !important;
  padding: 0;
  margin: 0;
}

.el-aside {
  height: calc(100vh - 105px);
  border-right: 1px solid #ccc;
}

.el-menu-item {
  font-size: 8px;
  padding: 0 0 0 10px !important;
  margin: 5px 0 !important;
  height: 30px;
  line-height: 30px;
}

.el-menu-item:hover {
  background-color: #f5f5f6 !important;
}

.el-menu-item-group {
  margin-top: 10px;
}

.el-main {
  padding: 0;
}

.routerView {
  padding: 0 15px;
  margin: 0;
  width: 100%;
  height: calc(100vh - 105px);
}
</style>
