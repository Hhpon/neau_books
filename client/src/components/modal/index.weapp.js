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

  static defaultProps = {
    cancelIsOpen: false,
    btnCancelContent: '取消',
    btnConfirmContent: '确定'
  };

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
          <AtModalAction>{this.props.cancelIsOpen && <Button>{this.props.btnCancelContent}</Button>}<Button onClick={this.modalHandle}>{this.props.btnConfirmContent}</Button></AtModalAction>
        </AtModal>
      </View>
    )
  }
}

// CustomButton.defaultProps = {
//   cancelIsOpen: false,
//   btnCancelContent: '取消'
// }
