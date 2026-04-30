/**
 * 温州乐翼小程�?- 全局逻辑
 * HZXK Mini Program - App Logic
 */

// 引入 API 配置
const apiConfig = require('./config/api.js');

App({
  // 全局数据
  globalData: {
    userInfo: null,
    isLogin: false,
    cartCount: 0,
    baseUrl: apiConfig.baseUrl
  },

  /**
   * 小程序初始化
   */
  onLaunch() {
    // 检查登录状�?    this.checkLoginStatus();
    
    // 从本地存储加载购物车数量
    this.loadCartCount();
    
    // 初始化云开发（如需要）
    // wx.cloud.init({ env: 'your-env-id' });
  },

  /**
   * 检查登录状�?   */
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
    }
  },

  /**
   * 用户登录
   */
  login(callback) {
    // 模拟登录（实际项目中应调�?wx.login 获取 code�?    wx.login({
      success: (res) => {
        if (res.code) {
          // 实际项目中应�?code 发送到后端获取 openid/session_key
          // 这里模拟直接获取用户信息
          wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (userRes) => {
              const userInfo = {
                id: Date.now(),
                nickName: userRes.userInfo.nickName,
                avatarUrl: userRes.userInfo.avatarUrl,
                gender: userRes.userInfo.gender
              };
              this.globalData.userInfo = userInfo;
              this.globalData.isLogin = true;
              wx.setStorageSync('userInfo', userInfo);
              callback && callback(userInfo);
            },
            fail: () => {
              wx.showToast({ title: '登录失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  /**
   * 退出登�?   */
  logout() {
    this.globalData.userInfo = null;
    this.globalData.isLogin = false;
    wx.removeStorageSync('userInfo');
    // 触发全局事件
    this.triggerLoginChange();
  },

  /**
   * 触发登录状态变化事�?   */
  triggerLoginChange() {
    const pages = getCurrentPages();
    pages.forEach(page => {
      if (page.onLoginChange) {
        page.onLoginChange(this.globalData.isLogin);
      }
    });
  },

  /**
   * 加载购物车数�?   */
  loadCartCount() {
    const cart = wx.getStorageSync('cart') || [];
    this.globalData.cartCount = cart.reduce((total, item) => total + item.num, 0);
    this.updateCartBadge();
  },

  /**
   * 更新购物车角�?   */
  updateCartBadge() {
    const count = this.globalData.cartCount;
    if (count > 0) {
      wx.setTabBarBadge({
        index: 2,
        text: count > 99 ? '99+' : String(count)
      });
    } else {
      wx.removeTabBarBadge({ index: 2 });
    }
  },

  /**
   * 更新全局购物车数�?   */
  setCartCount(count) {
    this.globalData.cartCount = count;
    this.updateCartBadge();
  },

  /**
   * 发起网络请求
   */
  request(url, data = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.baseUrl + url,
        data: data,
        method: method,
        header: {
          'Content-Type': 'application/json',
          'Authorization': wx.getStorageSync('token') || ''
        },
        success: (res) => {
          if (res.data.code === 0 || res.data.code === 200) {
            resolve(res.data.data);
          } else {
            wx.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
            reject(res.data);
          }
        },
        fail: (err) => {
          wx.showToast({ title: '网络请求失败', icon: 'none' });
          reject(err);
        }
      });
    });
  },

  /**
   * 显示加载提示
   */
  showLoading(title = '加载�?) {
    wx.showLoading({ title, mask: true });
  },

  /**
   * 隐藏加载提示
   */
  hideLoading() {
    wx.hideLoading();
  },

  /**
   * 显示成功提示
   */
  showSuccess(title = '成功') {
    wx.showToast({ title, icon: 'success', duration: 1500 });
  },

  /**
   * 显示错误提示
   */
  showError(title = '出错�?) {
    wx.showToast({ title, icon: 'none', duration: 2000 });
  }
});
