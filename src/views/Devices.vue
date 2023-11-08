<template>
  <div>
    <div>
      <div class="hForTable" v-if='linkData'><h1>DHCP список</h1></div>
      <table class="table">
        <tr>
          <th>MAC addr</th>
          <th>IP addr</th>
          <th>Host name</th>
        </tr>
        <tr v-for="item in linkData" :key="item">
          <td>{{ item[0] }}</td>
          <td>{{ item[1] }}</td>
          <td>{{ item[2] }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
const xhr = new XMLHttpRequest();
const urlHostName = window.location.hostname;

export default {
  data() {
    return {
      linkData: [],
    }
  },
  mounted() {
    this.devicesLinked();
  },
  methods: {
    /**
     * Cразу после загрузки страницы вызывается функция devicesLinked(),
     * в котором отправляется запрос серверу для получения данных о DHCP списке
     */
    devicesLinked() {
      xhr.open( 'GET', `http://${urlHostName}/fcgi/dumpleases` );
      xhr.send();
      xhr.onload = () => {
        /** полученные данные преобразованы из строки в объект, и присвоены к linkData */
        this.linkData = JSON.parse(xhr.response);
      }
    }
  },  
}
</script>

<style scoped>
  table {
    table-layout: fixed;
    width:100%
  }
  td {
    word-wrap:break-word;
  }
  @media only screen and (max-width: 400px) {
    tr {
      font-size: smaller;
    }
  }
</style>
