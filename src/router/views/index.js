import Layout from '@/page/index/'

export default [{
  path: '/wel',
  component: Layout,
  redirect: '/wel/index',
  children: [{
    path: 'index',
    name: '首页',
    meta: {
      i18n: 'dashboard'
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/wel/index')
  }, {
    path: 'dashboard',
    name: '控制台',
    meta: {
      i18n: 'dashboard',
      menu: false,
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/wel/dashboard')
  }]
}, {
  path: '/test',
  component: Layout,
  redirect: '/test/index',
  children: [{
    path: 'index',
    name: '测试页',
    meta: {
      i18n: 'test'
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/util/test')
  }]
}, {
  path: '/dict-horizontal',
  component: Layout,
  redirect: '/dict-horizontal/index',
  children: [{
    path: 'index',
    name: '字典管理',
    meta: {
      i18n: 'dict'
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/util/demo/dict-horizontal')
  }]
}, {
  path: '/dict-vertical',
  component: Layout,
  redirect: '/dict-vertical/index',
  children: [{
    path: 'index',
    name: '字典管理',
    meta: {
      i18n: 'dict'
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/util/demo/dict-vertical')
  }]
}, {
  path: '/info',
  component: Layout,
  redirect: '/info/index',
  children: [{
    path: 'index',
    name: '个人信息',
    meta: {
      i18n: 'info'
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/system/userinfo/index')
  }]
}, {
  path: '/auth',
  component: Layout,
  redirect: '/auth/index',
  children: [{
    path: 'index',
    name: '获取授权文件',
    meta: {
      i18n: 'auth'
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/system/authfile/index')
  }]
},{
  path: '/work/process/leave',
  component: Layout,
  redirect: '/work/process/leave/form',
  children: [{
    path: 'form/:processDefinitionId',
    name: '请假流程',
    meta: {
      i18n: 'work'
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/work/process/leave/form')
  }, {
    path: 'handle/:taskId/:processInstanceId/:businessId',
    name: '处理请假流程',
    meta: {
      i18n: 'work'
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/work/process/leave/handle')
  }, {
    path: 'detail/:processInstanceId/:businessId',
    name: '请假流程详情',
    meta: {
      i18n: 'work'
    },
    component: () =>
      import( /* webpackChunkName: "views" */ '@/views/work/process/leave/detail')
  },{
    path: '/iot/accesscontroller/emplist',
    name: '门禁进出记录',
    component: () =>
      import( /* webpackChunkName: "page" */ '@/views/iot/accesscontroller/emplist/index'),
    meta: {
      keepAlive: false,
      isTab: true,
      isAuth: true
    }
  },{
    path: '/dorm/panel/panel_dorm',
    name: '',
    component: () =>
      import( /* webpackChunkName: "page" */ '@/views/dorm/panel/panel_dorm/index'),
    meta: {
      keepAlive: false,
      isTab: true,
      isAuth: true
    }
  },{
    path: '/library-mng/books-periodical-info',
    name: '书刊信息录入',
    component: () =>
      import( /* webpackChunkName: "page" */ '@/views/library-mng/books-periodical-info/index'),
    meta: {
      keepAlive: false,
      isTab: false,
      isAuth: true
    }
  }]
}]
