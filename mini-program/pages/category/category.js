const { api } = require('../../config/api');

Page({
  data: {
    categories: [],
    currentId: 1,
    subCategories: [],
    products: []
  },
  onLoad() {
    this.loadCategories();
  },
  loadCategories() {
    api('/api/categories').then(res => {
      const cats = res.data || [];
      this.setData({ categories: cats });
      if (cats.length) this.selectCategory({ currentTarget: { dataset: { id: cats[0].id } } });
    });
  },
  selectCategory(e) {
    const id = e.currentTarget.dataset.id;
    const cat = this.data.categories.find(c => c.id === id);
    this.setData({ currentId: id, subCategories: cat?.children || [] });
    this.loadProducts(id);
  },
  loadProducts(catId) {
    api('/api/products?category_id=' + catId + '&page=1&size=20').then(res => {
      this.setData({ products: res.data.list || [] });
    });
  },
  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' });
  },
  goProducts(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/products/products?category_id=' + id });
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/detail/detail?id=' + id });
  }
});
