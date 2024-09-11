import Taro from '@tarojs/taro';

const init = () => {
  const userInfo = Taro.getStorageSync('userInfo');
  return {
    isLogin: false, // 是否登录
    nickName: userInfo?.nickName,
    avatarUrl: userInfo?.nickName,
    coupon: 0,
  };
};
export default {
  namespace: 'user',
  state: {
    ...init()
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    loginOut() {
      return {
        ...init()
      };
    }
  }
};
