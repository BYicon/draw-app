import Taro from '@tarojs/taro';
import * as service from '../common/api';
import { ADId, BASE_URL } from './config';
import { EnumMessageTemplateId } from './enum';

/**
 * 根据当前环境获取BaseUrl
 * @returns
 */
export const getBaseUrlByEnv = function() {
    const accountInfo = Taro.getAccountInfoSync();
    switch (accountInfo.miniProgram.envVersion) {
      case 'develop':
        return BASE_URL.dev;
        break;
      case 'trial':
      case 'release':
        return BASE_URL.prod;
      default:
        return BASE_URL.prod;
        break;
    }
};

/**
 * 登录函数
 * @returns
 */
export async function login({
  nickName,
  avatarUrl,
}) {
  const loginData = await service.loginReq();
  return service.addUser({
    unionid: "",
    openid: loginData.data.openid,
    nickname: nickName,
    url: avatarUrl,
  }).then((resData) => {
    Taro.setStorage({
      key: "token",
      data: resData.data.token,
    })
    Taro.setStorage({
      key: "userInfo",
      data: {
        nickName,
        avatarUrl
      },
    })
    return {
      nickName,
      avatarUrl
    };
  });
};

/**
 * 订阅消息
 * tmplIds 模板id集合  []
 * @returns
 */
export async function subscribeMsg(options: {
  tmplIds: EnumMessageTemplateId[],
  ok?: () => void,
  fail?: () => void,
}) {
  Taro.requestSubscribeMessage({
    tmplIds: options.tmplIds,
    success(res) {
      if (
          res[EnumMessageTemplateId.drawResult] === "accept"  ||
          res[EnumMessageTemplateId.drawResult2] === 'accept' ||
          res[EnumMessageTemplateId.drawStart] === 'accept' ||
          res[EnumMessageTemplateId.orderStateChange] === 'accept' ||
          res[EnumMessageTemplateId.signIn] === 'accept'
        ) {
        if (options.ok) {
          //完成任务
          options.ok();
        }
      } else {
        if (options.fail) {
          //完成任务
          options.fail();
        }
      }
    }
  })
};

/**
 * 加载广告
 * @param adUnitId 广告id
 * @param callback cb
 * @returns
 */
export const loadAd = function(callback, adUnitId = ADId.task) {
  let videoAd: any = null;
  // 在页面onLoad回调事件中创建激励视频广告实例
  if (Taro.createRewardedVideoAd) {
    videoAd = Taro.createRewardedVideoAd({
      adUnitId,
    });
    videoAd.onLoad((err) => {
    })
    videoAd.onError((err) => {
      Taro.showToast({
        title: "广告拉取失败，请稍后再试",
        icon: "none",
        duration: 1500,
      });
    })
    videoAd.onClose((res) => {
      if (res.isEnded) {
        callback && callback()
      }
    });
  }
  return videoAd;
};
