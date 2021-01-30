import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Wrapper from "@/views/Wrapper.vue";
import PriceData from "@/views/PriceData.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Wrapper",
    component: Wrapper,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
  {
    path: "/stats",
    name: "PriceData",
    component: PriceData,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
