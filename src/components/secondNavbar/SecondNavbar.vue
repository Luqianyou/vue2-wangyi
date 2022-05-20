<template>
  <div class="navBar">
    <!-- 设置传入的宽度值如果为零，就使用自适应的方式排列-->
    <div
      class="barItem"
      :class="index == activeNum ? 'active' : ''"
      v-for="(item, index) in SecondNavBarData"
      :key="index"
      @click="clickSecondBarItem(index)"
      :style="itemWidth == 0 ? '' : 'width:' + itemWidth + 'px;'"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeNum: 0
    }
  },
  props: {
    SecondNavBarData: {
      type: Array,
      dafault () {
        return []
      }
    },
    itemWidth: {
      type: Number,
      default () {
        return 40
      }
    }
  },
  methods: {
    clickSecondBarItem (index) {
      this.activeNum = index
      //   将index传入父组件使用
      this.$emit('clickSecondBarItem', index)
    }
  }
}
</script>

<style scoped>
.navBar {
  display: flex;
  flex-wrap: wrap;
}

.barItem {
  margin: 4px -2px;
  padding: 6px 10px;
  font-size: 12px;
  text-align: center;
  box-sizing: content-box;
  transform: scale(0.9, 0.9);
  cursor: pointer;
}

.active {
  background-color: #fdf5f5;
  color: #ec4747;
  border-radius: 11px;
}
</style>
