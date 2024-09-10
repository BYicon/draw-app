import { Component, PropsWithChildren } from 'react';
import Taro from '@tarojs/taro';
import { Provider } from "react-redux";
import 'taro-ui/dist/style/index.scss';
import createApp from "./dva";
import models from './models';
import './app.less';

const dvaApp = createApp({
  initialState: {},
  models,
});


export const store = dvaApp.getStore();

class App extends Component<PropsWithChildren> {

  timer: any = null;

  getSystemInfo = () => {
    const systemInfo = Taro.getSystemInfoSync();
    const menuButtonInfo = Taro.getMenuButtonBoundingClientRect();
    const navBarHeight = (menuButtonInfo.top - (systemInfo.statusBarHeight || 44)) * 2 + menuButtonInfo.height + (systemInfo.statusBarHeight || 44);
    const menuRight = systemInfo.screenWidth - menuButtonInfo.right;
    const menuBottom = menuButtonInfo.top - (systemInfo.statusBarHeight || 44);
    const menuHeight = menuButtonInfo.height;
    store.dispatch({
      type: "app/updateState",
      payload: {
        navBarHeight,
        menuRight,
        menuBottom,
        menuHeight,
      }
    });
  };

  /**
   * 新版本更新
   */
  checkUpdateVersion() {
    //创建 UpdateManager 实例
    const updateManager = Taro.getUpdateManager();
    //检测版本更新
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      if (res.hasUpdate) {
        //监听小程序有版本更新事件
        updateManager.onUpdateReady(function () {
          Taro.clearStorageSync();
          Taro.showModal({
            title: '更新提示',
            showCancel: false,
            content: '新版本已经准备好，点击“确定”重启应用',
            success(_res) {
              if (_res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate();
              }
            }
          });
        });
        updateManager.onUpdateFailed(function () {
          // 新版本下载失败
          Taro.showModal({
            title: '已经有新版本咯~',
            content: '请您删除当前小程序，到微信 “发现-小程序” 页，重新搜索打开呦~',
          });
        });
      }
    });
  }

  componentDidMount() {
    this.checkUpdateVersion();
    this.getSystemInfo();
    //请关注下面的，上面两行与该问题无关
    Taro.cloud.init({
      env: 'draw-4g0u7npk258f7727', //填上你的云开发环境id
      traceUser: true,
    });
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return <Provider store={store}>{this.props.children}</Provider>;
  }
}

export default App;
