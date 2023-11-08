<template>
  <div>
    <div class="hForTable" v-if='neighData'><h1>Таблица ARP</h1></div>
    <table class="table">
      <tr>
        <th>DST</th>
        <th class="interface">INTERFACE</th>
        <th>MAC</th>
        <th>STATE</th>
      </tr>
      <tr v-for="item in neighData" :key="item">
        <td>{{ item.dst }}</td>
        <td class="wlan">{{ item.dev }}</td>
        <td>{{ item.lladdr }}</td>
        <td class="state">{{ item.state[0] }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
/**
 * параметр urlHostName содержит доменное имя URL
 * XMLHttpRequest - даёт возможность делать HTTP-запросы к серверу без перезагрузки страницы
 */
const xhr = new XMLHttpRequest();
const urlHostName = window.location.hostname;

export default {
  data() {
    return {
      neighData: [],
    }
  },
  mounted() {
    this.ipNeighData();
  },
  methods: {
    /**
     * Cразу после загрузки страницы вызывается функция ipNeighData(),
     * в котором отправляется запрос серверу для получения данных о таблице ARP
     */
    ipNeighData() {
      xhr.open( 'GET', `http://${urlHostName}/fcgi/ip_neigh`, true ); 
      xhr.onload = () => {
        /** полученные данные преобразованы из строки в объект, и присвоены к neighData */
        this.neighData = JSON.parse(xhr.response); 
      }
    },
  },
}
</script>

<style scoped>
  .wlan {
    text-align: center;
  }
  td:first-child {
    text-align: left;
  }
  td:last-child {
    font-size: 16px;
  }
  @media only screen and (max-width: 530px) {
    td:last-child {
      font-size: 11px;
    }
  }
  @media only screen and (max-width: 400px) {
    td:last-child {
      font-size: smaller;
    }
    tr {
      font-size: smaller;
    }
  }
  @media only screen and (max-width: 340px) {
    .interface, 
    th:last-child {
      font-size: smaller;
    }
  }
</style>