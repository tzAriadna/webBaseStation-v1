<template>

    <div class="dataRoute" v-if='ospfData'>
      <div class="hForTable"><h1>Таблица OSPF соседей</h1></div>
      <table class="table">
        <tr>
          <th>Router ID</th>
          <th>Adj Address</th>
          <th>Adj Interface</th>
        </tr>
        <tr v-for="item in ospfData" :key="item">
          <td>{{item[0]}}</td>
          <td>{{item[1]}}</td>
          <td>{{item[2]}}</td>
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
      ospfData: [],
    }
  },
  mounted() {
    this.ospf_Data(); //сразу после загрузки страницы вызывается функция ospf_Data()
  },
  methods: {
    /**
     * Cразу после загрузки страницы вызывается функция ospf_Data(),
     * в котором отправляется запрос серверу для получения данных о таблице OSPF соседей
     */
    ospf_Data() {
      xhr.open( 'GET', `http://${urlHostName}/fcgi/ospf_table_monitoring`, true );
      xhr.send();
      xhr.onload = () => {
        /** полученные данные преобразованы из строки в объект, и присвоены к ospfData */
        this.ospfData = JSON.parse(xhr.response);
      }     
    },
  },
}
</script>

<style>

</style>