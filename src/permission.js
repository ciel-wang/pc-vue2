/**
 * 全站权限配置
 *
 */
import router from './router/router'
import store from './store'
import {Message} from 'element-ui';
import {validatenull} from '@/util/validate'
import {getToken} from '@/util/auth'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
NProgress.configure({showSpinner: false});
const lockPage = store.getters.website.lockPage; //锁屏页

router.beforeEach((to, from, next) => {
  const meta = to.meta || {};
  const isMenu = meta.menu === undefined ? to.query.menu : meta.menu;
  store.commit('SET_IS_MENU', isMenu === undefined);
  if (getToken()) {
    if (store.getters.isLock && to.path !== lockPage) { //如果系统激活锁屏，全部跳转到锁屏页
      next({path: lockPage})
    } else if (to.path === '/login') { //如果登录成功访问登录页跳转到主页
      next({path: '/'})
    } else if(store.getters.isUpdatePassword && to.path !== '/info/index'){
      Message({ message: '请先修改密码！', type: 'warning' });
      next({ path: '/info/index' })
    } else {
      //如果用户信息为空则获取用户信息，获取用户信息失败，跳转到登录页
      if (store.getters.token.length === 0) {
        store.dispatch('FedLogOut').then(() => {
          next({path: '/login'})
        })
      } else {
        let value = to.query.src || to.fullPath;
        const label = to.query.name || to.name;
        const meta = to.meta || router.$avueRouter.meta || {};
        const i18n = to.query.i18n;
        if (to.query.target) {
          window.open(value)
        } else if (to.query.src && to.query.src.startsWith('http') && to.query.src.indexOf('token') == -1){
          let query = to.query
          let index = query.src.indexOf('?');
          query.src = query.src + ( index < 0 ? '?token=': '&token=') + store.getters.sysToken;
          next({
            path:to.path,
            query:query,
            meta:meta,
            params: to.params,
          })
        }else{
          let index = value.indexOf('token')
          if(index >= 0){
            value = value.substring(0,index-1)
          }
          if(meta.isTab !== false && !validatenull(value) && !validatenull(label)) {
            store.commit('ADD_TAG', {
              label: label,
              value: value,
              params: to.params,
              query: to.query,
              meta: (() => {
                if (!i18n) {
                  return meta
                }
                return {
                  i18n: i18n
                }
              })(),
              group: router.$avueRouter.group || []
            });
          }
        }
        next()
      }
    }
  } else {
    //判断是否需要认证，没有登录访问去登录页
    if (meta.isAuth === false) {
      next()
    } else {
      next('/login')
    }
  }
})

router.afterEach(() => {
  NProgress.done();
  let title = store.getters.tag.label;
  let i18n = store.getters.tag.meta.i18n;
  title = router.$avueRouter.generateTitle(title, i18n);
  //判断登录页的情况
  if (router.history.current.fullPath === "/login") {
    title = "登录";
  }
  //根据当前的标签也获取label的值动态设置浏览器标题
  router.$avueRouter.setTitle(title);
});
