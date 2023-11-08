<template>
  <div class="home_monitoring">
    <ErrorData v-if="!this.ping || !wsDataMonitoring.header && !wsDataMonitoring.sysmon"></ErrorData>
    <div id="mainInformation">
      <div class="blockMainInformation main_inf" v-if='wsDataMonitoring.header && wsDataMonitoring.sysmon'>

        <div class="zagolovok">
          <h1 class='h1'>Основная информация</h1>
        </div>
        <div class="wrap_table">
          <div class="dataWs" v-for="(value, name) in this.wsDataMonitoring.header" :key="name">
            <label >{{ name }}</label> <span class="mainInform_value">{{ value }}</span>
          </div>
          <div class="dataWs" v-for="(value, name) in this.wsDataMonitoring.sysmon" :key="name">
            <label  >{{ name }}</label> <span class="mainInform_value">{{ value }}</span>
          </div>
          <div class="dataWs" v-for="item in this.wsDataMonitoring.wifi_sta.data" :key="item">
            <label  >{{ item.name }}</label> <span class="mainInform_value">{{ item.val }}</span>
          </div>
        </div>
      </div>

      <div class="blockMainInformation feeding" v-if="wsDataMonitoring.powermon">
        <div class="zagolovok zag_feeding">
          <h1 class='h1'>Питание</h1>
        </div>
        <div class="wrap_table">
          <div class="dataWs" v-for='(value, name) in this.wsDataMonitoring.powermon' :key="name">
            <label for="" >{{ name }}</label> <span>{{ value }}</span>
          </div>
          <div class="dataWs" v-for='item in this.wsDataMonitoring.gpio_power' :key="item">
            <label for="" >{{ item.name }}</label> 
            <span v-if="item.state">Вкл</span>
            <span v-else>Выкл</span>
          </div>
        </div>
      </div>
    </div>

    <div class="blockMonitoring" v-if="this.wsDataMonitoring.network">
      <div class="zagMonitoring"> <h1>Мониторинг</h1> </div>
      <table id='monitoringTable'>
        <tr class="hTable">
          <th>Статус</th>
          <th>Порт</th>
          <th>MAC-адрес</th>
          <th>IP-адрес</th>
          <th>Tx, bits/s</th>
          <th>Rx, bits/s</th>
        </tr>
        <tr v-for='item in wsDataMonitoring.network' :key="item">
          <td>
            <div v-show='item.operstate == "UP"' id="greenUp"></div>
            <div v-show='item.operstate == "DOWN" || item.operstate == "LOWERLAYERDOWN"' id="redDown"></div>
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.mac_addr }}</td>
          <td id="ip_address"> <label v-for='items in item.ip_addr' :key="items"><tr>{{ items }}</tr></label> </td>
          <td class="tx_rx">{{ item.stats64.tx_bps }}</td>
          <td class="tx_rx">{{ item.stats64.rx_bps }}</td>
        </tr>
      </table>
    </div>
    
  </div>
</template>

<script>
import ErrorData from '@/components/ErrorData.vue';
const xhr = new XMLHttpRequest();
const urlHostName = window.location.hostname;

export default {
  name: 'Home',
  components: {
    ErrorData,
  },
  data() {
    return {
      wsDataMonitoring: [],
      wsMonitoring: null,
      ping: true
    }
  },
  mounted() {
    const timeOut_threeSec = 3000;
    /** Раз в 3 секунды проверяется соединение с сервером через */
    setInterval( () => {
      this.pingConnection();
    }, timeOut_threeSec)
  },
  methods: {
    /** 
     * Проверка соединения путем отправки запроса серверу,
     * при получении ответа на запрос, создает веб-сокет соединение,
     * если ответ не пришел, то сервер не отвечает
     */
    pingConnection() {
        xhr.onload = () => {
          if (xhr.response) { 
            this.ping = true;
            this.webSocketMonitoring();
          } else { 
            console.log('Сервер не отвечает');
            this.ping = false;
            /** если веб-сокет открыт, то закрыть */
            if (this.wsMonitoring !== null) { this.wsMonitoring.close() }
          }
        }
        xhr.open('GET', `http://${urlHostName}/fcgi/header`);
        xhr.send();
      
    },
    /** создание сокет-соединения, 
     * если веб-сокет не создан, то создать и установить соединение */
    webSocketMonitoring() { 
    if (this.wsMonitoring === null || this.wsMonitoring.readyState !== WebSocket.OPEN) {
      if (this.wsMonitoring !== null) { this.wsMonitoring.close(); } 
        this.wsMonitoring = new WebSocket(`ws://${urlHostName}:80/ws/monitoring`);

        this.wsMonitoring.onopen = (event) => {
          console.log(`[open] Соединение установлено: ${event.code}`);
        }
        this.wsMonitoring.onmessage = (event) => {
          let wsArr = JSON.parse(event.data);
          
          /** для объекта network сокращены значения параметра stats64 в К или М  */
          if (wsArr.network) { 
            let n = 0;
            for ( let i = 0; i<wsArr.network.length; i++ ) { 
              let stats = wsArr.network[n].stats64;
              if (stats.tx_bps > 1000000) stats.tx_bps = (Math.trunc(stats.tx_bps/1000000)) + 'M';
              if (stats.tx_bps > 1000) stats.tx_bps = (Math.trunc(stats.tx_bps/1000)) + 'K';
              if (stats.rx_bps > 1000000) stats.rx_bps = (Math.trunc(stats.rx_bps/1000000)) + 'M';
              if (stats.rx_bps > 1000) stats.rx_bps = (Math.trunc(stats.rx_bps/1000)) + 'K';
              n++;
            }
          }
          /** полученные данные присвоены новому параметру */
          this.sortDataMon(wsArr);
          this.wsDataMonitoring = wsArr;
          console.log('[message] Данные WebSocketMonitoring получены...');
          this.ping = true;
        }

        /** полученные данные присвоены новому параметру */
        this.wsMonitoring.onerror = (error) => {
          console.log('[error] WebSocketMonitoring Error: ' + error);
          this.wsMonitoring.close();
          this.ping = false;
        }

        this.wsMonitoring.onclose = (event) => {
          if (event) {
            console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
          } else {
            console.log('Соединение прервано...');
            this.ping = false;
            const timeOut_twoSec = 2500;
            /** через каждые 2,5 секунд произвоидтся попытка переподключения */
            setInterval( () => {
              console.log("[reconnect] Попытка переподключения к серверу...")
              this.webSocketMonitoring();
            }, timeOut_twoSec)
          }
        }
      }
    },
    sortDataMon(wsArr) { //сортировка элементов по названию
      wsArr.network.sort(function(a, b){
      var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
      if (nameA < nameB)
        return -1
      if (nameA > nameB)
        return 1
      return 0 
      })
    }
  },
}
</script>

<style>

  .home_monitoring {
    padding: 50px 0;
  }
  .h1 {
    color: #FFB300;
  }
  #monitoringTable {
    border-radius: 10px;
    background: #616161;
  }
  .h1ForTable > 
  #monitoringTable th {
    background: #3B3B3B;
    padding: 10px;
    background-size: cover;
  }
  #mainInformation {
    display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-around;
  }
  .dataWs {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    color: #FFB300;
    width: 100%;
    font-size: 25px;
  }
  .blockMainInformation {
    /* min-width: 360px; */
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    background: #616161;
    border-radius: 10px;
    box-shadow: 0px 0.1px 0.3px 0px;
    width: 400px;
    height: 100%;
    margin-bottom: 2em;
  }
  .wrap_table {
    padding: 0 10px 10px 10px;
    width: 93%;
  }
  .main_inf {
    min-width: 390px;
    margin-right: 3%;
  }
  .feeding {
    min-width: 330px;
    max-width: 35px;
    margin-left: 3%;
  }
  .zagolovok {
    display: flex;
    justify-content: center;
    height: 10%;
    width: 100%;
    background:#363636; 
    border-radius: 10px 10px 0px 0px;
    position: relative;
    text-shadow: black 0px 3px 2px;
    bottom: 10px;
  }
  .blockMonitoring {
    max-width: 790px;
  }
  #monitoringTable {
    color: #FFB300;
    font-size: 24px;
    padding: 20px 0;
  }
  #monitoringTable > tr > td, 
  #monitoringTable th {
    padding: 10px;
  }
  .zagMonitoring {
    background: #363636;
    background-size: cover;
    width: 100%;
    height: 4em;
    top: 20px;
    position: relative;
    border-radius: 10px 10px 0px 0px;
    color: #FFB300;
    display: flex;
    justify-content: center;
    align-items: center;
    text-shadow: black 0px 3px 2px;
  }
  #greenUp {
    background: rgb(0, 255, 0);
    border-radius: 50%;
    width: 35px;
    height: 35px;
    border: 1px solid grey;
    box-shadow: 0px 1px 5px 3px rgba(30, 255, 0, 0.438);
    margin-left: 25%;
  }
  #redDown {
    background: rgb(255, 0, 0);
    border-radius: 50%;
    width: 35px;
    height: 35px;
    border: 1px solid grey;
    box-shadow: 0px 1px 5px 3px rgba(255, 30, 0, 0.438);
    margin-left: 25%;
  }
  .tx_rx {
    text-align: center;
  }

  @media screen and (max-width: 1280px) {
    .zagolovok {
      font-size: 14px;
    }
  }
  @media screen and (max-width: 1100px) {
    .main_inf {
      min-width: 360px;
    }
    .feeding {
      min-width: 300px;
    }
    .dataWs {
      font-size: 23px;
    }
    #monitoringTable {
      font-size: 22px;
    }
    #ip_address {
      margin-top: 6px;
    }
  }
  @media screen and (max-width: 780px) {
    .zagolovok {
      font-size: 14px;
    }
    .main_inf {
      min-width: 340px;
    }
    .feeding {
      min-width: 280px;
    }
    .dataWs {
      font-size: 21px;
    }
    .zagMonitoring {
      font-size: 14px;
    }
    #monitoringTable {
      font-size: 18px;
    }
    #monitoringTable > tr > td, 
    #monitoringTable th {
      padding: 8px;
    }
    #ip_address {
      margin-top: 8px;
    }
  }
  @media screen and (max-width: 670px) {
    #mainInformation {
      flex-direction: column;
      align-items: center;
    }
    .blockMainInformation {
      max-width: 360px;
    }
    .blockMonitoring {
      margin-top: -20px;
    }
    .feeding {
      margin-left: 0;
    }
    .main_inf {
      margin-right: 0;
    }
    #monitoringTable {
      font-size: 15px;
    }
    #monitoringTable > tr > td, 
    #monitoringTable th {
      padding: 5px;
    }
    #greenUp, #redDown {
      width: 30px;
      height: 30px;
    }
  }
  @media screen and (max-width: 530px) {
    .zagolovok {
      height: 4em;
      align-items: center;
    }
    #greenUp, #redDown {
      width: 20px;
      height: 20px;
    }
    #monitoringTable {
      font-size: 13px;
    }
    #ip_address {
      margin-top: 6px;
    }
  }
  @media screen and (max-width: 418px) {
    .dataWs {
      font-size: 18px;
    }
    .blockMainInformation {
      max-width: 300px;
      min-width: 250px;
    }
    #monitoringTable {
      font-size: 10px;
    }
    #monitoringTable > tr > td, 
    #monitoringTable th {
      padding: 10px 3px;
    }
    #ip_address {
      margin-top: 5px;
    }
  }
  @media screen and (max-width: 370px) {
    .blockMainInformation {
      max-width: 240px;
    }
    .zagolovok {
      font-size: 10px;
    }
    .zagMonitoring {
      font-style: 10px;
    }
    .h1 {
      font-size: 20px;
    }
    .dataWs {
      font-size: 15px;
    }
    #ip_address {
      margin-top: 6px;
    }
  }
</style>