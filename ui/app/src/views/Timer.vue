<template>
  <div>
    <img class="header" src="../assets/header-welcome.svg">
    <div class="main-container">
      <div class="container">
        <div>
          <div class="timer-header">
            <div class="time-header">DAYS</div>
            <div class="time-header">HOURS</div>
            <div class="time-header">MIN</div>
          </div>
          <div class="timer">
            <div class="time">11</div>
            <div class="time">30</div>
            <div class="time">45</div>
          </div>
          <div class="timer-footer">
            <p class="start-time">The Sifchain Token Sale will start on</p>
            <p class="start-date">November 12th, 12:00am GMT</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";

  export default defineComponent({
    name: "Timer",
  });
</script>

<style lang="scss" scoped>
  .main-container {
    display: table;
    margin: 0 auto;
  }
  .header {
    width: 720px;
    height: 130px;
    padding-bottom: 32px;
  }
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 421px;
    height: 392px;
    background-image: url("../assets/timer-background.svg");
    padding: 16px;
  }
  .timer-header {
    padding-bottom: 16px;
    display: flex;
    justify-content: space-evenly;
  }
  .timer {
    padding-bottom: 32px;
    display: flex;
    justify-content: space-evenly;
  }
  .timer-footer {
    padding-top: 8px;
  }
  .time-header {
    font-size: 12px;
    color: $c_gray_700;
    font-weight: lighter;
    font-style: italic;
    font-family: serif;
  }
  .time {
    font-size: 40px;
    color: $c_gray_900;
    font-weight: lighter;
    font-style: italic;
    font-family: serif;
    letter-spacing: 0;
  }
  .start-time {
    font-size: 16px;
    color: $c_gray_900;
    font-weight: normal;
    font-style: italic;
    font-family: serif;
  }
  .start-date {
    font-size: 16px;
    color: $c_gold;
    font-weight: bold;
    font-style: italic;
    font-family: serif;
  }
</style>
