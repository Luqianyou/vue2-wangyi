# wangyi

持续更新中 不是成品

项目搭建思路：开始切割模块 首先确定几个视图窗口的父组件，创建在views文件夹类表示是用户要看的，涉及到路由的跳转，具体显示的内容又由components来实现，相当于全局能用的功能模块，只要视图需要相关的内容，就可导入组件并赋值使用
在做项目时建议先完成视图界面组件的搭建，首先在创建一个首页index.vue搭建好大的框架，使用element-ui提供的布局方式，接下来就开始做views中的组件，按照router文件夹中导入组件的空格来创建出大体部分，而后深入逐一实现

API 可参考 :https://neteasecloudmusicapi.vercel.app/#/?id=neteasecloudmusicapi  （需下载）

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve# vue2-wangyi
