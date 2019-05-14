import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './mine.scss'

export default class Mine extends Component {
  config = {
    navigationBarTitleText: '个人信息'
  }
  constructor() {
    super()
    this.state = {

    }
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
      </View>
    )
  }
}