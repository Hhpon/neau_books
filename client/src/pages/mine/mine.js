import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'

import './mine.scss'

export default class Mine extends Component {
  // 生命周期放在相对上方，方法放在下方

  config = {
    navigationBarTitleText: '个人信息'
  }
  constructor() {
    super()
    this.state = {
      current: 0,
      tabList: [{ title: '我预订的' }, { title: '我发布的' }]
    }
  }

  handleClick(value) {
    this.setState({
      current: value
    })
  }

  render() {
    return (
      <View className='mine'>
        <View className='mine-mes'>
          <View className='avator'>
            <open-data type='userAvatarUrl'></open-data>
          </View>
          <View className='nickname'>
            <open-data type='userNickName'></open-data>
          </View>
        </View>
        <View className='mine-books'>
          <AtTabs current={this.state.current} tabList={this.state.tabList} onClick={this.handleClick.bind(this)}>
            <AtTabsPane current={this.state.current} index={0} >
              <View style='padding: 100px 50px;background-color: #FAFBFC;text-align: center;' >标签页一的内容</View>
            </AtTabsPane>
            <AtTabsPane current={this.state.current} index={1}>
              <View style='padding: 100px 50px;background-color: #FAFBFC;text-align: center;'>标签页二的内容</View>
            </AtTabsPane>
          </AtTabs>
        </View>
      </View>
    )
  }
}