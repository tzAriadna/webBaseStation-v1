<template>
  <div id="about">
    <div class="auth" @keyup.enter="authSession()">
    <h1>АВТОРИЗАЦИЯ</h1>
    <div class="groupForAuth">
    <label for="">Логин</label>
    <input id="loginInput" v-model="model.login" class="inputForAuth" type="text">
    </div>
    <div class="groupForAuth">
    <label for="">Пароль</label>
    <input id="passwordInput" v-model="model.password" class="inputForAuth" type="password">
    </div>
    <button id="enterButton" class="enterButton" :class="{ 'loaderButton' : isLoaderButton }" @click="authSession()">
      <span id="textBtnAuth">ВОЙТИ</span>
      <img id="loaderForBtnAuth" src="@/assets/load.svg" alt="загрузка..." style="display:none;">
      <img id="okForBtnAuth" src="@/assets/ok.svg" alt="Oк" style="display:none;">
      <img id="notOkForBtnAuth" src="@/assets/notOk.svg" alt="Ошибка" style="display:none;">
    </button>
    <label class="atempts" v-if="defendCounter === true" for="" style="color: red;">Превышено количество попыток ввода пароля</label>
    <button @click="guestSession()" style="color: #91BBFF;background:0;border:0;">Продолжить как гость</button>
  </div>
  </div>
</template>

<script>
import axios from 'axios'; 

const urlHostName = window.location.hostname;
let timeToBlock = 0;


export default {
  data() {
    return {
      defendCounter: false,
      isLoaderButton: false,
      model: {
        login: null,
        password: null
      }
    }
  },
  mounted() {
    this.hideHeader(); 
  },
  methods: {
    /**
     * Rаждый раз при обновлении или перезагрузке страницы вызывается функция hideHeader(),
     * в котором создается свойство реагирования мышки на шапку страницы (pointer-events)
     */
    hideHeader () { 
      document.isShowAuth = true;  
    },
    /** 
     * Функция вызывается при нажатии на "войти как гость".
     * Выполняется запрос на сервер, с информацией о пользователе "Гость".
     * Если запрос принят, response - ответ на запрос. В ответе содержатся токены, 
     * полученные токены кладем  в localStorage и перенаправляем гостя на главную страницу.
     * Если запрос не принят, произошла ошибка. Ошибка выведена в консоль
     */
    guestSession() {
      axios.post(`http://${urlHostName}:80/fcgi/login` , {"username": "user", "password": "user"} 
      ).then(response => {
        localStorage.access_token = response.data.access_token;
        localStorage.refresh_token = response.data.refresh_token;
        localStorage.user = 'guest';
        window.location.href = '/'; 
        console.log('Welcome Guest!');
      }).catch ((err) => {
        console.log (err);
      })
    },
    
    /** вызывается при нажатии на кнопку "войти"  */
    authSession() {
      const enterButton = document.getElementById('enterButton');
      const loader = document.getElementById('loaderForBtnAuth');
      const okLoad = document.getElementById('okForBtnAuth');
      const notOkLoad = document.getElementById('notOkForBtnAuth')
      const textBtn = document.getElementById('textBtnAuth');

      /** анимация "загрузка" */
      enterButton.disabled = true;
      textBtn.style.display = 'none';
      this.isLoaderButton = !this.isLoaderButton;
      loader.style.display = 'block';

      /** 
       * Функция вызывается внутри loading().
       * Выполняется запрос на сервер, с информацией о введенном логине и пароле.
       * Если запрос принят и получен ответ (response), то аутентификация прошла успешно. 
       * В ответе содержатся токены, кладем их  в localStorage и перенаправляем пользователя на главную страницу, 
       * где выдан контент для авторизованного пользователя
       * Если запрос не принят: произошла ошибка или неверно введены логин и пароль
       */
      axios.post(`http://${urlHostName}:80/fcgi/login` , { 
        "username": this.model.login,
        "password": this.model.password 
      }).then(response => {
        localStorage.access_token = response.data.access_token;
        localStorage.refresh_token = response.data.refresh_token;
        localStorage.user = 'admin';

        /** через 2 секунды меняются стили анимации "загрузка", выводится "галочка" */
        setTimeout(() => {
          loader.style.display = 'none';
          okLoad.style.display = 'inline';
        }, 2000);

        /** через 3 секунды обратно возвращается слово "Войти" */
        setTimeout(() => {
          okLoad.style.display = 'none';
          this.isLoaderButton = !this.isLoaderButton;
          textBtn.style.display = 'inline';
          enterButton.disabled = false;
          window.location.href = '/';
        }, 3000);
        console.log('Welcome Administrator!');

      }).catch ((err) => {
        console.log (err);
        /** при неверно введеном логине или пароле, в счетчик считывается количество неверно введенным данных */
        if (err.code == 'ERR_BAD_REQUEST') {
          timeToBlock = timeToBlock + 100;
          console.log(timeToBlock);
          
          /** через 1 секунду меняются стили анимации "загрузка", выводится "крестик" */
          setTimeout(() => {
            loader.style.display = 'none';
            notOkLoad.style.display = 'inline';
          }, 1000);

          /** через 2 секунды обратно возвращается слово "Войти" */
          setTimeout(() => {
            notOkLoad.style.display = 'none';
            this.isLoaderButton = !this.isLoaderButton;
            textBtn.style.display = 'inline';
            enterButton.disabled = false;
          }, 2000);
        }
      })

      /** если количество неверно введенных данных достигает 3, то выводится "Превышено количество попыток ввода пароля" */
      if (timeToBlock == 300) {
        while (timeToBlock != 0) {
          enterButton.disabled = true;
          this.defendCounter = true;
          timeToBlock -= 10;
        }
      }
    },
  },
}

</script>

<style>
   .auth {
    color: #F0AA00;
    background: #616161;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 10px;
    box-shadow: 0px 1px 2px 0.4px black;
    width: 450px;
    height: 400px;
  }

  .groupForAuth {
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
  }

  .inputForAuth {
    background: #8C8C8C;
    border-radius: 4px;
    border: 1px solid #C2C2C2;
    width: 244px;
    height: 27px;
    margin-top: 3px;
  }
  .enterButton {
    background: #616161;
    border: 1px solid #8C8C8C;
    box-shadow: 0 1px 2px 0.84px ;
    border-radius: 10px;
    width: 262px;
    height: 31px;
    cursor: pointer;
    background-repeat: no-repeat;
    background-position: center;
    display: flex;
    justify-content: center;
    align-content: center;
    align-items: center;
    transition-duration: 0.3s;
  }
  .atempts {
    text-align: center;
  }
  #loaderForBtnAuth {
    width: 60px;
  }
  #notOkForBtnAuth {
    padding: 5px 0 0 5px;
  }
  .enterButton.loaderButton {
    width: 64px;
    height: 64px;
    border-radius: 10px;
  }
  .enterButton:hover {
    background: #6d6d6d;
  }
  #loginInput:hover, #passwordInput:hover {
    box-shadow: 0.5px 0.5px 5px 0.1px white;
    outline: none;
  }
  #loginInput:focus, #passwordInput:focus {
    box-shadow: 0.5px 0.5px 5px 0.1px white;
    outline: none;
  }

  @media screen and (max-width: 470px) {
    .auth {
      width: 340px;
      height: 320px;
    }
    h1 {
      font-size: 25px;
    }
    .inputForAuth {
      width: 220px;
    }
    .enterButton {
      width: 227px;
    }
  }
  @media screen and (max-width: 370px) {
    .auth {
      width: 290px;
      height: 300px;
    }
    h1 {
      font-size: 23px;
    }
    .inputForAuth {
      width: 180px;
    }
    .enterButton {
      width: 183px;
    }
    .enterButton.loaderButton {
      width: 50px;
      height: 50px;
      border-radius: 8px;
    } 
  }
</style>