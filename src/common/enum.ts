export enum EnumGlobalDataKey {
    loginStat = "loginStat",
    userInfo = "userInfo",
}
export enum EnumLoginStat {
    no = 0,
    yes = 1,
}

export enum EnumEventType {
    navigate = 0, // 跳转页面
    share = 1, // 分享
    address = 2, // 地址管理
    preview = 3, // 预览图片
    contact = 4, // 客服
    custom = 5,
}

// 活动分类 热门和手气
export enum EnumDrawType {
    hot = 1,
    lucky = 0,
}


// 1:签到 2:看视频 3:邀请好友
export enum EnumTaskType {
    signIn = 1,
    video,
    invite,
}


// 空：全部查询 0:未兑换 1:待发货 2:已发货 3:已完成
export enum EnumOrderStatus {
    all = '',
    noReveive = 0,
    wait = 1,
    shipped = 2,
    done = 3,
}


// 抽奖状态

export enum EnumDrawState {
    ing = 0,
    done,
    reject,
}


// 用户参加状态

export enum EnumUserState {
    noWin = 0, // 未中奖
    won = 1, // 中奖未兑换
    received = 2, // 已兑换
    no = 3, // 未参加
    participated = 4, // 已参加
}

// 消息订阅模板id
export enum EnumMessageTemplateId {
    drawStart = "Your TemplateId", // 参与活动提醒
    drawResult = "Your TemplateId", // 开奖结果通知
    orderStateChange = "Your TemplateId", // 订单状态提醒
    signIn = "Your TemplateId", // 签到提醒
    drawResult2 = "Your TemplateId", // 开奖结果通知
}

export enum EnumUrlParamKey {
    entryKey = "en",
    drawId = "id",
    userId = "uid",
    invite = "inv",
}

// entrykey
export enum EnumEntryKey {
    indexPage = "0", // 首页
    couponPage = "1", // 奖券池页面
    minePage = "2", // 我的页面
    detailPage = "3", // 抽奖详情页面
}

// 邀请结果
export enum EnumInviteResult {
    fail = "0",
    success = "1",
}
