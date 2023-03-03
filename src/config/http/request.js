import axios from "axios";
import { Notification } from "element-ui";
import { base_url } from "@/config/http/url";
let notification = null;
let service = axios.create({
  baseURL: base_url,
  timeout: 5000,
});
// 添加请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // console.log(config);

    let token = window.localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    // 对请求错误做些什么
    // console.log(error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    // console.log(response);
    if (response.data.err) {
      if (notification) {
        notification.close();
      }
      notification = Notification({
        title: "发生错误",
        message: response.data.msg,
        type: "error",
      });
      return response.data;
    } else {
      return response.data;
    }
  },
  (error) => {
    // 对响应错误做点什么
    // console.log(error);
    switch (error.response.status) {
      case 400:
        error.message = "请求错误";
        break;
      case 401:
        error.message = "未授权，请登录";
        break;
      case 403:
        error.message = "拒绝访问";
        break;
      case 404:
        error.message = `请求地址出错: ${error.response.config.url}`;
        break;
      case 408:
        error.message = "请求超时";
        break;
      case 500:
        error.message = "服务器内部错误";
        break;
      case 501:
        error.message = "服务未实现";
        break;
      case 502:
        error.message = "网关错误";
        break;
      case 503:
        error.message = "服务不可用";
        break;
      case 504:
        error.message = "网关超时";
        break;
      case 505:
        error.message = "HTTP版本不受支持";
        break;
      default:
        break;
    }

    if (notification) {
      notification.close();
    }
    notification = Notification({
      title: "发生错误",
      message: error.message,
      type: "error",
    });
    // console.log(error);
    return Promise.reject(error);
  }
);
export default service;
