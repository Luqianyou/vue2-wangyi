<template>
  <div class="favoritesContainer">
    <nav-bar @clickBarItem="clickBarItem" :navBarItem="navBarData"></nav-bar>
    <router-view class="favorites"></router-view>
  </div>
</template>

<script>
import NavBar from 'components/navBar/NavBar.vue'
export default {
  components: { NavBar },
  name: 'Favorites',
  data () {
    return {
      navBarData: [
        { name: '专辑', path: '/mycollect/MycollectAlbum' },
        { name: '歌手', path: '/mycollect/MycollectSinger' },
        { name: '视频', path: '/mycollect/MycollectVideo' }
      ]
    }
  },
  methods: {
    // 事件
    //   点击navbaritem的回调
    clickBarItem (path) {
      this.$router.push(path)
    }
  },
  created () {
    if (!this.$store.state.isLogin) {
      this.$message.error('收藏页面只有登录后才能访问哦!')
      this.$router.replace('/index')
    }
  }
}
</script>

<style scoped>
.favoritesContainer {
  padding: 0 !important;
  overflow-y: hidden;
}

.favorites {
  margin: auto;
}
</style>
