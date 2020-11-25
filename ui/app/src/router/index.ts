import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Wrapper from "@/views/Wrapper.vue";
import TestWrapper from "@/views/TestWrapper.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Wrapper",
    component: Wrapper,
  },
  {
    path: "/timer",
    name: "TestWrapper",
    component: TestWrapper,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
