import { EnumEventType } from "./enum";

export const BASE_URL = {
  dev: "https://draw.placeholder.cn/hwcj-test",
  prod: "https://draw.placeholder.cn/hwcj"
};

export const BASE_IMAGE_URL = "https://draw.placeholder.cn/image";

export const ADId = {
  task: "your ad id",
  chaping: "your ad id",
}

export const MENU_LIST = [
    {
      id: 1,
      name: "我的订单",
      icon: require("../assets/images/order.png"),
      type: EnumEventType.navigate,
      openType: undefined,
      path: "/pages/Order/Order",
    },
    {
      id: 2,
      name: "收货地址",
      icon: require("../assets/images/location.png"),
      type: EnumEventType.address,
      openType: EnumEventType.address,
    },
    // {
    //   id: 3,
    //   name: "添加抽奖小助理",
    //   icon: require("../assets/images/group.png"),
    //   type: EnumEventType.preview,
    //   openType: undefined,
    // },
    {
      id: 4,
      name: "分享给好友",
      icon: require("../assets/images/share.png"),
      // type: EnumEventType.share,
      type: EnumEventType.share,
      openType: undefined,
    },
    {
      id: 5,
      name: "客服",
      icon: require("../assets/images/contact.png"),
      type: EnumEventType.contact,
      openType: "contact",
    },
    // {
    //   id: 6,
    //   name: "分享海报测试",
    //   icon: require("../assets/images/share.png"),
    //   type: EnumEventType.custom,
    //   openType: undefined,
    // },
  ]


  export const DEFAULT_SHARE_CONFIG = {
    title: "免费抽好物!",
    path: `pages/index/index`,
    imageUrl: BASE_IMAGE_URL +"/share-image.jpg",
  };
