/**
 * 搜索栏组件
 * search-bar component
 */
Component({
  properties: {
    value: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: '搜索商品'
    },
    customClass: {
      type: String,
      value: ''
    },
    customStyle: {
      type: String,
      value: ''
    }
  },

  methods: {
    onInput(e) {
      this.setData({ value: e.detail.value });
      this.triggerEvent('input', { value: e.detail.value });
    },

    onConfirm(e) {
      this.triggerEvent('confirm', { value: e.detail.value });
    },

    onFocus(e) {
      this.triggerEvent('focus', e.detail);
    },

    onBlur(e) {
      this.triggerEvent('blur', e.detail);
    },

    onClear() {
      this.setData({ value: '' });
      this.triggerEvent('input', { value: '' });
      this.triggerEvent('clear');
    }
  }
});
