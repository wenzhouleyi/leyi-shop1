const { api } = require('../../config/api');

Page({
  data: {
    banners: [],
    categories: [
      { id: 1, name: '手机全系列', icon: '📱' },
      { id: 2, name: '融合生态', icon: '🔌' },
      { id: 3, name: '精美礼品', icon: '🎁' },
      { id: 4, name: '精品配件', icon: '🎧' },
      { id: 5, name: '苹果手机', icon: '📱' },
      { id: 6, name: '苹果平板', icon: '📲' },
      { id: 7, name: '苹果电脑', icon: '💻' },
      { id: 8, name: '苹果配件', icon: '⌚' },
    ],
    products: []
  },
  onLoad() {
    this.loadBanners();
    this.loadProducts();
  },
  onShow() {
    this.loadProducts();
  },
  loadBanners() {
    api('/api/banners').then(res => {
      this.setData({ banners: res.data || [] });
    });
  },
  loadProducts() {
    api('/api/products?page=1&size=10').then(res => {
      this.setData({ products: res.data.list || [] });
    });
  },
  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },
  goCategory(e) {
    const id = e.currentTarget.dataset.id;
    wx.switchTab({ url: '/pages/category/category' });
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
