import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Wrapper from "@/views/Wrapper.vue";
import TestTimer from "@/views/TestTimer.vue";
import TestComplete from "@/views/TestComplete.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Wrapper",
    component: Wrapper,
  },
  {
    path: "/timer",
    name: "TestWrapper",
    component: TestTimer,
  },
  {
    path: "/complete",
    name: "TestComplete",
    component: TestComplete,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
