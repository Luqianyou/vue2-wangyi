<template>
  <div class="SearchMusicList">
    <div class="tip">找到{{ musicListCount }}个歌单</div>
    <list-card
      :listCardData="searchMusicList"
      @clickListCardItem="clickListCardItem"
    ></list-card>
    <!-- 分页 -->
    <div class="page" v-if="searchMusicList.length != 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="musicListCount"
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
import ListCard from "components/listCard/listCard.vue";

export default {
  name: "SearchMusicList",
    components: {
    ListCard,
  },
  data() {
    return {
      musicListCount: 0,
      searchMusicList: [],
      currentPage: 1,
    };
  },
  methods: {
    // 请求数据
    async getSearchMusicList() {
      let res = await this.$request("/cloudsearch", {
        keywords: this.$route.params.id,
        offset: 30 * (this.currentPage - 1),
        type: 1000,
      });
      this.musicListCount = res.data.result.playlistCount;
      this.searchMusicList = res.data.result.playlists;
    },
    clickListCardItem(id) {
      this.$router.push({ name: "musicListDetail", params: { id } });
    },
    pageChange(page) {
      this.currentPage = page;
      this.searchMusicList=[];
      this.getSearchMusicList()
    },
  },
  created() {
    this.getSearchMusicList()
  },
};
</script>

<style scoped>
.SearchMusicList {
  padding: 0 15px;
}

.tip {
  font-weight: bold;
  color: rgb(34, 34, 34);
  margin-bottom: 10px;
}

.page {
  width: 100%;
  padding-bottom: 20px;
  margin: 20px 0;
  padding-left: 70%;
}
</style>