<template>
<div class="home_setting">
  <ErrorData v-if="!dataSettings"></ErrorData>
  
  <table id="settingsGlobal">
      <caption>НАСТРОЙКИ</caption>
      <thead>
          <tr>
              <th>Название</th> <th>ip-aдрес</th> <th>Ручной режим</th> <th>Скорость</th>
          </tr>
      </thead>
      <tbody >
          <tr v-for="item in dataSettings.network" :key="item">
              <td> 
                <label class="portNameIp" for="ipValueForSettings" >{{ item.name }}</label>
              </td> 
              <td class="inputLine">      
                <input 
                  :disabled='!item.manual'
                  class="enterIp" 
                  name="ipValueForSettings" 
                  type="text" 
                  :value="item.ip_addr" 
                  pattern="(25[0-4]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([1][6-9]|[2][0-9]|[3][0-1]))"
                >
              </td> 
              <td>
                <input 
                  @change="allowInput()" 
                  type="checkbox" 
                  class="manualValue" 
                  :value="item.manual" 
                  :checked='item.manual'
                >
              </td> 
              <td  >
                <select class="speedIp">
                  <option
                    :disabled='speedBool'
                    v-for="option in options" 
                    v-bind:value="option.value"
                    :key="option" 
                    :selected="option.value == item.speed"
                  >
                    {{ option.text }}
                  </option>
                </select>
             </td>
          </tr>
          <tr>
              <th colspan="2">Название</th> <th colspan="2">Значение</th>
          </tr>
          <tr v-for='(value, name) in dataSettings.header' :key='value'>
            <td colspan="2"> 
                <label class='netnumNames'>{{ name }}</label>
            </td>
            <td colspan="2"> 
                <input class='enterValue' :value='value' />
            </td>
          </tr>
          <tr>
              <th colspan="2">Название</th> <th colspan="2">Вкл/Выкл</th>
          </tr>
          <tr v-for="gpio in dataSettings.gpio_power" :key="gpio">
            <td colspan="2"> 
                <label class="gpioNames" for='checkBox'>{{ gpio.name }}</label>
            </td>
            <td colspan="2"> 
                <input class="checkBoxValue" type="checkbox" name="checkBox" :checked='gpio.state' :id="gpio.name">
            </td>
          </tr>
      </tbody>
  </table>


  <div class="settingsMain" style="display: flex;" v-if="dataSettings">
    <button class="btnForInterface" id="acceptSettings" @click="acceptSettings()">
      <span class="textForBtn" id="textForBtn">Установить настройки</span>
      <img class="loaderForBtn" id="loaderForBtn" src="../assets/load.svg" alt="" style="display:none;">
      <img class="okForBtn" id="okForBtn" src="../assets/ok.svg" alt="" style="display:none;">
      <img class="notOkForBtn" id="notOkForBtn" src="@/assets/notOk.svg" alt="Ошибка" style="display:none;">
    </button>
    <button class="btnForInterface" id="rebootBs" @click="rebootBs()">
      <span class="textForBtn" id="textForBtn2">Перезагрузка</span>
      <img class="loaderForBtn" id="loaderForBtn2" src="../assets/load.svg" alt="" style="display:none;">
      <img class="okForBtn" id="okForBtn2" src="../assets/ok.svg" alt="" style="display:none;">
      <img class="notOkForBtn" id="notOkForBtn2" src="@/assets/notOk.svg" alt="Ошибка" style="display:none;">
    </button>
    <button class="btnForInterface" id="deinitialize" @click="deinitialize()" >
      <span class="textForBtn" id="textForBtn3">Общий сброс</span>
      <img class="loaderForBtn" id="loaderForBtn3" src="../assets/load.svg" alt="" style="display:none;">
      <img class="okForBtn" id="okForBtn3" src="../assets/ok.svg" alt="" style="display:none;">
      <img class="notOkForBtn" id="notOkForBtn3" src="@/assets/notOk.svg" alt="Ошибка" style="display:none;">
    </button>
  </div>

</div>
</template>

<script>
/** router нужeн для перекидывания на страницу авторизации */
import router from '@/router/index.js'
import ErrorData from '@/components/ErrorData.vue';
import axios from 'axios';

const urlHostName = window.location.hostname; 
const ipValue = document.getElementsByClassName('enterIp');
const manualValue = document.getElementsByClassName('manualValue');
const speedParams = document.getElementsByClassName('speedIp');
const portNameIp = document.getElementsByClassName('portNameIp');

export default {
  components: {
    ErrorData,
  },
  data() {
    return {
      dataSettings: {},
      options: [ 
        { id: 'wlan', text: 'Disable', value: '0' },
        { id: 'lan', text: '10', value: '3' },
        { id: 'lan', text: '100', value: '2' },
        { id: 'lan', text: '1000', value: '1' },
      ],
    }
  },
  
  mounted() {
    /** при открытии страницы или обновлении вызывается responseGet() для получения данных с сервера */
    this.responseGet();
  },

  /** функции вызываются 1 раз после изменения данных в компоненте и перерисовки DOM */
  updated: function(){
    this.deleteOptions(); 
    this.allowInput(); 
  },

  methods: {
    /**
     * Запрос для получения данных, которые необходимо отобразить на странице.
     * Запрос сопровождается с access-токеном, 
     * если access_token пройдет проверку на сервере, то мы получим  ответ response, 
     * в котором будут находится данные. Присвоим их к параметру dataSettings.
     * Если запрос не принят, произошла ошибка или access_token не действительный.
     */
    responseGet() {
      axios.get(`http://${urlHostName}:80/fcgi/get_settings` , {
        headers: {'Authorization': `${localStorage.access_token}`}
      }).then(response => {
        this.dataSettings = response.data; 
      })
      .catch ((err) => {
        this.funcErr(err);
      });
    },
    /** 
     * Генерация события в дочернем компоненте (SettingWidget.vue) и обработка в родительском (App.vue), 
     * в котором вызывается функция enter_exit() */
    back() {
      this.$emit('func');
    },

    /** Функия, удалающая ненужные значения в выпадающем списке скоростей сети */
    deleteOptions() {
      let n = 0;
      let nameNetwork = null;
      for (let i = 0; i<speedParams.length; i++) {
        nameNetwork = portNameIp[n].textContent;
        if ((nameNetwork !== 'wlan1') && (nameNetwork !== 'wlan1_1') && (nameNetwork !== 'wlan0')) {
          for (let j = 0; j < speedParams[n].options.length; j++) {
            if (speedParams[n].options[j].value == '0') {
              speedParams[n].options[j].remove();
          } }
        } else {
          for (let j = 0; j < speedParams[n].options.length; j++) {
            if (speedParams[n].options[j].value !== '0' ) {
              speedParams[n].options[j].remove();
          } }
          speedParams[n].disabled = true;
        }
        n++;
      }
    },

    /** Jтображение анимациb "загрузка" при нажатии на кнопки */
    loaderForButtons (buttonId, loaderId, textId) {
      const btnAni = document.getElementById(buttonId);
      const loader = document.getElementById(loaderId);
      const textBtn = document.getElementById(textId);
      
      btnAni.disabled = true;
      textBtn.style.display = 'none';
      btnAni.classList.toggle("loadButton");
      loader.style.display = 'inline';
    },
    /** Отображение "галочки" или "крестика" после "загрузки", в зависимости от полученных параметров */
    okOrNotForButtons (buttonId, loaderId, okOrNot, textId) {
      const btnAni = document.getElementById(buttonId);
      const loader = document.getElementById(loaderId);
      const okOrNotLoad = document.getElementById(okOrNot);
      const textBtn = document.getElementById(textId);
      
      /** через 1 секунду отобразится "галочка" или "крестик" */
      setTimeout(() => {
        loader.style.display = 'none';
        okOrNotLoad.style.display = 'inline';
      }, 1000)
      
      /** через 2 секунды вернется надпись внутри кнопки */
      setTimeout(() => {
        okOrNotLoad.style.display = 'none';
        btnAni.classList.toggle("loadButton");
        textBtn.style.display = 'inline';
        btnAni.disabled = false;
      }, 2000)
    },

    /** функция запрета ввода IP-адреса при выключенном ручном режиме */
    allowInput() {
      let n = 0;
      for ( let i = 0; i<ipValue.length; i++ ) {
        if ( manualValue[n].checked ) {
          ipValue[n].disabled = false;
          ipValue[n].classList.add("ipBackground");
        } else {
          ipValue[n].disabled = true;
          ipValue[n].classList.remove("ipBackground");
        }
        n++;
      }
    }, 
    
    /** функция вызывается при нажатии на кнопку "Установить настройки" */
    acceptSettings() {
      const gpioNamesParams = document.getElementsByClassName('gpioNames');
      const checkGpio = document.getElementsByClassName('checkBoxValue');
      const netnumNames = document.getElementsByClassName('netnumNames');
      const netnumValue = document.getElementsByClassName('enterValue');
      
      /** 
       * Созданны новые параметры для отправки их к серверу для изменения настроек.
       * В массиве portNames хранится инфорамация о названии портов
       */
      let n = 0;
      let portNames = [];
      let network = []; 
      let manual = null; 
      for (let i = 0; i<portNameIp.length;i++ ) {
        portNames.push( portNameIp[n].textContent );
        n++;
      }
      
      /** Массив network заполняется информацией о названии порта, IP-адресе, ручном режиме и о скорости.  */
      n = 0;
      for ( let i = 0; i<ipValue.length; i++ ) { 
        if ( manualValue[n].checked ) {
          manual = true; 
          ipValue[n].disabled = false;
        } else {
          manual = false;
          ipValue[n].disabled = true;
        }
        network.push( `{"name":"${portNames[n]}","ip_addr":["${ipValue[n].value}"],"manual":${manual},"speed":${speedParams[n].value}}` );
        n++;
      }

      /** Массив gpioPower содержит информ. о вкл. или выкл. питания */
      let gpioPower = [];
      n = 0;
      for ( let i = 0; i<gpioNamesParams.length;i++ ) {
        gpioPower.push( `{"state":${checkGpio[n].checked},"name":"${gpioNamesParams[n].textContent}"}` );
        n++;
      }
      
      /** массивы содержат информ. о подсети и сети */
      let namesNetnum = [];
      let valueNetnum = [];
      n = 0
      for (let i = 0; i<netnumNames.length; i++) {
        /** информ. о названии: "номер подсети" и "номер сети" */
        namesNetnum.push(netnumNames[n].textContent);
        n++;
      }
      n = 0;
      for (let i = 0; i<netnumValue.length; i++) {
        /** инфром. о номере подсети или сети */
        valueNetnum.push(`"${namesNetnum[n]}":${netnumValue[n].value}`);
        n++
      }

      /** создание нового объекта со всеми данными, и его отправка на сервер с запросом */
      let newSettingsMassive = `{"header":{${valueNetnum}},"gpio_power":[${gpioPower}],"network":[${network}]}`;
      /** параметры которые передаются okOrNotForButtons() для анимации "загрузки", "галочки" или "крестика" */
      let arrForLoad = { 
        buttonId: 'acceptSettings',
        loaderId: 'loaderForBtn',
        textId: 'textForBtn',
        ok: 'okForBtn',
        notOk: 'notOkForBtn',
      }
      this.loaderForButtons(arrForLoad.buttonId, arrForLoad.loaderId, arrForLoad.textId);
      /** 
       * Параметру arrPesponce присвоена информ. о запросе на установку настроек.
       * запрос должен имеет заголовок с access-токеном,
       * и тело, в котором находится массив с измененными данными.
       */
      let arrResponse = {
        method: `post`, 
        url: `http://${urlHostName}:80/fcgi/set_settings`,  
        headers: { 'Authorization': `${localStorage.access_token}` }, 
        data: newSettingsMassive
      }
      /** вызывается функция responseForBtn(), в котором выполнится запрос на сервер, в соответствии с переданными параметрами */
      this.responseForBtn(arrForLoad, arrResponse);
    },

    /** Функция выполняется при клике на кнопку "перезагрузка" */
    rebootBs() {
      /** параметр arrPesponce содержит информ. о запросе перезагрузки */
      let arrForLoad = {
        buttonId: 'rebootBs',
        loaderId: 'loaderForBtn2',
        textId: 'textForBtn2',
        ok: 'okForBtn2',
        notOk: 'notOkForBtn2',
        warning: 'Подождите! Устройство перезагружается!'
      }
      let rebootQuestion = confirm( 'Перезагрузить устройство?' );
      if ( rebootQuestion ) {
        this.loaderForButtons(arrForLoad.buttonId, arrForLoad.loaderId, arrForLoad.textId);
        /** 
         * Параметру arrPesponce присвоена информ. о запросе для выполнения перезагрузки
         * запрос должен имеет заголовок с access-токеном 
         */
        let arrResponse = {
          method: `get`, 
          url: `http://${urlHostName}:80/fcgi/reboot`,  
          headers: { 'Authorization': `${localStorage.access_token}` },
        }
        this.responseForBtn(arrForLoad, arrResponse);
      }
    },

    /** функция выполняется при клике на кнопку "Общий сброс" */
    deinitialize () {
      let arrForLoad = {
        buttonId: 'deinitialize',
        loaderId: 'loaderForBtn3',
        textId: 'textForBtn3',
        ok: 'okForBtn3',
        notOk: 'notOkForBtn3',
        warning: 'Подождите! Настройки сбрасываются!'
      }
      let deinitializeQuestion = confirm( 'Сбросить настройки?' );
      if ( deinitializeQuestion ) {
        this.loaderForButtons(arrForLoad.buttonId, arrForLoad.loaderId, arrForLoad.textId);
        let arrResponse = {
          method: `get`, 
          url: `http://${urlHostName}:80/fcgi/deinitialize`,  
          headers: { 'Authorization': `${localStorage.access_token}` },
        }
        this.responseForBtn(arrForLoad, arrResponse);
      }
    },

    /** 
     * Функция выполняет запрос к серверу, 
     * данные для запроса берутся с переданного параметра arrResponse.
     * Если ответ получен, то запрос принят. 
     */
    responseForBtn(arrForLoad, arrResponse) {
      axios( arrResponse 
      ).then(response => {
        if (response) { 
          /** вызывается функция, в котором анимация "загрузка" меняется на "галочка" */
          this.okOrNotForButtons(arrForLoad.buttonId, arrForLoad.loaderId, arrForLoad.ok, arrForLoad.textId); 
          console.log('Успешно');
          /** если есть предупреждающее сообщение warning, то через 4 секунды, появляется всплывающее окно с преудпреждающим сообщением  */
          if (arrForLoad.warning) {
            setTimeout(() => {
              alert(arrForLoad.warning)
            }, 4000)
          }
        }
      }).catch ((err) => {
        /** если запрос не принят, то вызывается функция funcErr() */
        this.funcErr(err, arrForLoad, arrResponse);
      });
    },

    /** 
     * Функция срабатывающая при ошибке.
     * Если статус ошибки == 403, то уровень доступа ограничен, необходимо авторизоваться.
     * Если статус ошибки == 401, то истек срок жизни access_token.  Необходима реавторизация
     * Если статус ошибки == 400, то истек срок жизни refresh_token. Автоматически перекидывается на окно авторизации
     */
    funcErr(err, arrForLoad, arrResponse) { 
      console.log("Server response: " + err.response.status); 
      if (err.response.status == 403) {
        /** срабатывает анимация "крестик" */
        this.okOrNotForButtons(arrForLoad.buttonId, arrForLoad.loaderId, arrForLoad.notOk, arrForLoad.textId);
        alert('Пожалуйста пройдите авторизацию. Ваш уровень доступа ограничен!')
        this.responseGet();
      } else {
        if (err.response.status == 401) {
          console.log('need reauth');
          /** для реавторизации отправляем запрос с двумя токенами */
          axios.post(`http://${urlHostName}:80/fcgi/reauth` , { 
            "access_token": localStorage.access_token, 
            "refresh_token": localStorage.refresh_token
          }).then(response => {
            /** 
             * Если запрос принят, то в сервера ответе находятся 2 новых токена:
             * пересохраняем access_token в localStorage,ж 
             * пересохраняем refresh_token в localStorage
             */
            localStorage.access_token = response.data.access_token; 
            localStorage.refresh_token = response.data.refresh_token;
            console.log('токены обновлены');
            /**
             * Если в запросе был параметр arrPesponse,
             * то пересохраняем в arrResponse свойство headers,
             * заново отправляем запрос на сервер с новым access-токеном,
             * иначе выполняем responseGet(), получаем данные для отображения повторно
             */
            if (arrResponse){ 
              arrResponse.headers = { 'Authorization': `${localStorage.access_token}` }
              this.responseForBtn(arrForLoad, arrResponse)
            } else {
              this.responseGet();
            }
          }).catch ((er) => {
            console.log("Server response: " + er.response.status);
            if (er.response.status == 400) {
              localStorage.user = '';
              /** автоматически перекидывается на страницу авторизации */
              router.push({name: 'Authorization'})
              this.back(); /** передается информация родительскому компоненту App.vue */
            }
          });
        } else {
          /** Если ошибка другая, то выводим его в консоль. */
          if (arrForLoad) {
            /** После анимации "загрузка" отображается "крестик". */
            this.okOrNotForButtons(arrForLoad.buttonId, arrForLoad.loaderId, arrForLoad.notOk, arrForLoad.textId);
          }
          console.log('другая ошибка: ' + err);
        }
      }
    },

  }
}
</script>

<style>
.home_setting {
  margin-top: 150px;
}
  #settingsGlobal {
    background: #636363;
  }
  .settingsForIp, .netnumSettings, .gpioSettings {
    display:flex;
    justify-content: space-between;
    align-items:center;
    width:70%;
  }
  caption {
    background: #363636;
    font-size: 26px;
    height: 2em;
    border-radius: 10px 10px 0px 0px;
    color: #FFB300;
    text-shadow: black 0px 3px 2px;
    bottom: 10px;
    padding-top: 15px;
  }
 .btnForInterface {
    margin: 30px;
    width: 324px;
    height: 64px;
    background: #616161;
    background-repeat: no-repeat;
    background-position: center;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    box-shadow: 0px 1px 4px 0.65px;
    border-radius: 40px;
    border: 0;
    font-size: 24px;
    cursor:pointer;
    transition-duration: 0.1s;
    position: relative;
  }
  .enterIp, .enterValue {
    width: 300px;
    height: 30px;
    background: #8C8C8C;
    border: 1px solid #C2C2C2;
    border-radius: 10px;
    text-align: center;
  }
  .enterIp:hover, .enterValue:hover {
    box-shadow: 0.5px 0.5px 10px 0.1px white;
    outline: none;
  }
  .enterIp:focus, .enterValue:focus {
    box-shadow: 0.5px 0.5px 10px 0.1px white;
    outline: none;
  }
  .enterIp:invalid, .enterValue:invalid {
    box-shadow: 0.5px 0.5px 10px 0.1px red;
    border: 1px solid red;
    content: 'Invalid Syntax';
  }
#settingsGlobal {
 border-radius: 0px 0px 10px 10px;
}
#settingsGlobal td {
  text-align: center;
  vertical-align: middle;
}
 .btnForInterface:hover {
  box-shadow: 0.5px 0.5px 5px 0.5px white;
 }
 .loadButton {
  width: 64px;
 }
 .notOkForBtn {
  width: 20em;
 }
 .enterValue,
 .ipBackground {
  background: #d7d7d7;
 }

 @media screen and (max-width: 1100px) {
  .btnForInterface {
    width: 270px;
  }
  .loadButton {
    width: 64px;
  }
 }
 @media screen and (max-width: 950px) {
  .btnForInterface {
    width: 220px;
    margin: 30px 23px;
  }
  .loadButton {
    width: 64px;
  }
 }
 @media screen and (max-width: 820px) {
  .home_setting {
    margin: 140px 0 50px 0;
  }
 }
  @media screen and (max-width: 800px) {
    .btnForInterface {
      width: 180px;
      margin: 30px 10px;
    }
    .enterIp, .enterValue {
      width: 250px;
    }
    .btnForInterface {
      font-size: 22px;
    }
    .loadButton {
      width: 64px;
    }
  }
  @media screen and (max-width: 630px) {
    .enterIp, .enterValue {
      width: 200px;
    }
    .btnForInterface {
      width: 150px;
      height: 56px;
      font-size: 20px;
    }
    .loadButton {
      width: 64px;
    }
  }
  @media screen and (max-width: 510px) {
    .enterIp, .enterValue {
      width: 154px;
    }
    .settingsMain {
      flex-direction: column;
      margin-top: 15px;
    }
    .btnForInterface {
      width: 246px;
      margin: 11px 10px;
    }
    .loadButton {
      width: 64px;
      margin-left: 40%;
    }
  }
  @media screen and (max-width: 430px) {
    .home_setting {
      margin-top: 120px;
    }
    .enterIp, .enterValue {
      width: 134px;
    }
    caption {
      font-size: 23px;
    }
    .portNameIp {
      font-size: 15px;
    }
    .btnForInterface {
      font-size: 20px;
    }
    .loadButton {
      width: 64px;
      margin-left: 40%;
    }
  }
  @media screen and (max-width: 390px) {
    .enterIp, .enterValue {
      width: 124px;
    }
    #settingsGlobal {
      padding: 10px 0;
    }
    .loadButton {
      width: 64px;
      margin-left: 40%;
    }
  }
  @media screen and (max-width: 365px) {
    .home_setting {
      margin-top: 100px;
    }
    .enterIp, .enterValue {
      width: 96px;
      font-size: 12px;
    }
    .btnForInterface {
      width: 224px;
      height: 50px;
      margin: 8px 10px;
    }
    caption {
      font-size: 20px;
    }
    .loadButton {
      width: 52px;
      margin-left: 40%;
    }
    .loaderForBtn {
      width: 60px;
    }
  }
</style>