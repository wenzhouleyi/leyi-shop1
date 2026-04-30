const { api } = require('../../config/api');

Page({
  data: {
    cart: [],
    isEdit: false,
    selectAll: false
  },
  onShow() {
    this.loadCart();
  },
  loadCart() {
    api('/api/cart').then(res => {
      const cart = (res.data || []).map(i => ({ ...i, selected: false }));
      this.setData({ cart });
      this.updateSelectAll();
    });
  },
  toggleSelect(e) {
    const id = e.currentTarget.dataset.id;
    const cart = this.data.cart.map(i => i.id === id ? { ...i, selected: !i.selected } : i);
    this.setData({ cart });
    this.updateSelectAll();
  },
  toggleSelectAll() {
    const selectAll = !this.data.selectAll;
    const cart = this.data.cart.map(i => ({ ...i, selected: selectAll }));
    this.setData({ cart, selectAll });
  },
  updateSelectAll() {
    const selectAll = this.data.cart.length > 0 && this.data.cart.every(i => i.selected);
    this.setData({ selectAll });
  },
  changeQty(e) {
    const { id, delta } = e.currentTarget.dataset;
    const item = this.data.cart.find(i => i.id === id);
    const qty = item.quantity + parseInt(delta);
    if (qty < 1) return;
    api('/api/cart/' + id, { method: 'PUT', body: JSON.stringify({ quantity: qty }) }).then(() => {
      this.loadCart();
    });
  },
  toggleEdit() {
    this.setData({ isEdit: !this.data.isEdit });
  },
  checkout() {
    const selected = this.data.cart.filter(i => i.selected);
    if (!selected.length) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/order/confirm' });
  },
  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});
