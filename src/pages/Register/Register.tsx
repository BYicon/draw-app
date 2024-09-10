import React, { useState } from 'react';
import Taro, { useLoad, useShareAppMessage } from '@tarojs/taro';
import { View, Input, Image, Button, Text } from '@tarojs/components';
import defaultAvatar from "../../assets/images/default.jpeg";
import './Register.less';
import * as helper from "../../common/helper";
import * as service from "../../common/api";
import { connect } from 'react-redux';
import { DEFAULT_SHARE_CONFIG } from '../../common/config';
import tools from '../../common/tools';
import { EnumInviteResult, EnumUrlParamKey } from '../../common/enum';

let loginData: any = null;
let inviteSuccess = false; // 是否助力成功

/**
 * 登录页
 * @param props
 * @returns
 */
function RegisterPage(props) {
  const { params: urlParams } = Taro.useRouter()
  const inviteUserId = urlParams[EnumUrlParamKey.userId];
  const userInfoState = props.user;
  const isLogin = userInfoState.isLogin;
  const [avatarUrl, setAvatarUrl] = useState("");
  const [nickName, setNickName] = useState("");
  /**
   * 选择头像
   * @param e evt
   */
  const onChooseAvatar = (e) => {
    const { avatarUrl } = e.detail;
    setAvatarUrl(avatarUrl);
  }

  /**
   * 设置昵称
   * @param e
   */
  const onChange = (e) => {
    setNickName(e.detail.value)
  }

  /**
   * 登录
   */
  const login = async () => {
    Taro.showLoading({
      title: "请稍后...",
    });
    if (!avatarUrl) {
      Taro.showToast({
        title: '请选择头像',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    if (!nickName) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    // 上传头像到云储存
    const cloudAvatarUrl = await tools.uploadImage(avatarUrl, loginData.data.openid).catch(() => {
      Taro.showToast({
        title: "头像上传错误，请重新选择",
        icon: "none",
      });
    });
    if (!cloudAvatarUrl) {
      return;
    }
    // 如果地址栏存在userId，则说明是通过分享链接进入的页面
    if(inviteUserId) {
      const inviteRes = await service.invitation(inviteUserId, loginData.data.openid);
      inviteSuccess = inviteRes.data.is_invitation.toString() === EnumInviteResult.success;
    };
    helper.login({
      nickName,
      avatarUrl: cloudAvatarUrl
    }).then((userInfo) => {
      props.dispatch({
        type: "user/updateState",
        payload: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          isLogin: true,
        }
      });
      if(inviteUserId) {
        props.dispatch({
          type: 'app/updateState',
          payload: {
            inviteData: {
              visible: true, // 是否需要展示助力弹框
              success: inviteSuccess, // 是否助力成功
            }
          },
        });
        Taro.switchTab({
          url: `/pages/CouponArea/CouponArea`,
        });
        return;
      }
      Taro.navigateBack({
        fail: () => {
          Taro.switchTab({
            url: "/pages/index/index"
          })
        }
      });
    }).catch((err) => {
      Taro.showToast({
        title: err,
        icon: "none",
      })
    }).finally(() => {
      Taro.hideLoading();
    });
  }

  // onLoad
  useLoad(async () => {
    if(isLogin) {
      Taro.setNavigationBarTitle({
        title: "个人信息"
      })
    }
    loginData = await service.loginReq();
    service.getUserInfoByOpenid(loginData.data.openid).then(res => {
      if (res && res.data) {
        setAvatarUrl(res.data.url);
        setNickName(res.data.name);
      }
    });
  })

  /**
   * 分享
   */
   useShareAppMessage(res => {
    if (res.from === 'button') {
    }
    return {
      ...DEFAULT_SHARE_CONFIG,
    }
  });

  return <View className='order-page'>
    <Button className="avatar-wrapper" openType="chooseAvatar" onChooseAvatar={onChooseAvatar}>
      <Image className="avatar" src={avatarUrl || defaultAvatar}></Image>
    </Button>
    <View className="nickname-wrapper">
      <Text className="form-label">昵称</Text>
      <Input type="nickname" className="nickname-input" value={nickName} maxlength={12} onBlur={onChange} placeholder="请输入昵称" />
    </View>
    <Button className="primary-btn" onClick={login}>{isLogin ? "保存" : "登录/注册"}</Button>
  </View>
};

const mapStateToProps = store => {
  return store
};

export default connect(mapStateToProps)(RegisterPage)
