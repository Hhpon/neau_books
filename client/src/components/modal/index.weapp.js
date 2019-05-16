import Taro, { Component } from "@tarojs/taro"
import { View, Button } from "@tarojs/components"
import { AtModal, AtModalAction } from "taro-ui"

import './index.weapp.scss'

export default class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      closeOnClickOverlay: false
    }
  }

  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  modalHandle() {
    this.props.onModalHandle()
  }

  render() {
    return (
      <View className='index'>
        <AtModal isOpened={this.props.isOpened} closeOnClickOverlay={this.state.closeOnClickOverlay}>
          <View className='model-content'>{this.props.content}</View>
          <AtModalAction><Button onClick={this.modalHandle}>{this.props.btnContent}</Button></AtModalAction>
        </AtModal>
      </View>
    )
  }
}
