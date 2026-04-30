const { createApp } = Vue;

const API_BASE = '';

function api(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = 'Bearer ' + token;
  return fetch(API_BASE + url, { ...options, headers })
    .then(r => r.json())
    .then(data => {
      if (data.code !== 200) throw new Error(data.message);
      return data;
    });
}

const app = createApp({
  data() {
    return {
      view: 'home',
      user: null,
      token: localStorage.getItem('token'),
      categories: [],
      products: [],
      hotProducts: [],
      currentProduct: {},
      cart: [],
      orders: [],
      page: 1,
      size: 12,
      searchKeyword: '',
      qty: 1,
      loginForm: { username: '', password: '' },
      registerForm: { username: '', password: '', phone: '', verifyCode: '', businessName: '', storeAddress: '', contactName: '' },
      verifyCodeCountdown: 0,
      remark: '',
      address: '',
      toastShow: false,
      toastMsg: '',
      toastType: 'toast-info'
    };
  },
  computed: {
    cartCount() {
      return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    },
    selectedCount() {
      return this.cart.filter(i => i.selected).reduce((sum, i) => sum + i.quantity, 0);
    },
    selectedCartItems() {
      return this.cart.filter(i => i.selected);
    },
    totalAmount() {
      return this.cart.filter(i => i.selected).reduce((sum, i) => sum + i.price * i.quantity, 0);
    },
    selectAll: {
      get() { return this.cart.length > 0 && this.cart.every(i => i.selected); },
      set(val) { this.cart.forEach(i => i.selected = val); }
    }
  },
  mounted() {
    this.checkLogin();
    this.loadCategories();
    this.loadProducts();
    this.loadHotProducts();
    if (this.token) {
      this.loadCart();
      this.loadOrders();
    }
  },
  methods: {
    showToast(msg, type = 'info') {
      this.toastMsg = msg;
      this.toastType = 'toast-' + type;
      this.toastShow = true;
      setTimeout(() => this.toastShow = false, 2500);
    },
    checkLogin() {
      if (this.token) {
        api('/api/auth/profile').then(res => {
          this.user = res.data;
        }).catch(() => {
          localStorage.removeItem('token');
          this.token = null;
        });
      }
    },
    goHome() {
      this.view = 'home';
      this.loadHotProducts();
    },
    goCategory(catId) {
      this.page = 1;
      this.loadProducts(catId);
      this.view = 'products';
    },
    doSearch() {
      if (!this.searchKeyword) return;
      this.page = 1;
      this.loadProducts();
      this.view = 'products';
    },
    loadCategories() {
      api('/api/categories').then(res => {
        this.categories = res.data || [];
      });
    },
    loadProducts(catId) {
      const params = new URLSearchParams({ page: this.page, size: this.size });
      if (catId) params.append('category_id', catId);
      if (this.searchKeyword) params.append('keyword', this.searchKeyword);
      api('/api/products?' + params).then(res => {
        this.products = res.data.list || [];
      });
    },
    loadHotProducts() {
      api('/api/products?page=1&size=8').then(res => {
        this.hotProducts = res.data.list || [];
      });
    },
    loadCart() {
      api('/api/cart').then(res => {
        this.cart = (res.data || []).map(i => ({ ...i, selected: false }));
      }).catch(() => {});
    },
    loadOrders() {
      api('/api/orders').then(res => {
        this.orders = res.data.list || [];
      }).catch(() => {});
    },
    addCart(productId, qty = 1) {
      if (!this.token) {
        this.showToast('请先登录', 'error');
        this.view = 'login';
        return;
      }
      api('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity: qty })
      }).then(() => {
        this.showToast('已加入购物车', 'success');
        this.loadCart();
      }).catch(e => this.showToast(e.message, 'error'));
    },
    updateCart(id, qty) {
      if (qty < 1) return;
      api('/api/cart/' + id, {
        method: 'PUT',
        body: JSON.stringify({ quantity: qty })
      }).then(() => this.loadCart());
    },
    removeCart(id) {
      api('/api/cart/' + id, { method: 'DELETE' }).then(() => {
        this.showToast('已删除', 'success');
        this.loadCart();
      });
    },
    goDetail(id) {
      api('/api/products/' + id).then(res => {
        this.currentProduct = res.data;
        this.qty = 1;
        this.view = 'detail';
      });
    },
    buyNow() {
      if (!this.token) {
        this.showToast('请先登录', 'error');
        this.view = 'login';
        return;
      }
      this.cart = [{ ...this.currentProduct, quantity: this.qty, selected: true, product_id: this.currentProduct.id }];
      this.view = 'checkout';
    },
    checkout() {
      if (!this.selectedCount) {
        this.showToast('请选择商品', 'error');
        return;
      }
      this.view = 'checkout';
    },
    submitOrder() {
      if (!this.selectedCount) {
        this.showToast('请选择商品', 'error');
        return;
      }
      const items = this.selectedCartItems.map(i => ({ product_id: i.product_id || i.id, quantity: i.quantity }));
      api('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ items, remark: this.remark, address: this.address })
      }).then(() => {
        this.showToast('下单成功！', 'success');
        this.loadCart();
        this.loadOrders();
        this.view = 'user';
      }).catch(e => this.showToast(e.message, 'error'));
    },
    sendVerifyCode() {
      const phone = this.registerForm.phone;
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        this.showToast('请输入正确的手机号', 'error');
        return;
      }
      // 发送验证码API
      api('/api/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone: phone })
      }).then(() => {
        this.showToast('验证码已发送', 'success');
        this.verifyCodeCountdown = 60;
        const timer = setInterval(() => {
          this.verifyCodeCountdown--;
          if (this.verifyCodeCountdown <= 0) clearInterval(timer);
        }, 1000);
      }).catch(e => this.showToast(e.message, 'error'));
    },
    doLogin() {
      if (!this.loginForm.username || !this.loginForm.password) {
        this.showToast('请填写用户名和密码', 'error');
        return;
      }
      api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(this.loginForm)
      }).then(res => {
        localStorage.setItem('token', res.data.token);
        this.token = res.data.token;
        this.user = res.data;
        this.showToast('登录成功', 'success');
        this.loadCart();
        this.loadOrders();
        this.view = 'home';
      }).catch(e => this.showToast(e.message, 'error'));
    },
    doRegister() {
      const f = this.registerForm;
      if (!f.username || !f.password || !f.phone || !f.verifyCode) {
        this.showToast('请填写完整信息', 'error');
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(f.phone)) {
        this.showToast('请输入正确的手机号', 'error');
        return;
      }
      if (!f.businessName || !f.storeAddress || !f.contactName) {
        this.showToast('请填写营业执照名称、门店地址和负责人', 'error');
        return;
      }
      api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: f.username,
          password: f.password,
          phone: f.phone,
          verifyCode: f.verifyCode,
          businessName: f.businessName,
          storeAddress: f.storeAddress,
          contactName: f.contactName
        })
      }).then(() => {
        this.showToast('注册成功，请登录', 'success');
        this.view = 'login';
        this.loginForm.username = f.username;
      }).catch(e => this.showToast(e.message, 'error'));
    },
    logout() {
      localStorage.removeItem('token');
      this.token = null;
      this.user = null;
      this.cart = [];
      this.showToast('已退出登录', 'info');
      this.view = 'home';
    },
    statusText(status) {
      const map = { pending: '待处理', shipped: '已发货', completed: '已完成', cancelled: '已取消' };
      return map[status] || status;
    }
  }
});

app.mount('#app');