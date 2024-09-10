import Taro from '@tarojs/taro';
import { BASE_URL } from './config';
import { getBaseUrlByEnv } from './helper';
import tools from './tools'

const API_PRE = getBaseUrlByEnv();

// 不需要传LDToken的接口
export const NOT_REQUIRED_LDTOKEN = [
  `${API_PRE}/auth/getServerTimeStamp`
];

// 登录
export const loginReq = () => {
  return new Promise((resolve, reject) => {
    Taro.login({
      success(res) {
        if (res.code) {
          tools.request({
            url: `${API_PRE}/auth/getWxOpenid`,
            method: 'POST',
            params: {
              code: res.code
            },
          }).then(resData => {
            resolve(resData)
          }).catch((err) => {
            reject(err);
          })
        } else {
          reject(res.errMsg);
        }
      }
    })
  })
};


// 添加用户信息
export const addUser = (params) => {
  return tools.request({
    url: `${API_PRE}/user/storeUser`,
    method: 'POST',
    params: {
      ...params
    },
  })
};

// 根据openid获取用户信息
export const getUserInfoByOpenid = (openid) => {
  return tools.request({
    url: `${API_PRE}/user/getUserByOpenid`,
    method: 'POST',
    params: {
      openid
    }
  });
};


// 获取抽奖列表
export const getDrawList = (params) => {
  return tools.request({
    url: `${API_PRE}/lottery/getLotteryInfoPage`,
    method: 'POST',
    params: {
      page_index: params.pageNum,
      page_size: params.pageSize,
      type: params.type //0:手气 1:热门
    },
  }).then(res => {
    const list = (res.data?.list || []).map(item => {
      return {
        id: item.id,
        name: item.name,
        awardCount: 1,
        price: item.price,
        imgSrc: item.url,
        desc: "剩余111人开奖",
        state: item.status,
        currentCount: item.prizeNum, // 当前人次
        targetCount: item.lotteryNum, // 开奖目标数量
        startTime: "2022/09/09 18:00:00", // 开始时间
        publicTime: "2022/09/09 18:00:00", // 公布时间
        costCount: item.awardNum, // 消耗数量
        userList: [], // 参加人群
        introduce: "消耗2点券参加",
      }
    })
    return {
        list: list,
        total: res.data.total,
        pageSize: res.data.pageSize,
        pageNum: res.data.pageNum,
    }
  })
};

// 获取抽奖详情
export const getDetail = (id) => {
  return tools.request({
    url: `${API_PRE}/lottery/getLotteryInfoById`,
    method: 'POST',
    params: {
      id
    }
  })
};



// 参加抽奖
export const draw = (id, userCouponNum) => {
  return tools.request({
    url: `${API_PRE}/prize/storeUserPrize`,
    method: 'POST',
    params: {
      lottery_id: id,
      award_num: userCouponNum,
    }
  })
};


// 获取抽奖用户头像
export const getUserList = (id) => {
  return tools.request({
    url: `${API_PRE}/prize/getUserPrizeUserInfo`,
    method: 'POST',
    params: {
      lottery_id: id,
    }
  })
}


// 获取用户奖券
export const getUserCoupon = () => {
  return tools.request({
    url: `${API_PRE}/award/getUserAwardNum`,
    method: 'POST',
  })
};

// 获取用户奖券记录
export const getUserCouponRecord = (id) => {
  return tools.request({
    url: `${API_PRE}/awardInfo/getUserAwardInfoByPage`,
    method: 'POST',
    params: {
      page_index: 1,
      page_size: 100,
    }
  })
};


// 获取任务列表
export const getTaskList = () => {
  return tools.request({
    url: `${API_PRE}/task/getUserTaskList`,
    method: 'POST',
  });
};

// 做任务 "type": 1 // 1:签到 2:看视频 3:邀请好友
export const doTask = (type) => {
  return tools.request({
    url: `${API_PRE}/award/storeUserAward`,
    method: 'POST',
    params: {
      type
    }
  })
};


// 获取参与记录
export const getDrawRecord = () => {
  return tools.request({
    url: `${API_PRE}/prize/getUserPrizeNum`,
    method: 'POST',
  })
};


// 获取用户抽奖的中奖码
export const getUserCode = (id) => {
  return tools.request({
    url: `${API_PRE}/prize/getUserPrizeUserId`,
    method: 'POST',
    params: {
      lottery_id: id,
      page_size: 200,
      page_num: 1,
    }
  })
};


// 订单列表 1:代发货 2:已发货 3:已完成
export const getOrderList = ({state, ...params}) => {
  const _params = {
    ...params,
  };
  if (state) {
    _params.shipment_status = state;
  }
  return tools.request({
    url: `${API_PRE}/prizeLog/getPrizeGoodsPage`,
    method: 'POST',
    params: _params
  })
};

/**
 * 兑换
 * @param {*} param0
 * @returns
 */
export const receive = ({
  drawId,
  name,
  phone,
  address,
  remark
}) => {
  return tools.request({
    url: `${API_PRE}/prizeLog/storeUserPrizeAddress`,
    method: 'POST',
    params: {
      lottery_id: drawId,
      harvest_name: name, //收货人姓名
      mobile: phone,//手机号
      addr_name: address,//地址
      addr_remark: remark, // 备注
    },
  })
};


// 获取用户抽奖记录
export const getDrawRecordList = (params) => {
  return tools.request({
    url: `${API_PRE}/prizeLog/getUserPrizeLogPageReq`,
    method: 'POST',
    params: {
      page_index: params.pageNum,
      page_size: params.pageSize,
      type: params.type //0参与抽奖 1:中奖情况
    }
  });
};

// 获取用户抽奖记录
export const confirmReceipt = (id) => {
  return tools.request({
    url: `${API_PRE}/prizeLog/confirmReceipt`,
    method: 'POST',
    params: {
      id
    }
  });
};

// 获取中奖用户名单
export const getWinnerList = (id) => {
  return tools.request({
    url: `${API_PRE}/lottery/getWinnerInfo`,
    method: 'POST',
    params: {
      lottery_id: id
    }
  });
};

// 获取公告
export const getNoticeList = (id) => {
  return tools.request({
    url: `${API_PRE}/virtual/getVirtualUserRandom`,
    method: 'POST',
    params: {
      id
    }
  });
};

// 获取服务端时间
export const getServerTime = () => {
  return tools.request({
    url: `${API_PRE}/auth/getServerTimeStamp`,
    method: 'POST',
  });
};

// 分享邀请接口
export const invitation = (userId, openid) => {
  return tools.request({
    url: `${API_PRE}/award/storeUserinvitation`,
    method: 'POST',
    params: {
      user_id: userId,
      openid
    }
  });
};









