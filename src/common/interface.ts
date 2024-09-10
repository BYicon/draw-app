import { EnumEventType, EnumOrderStatus } from "./enum";
export interface IGoodsData {
    id: number; // id
    name: string; // 奖品名称
    awardCount: number,
    imgSrc: string; // 图片链接
    price: string; // 价格
    desc: string; // 奖品描述
    state: number; // 参加状态
    introduce: string; // 介绍说明
    currentCount: number; // 当前数量
    targetCount: number; // 开奖目标数量
    currentCouponCount: number; // 当前投入奖券数
    restCouponCount: number; // 剩余开奖奖券数
    startDate?: string; // 开始时间
    startTime: string; // 开始时间
    publicDate?: string;
    publicTime: string; // 公布时间
    exchangeDate: string;
    exchangeTime: string;
    costCount: number; // 消耗数量
    winStatus: number;
}


export interface IOrderData{
    id: number; // id
    name: string; // 奖品名称
    url: string; // 图片链接
    price: string; // 价格
    desc: string; // 奖品描述
    shipmentStatus: EnumOrderStatus; // 参加状态
    orderDate: string; // 介绍说明
    lotteryId: number;
}

export interface IUser {
    id: number;
    name: string;
    url: string; // 用户头像
}


export interface ITask {
    id: number; //任务id
    name: string;   // 任务名称
    type: number;   // 任务类型
    desc: string;   // 任务描述
    state: number; // 完成状态
}

export interface IMenu {
    id: number;
    name: string;
    icon: any;
    type: EnumEventType;
    openType: EnumEventType | undefined;
    path?: string;
}


export interface INotice {
    name: string;
    remark: string;
    url: string
}