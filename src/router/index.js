import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [];

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes,
});

// router.beforeEach((to, from, next) => {});

export default router;
