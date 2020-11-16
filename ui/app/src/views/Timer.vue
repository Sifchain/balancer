<template>
  <div>
    <div class="main-container">
      <div class="container">
        <div>
          <div class="timer-header">
            <div class="time-header">DAYS</div>
            <div class="time-header">HOURS</div>
            <div class="time-header">MIN</div>
          </div>
          <div class="timer">
            <div class="time">{{days}}</div>
            <div class="time">{{hours}}</div>
            <div class="time">{{minutes}}</div>
          </div>
          <div class="timer-footer">
            <p class="start-time">The Sifchain Token Sale will start on</p>
            <p class="start-date">November 19th, 12:00am GMT</p>
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
    data() {
      return {
        days: 0,
        hours: 0,
        minutes: 0
      }
    },
    methods: {
      updateTimer() {
        const tokenSaleStartDate = Date.UTC(2020, 10, 19, 0, 0, 0, 0); // Nov 19, 2020
        const timeDifference = tokenSaleStartDate - Date.now();
        this.days = timeDifference > 0 ? Math.floor(timeDifference / 86400000) : 0;
        this.hours = timeDifference > 0 ? Math.floor((timeDifference % 86400000) / 3600000) : 0;
        this.minutes = timeDifference > 0 ? Math.floor(((timeDifference % 86400000) % 3600000) / 60000) : 0;
      }
    },
    mounted() {
      window.setInterval(() => {
        this.updateTimer()
      }, 1000)
    },
  });
</script>

<style lang="scss" scoped>
  .main-container {
    display: table;
    margin: 0 auto;
  }
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 421px; // 100%
    height: 392px; // none
    background-size: contain; // none
    background-repeat: no-repeat; // none
    background-position: center; // none
    background-image: url("../assets/timer-background.svg");
    padding: 64px; // 16 px
  }
  .timer-header {
    display: flex;
    justify-content: space-evenly;
    border-top-left-radius: $br_sm;
    border-top-right-radius: $br_sm;
    border-color: $c_gray_100;
    border-width: 1px;
    border-style: solid;
    border-bottom-color: $c_gray_25;
  }
  .timer {
    padding-top: 14px;
    padding-bottom: 8px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-evenly;
    border-bottom-left-radius: $br_sm;
    border-bottom-right-radius: $br_sm;
    border-color: $c_gray_100;
    border-width: 1px;
    border-style: solid;
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
