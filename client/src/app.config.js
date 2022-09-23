export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/test/test',
    'pages/attest/attest',
    'pages/manual/manual',
    'pages/search/search',
    'pages/mine/mine',
    'pages/sell/sell',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#6190E8',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'white',
    backgroundColor: '#6190E8',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#6190E8',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        iconPath: './common/tabbar/index.png',
        selectedIconPath: './common/tabbar/indexed.png',
        text: '首页',
      },
      {
        pagePath: 'pages/sell/sell',
        iconPath: './common/tabbar/sell.png',
        selectedIconPath: './common/tabbar/selled.png',
        text: '卖书',
      },
      {
        pagePath: 'pages/mine/mine',
        iconPath: './common/tabbar/mine.png',
        selectedIconPath: './common/tabbar/mined.png',
        text: '我的',
      },
    ],
  },
  cloud: true,
});
