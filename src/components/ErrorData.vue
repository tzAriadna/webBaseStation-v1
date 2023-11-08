<template>
  <div id="warningData">
    <h1 id="errorData" style="color: red;">ВНИМАНИЕ! ПОТЕРЯНО СОЕДИНЕНИЕ С УСТРОЙСТВОМ...</h1>
  </div>
</template>

<style>
  #errorData {
    color: red;
    text-shadow: black 3px 3px 2px;
  }
  #warningData {
    display: flex;
    text-align: center;
  }
  @media screen and (max-width: 420px) {
    #errorData {
      font-size: 24px;
    }
  }
</style>