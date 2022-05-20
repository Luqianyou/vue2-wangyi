import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 提前将组件声明，采用异步的方式引用通过相对路径进行引用根据router文件夹和views文件夹的相对路径为
// 注意格式
const Index = () => import('views/Index.vue')

// 个性推荐相关组件
const Discover = () => import('views/discover/Discover.vue')
const SuperRecommend = () => import('views/discover/discoverChildren/superRecommend.vue')
const customMade = () => import('views/discover/discoverChildren/custom-made.vue')
const Singer = () => import('views/discover/discoverChildren/Singer.vue')
const Ranking = () => import('views/discover/discoverChildren/Ranking.vue')
const MusicList = () => import('views/discover/discoverChildren/MusicList.vue')
const MusicListindex = () => import('views/discover/discoverChildren/musicListChildren/MusicListIndex.vue')
const newSinger = () => import('views/discover/discoverChildren/newSinger.vue')

// 我的收藏相关组件
const Mycollect = () => import('views/mycollect/Mycollect.vue')
const MycollectAlbum = () => import('views/mycollect/MycollectChildren/MycollectAlbum.vue')
const MycollectSinger = () => import('views/mycollect/MycollectChildren/MycollectSinger.vue')
const MycollectVideo = () => import('views/mycollect/MycollectChildren/MycollectVideo.vue')

// 私人FM相关组件
const Video = () => import('views/video/Video.vue')
const MvList = () => import('views/video/videoChildren/MvList.vue')
const VideoList = () => import('views/video/videoChildren/VideoList.vue')

// 每日推荐相关组件
const Recommend = () => import('views/recommend/Recommend.vue')

// 搜索相关
const Search = () => import('views/search/Search.vue')
const SearchSong = () => import('views/search/searchChildren/SearchSong.vue')
const SearchSinger = () => import('views/search/searchChildren/SearchSinger.vue')
const SearchAlbum = () => import('views/search/searchChildren/SearchAlbum.vue')
const SearchVideo = () => import('views/search/searchChildren/SearchVideo.vue')
const SearchMusicList = () => import('views/search/searchChildren/SearchMusicList.vue')

// 歌单列表详情
const MusicListDetail = () => import('views/musicListDetail/MusicListDetail.vue')
// 歌手列表详情
const SingerDetail = () => import('views/singerDetail/SingerDetail.vue')
// mv详情
const VideoDetail = () => import('views/videoDetail/VideoDetail.vue')

const routes = [
  // redirect重定向，当用户访问 "/" 时直接跳转到 '/index'
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    // 设置name 方便this.$router.push的明文(query)和隐藏(params)跳转
    component: Index,
    // 与/index不匹配跳转到/discover,默认显示/discover页面内容，及发现音乐
    redirect: '/discover',
    // 子路由
    children: [
      // 个性推荐
      {
        path: '/discover',
        name: 'Discover',
        component: Discover,
        // 重定向到个性推荐
        redirect: '/discover/superrecommend',
        children: [
          // 个性推荐
          {
            path: '/discover/superrecommend',
            name: 'SuperRecommend',
            component: SuperRecommend
          },
          // 歌单
          {
            path: '/discover/musiclist',
            component: MusicList,
            redirect: '/discover/musiclist/musicListindex',
            children: [{
              path: '/discover/musiclist/musicListindex',
              name: 'musicListIndex',
              component: MusicListindex
            }]
          },
          // 专属定制
          {
            path: '/discover/coustom-made',
            name: 'customMade',
            component: customMade
          },
          // 排行榜
          {
            path: '/discover/ranking',
            component: Ranking
          },
          // 歌手
          {
            path: '/discover/singer',
            component: Singer
          },
          // 最新歌手
          {
            path: '/discover/newSinger',
            name: 'newSinger',
            component: newSinger
          }
        ]
      },
      // 搜索
      {
        path: '/search/:id',
        name: 'search',
        component: Search,
        redirect: '/search/searchsong/:id',
        children: [{
          path: '/search/searchsong/:id',
          name: 'searchSong',
          component: SearchSong
        },
        {
          path: '/search/searchsinger/:id',
          name: 'searchSinger',
          component: SearchSinger
        },
        {
          path: '/search/searchalbum/:id',
          name: 'searchAlbum',
          component: SearchAlbum
        },
        {
          path: '/search/searchvideo/:id',
          name: 'searchVideo',
          component: SearchVideo
        },
        {
          path: '/search/searchmusiclist/:id',
          name: 'searchMusicList',
          component: SearchMusicList
        }
        ]
      },
      // 私人FM
      {
        path: '/video',
        name: 'Video',
        component: Video,
        redirect: '/video/VideoList',
        children: [
          {
            path: '/video/MvList',
            name: 'MvList',
            component: MvList
          },
          {
            path: '/video/VideoList',
            name: 'VideoList',
            component: VideoList
          }
        ]
      },
      // 我的收藏
      {
        path: '/mycollect',
        name: 'Mycollect',
        component: Mycollect,
        redirect: '/mycollect/MycollectAlbum',
        children: [
          {
            path: '/mycollect/MycollectAlbum',
            name: 'MycollectAlbum',
            component: MycollectAlbum
          },
          {
            path: '/mycollect/MycollectSinger',
            name: 'MycollectSinger',
            component: MycollectSinger
          },
          {
            path: '/mycollect/MycollectVideo',
            name: 'MycollectVideo',
            component: MycollectVideo
          }
        ]
      },
      // 每日推荐
      {
        path: '/recommend',
        name: 'Recommend',
        component: Recommend
      },
      // 歌单列表详情
      {
        path: '/musiclistdetail/:id',
        name: 'musicListDetail',
        component: MusicListDetail
      },
      // 歌手列表详情
      {
        path: '/singerdetail/:id',
        name: 'singerDetail',
        component: SingerDetail
      },
      // mv详情
      {
        path: '/videodetail/:id/:type',
        name: 'videoDetail',
        component: VideoDetail
      }
    ]

  }
]

const router = new VueRouter({
  routes
})

export default router
