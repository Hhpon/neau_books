import Taro, { Component } from '@tarojs/taro'
import { View, Picker } from '@tarojs/components'
import { AtButton, AtMessage } from 'taro-ui'
import SeModal from '@components/modal/index'
import SeInput from '@components/se-input/index'
import { ERR_NO } from '@common/js/config'

import './attest.scss'

export default class Attest extends Component {

  config = {
    navigationBarTitleText: '学生认证'
  }

  constructor() {
    super()
    this.state = {
      studentID: '',
      studentPassWord: '',
      tel: '',
      charCode: '',
      attestModalContent: '认证信息提交以后不能更改，请确认是否提交',
      isAttestModalOpened: false,
      isStudentIDError: false,
      isStudentPassWordError: false,
      isTelError: false,
      isCharCodeError: false,
      charCodeUrl: '',
      cookie: ''
    }
  }

  componentWillMount() {
    this.getLoginParams()
  }

  // 获取爬虫cookie以及验证码
  getLoginParams() {
    let that = this
    Taro.cloud.callFunction({
      name: 'getLoginParams',
      config: {
        env: 'test-zrdkv'
      }
    }).then(res => {
      console.log(res.result);
      if (res.result.code === 0) {
        Taro.atMessage({
          'message': '网络出现问题，请稍后再试',
          'type': 'error',
        })
        setTimeout(() => {
          Taro.navigateBack({ delta: 1 })
        }, 500)
        return
      }
      that.setState({
        charCodeUrl: "data:image/jpeg;base64," + res.result.charCode,
        cookie: res.result.cookie
      })
    }).catch(err => {
      console.log(err);
    })
  }

  studentIDChange(e) {
    let value = e.detail.value
    this.setState({
      studentID: value
    })
    return value
  }

  studentPassWord(e) {
    let value = e.detail.value
    this.setState({
      studentPassWord: value
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

  charCodeChange(e) {
    let value = e.detail.value
    this.setState({
      charCode: value
    })
    return value
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

  charCodeBlur(e) {
    let value = e.detail.value
    let charCodeReg = /\b\w{4}\b/
    if (!charCodeReg.test(value)) {
      this.setState({
        isCharCodeError: true
      })
      return
    }
    this.setState({
      isCharCodeError: false
    })
  }

  // 点击认证按钮
  attestInfo() {
    setTimeout(() => {
      if (this.state.isStudentIDError || this.state.isTelError || this.state.isCharCodeError || !this.state.studentID || !this.state.tel || !this.state.charCode) {
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
    this.setState({
      isAttestModalOpened: false
    })
    Taro.showLoading({
      title: '加载中',
      mask: true
    })
    Taro.cloud.callFunction({
      name: 'loginNeau',
      data: {
        charCode: this.state.charCode,
        cookie: this.state.cookie,
        studentID: this.state.studentID,
        studentPassWord: this.state.studentPassWord,
        tel: this.state.tel
      }
    }).then(res => {
      let ret = res.result
      if (ret.code === ERR_NO) {
        this.getLoginParams()
        Taro.atMessage({
          'message': ret.loseRetMes,
          'type': 'error',
        })
        Taro.hideLoading()
        return
      }
      let updateCount = ret.stats.updated
      if (updateCount > 0) {
        Taro.hideLoading()
        Taro.atMessage({
          'message': '认证成功',
          'type': 'success',
        })
        setTimeout(() => {
          Taro.navigateBack({ delta: 1 })
        }, 500)
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
        <View className='attest-remark'>注：学生认证为了保证买卖书籍同学均为东农学子，所以学号密码为教务系统的学号密码！</View>
        <SeInput isError={this.state.isStudentIDError} onBlurInput={this.studentIDBlur} title='学号' value={this.state.studentID} placeholder='请输入学号' onChangeInput={this.studentIDChange} maxlength={9}></SeInput>
        <SeInput isError={this.state.isStudentPassWordError} title='密码' value={this.state.studentPassWord} placeholder='请输入密码' onChangeInput={this.studentPassWord}></SeInput>
        <SeInput isError={this.state.isTelError} onBlurInput={this.telBlur} type='number' title='联系电话' value={this.state.tel} placeholder='请输入联系电话' onChangeInput={this.telChange} maxlength={11}></SeInput>
        <View className='charcode-container'>
          <SeInput isError={this.state.isCharCodeError} title='验证码' value={this.state.charCode} onBlurInput={this.charCodeBlur} onChangeInput={this.charCodeChange} placeholder='请输入验证码' maxlength={4}></SeInput>
          <Image src={this.state.charCodeUrl} className='charcode-img' />
        </View>
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