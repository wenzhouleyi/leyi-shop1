const { api } = require('../../config/api');

Page({
  data: {
    user: null
  },
  onShow() {
    this.loadUser();
  },
  loadUser() {
    const token = wx.getStorageSync('token');
    if (!token) {
      this.setData({ user: null });
      return;
    }
    api('/api/auth/profile').then(res => {
      this.setData({ user: res.data });
    }).catch(() => {
      wx.removeStorageSync('token');
      this.setData({ user: null });
    });
  },
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },
  goOrders(e) {
    const status = e.currentTarget.dataset.status;
    wx.navigateTo({ url: '/pages/order/list?status=' + status });
  },
  goAddress() {
    wx.navigateTo({ url: '/pages/address/address' });
  },
  goFav() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },
  contact() {
    wx.showToast({ title: '客服电话：400-888-8888', icon: 'none' });
  },
  about() {
    wx.showModal({ title: '关于', content: '温州乐翼数码商城 v1.0', showCancel: false });
  },
  logout() {
    wx.removeStorageSync('token');
    this.setData({ user: null });
    wx.showToast({ title: '已退出登录', icon: 'success' });
  }
});
