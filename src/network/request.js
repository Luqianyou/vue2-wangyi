import axios from 'axios'

// 该项目所有请求均为 get请求
export function request (url, params) {
  // 请求超过30秒则判定为超时
  const instance = axios.create({
    baseURL: '/api',
    timeout: 30000,
    withCredentials: true
  })

  // axios拦截器
  // 请求拦截
  instance.interceptors.request.use(config => {
    // console.log('请求拦截器');
    return config
  }, err => {
    console.log(err)
  })

  if (params) {
    params = {
      params: params
    }
    return instance.get(url, params)
  } else {
    return instance.get(url)
  }
}
