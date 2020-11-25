import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Main from "@/views/Main.vue";
import Timer from "@/views/Timer.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Main",
    component: Main,
  },
  {
    path: "/timer",
    name: "Timer",
    component: Timer,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
