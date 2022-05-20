import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 引入全局样式表
import './assets/css/base.css'
// 引入ElementUI全局对象
import ElementUI from 'element-ui'
// 引入ElementUI的css样式文件
import 'element-ui/lib/theme-chalk/index.css'
// 导入Vuex仓库
import store from './store/index'

// 接收来自外部文件暴露axios的对象
import { request } from './network/request'

// 使用vue.use调用Elemntui
Vue.use(ElementUI)
Vue.prototype.$request = request

// 阻止启动生产消息
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
