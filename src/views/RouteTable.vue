<template>

    
    <div class="dataRoute" v-if='routeData'>
      <div class="hForTable"><h1>Таблица маршрутизации</h1></div>
      <table class="table">
        <tr>
          <th>DST</th>
          <th>GATEWAY</th>
          <th class="interface">INTERFACE</th>
          <th>METRIC</th>
        </tr>
        <tr v-for="item in routeData" :key="item">
          <td>{{ item.dst }}</td>
          <td>{{ item.gateway }}</td>
          <td class="wlan">{{ item.dev }}</td>
          <td>{{ item.metric }}</td>
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
      routeData: [],
    }
  },
  mounted() {
    this.ipRouteData();
  },
  methods: {
    ipRouteData() {
      /**
     * Cразу после загрузки страницы вызывается функция ipRouteData(),
     * в котором отправляется запрос серверу для получения данных о таблице OSPF соседей
     */
      xhr.open( 'GET', `http://${urlHostName}/fcgi/ip_route`, true );
      xhr.send();
      xhr.onload = () => {
        /** полученный овтет преобразован в объект, и присвоен к routeData */
        this.routeData = JSON.parse(xhr.response);
      }
    },

  },
}
</script>

<style scoped>
  .wlan {
    text-align: center;
  }
  @media only screen and (max-width: 400px) {
    tr {
      font-size: smaller;
    }
  }
  @media only screen and (max-width: 340px) {
    .interface {
      font-size: smaller;
    }
  }
</style>