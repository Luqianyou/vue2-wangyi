<template>
  <div class="FavoriteAlbumContainer">
    <div class="FavoriteAlbum">
      <div v-if="count != 0">
        <div class="title">收藏的专辑({{ count }})</div>
        <list-card
          :listCardData="favoriteAlbumList"
          @clickListCardItem="clickListCardItem"
        ></list-card>
      </div>
      <div v-else class="tip"><div>暂无收藏专辑</div></div>
    </div>
  </div>
</template>

<script>
import ListCard from 'components/listCard/listCard.vue'
export default {
  components: { ListCard },
  name: 'MycollectAlbum',
  data () {
    return {
      favoriteAlbumList: [],
      count: 0
    }
  },
  methods: {
    // 请求
    // 请求已收藏的专辑
    async getFavoriteAlbumList () {
      const timestamp = Date.parse(new Date())
      const res = await this.$request('/album/sublist', {
        limit: 1000,
        timestamp
      })
      this.favoriteAlbumList = res.data.data
      this.count = res.data.count
      this.$store.commit('updateSubAlbumList', res.data.data)
    },

    // 事件
    // 点击卡片的事件
    clickListCardItem (id) {
      this.$router.push({ name: 'album', params: { id } })
    }
  },
  created () {
    if (this.$store.state.subAlbumList == null) {
      this.getFavoriteAlbumList()
      console.log('发送了请求')
    } else {
      this.favoriteAlbumList = this.$store.state.subAlbumList
      this.count = this.$store.state.subAlbumList.length
    }
  },
  watch: {
    '$store.state.subAlbumList' (current) {
      this.favoriteAlbumList = current
      this.count = current.length
    }
  }
}
</script>

<style scoped>
.FavoriteAlbumContainer {
  display: flex;
  justify-content: center;
  padding: 0 25px;
  overflow-y: scroll;
  height: calc(100vh - 162px);
}

.FavoriteAlbum {
  max-width: 1000px;
}

.title {
  font-size: 12px;
  color: rgb(34, 34, 34);
  margin: 0px 0 10px;
}

.tip {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: rgb(34, 34, 34);
}
</style>
