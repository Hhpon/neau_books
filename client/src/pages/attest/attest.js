import Taro, { Component } from '@tarojs/taro'
import { View, Picker } from '@tarojs/components'
import { AtButton, AtMessage } from 'taro-ui'
import SeModal from '@components/modal/index'
import SeInput from '@components/se-input/index'

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
      facultyItems: ['农学', '经管', '工程', '动科', '动医', '电信', '食品', '生命', '园艺', '资环', '水利', '文法', '理学院', '国际', '艺术'],
      isUserNameError: false,
      isStudentIDError: false,
      isTelError: false
    }
  }

  userNameChange(e) {
    let value = e.detail.value
    this.setState({
      userName: value
    })
    return value
  }

  facultyChange(e) {
    let facultyItems = this.state.facultyItems
    let index = e.detail.value
    this.setState({
      faculty: facultyItems[index]
    })
    return facultyItems[index]
  }

  studentIDChange(e) {
    let value = e.detail.value
    this.setState({
      studentID: value
    })
    return value
  }

  telChange(e) {
    let value = e.detail.value
    this.setState({
      tel: value
    })
    return value
  }

  userNameBlur(e) {
    let value = e.detail.value
    if (!value) {
      this.setState({
        isUserNameError: true
      })
      return
    }
    this.setState({
      isUserNameError: false
    })
  }

  studentIDBlur(e) {
    let value = e.detail.value
    let stuIDReg = /\bA\d{8}\b/
    if (!stuIDReg.test(value)) {
      this.setState({
        isStudentIDError: true
      })
      return
    }
    this.setState({
      isStudentIDError: false
    })
  }

  telBlur(e) {
    let value = e.detail.value
    let telReg = /\b\d{11}\b/
    if (!telReg.test(value)) {
      this.setState({
        isTelError: true
      })
      return
    }
    this.setState({
      isTelError: false
    })
  }

  // 点击认证按钮
  attestInfo() {
    setTimeout(() => {
      if (this.state.isUserNameError || this.state.isStudentIDError || this.state.isTelError || !this.state.faculty || !this.state.userName || !this.state.studentID || !this.state.tel) {
        Taro.atMessage({
          'message': '请输入正确信息',
          'type': 'error',
        })
        return
      }
      this.setState({
        isAttestModalOpened: true
      })
    }, 200)
  }

  // 点击模态框的确认按钮
  btnConfirmModalHandle() {
    Taro.showLoading({
      title: '加载中',
      mask: true
    })
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
        Taro.hideLoading()
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
      Taro.hideLoading()
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
        <SeInput isError={this.state.isUserNameError} onBlurInput={this.userNameBlur} title='姓名' value={this.state.userName} placeholder='请输入姓名' onChangeInput={this.userNameChange}></SeInput>
        <Picker mode='selector' range={this.state.facultyItems} onChange={this.facultyChange}>
          <SeInput disabled title='学院' placeholder='请选择学院' value={this.state.faculty}></SeInput>
        </Picker>
        <SeInput isError={this.state.isStudentIDError} onBlurInput={this.studentIDBlur} title='学号' value={this.state.studentID} placeholder='请输入学号' onChangeInput={this.studentIDChange}></SeInput>
        <SeInput isError={this.state.isTelError} onBlurInput={this.telBlur} type='number' title='联系电话' value={this.state.tel} placeholder='请输入联系电话' onChangeInput={this.telChange} ></SeInput>
        <View className='empty'></View>
        <AtButton onClick={this.attestInfo} type='primary'>提交</AtButton>
        <View className='modal'>
          <SeModal cancelIsOpen content={this.state.attestModalContent} isOpened={this.state.isAttestModalOpened} onConfirmModalHandle={this.btnConfirmModalHandle} onCancelModalHandle={this.btnCancelModalHandle}></SeModal>
        </View>
        <AtMessage />
      </View >
    )
  }
}