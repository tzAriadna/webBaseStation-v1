<template>
  <div id="Main">
    <div id="preloader">
      <div id="loader"></div>
    </div>
    <div id="content">
    <div id="menu" :class="{ 'show_auth' : isShowAuth }">
      <div class="menu_start">
        <img class="menu_logo" src="@/assets/logo_orange.png" alt="">
        <h1 class="menu_master">{{extended}}</h1>
      </div>
      <div class="menu_buttons" :class="{ 'show' : isShow }">
        <router-link class="menuPunkt" active-class="active" :to="{ name: 'Monitoring' }" @click="burger()">МОНИТОРИНГ</router-link>
        <router-link class="menuPunkt menuPunkt_addInf" active-class="active" :to="{ name: 'AdditionalInformation' }" @click="burger()">ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ</router-link>
        <router-link class="menuPunkt" active-class="active" :to="{ name: 'Settings' }" @click="burger()">НАСТРОЙКИ</router-link>
        <div class="menuPunkt lastPunkt"></div>
      </div>
      <div id="connectionWithBS"> 
        <label class = "connection_Master08" for="">Связь с {{extended}}:</label>
        <div class="connection_signal">
          <div class="lvlConnection" id="lvl1"></div>
          <div class="lvlConnection" id="lvl2"></div>
          <div class="lvlConnection" id="lvl3"></div>
        </div>
        <div class="buttons_auth" :class="{ 'show' : isShow }" @hide='onHide' v-if="!isShowAuth">
          <router-link  id="exit" v-if="this.user && this.user != 'guest'" :to="{ name: 'Authorization' }" @click='enter_exit()'>Выйти</router-link>
          <router-link  id="enter" v-if="!this.user || this.user == 'guest'" :to="{ name: 'Authorization' }" @click='enter_exit()'>Войти</router-link>
        </div>
      </div>
      <div class="menuBurger"  @click="burger()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path d="M88 152h336M88 256h336M88 360h336" fill="none" stroke="#616161" stroke-linecap="round" stroke-miterlimit="10" stroke-width="48px" class="stroke-000000"/>
        </svg>
      </div>
    </div>
    <div class="contentForRoute">
    <router-view class="viewRoute"  @func="enter_exit" :class="{ 'show' : isShow }" v-slot='{Component}'>
      <Transition name="contentVue" mode="out-in">
        <component :is='Component' />
      </Transition>
    </router-view>
    </div>
  
    <footer id="footer">
       <p id="copy"> © НПФ "Гранч", {{ new Date().getFullYear() }}</p>
    </footer>
    </div>
  </div>
</template>

<script>
/**
 * параметр urlHostName содержит доменное имя URL
 * XMLHttpRequest - даёт возможность делать HTTP-запросы к серверу без перезагрузки страницы
 */
const urlHostName = window.location.hostname; 
const xhr = new XMLHttpRequest(); 

export default {
  name: 'App',
  data() {
    return {
      user: '',
      isShow: false,
      isShowAuth: '',
      extended: null    
    }
  },

  mounted() {
    /** вызов функции проверки соединения с сервером */
    this.pingConnection();
    const timeOut_oneSec = 1000; 
    /**
     * каждую секунду присваиваются следующие параметры:
     * - помощью параметра user отображаются кнопки "войти" и "выйти"
     * - к помощью параметра isShowAuth создается свойство реагирования мышки на шапку страницы (pointer-events)
     */
    setInterval( () => {  
      this.user = localStorage.user;
      this.isShowAuth = document.isShowAuth;
    }, timeOut_oneSec);
    const _this = this; 
    /** функция реагирования на клики */
    document.addEventListener('click',function(){
      if (_this.debug === 1) {
        _this.debug = 0
        return
      }
      if (_this.debug === 0) {
        _this.isShow = false
      }
    });
  },

  methods: {
    /** по нажатию на кнопку бургера открывается (закрывается) бургер-меню */
    burger() { 
      this.isShow = !this.isShow;
      if (this.isShow) {
        this.debug = 1
      } else {
        this.debug = 0
      }
    },

    /** проверка соединения с сервером */
    pingConnection() { 
      const lvl1 = document.getElementById('lvl1'); 
      const lvl2 = document.getElementById('lvl2');
      const lvl3 = document.getElementById('lvl3');
      setInterval(() => {
        xhr.timeout = 3000;
        /** Таймаут. Индикатор сигнала связи - желтый */
        xhr.ontimeout = () => { 
          lvl1.style.background = 'yellow';
          lvl2.style.background = 'yellow';
          lvl3.style.background = '#616161';
        }
        /** 
         * Запрос завершён.
         * если пришел ответ, то индикатор сигнала связи - зеленый
         * если ответа нет, то индикатор сигнала связи - красный
         */
        xhr.onload = () => {
          if (xhr.response) { 
            lvl1.style.background = '#0fb900';
            lvl2.style.background = '#0fb900';
            lvl3.style.background = '#0fb900';
          } else { 
            lvl1.style.background = 'red';
            lvl2.style.background = '#616161';
            lvl3.style.background = '#616161';
          }
          /** parse - преобразование строки в объект */
          let signal = JSON.parse(xhr.response); 
          /** extended - название устройства, которое выводится на шапке страницы рядом с логотипом */
          this.extended = signal.extended; 
          /** title - определяет заголовок документа, который отображается в заголовке окна браузера или на вкладке страницы */
          document.title = signal["Имя устройства"]; 
        }
        
        /** при ошибке запроса индикатор сигнала связи тоже красный */
        xhr.onerror = (error) => {
          lvl1.style.background = 'red';
          lvl2.style.background = '#616161';
          lvl3.style.background = '#616161';
          console.log([error.total] + ' ' + 'Нет связи...')
        }
        xhr.open('GET', `http://${urlHostName}/fcgi/header`, true); /** запрос */
        xhr.send('ok');
      }, 2000)
    },
  
    /** при клике на кнопку "войти" или "выйти" отображается окно авторизации  */
    enter_exit() {
      this.isShowAuth = !this.isShowAuth;
    },
  }
}
</script>

<style>
  
  body {
    margin: 0;
    padding: 0;
  }

#preloader {
  display: block;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  z-index: 4;
  background: rgb(61, 61, 61);
} 
#loader {
 display: block;
  position: fixed;
  top: 50%;
  left: 50%;
  margin-right: -50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  background-image: url('./assets/loader.gif');
  width: 64px;
  height: 64px;
}

.contentVue-enter-active, .contentVue-leave-active {
  transition: all 0.5s linear;
  opacity: 1;
}

.contentVue-enter-from, .contentVue-leave-to {
  opacity: 0;
}

  #menu {
    display: flex;
    justify-content: space-around;
    align-content: space-around;
    align-items: center;
    flex-direction: row;
    background: #333333;
    color: #FFB300;
    text-shadow: black 0px 3px 2px;
    font-family: "AECPoints";
    padding-right: 12px;
    position: fixed;
    width: 100%;
    z-index: 2;
  }
  .contentForRoute {
    background: #474747; 
    display:flex;
    justify-content:center;
    flex-direction:column;
    align-items:center;
    /* min-height: 47.5em; */
    min-height: 54.7em;
  }
  .viewRoute {
    display:flex;
    width: 60%;
    justify-content:center;
    flex-direction:column;
    align-items:center;
    margin-top: 110px;
  }
  .menu_start {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 0;
  }
  .menu_logo {
    width: 15em;
  }
  .menu_master {
    margin: 0px 10px;
  }
  .menu_buttons {
    display: flex;
    justify-content: space-around;
    flex-direction: row;
  }
  .menuPunkt {
    text-decoration: none;
    background: #292929;
    padding:30px;
    border: 1px solid #8C8C8C;
    color: #FFB300;
  }
  .menuPunkt_addInf {
    text-align: center;
  }

  #connectionWithBS {
    display: grid;
    margin-left: 12px;
    align-items: center;
    grid-template-areas:  "connection signal buttons_auth";  
    grid-template-columns: auto;  
    grid-template-rows: auto; 
  }
  .connection_Master08 {
    grid-area: connection;
  }
  .connection_signal {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    grid-area: signal;
  }
  .buttons_auth {
    display: flex;
    align-items: center;
    grid-area: buttons_auth;
    margin-right: 10px;
  }
  
  .lvlConnection {
    background: #616161;
    width: 30px;
    height: 30px;
    margin: 10px;
  }

  #footer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    background: #333333;
    color: #ffb300;
    height: 80px;
    height: 94px;
  }

  #exit, #enter {
    color: #FFB300;
    background: none;
    border: 1px solid gray;
    border-radius: 10px;
    width: 5em;
    cursor: pointer;
    display: flex;
    justify-content: center;
    text-decoration: none;
    padding: 4px 0;
  }
  #menu.show_auth {
    pointer-events: none;
  }
  
  .menuPunkt:hover  {
    background: #616161;
  }

  #enter:hover, #exit:hover {
    background: #616161;
    /* border: 1px solid gray; */
  }
  .active{
  background: #616161;
  }
  .menuBurger {
    display: none;
  }
  .lastPunkt {
    display: none;
  }

  @media screen and (max-width: 1505px) {
    .menu_master {
      font-size: 28px;
    }
  }

  @media screen and (max-width: 1280px) {
    .menu_logo {
      width: 11em;
    }
    .menu_master {
      font-size: 25px;
    }
    .menuPunkt {
      padding: 24px 14px 15px;
    }
  }
  @media screen and (max-width: 1100px) {
    .menu_start {
      margin: 0 15px 5px 5px;
      flex-direction: column;
    }
    .menu_logo {
      width: 10em;
    }
    .menu_master {
      font-size: 19px;
    }
    .menuPunkt {
      padding: 24px 10px 15px;
      font-size: 15px;
    }
    #connectionWithBS {
      grid-template-areas:  "connection buttons_auth"  
                            "signal buttons_auth"; 
      grid-template-columns: auto;  
      grid-template-rows: auto; 
    }
    .connection_Master08 {
      padding-left: 5px;
      font-size: 13px;
    }
    .buttons_auth {
      margin-left: 8px;
    }
    #lvl2 {
      margin: 3px;
    }
    .lvlConnection {
      width: 26px;
      height: 26px;
    }
  }

  @media screen and (max-width: 819px) {
    .viewRoute {
      margin-top: 90px;
    }
    #menu {
      justify-content: space-between;
    }
    #connectionWithBS {
      margin-top: 10px;
      margin-right: 80px;
    }
    .menuBurger {
      display: inline-block;
      width: 60px;
      align-self: center;
      justify-self: center;
      position: fixed;
      right: 0;
      padding-right: 12px;
      transition: all 0.3s ease 0s;
    }
    .menu_buttons {
      position: fixed;
      top: -100%;
      right: 0;
      height: 225px;
      width: 240px;
      flex-direction: column;
      z-index: 2;
      justify-content: center;
      margin-top: 94px;
    }
    .menuPunkt {
      padding: 18px 20px;
      border: none;
    }
    .menuPunkt_addInf {
      text-align: left;
      border-top: 1px solid #8c8c8c;
      border-bottom: 1px solid #8C8C7E;
    }
    .lastPunkt {
      display: inline;
      padding: 28px 0;
      border-top: 1px solid #8c8c8c;
    }
    .lastPunkt:hover {
      background: #292929;
    }
    .buttons_auth {
      position: fixed;
      right: 0;
      top: -100%;
      margin: 288px 141px 0 0;
      z-index: 2;
    }
    .menu_buttons, .buttons_auth {
      transform: translateY(-100%);
      transition-timing-function: cubic-bezier(.68,-.55,.265,1.55);
      transition-duration: .1s;
    }
    #enter, #exit {
      width: 5em;
      font-size: 15px;
      padding: 3px;
    }
    .menu_buttons.show,
    .buttons_auth.show {
      top: 0;
      transform: translateY(0);
      transition-timing-function: cubic-bezier(0,0,0.58,1);
      transition-duration: .5s;
    }
    .viewRoute.show {
      opacity: .3;
      pointer-events: none;
    }
  }
  @media screen and (max-width: 425px) {
    .viewRoute {
      margin-top: 70px;
    }
    .menu_logo {
      width: 8em;
    }
    .menu_master {
      font-size: 15px;
    }
    #connectionWithBS {
      margin-right: 60px;
    }
    .connection_Master08 {
      font-size: 11px;
    }
    .menuBurger {
      padding-right: 5px;
      width: 54px;
    }
    .lvlConnection {
      width: 23px;
      height: 23px;
      margin: 12px 7px;
    }
    .menu_buttons {
      width: 184px;
      margin-top: 82px;
    }
    .buttons_auth {
      margin: 271px 83px 0 0;
    }
    #footer {
      height: 60px;
    }
  }
  @media screen and (max-width: 360px) {
    .viewRoute {
      margin-top: 50px;
    }
    .menu_logo {
      width: 6em;
    }
    .menu_master {
      font-size: 12px;
      margin: 0 5px;
    }
    #connectionWithBS {
      margin-right: 53px;
    }
    .connection_Master08 {
      font-size: 10px;
    }
    .menuBurger {
      width: 45px;
    }
    .lvlConnection {
      width: 20px;
      height: 20px;
      margin: 10px 7px;
    }
    .menuPunkt {
      font-size: 13px;
      padding: 17.5px 15px;
    }
    .menu_buttons {
      width: 156px;
      height: 211px;
      margin-top: 60px;
    }
    .buttons_auth {
      margin: 241px 64px 0 0;
    }
    #enter, #exit {
      padding: 2px;
    }
  }
</style>
