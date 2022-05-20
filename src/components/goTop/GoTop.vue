<template>
  <div class="GoTop" v-show="isGoTopShow" @click="goTop">
    <i class="iconfont icon-fanhuidingbu"></i>
  </div>
</template>

<script>
let obj

export default {
  name: 'GoTop',
  props: {
    // 滚动对象的选择器
    scrollObj: {
      type: String,
      default () {
        return ''
      }
    }
  },
  data () {
    return {
      // 是否显示改组件
      isGoTopShow: false
    }
  },
  methods: {
    goTop () {
      obj.scrollTo({
        behavior: 'smooth',
        top: 0
      })
    }
  },
  mounted () {
    obj = document.querySelector(this.scrollObj)
    obj.onscroll = (e) => {
      // console.log(e);
      // console.log(obj.scrollTop);
      if (obj.scrollTop >= 500 && this.isGoTopShow === false) {
        this.isGoTopShow = true
      } else if (obj.scrollTop < 500 && this.isGoTopShow) {
        this.isGoTopShow = false
      }
    }
  }
}
</script>

<style scoped>
.GoTop {
  position: fixed;
  background-color: #fafafa;
  bottom: 80px;
  right: 50px;
  border-radius: 50%;
  height: 35px;
  width: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 10px 1px rgba(0, 0, 0, 0.1);
  z-index: 10000;
  cursor: pointer;
}

.GoTop:hover {
  background-color: #f5f5f5;
}
</style>
