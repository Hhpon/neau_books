import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { AtModal, AtModalAction, AtSearchBar } from "taro-ui"

import './index.scss'

const OPENID_STORAGE = 'openid'
const db = Taro.cloud.database()

// import Login from '../../components/login/index'

export default class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }

  constructor() {
    super();
    this.state = {
      isOpened: false,
      closeOnClickOverlay: false
    }
  }

  componentWillMount() {
    this.isAuthorize()
  }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  getOpenId() {
    Taro.cloud
      .callFunction({
        name: "login"
      })
      .then(res => {
        Taro.setStorage({ key: OPENID_STORAGE, data: res.result.openid })
      })
  }

  getuserInfo(e) {
    this.getOpenId()
    let userInfo = e.detail.userInfo
    db.collection('test').add({
      // data 字段表示需新增的 JSON 数据
      data: userInfo
    })
      .then(res => {
        console.log(res)
      })
      .catch(console.error)
  }

  isAuthorize() {
    let that = this;
    Taro.getSetting({
      success(res) {
        let scopeUserInfo = res.authSetting['scope.userInfo']
        let openId = Taro.getStorageSync(OPENID_STORAGE)
        if (scopeUserInfo && openId) {
          return;
        }
        that.setState({
          isOpened: true
        })
      }
    })
  }

  searchHandle() {
    console.log('跳转到搜索页面');
  }

  render() {
    let isOpened = this.state.isOpened
    return (
      <View className='index'>
        <AtModal isOpened={isOpened} closeOnClickOverlay={this.state.closeOnClickOverlay}>
          {/* <AtModalHeader>提示</AtModalHeader> */}
          {/* <AtModalContent>
          </AtModalContent> */}
          <View className='model-content'>欢迎你来到东农二手书买卖平台</View>
          <AtModalAction><Button open-type='getUserInfo' ongetuserinfo={this.getuserInfo}>确定</Button></AtModalAction>
        </AtModal>
        <View className='search-container' onClick={this.searchHandle}>
          <AtSearchBar
            value={this.state.value}
            disabled
          />
        </View>
      </View>
    )
  }
}
