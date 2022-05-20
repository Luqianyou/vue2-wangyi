<template>
  <!-- 大容器 -->
  <div class="headerBar">
    <!-- 左侧Logo标志 -->
    <div class="left">
      <img src="~assets/img/logo.png" alt="" />
    </div>

    <!-- 头部中间内容 -->
    <div class="center">
      <!-- 前进后退按钮 -->
      <div class="buttons">
        <el-button
          type="info"
          icon="el-icon-arrow-left"
          circle
          size="small"
          @click="goBack"
        ></el-button>
        <el-button
          type="info"
          icon="el-icon-arrow-right"
          circle
          size="small"
          @click="goForward"
        ></el-button>
      </div>
      <!-- 搜索框 -->
      <div class="search">
        <!-- 弹出框 -->
        <el-popover
          placement="bottom"
          width="300"
          popper-class="searchPop"
          trigger="focus"
          v-model="isSearchPopShow"
        >
          <!-- 输入框 -->
          <!--加上具名插槽 slot="reference" 相当于激活元素-->
          <el-input
            placeholder="请输入歌名/歌手"
            prefix-icon="el-icon-search"
            size="mini"
            slot="reference"
            @input="inputSearch"
            @keyup.enter="onSubmit"
            v-model="searchInput"
            clearable
          ></el-input>

          <!-- 搜索榜单 如果未输入搜索信息，searchSuggestList.songs 为空，显示搜索榜单-->
          <div class="hotSearch" v-if="!searchSuggestList.songs">
            <!-- 提示小标题 -->
            <div class="hotSearchTitle">热搜榜</div>
            <!-- 遍历歌单 根据歌名查具体点击的歌曲-->
            <div
              class="hotSearchItem"
              v-for="(item, index) in hotSearchList"
              :key="index"
              @click="clickHotSearchItem(item.searchWord)"
            >
              <!-- 榜单内排名显示 计算属性三元运算判断前三-->
              <div class="hotSearchIndex" :class="Topthree(index)">
                {{ index + 1 }}
              </div>
              <!-- 歌曲详情 -->
              <div class="hotSearchWord">
                <!-- 歌曲名称 -->
                <div class="hotSearchWord" :class="TopContentthree(index)">
                  {{ item.searchWord }}
                </div>
                <!-- 歌曲简介 -->
                <div class="hotSearchContent">{{ item.content }}</div>
              </div>
            </div>
          </div>

          <!-- 搜索建议 -->
          <div class="searchSuggest" v-else>
            <!-- 提示小标题 -->
            <div class="hotSearchTitle">搜索建议</div>
            <!-- 单曲 -->
            <!-- 有歌曲数据就显示出来 -->
            <div
              class="searchSuggestItem"
              v-if="
                searchSuggestList.songs && searchSuggestList.songs.length != 0
              "
            >
              <!-- 小标题 -->
              <div class="searchSuggestItemTitle">
                <i class="iconfont icon-yinle"></i>单曲
              </div>
              <!-- 通过searchSuggestList.songs的内容进行遍历-->
              <div
                class="suggestItemDetail"
                v-for="(item, index) in searchSuggestList.songs"
                :key="index"
                @click="clickSuggestSong(item.id)"
              >
                {{ item.name + " - " + item.artists[0].name }}
              </div>
            </div>
            <!-- 歌手 -->
            <!-- 有歌手数据就显示出来 -->
            <div
              class="searchSuggestItem"
              v-if="
                searchSuggestList.artists &&
                searchSuggestList.artists.length != 0
              "
            >
              <!-- 小标题 -->
              <div class="searchSuggestItemTitle">
                <i class="iconfont icon-mic"></i> 歌手
              </div>
              <!-- 通过searchSuggestList.artists的内容进行遍历-->
              <div
                class="suggestItemDetail"
                v-for="(item, index) in searchSuggestList.artists"
                :key="index"
                @click="clickSuggestSinger(item.id)"
              >
                {{ item.name }}
              </div>
            </div>
            <!-- 专辑 -->
            <!-- 有专辑就显示出来 -->
            <div
              class="searchSuggestItem"
              v-if="
                searchSuggestList.albums && searchSuggestList.albums.length != 0
              "
            >
              <!-- 小标题 -->
              <div class="searchSuggestItemTitle">
                <i class="iconfont icon-more"></i> 专辑
              </div>
              <!-- 通过searchSuggestList.albums的内容进行遍历 -->
              <div
                class="suggestItemDetail"
                v-for="(item, index) in searchSuggestList.albums"
                :key="index"
                @click="clickSuggestAlbum(item.id)"
              >
                {{ item.name + "-" + item.artist.name }}
              </div>
            </div>
            <!-- 歌单 -->
            <!-- 有歌单就显示出来 -->
            <div
              class="searchSuggestItem"
              v-if="
                searchSuggestList.playlists &&
                searchSuggestList.playlists.length != 0
              "
            >
              <div class="searchSuggestItemTitle">
                <i class="iconfont icon-gedan"></i> 歌单
              </div>
              <div
                class="suggestItemDetail"
                v-for="(item, index) in searchSuggestList.playlists"
                :key="index"
                @click="clickSuggestMusicList(item.id)"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
        </el-popover>
      </div>
    </div>

    <!-- 右侧登录按钮 -->
    <div class="right">
      <!-- 登录区布局盒子 -->
      <div class="user">
        <!-- 登录点击图像及弹出框盒子-->
        <div class="avatar">
          <!-- 登录框 -->
          <el-popover
            placement="bottom"
            width="330"
            trigger="click"
            v-if="!userInfo.avatarUrl"
          >
            <!-- 登录窗口的form表单 设置判断规则rules-->
            <el-form
              ref="loginForm"
              :model="loginForm"
              :rules="rules"
              v-model="loginForm"
              label-width="80px"
              label-position="right"
              size="mini"
            >
              <!-- 手机号输入区 required是否必填 -->
              <el-form-item
                label="手机号码："
                size="mini"
                label-width="100px"
                prop="phoneNum"
              >
                <el-input type="text" v-model="loginForm.phoneNum"></el-input>
              </el-form-item>
              <!-- 密码输入区 -->
              <el-form-item
                label="密码："
                size="mini"
                label-width="100px"
                prop="password"
              >
                <el-input
                  type="password"
                  v-model="loginForm.password"
                ></el-input>
              </el-form-item>
              <div class="loginButton">
                <el-button type="danger" size="mini" @click="login"
                  >登录</el-button
                >
              </div>
            </el-form>
            <!-- 激发弹框属性 -->
            <img
              src="~assets/img/test.jpg"
              alt=""
              slot="reference"
            />
          </el-popover>
          <!-- 已登录状态的显示 -->
          <el-popover
            placement="bottom"
            trigger="click"
            v-else
          >
            <img :src="userInfo.avatarUrl" alt="" slot="reference" />
            <div class="logout">
              <el-button size="mini" type="info" @click="logout"
                >退出登录</el-button
              >
            </div>
          </el-popover>
        </div>
        <!-- 有用户名就显示用户 否则提示登录 -->
        <div class="userName" v-if="userInfo.nickname">
          {{ userInfo.nickname }}
        </div>
        <div class="userName" v-else>点击头像登录</div>
      </div>
    </div>
    <!-- 注册窗口组件 -->
  </div>
</template>

<script>
import { handleMusicTime } from 'plugins/utils.js'
// 设置定时器
let timer
export default {
  // 设置name值方便设置跳转方式
  name: 'HeaderBar',
  data () {
    // 手机前端验证正则表达式
    const checkPhone = (rule, value, callback) => {
      const reg = /^1[3456789]\d{9}$/
      if (!reg.test(value)) {
        callback(new Error('请输入11位手机号'))
      } else {
        callback()
      }
    }
    return {
      // 获取用户的手机号和密码
      loginForm: {
        phoneNum: '',
        password: ''
      },
      // 设置登录判断规则
      rules: {
        phoneNum: [
          // validator自定义验证规则
          { required: true, message: '请输入手机号', trigger: 'change' },
          {
            validator: checkPhone,
            message: '请输入正确手机号',
            trigger: 'change'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' },
          { min: 6, max: 18, message: '密码长度不正确', trigger: 'blur' }
        ]
      },
      // 搜索弹出框控制显示
      isSearchPopShow: false,
      // 搜索的内容
      searchInput: '',
      // 搜索榜单数据
      hotSearchList: [],
      // 搜索建议列表
      searchSuggestList: {},
      // 用户信息
      userInfo: {}
    }
  },
  methods: {
    // 页面后退按钮
    goBack () {
      this.$router.go(-1)
    },
    // 页面前进按钮
    goForward () {
      this.$router.go(1)
    },
    // 获取热搜榜单数据
    async getHotSearch () {
      // 调用网易云歌曲榜单接口
      const res = await this.$request('/search/hot/detail')
      // console.log(res);
      this.hotSearchList = res.data.data
    },
    // 获取搜素建议列表
    async getSearchSuggest (keywords) {
      const res = await this.$request('/search/suggest', { keywords })
      // console.log(res);
      this.searchSuggestList = res.data.result
    },
    // 搜索框输入
    inputSearch (e) {
      // console.log(e);
      // 清除定时器
      clearTimeout(timer)
      if (e != '') {
        timer = setTimeout(() => {
          // 向getSearchSuggest()方法传入输入值
          this.getSearchSuggest(e)
        }, 500)
      } else {
        // 清空searchSuggestList
        this.searchSuggestList = {}
        // 停止搜索操作
      }
    },
    // 输入内容后点击enter键触发
    onSubmit (e) {
      if (e.keyCode == 13 && this.searchInput != '') {
        this.goSearch()
      }
    },
    // 跳转至搜索详情页面
    goSearch () {
      this.isSearchPopShow = false
      this.$router.push({ name: 'search', params: { id: this.searchInput } })
    },
    // 点击榜单内歌曲后执行函数
    clickHotSearchItem (searchWord) {
      this.searchInput = searchWord
      this.goSearch()
    },
    // 点击搜索建议中专辑的回调
    clickSuggestAlbum (id) {
      this.$router.push({ name: 'album', params: { id } })
      this.isSearchPopShow = false
    },
    // 点击搜索建议中歌手的回调
    clickSuggestSinger (id) {
      this.$router.push({ name: 'singerDetail', params: { id } })
      this.isSearchPopShow = false
    },
    // 点击搜索建议中歌单的回调
    clickSuggestMusicList (id) {
      this.$router.push({ name: 'musicListDetail', params: { id } })
      this.isSearchPopShow = false
    },
    // 点击搜索建议中单曲的回调
    async clickSuggestSong (id) {
      const row = await this.getMusicInfo(id)
      this.isSearchPopShow = false
      // 首先获取当前的歌单列表和歌曲索引
      const musicList = this.$store.state.musicList
      const currentIndex = this.$store.state.currentIndex
      // 先判断歌曲是否已经在歌单中存在，避免重复点击导致歌单出现相同的歌曲
      // find() 方法返回通过测试（函数内判断）的数组的第一个元素的值。
      const isExist = musicList.find((item) => item.id == row.id)
      if (isExist) {
        // 如果已经存在 则只提交歌曲id并return出去
        this.$store.commit('updateMusicId', row.id)
        return
      }
      this.$store.commit('changePlayState', false)
      // 将请求的歌曲详情插入到歌单对应位置并提交值vuex
      musicList.splice(currentIndex, 0, row)
      this.$store.commit('updateMusicId', row.id)
      this.$store.commit('updateMusicList', {
        musicList,
        musicListId: this.$store.state.musicListId
      })
    },
    // 根据id获取歌曲的详情
    async getMusicInfo (ids) {
      const res = await this.$request('/song/detail', { ids })
      // console.log(res);
      // 处理时间
      res.data.songs[0].dt = handleMusicTime(res.data.songs[0].dt)
      return res.data.songs[0]
    },
    // 通过手机登录 (withCredentials: true) 跨域请求要想带上cookie
    async loginByCellphone () {
      const res = await this.$request('/login/cellphone', {
        phone: this.loginForm.phoneNum,
        password: this.loginForm.password,
        withCredentials: true
      })
      // console.log(res);
      // 将用户数据存入sessionStorage方便过后页面切换读取
      if (res.data.code == 200) {
        window.localStorage.setItem(
          'userInfo',
          JSON.stringify(res.data.profile)
        )
        // 将获取的数据存入页面
        this.userInfo = res.data.profile
        // 弹窗提示用户登录成功
        this.$message.success('登录用户成功')
        // 刷新页面
        this.$router.go(0)
      } else if (res.data.code == 400) {
        // 手机号输入有误
        this.$message.error('请输入正确手机号')
      } else if (res.data.code == 502) {
        // 密码错误
        this.$message.error('密码错误')
      } else {
        // 登录失败
        this.$message.error('登录失败，请重新输入')
      }

      // 清空输入框的内容
      this.loginForm.password = ''
      this.loginForm.phoneNum = ''
    },
    // 点击登录按钮
    login () {
      // console.log(this.loginForm);
      // 调用方法读取用户登录信息
      this.loginByCellphone()
    },
    // 点击退出登录的回调
    logout () {
      // 清空data和localstorage中的数据，以及cookie
      this.userInfo = {}
      // 将userInfo清空
      window.localStorage.setItem('userInfo', '')
      this.clearAllCookie()
      //   在vuex中更新登录状态
      this.$store.commit('updataLoginState')
      this.$message.success('退出成功!')
      // 刷新页面
      this.$router.go(0)
    },

    // 清除所有cookie函数
    clearAllCookie () {
      var date = new Date()
      date.setTime(date.getTime() - 10000)
      var keys = document.cookie.match(/[^ =;]+(?=\=)/g)
      // console.log("需要删除的cookie名字：" + keys);'
      if (keys) {
        for (var i = keys.length; i--;) {
          document.cookie =
            keys[i] + '=0; expire=' + date.toGMTString() + '; path=/'
        }
      }
    }
  },
  // 计算属性判断添加名称
  computed: {
    Topthree () {
      return function (index) {
        return index < 3 ? 'topThree' : ''
      }
    },
    TopContentthree () {
      return function (index) {
        return index < 3 ? 'hotSearchWordTopThree' : ''
      }
    }
  },
  created () {
    // 调用获取榜单方法
    this.getHotSearch()
    // 如果已经登录了用户，取出数据渲染页面
    if (window.localStorage.getItem('userInfo')) {
      // 进入这里表示已经登录，更新登录状态到vuex,将isLogin设为true
      this.$store.commit('updataLoginState')
      this.userInfo = JSON.parse(window.localStorage.getItem('userInfo'))
    }
  }
}
</script>

<style lang="scss" scoped>
// @import 等到页面被加载完再加载
@import "./HeaderBar-elementUI.css";
.headerBar {
  display: flex;
  width: 100%;
  height: 50px;
  align-items: center;
  position: relative;
  .left {
    width: 150px;
    margin: 5px 50px 0 10px;
    img {
      width: 100%;
    }
  }
  .center {
    display: flex;
    align-items: center;
    .buttons {
      height: 100%;
    }
  }
  .right {
    display: flex;
    position: absolute;
    line-height: 50px;
    right: 50px;
    top: 0;
    .user {
      display: flex;
      align-items: center;
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 7px;
        cursor: pointer;
        img {
          width: 100%;
        }
      }
      .userName {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.85);
        width: 100px;
      }
    }
  }
}

// el-popover的class也是el-popover，他比较特别的是,el-popover生成的div不在当前组件之内
//，甚至不在App.vue组件的div内，他和App.vue组件的div平级，所以需要设置全局style
.searchPop {
  .hotSearch {
    .hotSearchTitle {
      font-size: 13px;
      margin: 10px 0 5px 20px !important;
    }
    .hotSearchItem {
      display: flex;
      align-items: center;
      padding: 6.5px 15px;
      .hotSearchIndex {
        margin-right: 15px;
        color: #aaa;
      }
      .topThree {
        color: #e13e3e;
      }

      .hotSearchWord {
        font-size: 12px;
        color: rgb(51, 51, 51);
      }

      .hotSearchWordTopThree {
        font-weight: 600;
        color: black;
      }

      .hotSearchContent {
        font-size: 12px;
        transform: scale(0.9) translateX(-5%);
      }
    }
    .hotSearchItem:hover {
      background-color: #f2f2f2;
    }
  }

  .searchSuggest {
    font-size: 12px;
    .hotSearchTitle {
      font-size: 13px;
      margin: 10px 0 5px 20px !important;
    }
  }

  .searchSuggestItemTitle {
    background-color: #f5f5f7;
    padding: 4px 8px;
    .searchSuggestItemTitle i {
      font-size: 15px;
    }
  }

  .suggestItemDetail {
    padding: 4px 27px;
    font-size: 12px;
  }

  .suggestItemDetail:hover {
    background-color: #f2f2f2;
  }
}

.loginButton {
  display: flex;
  align-items: center;
  justify-content: center;
  .loginButton .el-button {
    width: 200px;
  }
  .regEnter {
    margin-left: 35px;
    font-size: 12px;
    text-decoration: underline;
    cursor: pointer;
  }
}

.logout {
  text-align: center;
}

.el-button--info {
  color: black !important;
}
</style>
