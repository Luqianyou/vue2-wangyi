<!--
 * @Author: Luqianyou 757628817@qq.com
 * @Date: 2021-06-25 15:47:17
 * @LastEditors: Luqianyou 757628817@qq.com
 * @LastEditTime: 2022-05-15 20:17:19
 * @FilePath: \NeteaseCloudMusicApid:\前端知识练习\vue2 vuecli项目练习\wangyi\src\views\discover\discoverChildren\superRecommend.vue
 * @Description:
 *
 * Copyright (c) 2022 by Luqianyou 757628817@qq.com, All Rights Reserved.
-->
<template>
  <div class="recommend">
    <!-- 轮播图 -->
    <div class="carousel">
      <el-carousel :interval="3000" type="card" height="200px">
        <el-carousel-item v-for="(item, index) in bannerData" :key="index">
          <img :src="item.imageUrl" alt="" />
          <span>{{ item.typeTitle }}</span>
        </el-carousel-item>
      </el-carousel>
    </div>
    <!-- 推荐歌单 -->
    <div>
      <h3>推荐歌单<i class="iconfont icon-arrow-right-bold"></i></h3>
      <list-card
        :listCardData="musicList"
        @clickListCardItem="clickListCardItem"
      ></list-card>
    </div>
  </div>
</template>

<script>
import ListCard from 'components/listCard/listCard.vue'
import descriptionCard from 'components/descriptionCard/descriptionCard.vue'
export default {
  data () {
    return {
      //   轮播图数据
      bannerData: [],
      //   推荐的歌单
      musicList: []
    }
  },
  methods: {
    // 请求轮播图数据
    async getBannerData () {
      const res = await this.$request('/banner')
      //   console.log(res);
      this.bannerData = res.data.banners
    },

    // 请求推荐歌单的前十数据
    getMusicList () {
      this.$request('/personalized', { limit: 10 }).then((res) => {
        // console.log(res);
        this.musicList = res.data.result
      })
    },
    // 点击歌单封面的回调
    clickListCardItem (id) {
      // console.log(id);
      this.$router.push({ name: 'musicListDetail', params: { id } })
    }
  },
  components: {
    ListCard,
    descriptionCard
  },
  created () {
    this.getBannerData()
    this.getMusicList()
  }
}
</script>

<style lang="scss" scoped>
.carousel {
  width: 100%;
}

.el-carousel {
  margin: auto;
  width: 900px;
}

.el-carousel__item {
  border-radius: 10px;
}

.el-carousel__item img {
  height: 100%;
  position: relative;
}

.el-carousel__item span {
  display: inline-block;
  position: absolute;
  padding: 5px 10px;
  box-sizing: border-box;
  bottom: 0;
  right: 0;
  color: white;
  border-top-left-radius: 10px;
}
</style>>
