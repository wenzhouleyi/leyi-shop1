const { api } = require('../../config/api');

Page({
  data: {
    product: {},
    qty: 1
  },
  onLoad(options) {
    this.loadProduct(options.id);
  },
  loadProduct(id) {
    api('/api/products/' + id).then(res => {
      this.setData({ product: res.data });
    });
  },
  changeQty(e) {
    const d = parseInt(e.currentTarget.dataset.d);
    let qty = this.data.qty + d;
    if (qty < 1) qty = 1;
    this.setData({ qty });
  },
  addCart() {
    api('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: this.data.product.id, quantity: this.data.qty })
    }).then(() => {
      wx.showToast({ title: '已加入购物车', icon: 'success' });
    }).catch(e => {
      if (e.message.includes('登录')) {
        wx.navigateTo({ url: '/pages/login/login' });
      }
    });
  },
  buyNow() {
    wx.navigateTo({ url: '/pages/order/confirm?product_id=' + this.data.product.id + '&qty=' + this.data.qty });
  },
  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },
  goCart() {
    wx.switchTab({ url: '/pages/cart/cart' });
  },
  contact() {
    wx.showToast({ title: '客服电话：400-888-8888', icon: 'none' });
  }
});
