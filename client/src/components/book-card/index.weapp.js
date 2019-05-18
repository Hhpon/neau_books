import Taro, { Component } from "@tarojs/taro"
import { View, Image } from "@tarojs/components"
import { AtIcon } from 'taro-ui'

import './index.weapp.scss'

export default class BookCard extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  closeBtnClick() {
    this.props.onClose()
  }

  render() {
    return (
      <View className='index'>
        <View className='card-img'>
          <Image mode='aspectFit' src={this.props.bookInfo.img}></Image>
        </View>
        <View className='card-info'>
          <View className='info-top'>
            <View className='info-title'>{this.props.bookInfo.title}</View>
            <View className='info-author'>{this.props.bookInfo.author}</View>
          </View>
          <View className='info-bottom'>
            {this.props.children}
          </View>
        </View>
        <View className='close-fixed'>
          <AtIcon value='close' size='15' onClick={this.closeBtnClick}></AtIcon>
        </View>
      </View>
    )
  }
}
