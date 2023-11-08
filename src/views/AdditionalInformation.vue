<template>
  <div>
    <div class="home_addInf">
        <AdhocTable class="adhoc leftTable"></AdhocTable>
        <OspfTable class="ospf leftTable"></OspfTable>
        <Devices class="devices"></Devices>
        <RouteTable class="route"></RouteTable>
        <ArpTable class="arp"></ArpTable>
    </div>
  </div>
</template>

<script>
import AdhocTable from './AdhocTable.vue';
import ArpTable from './ArpTable.vue';
import RouteTable from './RouteTable.vue';
import Devices from './Devices.vue';
import OspfTable from './OspfTable.vue';

export default {
  name: 'AdditionalInformation',
  components: {
    AdhocTable,
    ArpTable,
    RouteTable,
    Devices,
    OspfTable,
  }
}
</script>

<style>
  .home_addInf {
    padding: 50px 0;
    display: grid;
    grid-template-areas:  "adhoc ospf devices"  
                          "route arp arp";
    grid-template-columns: 1fr 1fr 1fr;  
    grid-template-rows: auto auto; 
  }
  .adhoc {
    grid-area: adhoc;
  }
  .route {
    grid-area: route;
    margin-top: 25px;
  }
  .ospf {
    grid-area: ospf;
    margin-right: 60px;
  }
  .devices {
    grid-area: devices;
    min-width: 380px;
  }
  .arp {
    grid-area: arp;
    margin-top: 25px;
    justify-self: center;
    width: 78%;
  }
  .leftTable {
    width: 398px;
  }
  .hForTable {
    background: #363636;
    background-size: cover;
    width: 100%;
    height: 4em;
    /* position: relative; */
    z-index: 1;
    border-radius: 10px 10px 0px 0px;
    color: #FFB300;
    display: flex;
    justify-content: center;
    align-items: center;
    text-shadow: black 0px 3px 2px;
  }
  .hForTable h1 {
    font-size: 25px;
  }
  .table {
    background: #636363;
    border-radius: 0px 0px 10px 10px;
    width: 100%;
    font-size: 19px;
    padding-left: 8px;
  }
  .table td, 
  .table th {
    padding: 10px 5px;
    color: #ffb300;
    text-align: center;
  }
  @media only screen and (max-width: 1360px) {
    .home_addInf {
      grid-template-areas:  "adhoc devices"  
                            "ospf route"
                            "arp arp"; 
      grid-template-columns: 420px auto;  
      grid-template-rows: auto auto; 
    }
    .arp {
      width: 68%;
    }
    .ospf {
      margin-top: 25px;
      margin-right: 0;
    }
  }
  @media only screen and (max-width: 920px) {
    .home_addInf {
      grid-template-areas:  "adhoc ospf"  
                            "devices devices"
                            "route route"
                            "arp arp"; 
      grid-template-columns: auto auto;
    }
    .adhoc {
      padding-right: 20px;
      width: 265px;
    }
    .ospf {
      margin-top: 0;
      width: 378px;
    }
    .devices, .route, .arp {
      margin-top: 25px;
      justify-self: center;
      width: 100%;
    }
    .hForTable h1 {
      font-size: 24px;
    }
    .table {
      font-size: 18px;
    }
  }

  @media only screen and (max-width: 690px) {
    .home_addInf {
      grid-template-areas:  "adhoc"
                            "ospf"  
                            "devices"
                            "route"
                            "arp"; 
      justify-items: center;
    }
    .adhoc {
      padding: 0;
      width: 67%;
    }
    .ospf {
      margin-top: 25px;
    }
    .leftTable {
      width: 100%;
    }
    .table {
      font-size: 15px;
    }
    .hForTable h1 {
      font-size: 20px;
    }
    .table td, 
    .table th {
      padding: 10px 3px;
    }
    .devices {
      width: 100%;
    }
  }

  @media only screen and (max-width: 500px) {
    .table {
      font-size: 11px;
    }
    .arp, .ospf, .devices, .route, .adhoc {
      width: 100%;
    }
  }
  @media only screen and (max-width: 400px) {
    .hForTable {
      height: 3em;
    }
    .hForTable h1 {
      font-size: 17px;
    }
    .devices {
      min-width: 300px;
    }
  }
</style>