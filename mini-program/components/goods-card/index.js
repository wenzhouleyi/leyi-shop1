/**
 * 商品卡片组件
 * goods-card component
 */
Component({
  properties: {
    goods: {
      type: Object,
      value: {}
    }
  },

  methods: {
    onTap() {
      const goods = this.data.goods;
      if (goods && goods.id) {
        wx.navigateTo({
          url: '/pages/detail/detail?id=' + goods.id
        });
      }
    }
  }
});
