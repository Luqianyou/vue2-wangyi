<template>
  <div class="discoverContainer">
    <!-- @clickBarItem接收子元素的值  :navBarItem获取父元素的值覆盖子元素-->
    <nav-bar @clickBarItem="clickBarItem" :navBarItem="navBarData"></nav-bar>
    <router-view class="discover"></router-view>
  </div>
</template>

<script>
import NavBar from 'components/navBar/NavBar.vue'

export default {
  data () {
    return {
      navBarData: [
        { name: '个性推荐', path: '/discover/superrecommend' },
        { name: '歌单', path: '/discover/musiclist' },
        { name: '排行榜', path: '/discover/ranking' },
        { name: '歌手', path: '/discover/singer' }
      ]
    }
  },
  methods: {
    // 接收navbar传来的事件
    clickBarItem (path) {
      // 明文页面跳转
      this.$router.push(path)
    }
  },
  created () {},
  components: {
    NavBar
  }
}
</script>

<style scoped>
.discover {
  max-width: 1200px;
  margin: auto;
}
</style>
