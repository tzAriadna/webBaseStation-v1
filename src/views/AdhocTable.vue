<template>
  <div>
    <div class="hForTable" v-if='wifiData'><h1>Станции AdHoc</h1></div>
    <table class="table">
      <tr>
        <th>MAC addr</th>
        <th>PowerLevel, dBm</th>
      </tr>
      <tr v-for="item in wifiData" :key="item">
        <td>{{ item[0] }}</td>
        <td>{{ item[1] }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
const xhr = new XMLHttpRequest();
const urlHostName = window.location.hostname;

export default {
  data() {
    return {
      wifiData: [],
      ping: false,
    }
  },
  mounted() {
    this.wifiResponse();
  },
  methods: {
    /**
     * Cразу после загрузки страницы вызывается функция wifiResponse(),
     * в котором отправляется запрос серверу для получения данных о станции AdHoc
     */
    wifiResponse() {
      xhr.open( 'GET', `http://${urlHostName}/fcgi/wifi_adhoc`, true );
      xhr.send();
      xhr.onload = () => {
        /** если пришел ответ, то полученную строку преобразовываем в объект */
        this.wifiData = JSON.parse(xhr.response);
      }
    },
  },
}
</script>
<style scoped>
  td {
    text-align: center;
  }
</style>