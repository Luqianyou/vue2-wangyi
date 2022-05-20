<template>
  <div class="navBarContainer">
    <div class="navBar">
      <!-- 这里的navBarItem遍历的是父组件的 -->
      <div
        class="barItem"
        :class="index == activeNum ? 'active' : ''"
        v-for="(item, index) in navBarItem"
        :key="index"
        @click="clickBarItem(item.path, index)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      activeNum: 0,
    };
  },
  // 子组件设置值，和data用法类似
  props: {
    navBarItem: {
      type: Array,
      // 默认为空
      default() {
        return [];
      },
    },
  },
  methods: {
    clickBarItem(path, index) {
      // console.log(path);
      this.activeNum = index;
      // 向父组件传递地址方法和参数
      this.$emit("clickBarItem", path);
    },
  },
  created() {
    // 获取当前页面信息
    // console.log(this.$route.path);
    // 根据地址判断 activeNum
    this.navBarItem.forEach((item, index) => {
      // decodeURI() 函数可对 encodeURI() 函数编码过的 URI 进行解码
      // search()传递了一个非正则表达式对象，函数内部将会调用new RegExp(obj)把他转换成一个正则表达式对象
      // 如果查找成功，返回第一个被匹配到的值在字符串中的索引；否则返回-1。
      if (decodeURI(this.$route.path).search(item.path) != -1) {
        this.activeNum = index;
      }
    });
  },
};
</script>

<style lang="scss" scoped>
.navBarContainer {
  height: 60px;
  width: 100%;
  position: relative;
}

.navBar {
  display: flex;
  position: fixed;
  left: 160px;
  top: 50px;
  background-color: #fff;
  z-index: 100;
  width: 100%;
  color: rgb(49, 49, 49);
  align-items: center;
  padding: 10px 0 20px 20px;
}

.barItem {
  font-size: 13px;
  margin: 0 10px;
  text-align: center;
  cursor: pointer;
}

.active {
  font-size: 16px;
  color: black;
  font-weight: 600;
  padding-bottom: 5px;
  border-bottom: 3px solid #ec4141;
  transform: translateY(4px);
}
</style>>