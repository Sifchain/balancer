<template>
    <div class="timer-container">
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
          <p class="start-date">December 10th, 12:00am GMT</p>
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
        const tokenSaleStartDate = Date.UTC(2020, 11, 10, 0, 0, 0, 0); // Dec 10, 2020
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
  .timer-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 392px;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-image: url("../assets/timer-background.svg");
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
