export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/Mine/Mine',
    'pages/Record/Record',
    'pages/CouponArea/CouponArea',
    'pages/DrawDetail/DrawDetail',
    'pages/Order/Order',
    'pages/Register/Register',
    'pages/Infomation/Infomation'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: "#BABABA",
    selectedColor: "#F95234",
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: './assets/images/home.png',
        selectedIconPath: './assets/images/home-on.png'
      },
      {
        pagePath: 'pages/CouponArea/CouponArea',
        text: '奖券池',
        iconPath: './assets/images/coupon.png',
        selectedIconPath: './assets/images/coupon-on.png'
      },
      {
        pagePath: 'pages/Mine/Mine',
        text: '我的',
        iconPath: './assets/images/mine.png',
        selectedIconPath: './assets/images/mine-on.png'
      },
    ]
  },
  requiredPrivateInfos: [
    "chooseAddress",
  ],
})
