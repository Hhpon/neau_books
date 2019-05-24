import Taro, { Component } from '@tarojs/taro'
import { View, Picker, Input, Text } from '@tarojs/components'
import { AtInput, AtButton, AtMessage } from 'taro-ui'
import SeModal from '@components/modal/index'

import './attest.scss'

export default class Attest extends Component {

  config = {
    navigationBarTitleText: '学生认证'
  }

  constructor() {
    super()
    this.state = {
      userName: '',
      faculty: '',
      studentID: '',
      tel: '',
      attestModalContent: '认证信息提交以后不能更改，请确认是否提交',
      isAttestModalOpened: false,
      facultyItems: ['农学', '经管', '工程', '动科', '动医', '电信', '食品', '生命', '园艺', '资环', '水利', '文法', '理学院', '国际', '艺术']
    }
  }

  userNameChange(value) {
    this.setState({
      userName: value
    })
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value
  }

  facultyChange(e) {
    let facultyItems = this.state.facultyItems
    let index = e.detail.value
    console.log(index)
    this.setState({
      faculty: facultyItems[index]
    })
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return facultyItems[index]
  }

  studentIDChange(value) {
    this.setState({
      studentID: value
    })
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value
  }

  telChange(value) {
    this.setState({
      tel: value
    })
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value
  }

  attestInfo() {
    let userInfo = {
      userName: this.state.userName,
      faculty: this.state.faculty,
      studentID: this.state.studentID,
      tel: this.state.tel
    }

    for (let key in userInfo) {
      if (!userInfo[key]) {
        Taro.atMessage({
          'message': '请输入完整',
          'type': 'error',
        })
        return
      }
    }
    this.setState({
      isAttestModalOpened: true
    })
  }

  // 点击模态框的确认按钮
  btnConfirmModalHandle() {
    let userInfo = {
      userName: this.state.userName,
      faculty: this.state.faculty,
      studentID: this.state.studentID,
      tel: this.state.tel
    }
    Taro.cloud.callFunction({
      name: 'updateUserinfo',
      data: userInfo
    }).then(res => {
      let updateCount = res.result.stats.updated
      if (updateCount > 0) {
        Taro.atMessage({
          'message': '认证成功',
          'type': 'success',
        })
        setTimeout(() => {
          Taro.navigateBack({ delta: 1 })
        }, 1000)
        this.setState({
          isAttestModalOpened: false
        })
        return
      }
      Taro.atMessage({
        'message': '数据未更新',
        'type': 'info',
      })
      this.setState({
        isAttestModalOpened: false
      })
    }).catch(() => {
      Taro.atMessage({
        'message': '网络出现问题，请联系开发者',
        'type': 'error',
      })
      this.setState({
        isAttestModalOpened: false
      })
    })
  }

  // 点击模态框的取消按钮
  btnCancelModalHandle() {
    this.setState({
      isAttestModalOpened: false
    })
  }

  render() {
    return (
      <View className='attest'>
        <View className='attest-title'>学生认证</View>
        <View className='attest-remark'>注：该信息是活动主办方唯一确认您身份的凭证，请认真填写！</View>
        <AtInput
          name='userName'
          title='姓名'
          type='text'
          placeholder='请输入姓名'
          value={this.state.userName}
          onChange={this.userNameChange.bind(this)}
        />
        <Picker mode='selector' range={this.state.facultyItems} onChange={this.facultyChange}>
          <AtInput
            name='faculty'
            title='学院'
            type='text'
            placeholder='请输入学院'
            value={this.state.faculty}
          />
        </Picker>
        <AtInput
          name='studentID'
          title='学号'
          type='text'
          placeholder='请输入学号'
          value={this.state.studentID}
          onChange={this.studentIDChange.bind(this)}
        />
        <AtInput
          name='tel'
          title='联系电话'
          type='phone'
          placeholder='请输入联系电话'
          value={this.state.tel}
          onChange={this.telChange.bind(this)}
        />
        <View className='empty'></View>
        <AtButton onClick={this.attestInfo} type='primary'>提交</AtButton>
        <View className='modal'>
          <SeModal cancelIsOpen content={this.state.attestModalContent} isOpened={this.state.isAttestModalOpened} onConfirmModalHandle={this.btnConfirmModalHandle} onCancelModalHandle={this.btnCancelModalHandle}></SeModal>
        </View>
        <AtMessage />
      </View>
    )
  }
}