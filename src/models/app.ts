import Taro from '@tarojs/taro';
import tools from '../common/tools';

const init = () => {
  return {
    navBarHeight: 84,
    menuRight: 7,
    menuBottom: 4,
    menuHeight: 32,
    inviteData: {
      visible: false, // 是否需要展示助力弹框
      success: false, // 是否助力成功
    }
  };
};
export default {
  namespace: 'app',
  state: {
    ...init()
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    }
  }
};
