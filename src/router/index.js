import Vue from "vue";
import VueRouter from "vue-router";

let originPush = VueRouter.prototype.push; //备份原push方法

VueRouter.prototype.push = function (location, resolve, reject) {
  if (resolve && reject) {
    //如果传了回调函数，直接使用
    originPush.call(this, location, resolve, reject);
  } else {
    //如果没有传回调函数，手动添加
    originPush.call(
      this,
      location,
      () => {},
      () => {}
    );
  }
};
Vue.use(VueRouter);

const routes = [];

const router = new VueRouter({
 
  routes,
});

// router.beforeEach((to, from, next) => {});

export default router;
