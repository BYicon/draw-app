import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import './CouponArea.less';
import Taro, { useDidShow, useLoad, useShareAppMessage } from '@tarojs/taro';
import classnames from "classnames";
import TopBackground from '../../components/TopBackground/TopBackground';
// import { TaroCanvas } from 'taro-canvas';
import * as service from '../../common/api';
import * as helper from '../../common/helper';
import { EnumEntryKey, EnumMessageTemplateId, EnumTaskType, EnumUrlParamKey } from '../../common/enum';
import { connect } from 'react-redux';
import NavBar from '../../components/NavBar/NavBar';
import InviteModal from '../../components/InviteModal/InviteModal';
import giftIcon from "../../assets/images/video.png";
import signinIcon from "../../assets/images/signin.png";
import inviteIcon from "../../assets/images/invite.png";
import { DEFAULT_SHARE_CONFIG } from '../../common/config';

interface IRecordData {
  id: number;
  name: string;
  date: string;
  count: string;
}

let videoAward = 0; // 视频任务奖励的奖券数
let videoAd: any = null; // 广告组件实例
/**
 * 奖券池页面
 * @param props
 * @returns
 */
function CouponArea(props) {
  const { params: urlParams } = Taro.useRouter()
  const userState = props.user;
  const appState = props.app;
  const isLogin = userState.isLogin;
  const [taskList, setTaskList] = useState([]);
  const [recordList, setRecordList] = useState<IRecordData[]>([]);
  const [modalType, setModalType] = useState<'success' | "fail">("fail");

  /**
   * 登录
   */
  const loginHandler = () => {
    Taro.navigateTo({
      url: "/pages/Register/Register"
    })
  }

  /**
   * 获取任务列表
   */
  const getTaskList = () => {
    service.getTaskList().then((res) => {
      const _taskList = (res.data || []).map((item, index) => {
        const obj = {
          icon: giftIcon,
          text: "去完成",
          openType: undefined
        }
        if (item.type === EnumTaskType.invite) {
          obj.icon = inviteIcon;
          obj.text = "去邀请";
          // @ts-ignore
          obj.openType = "share";
        } else if (item.type === EnumTaskType.signIn) {
          obj.icon = signinIcon;
          obj.text = "签到";
        } else if (item.type === EnumTaskType.video) {
          obj.icon = giftIcon;
          obj.text = "立即观看";
        }
        return {
          ...item,
          id: index + 1,
          ...obj
        }
      });
      setTaskList(_taskList);
    })
  };

  /**
   * 获取奖券记录
   */
  const getCouponRecord = async () => {
    const res = await service.getUserCouponRecord();
    const _recordList = (res?.data?.list || []).map(item => ({
      id: item.id,
      name: item.remark,
      date: item.createTime.slice(0, 3).join("/"),
      count: item.awardNum,
    }));
    setRecordList(_recordList);
  }

  /**
  * 请求任务接口
  * @param type // 1:签到 2:看视频 3:邀请好友
  */
  const requestTaskApi = (type, value) => {
    service.doTask(type).then((res) => {
      if (res.data === 1) {
        Taro.showToast({
          title: value!==0 ? "奖券 +" + value : "已获得奖券",
          icon: "success",
        });
        initData();
      } else if (res.data === 0) {
        Taro.showToast({
          title: "今日已完成该任务",
          icon: "none",
        });
        initData();
      }
    })
  }

  /**
   * 做任务得奖券
   * @param type // 1:签到 2:看视频 3:邀请好友
   */
  const doTask = (type, value) => () => {
    if (isLogin) {
      Taro.showLoading({
        title: "正在完成...",
      });
      if (type === EnumTaskType.signIn) { // 签到
        Taro.hideLoading();
        helper.subscribeMsg({
          tmplIds: [EnumMessageTemplateId.signIn],
          ok: () => {
            requestTaskApi(type, value);
          },
          fail: () => {
            requestTaskApi(type, value);
          }
        })
      } else if (type === EnumTaskType.video) { // 看广告
        videoAward = value;
        Taro.hideLoading();
        if (videoAd) {
          videoAd.show().catch(() => {
            // 失败重试
            videoAd.load()
              .then(() => videoAd.show())
              .catch(err => {
                console.log('激励视频 广告显示失败', err)
              })
          })
        }
      } else if (type === EnumTaskType.invite) { // 邀请
        // setTimeout(() => {
        //   requestTaskApi(type, value);
        // }, 3000);
        Taro.hideLoading();
      }
    } else {
      loginHandler();
    };
  }

  /**
   * 获取用户剩余奖券
   */
  const getCounponNum = () => {
    service.getUserCoupon().then((res) => {
      props.dispatch({
        type: "user/updateState",
        payload: {
          coupon: res?.data?.awardNum || 0
        }
      });
    })
  }

  const initData = () => {
    getTaskList();
    getCouponRecord();
    if (isLogin) {
      getCounponNum();
    }
  }

  // onShow
  useDidShow(() => {
    initData();
  })

  // onLoad
  useLoad(() => {
    // 加载视频广告
    videoAd = helper.loadAd(() => {
      requestTaskApi(EnumTaskType.video, videoAward);
    });
    if (appState.inviteData.visible) {
      setModalType(appState.inviteData.success ? "success" : "fail")
    }
  })

  /**
   * 分享
   */
  useShareAppMessage(res => {
    if (res.from === 'button') {
      let userId = '';
      if(taskList && taskList[0]) {
        // @ts-ignore
        userId = taskList[0].userId;
      }
      if(!userId) {
        Taro.showToast({
          title: "userId不存在",
          icon: "none",
        });
      };
      // 来自页面内转发按钮
      return {
        ...DEFAULT_SHARE_CONFIG,
        path: `pages/index/index?${EnumUrlParamKey.entryKey}=${EnumEntryKey.couponPage}&${EnumUrlParamKey.userId}=${userId}`,
        imageUrl: "https://example.com/invite-share.jpg"
      }
    }
    return {
      ...DEFAULT_SHARE_CONFIG,
      path: `pages/index/index?${EnumUrlParamKey.entryKey}=${EnumEntryKey.couponPage}`,
    }
  });

  return <View className='coupon-page'>
    <NavBar hideLeft={true} title="奖券池"></NavBar>
    <View className='coupon-area'>
      <TopBackground height={888} />
      <View className='coupon-task'>
        <Image className='coupon-bg' src={require("../../assets/images/coupon-bg.png")} />
        {
          isLogin ?
            <View className='award-desc'>当前您拥有 <Text className='award-value'>{userState.coupon}</Text> 张奖券</View>
            :
            <View className='award-desc' onClick={loginHandler}>登录查看奖券数</View>
        }
        <Button className='main-btn' onClick={doTask(EnumTaskType.video, videoAward)}>看视频得奖券</Button>
      </View>
      <View className="ca-main">
        <View className="panel-title">做任务得奖券</View>
        {/* 任务列表 */}
        <View className="panel-body task-list">
          {
            taskList.map((task: any) => <View className='task-item'>
              <Image className='task-icon' src={task.icon} />
              <View className='task-content'>
                <View className="task-name">{task.name} ({task.numTaskEd}/{task.numTask})</View>
                {/* <View className="task-desc">最高可得<Text className='award-value'>{task.excitationValue}</Text>奖券</View> */}
                <View className="task-desc">{task.remark}</View>
              </View>
              {
                task.status === 0 ? <Button className='task-btn primary-btn' onClick={doTask(task.type, task.excitationValue)} openType={task.openType}>
                  {task.text}
                </Button> : <Button className='task-btn primary-btn disabled'>
                  已完成
                </Button>
              }
            </View>)
          }
        </View>
        {
          isLogin ? <>
            <View className="panel-title">收支明细</View>
            <View className="panel-body record-list">
              {recordList.length > 0 ?
                recordList.map((recordItem) =>
                  <View className='record-item' key={recordItem.id}>
                    <View className='record-left'>
                      <View className="record-name">{recordItem.name}</View>
                      <View className="record-date">{recordItem.date}</View>
                    </View>
                    <View className='record-right'>
                      <Text className={classnames({
                        "record-value": true,
                        red: +recordItem.count > 0,
                        green: +recordItem.count < 0,
                      })}>{recordItem.count}</Text>
                    </View>
                  </View>) :
                  <View className='no-data'>暂无数据</View>
              }
            </View>
          </> : null
        }
      </View>
      <InviteModal
        visible={appState.inviteData.visible}
        type={modalType}
        onClose={() => {
          props.dispatch({
            type: 'app/updateState',
            payload: {
              inviteData: {
                visible: false, // 是否需要展示助力弹框
                success: false, // 是否助力成功
              }
            },
          });
        }}
      />
    </View>
  </View>
}

const mapStateToProps = store => {
  return store
};

export default connect(mapStateToProps)(CouponArea)
