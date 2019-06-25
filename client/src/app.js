import Taro, { Component } from '@tarojs/taro'
import '@tarojs/async-await'
import 'taro-ui/dist/style/index.scss'
import '@common/scss/variable.scss'
import Index from './pages/index'

import './app.scss'
import './icon.scss'

class App extends Component {

  config = {
    pages: [
      'pages/attest/attest',
      'pages/index/index',
      'pages/test/test',
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
      backgroundColor: '#6190E8'
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
          text: '首页'
        },
        {
          pagePath: 'pages/sell/sell',
          iconPath: './common/tabbar/sell.png',
          selectedIconPath: './common/tabbar/selled.png',
          text: '卖书'
        },
        {
          pagePath: 'pages/mine/mine',
          iconPath: './common/tabbar/mine.png',
          selectedIconPath: './common/tabbar/mined.png',
          text: '我的'
        },
      ]
    },
    cloud: true
  }

  componentDidMount() {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({
        env: 'neaubooks-ua606'
      })
    }
  }

  componentDidShow() { }

  componentDidHide() { }

  componentDidCatchError() { }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
