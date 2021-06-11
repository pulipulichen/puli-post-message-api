/* global __webpack_public_path__ */
import Vue from 'vue'


// ----------------------------------
// plugins

import i18n from './i18n/i18n.js'

// ----------------------

import './styles/styles.js'
import template from './index.tpl'
import config from './config.js'
import localConfig from './local-config.js'
import utils from './utils/utils.js'
import $ from 'jquery'

// --------------------
// Components or routes

//import components from './components/index.js'
import Index from './components/Index.vue'

// -----------------------
// 確認 baseURL

let baseURL = __webpack_public_path__
baseURL = baseURL.split('/').slice(0, 3).join('/')

let baseScript = document.currentScript
if (baseScript) {
  
  let src = baseScript.src
  //console.log(src)
  if (src.startsWith('/')) {
    src = window.location.href
    console.log(src)
  }
  else {
    baseURL = src.split('/').slice(0, 3).join('/')
  }
  //console.log(baseURL)
  //if (enableBrowserTest && baseScript[0].src.startsWith(testBaseURL)) {
  //if (enableBrowserTest) {
  //}
  
  
  let appNode = document.createElement("div");
  appNode.id = 'app'
  baseScript.parentNode.insertBefore(appNode, baseScript);
  //baseScript.before(`<div id="app"></div>`)
}
config.baseURL = baseURL

// ---------------
// 錯誤訊息的設置

window.onerror = function(message, source, lineno, colno, error) {
  if (error === null) {
    error = message
  }
  //console.error(error)
  VueController.data.errors.push(error)
}

Vue.config.errorHandler  = function(err, vm, info) {
  //console.log(`errorHandler Error: ${err.stack}\nInfo: ${info}`);
  //console.error(err)
  VueController.data.errors.push(err)
}

// -----------------------

let VueController = {
  el: '#app',
  template: template,
  data: {
    config: config,
    localConfig: localConfig,
    utils: utils,
    errors: [],
  },
  i18n: i18n,
  components: {
    'index': Index
  },
  watch: {},
  mounted: async function () {
    //console.log('index.js mounted', 1)
    
    this.restoreFromLocalStorage()
    
    //console.log('index.js mounted', 2)
    
    await this.waitForSemanticUIReady()
    
    this.addViewportListener()
    
    //console.log('index.js mounted', 3)
    
    this.config.inited = true
  },
  methods: {
    waitForSemanticUIReady: async function () {
      let $body = $('body')
      while (typeof($body.modal) !== 'function') {
        await this.utils.AsyncUtils.sleep()
      }
      return true
    },
    restoreFromLocalStorage () {
      if (this.config.debug.enableRestore === false) {
        return false
      } 

      let data = localStorage.getItem(this.config.appName)
      //console.log(data)
      if (data === null || data.startsWith('{') === false || data.endsWith('}') === false) {
        return false
      }

      try {
        data = JSON.parse(data)
      } catch (e) {
        console.error(e)
      }

      //console.log(data)
      for (let key in data) {
        this.localConfig[key] = data[key]
      }
    },
    saveToLocalStorage () {
      if (this.config.inited === false) {
        return false
      }

      let data = this.localConfig
      //console.log(data)
      data = JSON.stringify(data)
      //console.log(data)
      localStorage.setItem(this.config.appName, data)
    },
    addViewportListener () {
      let $window = $(window)
      
      let resizeHandlerTimer
      
      let resizeHandler = () => {
          //  Little JS Tip, No need to write `var` 50thousand times. Just use a comma and write your new variable
          let x = $window.width(),    //  variable for window width assigned to `x`
              y = $window.height(),   //  variable for window height assigned to `y`
              z = x/y    //  your conversion you were using in the code you have in your question, there's plenty of different ways to test for size changes, do some Googling on "aspect ratio" as it's usually best way to go
          
          this.config.viewportSize.width = x
          this.config.viewportSize.height = y
          this.config.viewportSize.ratio = z
      }
      
      $window.on('resize', () => {
        clearTimeout(resizeHandlerTimer)
        resizeHandlerTimer = setTimeout(() => {
          resizeHandler()
        }, 100)
      })
      resizeHandler()
    }
  }
}

// ----------------------------

for (let key in localConfig) {
  //console.log(key)
  VueController.watch['localConfig.' + key] = function () {
    this.saveToLocalStorage()
  }
}

// ----------------------------

if (typeof(baseURL) === 'string') {
  setTimeout(() => {
    window.vueApp = new Vue(VueController)
  }, 0)
}

import './service-worker-loader.js'