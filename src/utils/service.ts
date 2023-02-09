import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import router from "@/router"
import { ElMessage } from "element-plus"
import { get } from "lodash-es"
import {
  Configuration,
  UsersApi,
  FilesApi,
  RolesApi,
  ArticleApi,
  ArticleTagsApi,
  ArticleCategoriesApi
} from "@/request/generator"

/** 创建请求实例 */
function createService() {
  // 创建一个 Axios 实例
  const service = axios.create()

  service.defaults.timeout = 5000

  service.defaults.baseURL = import.meta.env.VITE_BASE_API

  service.defaults.withCredentials = true

  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => response,
    (error) => {
      // Status 是 HTTP 状态码
      const status = get(error, "response.status")
      const errMsg = get(error, "response.data")
      switch (status) {
        case 400:
          error.message = "请求错误 " + errMsg.message
          break
        case 401:
          // 登录信息失效，直接跳转到登录页面
          router.push("/login")
          break
        case 403:
          error.message = "拒绝访问"
          break
        case 404:
          error.message = "请求地址出错"
          break
        case 408:
          error.message = "请求超时"
          break
        case 409:
          error.message = errMsg.message
          break
        case 500:
          error.message = "服务器内部错误"
          break
        case 501:
          error.message = "服务未实现"
          break
        case 502:
          error.message = "网关错误"
          break
        case 503:
          error.message = "服务不可用"
          break
        case 504:
          error.message = "网关超时"
          break
        case 505:
          error.message = "HTTP 版本不受支持"
          break
        default:
          break
      }
      ElMessage.error(error.message)
      return Promise.reject(error)
    }
  )
  return service
}

/** 创建请求方法 */
function createRequestFunction(service: AxiosInstance) {
  return function (config: AxiosRequestConfig) {
    const configDefault = {
      timeout: 5000,
      baseURL: import.meta.env.VITE_BASE_API,
      data: {}
    }
    return service(Object.assign(configDefault, config))
  }
}

/** 用于网络请求的实例 */
const service = createService()
/** 用于网络请求的方法 */
export const request = createRequestFunction(service)

export const api = {
  UserAPi: new UsersApi(new Configuration({}), "", service),
  RoleApi: new RolesApi(new Configuration({}), "", service),
  FileApi: new FilesApi(new Configuration({}), "", service),
  ArticleApi: new ArticleApi(new Configuration({}), "", service),
  ArticleTagApi: new ArticleTagsApi(new Configuration({}), "", service),
  ArticleCategoryApi: new ArticleCategoriesApi(new Configuration({}), "", service)
}
