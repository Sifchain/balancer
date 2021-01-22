import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Wrapper from "@/views/Wrapper.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Wrapper",
    component: Wrapper,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
