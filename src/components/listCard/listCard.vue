<template>
  <div class="listCard" >
    <div
      class="listCardItem"
      v-for="(item, index) in listCardData"
      :key="index"
      @click="clickListCardItem(item.id)"
    >
      <div class="image">
        <img
          :src="(item.picUrl || item.coverImgUrl) + '?param=300y300'"
          alt=""
        />
      </div>
      <div class="title">{{ item.name }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListCard',
  props: {
    listCardData: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    // 子组件向父组件传递id值
    clickListCardItem (id) {
      this.$emit('clickListCardItem', id)
    }
  }
}
</script>

<style>
.listCard {
  display: flex;
  flex-wrap: wrap;
  margin: 10px 0;
}

.listCardItem {
  width: 18%;
  margin: 0 2% 20px 0;
  overflow: hidden;
  cursor: pointer;
}

.image img {
  width: 100%;
  border-radius: 10px;
}

.title {
  margin-top: 8px;
  padding: 0 2px;
  font-size: 12px;
  color: black;
}
</style>
