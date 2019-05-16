import Taro, { Component } from "@tarojs/taro"
import { View, Button } from "@tarojs/components"
// import { AtModal, AtModalAction } from "taro-ui"

import './index.weapp.scss'

export default class BookCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      
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
        
      </View>
    )
  }
}
