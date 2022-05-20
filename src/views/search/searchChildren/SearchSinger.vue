<template>
  <div class="searchSinger">
    <div class="tip">找到{{ singerCount }}位歌手</div>
    <!-- 歌手 -->
    <list-card
      :listCardData="searchSingerList"
      @clickListCardItem="clickListCardItem"
    ></list-card>
    <!-- 分页 -->
    <div class="page" v-if="searchSingerList.length != 0">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="singerCount"
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
  name: "SearchSinger",
  components:{
    ListCard
  },
  data() {
    return {
      singerCount: 0,
      searchSingerList: [],
      currentPage: 1,
    };
  },
  methods: {
    // 请求获取歌手
    async getSearchSinger() {
      let res = await this.$request("/cloudsearch", {
        keywords: this.$route.params.id,
        offset: 30 * (this.currentPage - 1),
        type: 100,
      });
      this.singerCount = res.data.result.artistCount;
      this.searchSingerList = res.data.result.artists;
    },
    // 点击歌手图片跳转至歌手详情
    clickListCardItem(id) {
      this.$router.push({ name: "singerDetail", params: { id } })
    },
    // 点击翻页调
    pageChange(page) {
      this.currentPage = page;
      this.searchSingerList = [];
      this.getSearchSinger();
    },
  },
  created() {
    this.getSearchSinger();
  },
};
</script>

<style scoped>
.searchSinger {
  padding: 0 15px;
}

.tip {
  font-weight: bold;
  color: rgb(34, 34, 34);
  margin-bottom: 10px;
}

.page {
  width: 100%;
  text-align: center;
  padding-bottom: 20px;
  margin: 20px 0;
}
</style>