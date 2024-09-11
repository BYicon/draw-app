import Taro from '@tarojs/taro';
import { objectToString } from './utils';
import {NOT_REQUIRED_LDTOKEN} from "./api";

const tools = {
  /**
   * 网络请求
   * @{param}	 opts
   */
  request: (opts) => {
    const {
      url = "",
      params = {}, // 请求参数
      method = "GET",
      ...rest // 剩余参数
    } = opts
    return new Promise((resolve, reject) => {
      const ldToken = Taro.getStorageSync("ldToken");
      const token = Taro.getStorageSync("token");
      const _header = {
        token,
      }
      if(!NOT_REQUIRED_LDTOKEN.includes(opts.url)) {
        _header.ldToken = ldToken;
      };

      Taro.request({
        url,
        data: {
            ...params
        },
        method,
        header: {
          ..._header
        },
        ...rest,
      })
        .then((res) => {
          const { data } = res
          if (data?.code === 200) {
            // 成功
            resolve(data)
          } else {
            // 不是预期的结果
            reject(res)
            tools.showToast(data.msg, "请求错误，请稍后重试");
          }
        })
        .catch(err => {
          tools.showToast("请求错误，请稍后重试");
          reject(err)
        })
    })
  },
  /**
   * 页面loading
   * @{param}
   */
  showLoading: (param = "") => {
    let dptOpts = {
      title: '加载中...',
      mask: true, // 防止触摸穿透
    }
    if (Object.prototype.toString.call(param) === "[object String]") {
      dptOpts.title = param
    } else if (Object.prototype.toString.call(param) === "[object Object]") {
      dptOpts = {
        ...dptOpts,
        ...param,
      }
    }
    return Taro.showLoading(dptOpts)
  },
  hideLoading: () => {
    Taro.hideLoading()
  },
  /**
   * 页面提示
   * @{param}
   */
  showToast: (param) => {
    let dptOpts = {
      title: '温馨提示', // 提示内容
      icon: "none",
      mask: true,
      duration: 2000, // 提示时间
    }
    if (Object.prototype.toString.call(param) === "[object String]") {
      dptOpts.title = param
    } else if (Object.prototype.toString.call(param) === "[object Object]") {
      dptOpts = {
        ...dptOpts,
        ...param,
      }
    } else {
      throw new Error('参数类型有误，应该是字符串或者对象')
    }
    return Taro.showToast(dptOpts)
  },
  /**
   *
   * @{param}	 url 页面路径
   * @{Object}	 data 页面参数
   */
  navigateTo: ({url, data}) => {
    const searchStr = objectToString(data)
    return Taro.navigateTo({
      url: `${url}?${searchStr}`
    })
  },
  /**
   *
   * @{param}	 time 缓存有效时间 单位：s
   */
  setStorageSyncWithTime: (key, value, time) => {
    try {
      const curTime = Date.now()
      // 过期时间
      const expiredTime = curTime + time * 1000
      Taro.setStorageSync(key, {
        [key]: value,
        expiredTime
      })
    } catch(err) {
      console.log(err)
    }
  },
  getStorageSyncWithTime: (key) => {
    try {
      const result = Taro.getStorageSync(key)
      const { expiredTime } = result
      if (Date.now() > expiredTime) {
        // 已过期
        Taro.removeStorageSync(key)
      } else {
        return result[key]
      }
    } catch(err) {
      console.log(err)
    }
  },
  /**
   *
   * @{param}	 fn 如果登录就执行fn
   */
  doLogin: (fn) => {
    const user = tools.getStorageSyncWithTime('userInfo')
    if (!user?.userPhone) {
      tools.navigateTo({
        url: '/pages/login/login'
      })
    } else {
      fn?.()
    }
  },
  /**
   * 获取用户信息，需手动触发
   * @returns
   */
  getUserInfo: () => {
    return new Promise((resolve, reject) => {
        Taro.getSetting({
            success: (res) => {
              if (res.authSetting["scope.userInfo"]) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                // @ts-ignore
                if (Taro.getUserProfile) {
                  // @ts-ignore
                  Taro.getUserProfile({
                    desc: "用于完善会员资料",
                    success: (res) => {
                      // 可以将 res 发送给后台解码出 unionId
                      resolve(res.userInfo);
                    },
                    fail: () => {
                        reject("授权失败");
                    },
                  });
                } else {
                  Taro.getUserInfo({
                    success: (res) => {
                      // 可以将 res 发送给后台解码出 unionId
                      callback("ok", res.userInfo);
                    },
                    fail: () => {
                      reject("授权失败");
                    },
                  });
                }
              } else {
                reject("授权失败");
              }
            },
            fail: () => {
              reject("授权失败");
            },
          });
    });
  },
  /**
   * 上传图片
   * @param {图片路径} path
   */
  uploadImage(path, name = Date.now()) {
    return new Promise((resolve, reject) => {
      Taro.cloud.uploadFile({
        // 指定上传到的云路径
        cloudPath: name + '.png',
        // 指定要上传的文件的小程序临时文件路径
        filePath: path,
        // 成功回调
        success: res => {
          if (res.errMsg === "cloud.uploadFile:ok") {
            resolve(res.fileID)
          } else {
            reject("");
          }
        },
        fail: err => {
          reject("");
        }
      })
    })
  },
  isAliPay: Taro.ENV_TYPE.ALIPAY === Taro.getEnv(),
  isBaiDu: Taro.ENV_TYPE.SWAN === Taro.getEnv(),
  isH5: Taro.ENV_TYPE.WEB === Taro.getEnv(),
}



export default tools
