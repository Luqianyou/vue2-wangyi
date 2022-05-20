<template>
  <div class="search">
    <nav-bar @clickBarItem="clickBarItem" :navBarItem="navBarData"></nav-bar>
    <router-view></router-view>
  </div>
</template>

<script>
import NavBar from "components/navBar/NavBar.vue";
export default {
  name: "Search",
  components: {
    NavBar,
  },
  data() {
    return {
      navBarData: [
        {
          name: "单曲",
          path: `/search/searchsong/${this.$route.params.id}`,
        },
        {
          name: "歌手",
          path: `/search/searchsinger/${this.$route.params.id}`,
        },
        {
          name: "专辑",
          path: `/search/searchalbum/${this.$route.params.id}`,
        },
        {
          name: "视频",
          path: `/search/searchvideo/${this.$route.params.id}`,
        },
        {
          name: "歌单",
          path: `/search/searchmusiclist/${this.$route.params.id}`,
        },
      ],
    };
  },
  methods: {
    clickBarItem(path) {
        // console.log(path);
      if (path != this.$route.path) {
        this.$router.push(path);
      }
    },
  },
};
</script>

<style>
</style>