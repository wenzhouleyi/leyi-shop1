/**
 * API 基础配置
 */
module.exports = {
  // API 基础地址
  baseUrl: 'http://localhost:3000',
  
  // API 路径
  api: {
    // 首页数据
    home: '/api/home',
    
    // 商品相关
    goods: '/api/goods',
    goodsDetail: '/api/goods/detail',
    goodsList: '/api/goods/list',
    goodsSearch: '/api/goods/search',
    
    // 分类相关
    category: '/api/category',
    categoryGoods: '/api/category/goods',
    
    // 购物车相关
    cart: '/api/cart',
    cartAdd: '/api/cart/add',
    cartUpdate: '/api/cart/update',
    cartDelete: '/api/cart/delete',
    
    // 订单相关
    order: '/api/order',
    orderCreate: '/api/order/create',
    orderList: '/api/order/list',
    orderDetail: '/api/order/detail',
    orderConfirm: '/api/order/confirm',
    
    // 用户相关
    user: '/api/user',
    userLogin: '/api/user/login',
    userInfo: '/api/user/info',
    userAddress: '/api/user/address',
    
    // 其他
    banner: '/api/banner'
  }
};
