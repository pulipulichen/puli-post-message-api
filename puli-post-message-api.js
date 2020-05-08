function PuliPostMessageAPI() {
  /**
   * 開啟視窗的呼叫者
   * @type type
   */
  let opener
  if (window.opener) {
    opener = window.opener
  }
  else if (window.parent && window.parent !== window) {
    opener = window.parent
  }

  let docReady = function (fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }
  
  //console.log(opener)
  if (opener) {
    docReady(function () {
      //console.log('ready', location.href.slice(location.href.lastIndexOf('/') + 1))
      opener.postMessage({
        eventName: 'ready',
        url: location.href
      }, '*')
      //console.log('ready', location.href.slice(location.href.lastIndexOf('/') + 1))
    })
  }
  
  let _receiverReadyList = {}
  let _receiverWaitList = {}
  let _receiverSendWaitList = {}
  
  // -----------------------
  
  let _receiverElementList = {}
  
  let _AddSendWait = function (url) {
    if (Array.isArray(_receiverSendWaitList[url]) === false) {
      _receiverSendWaitList[url] = []
    }
    
    return new Promise(function (resolve, reject) {
      _receiverSendWaitList[url].push(function () {
        resolve(true)
      })
      
      //console.log(_receiverSendWaitList[url].length, url)
      if (_receiverSendWaitList[url].length === 1) {
        _receiverSendWaitList[url][0]()
      }
    })
  }
  
  let _ExecuteNextSendWait = function (url) {
    _receiverSendWaitList[url].shift()
    //console.log('_ExecuteNextSendWait', url)
    if (_receiverSendWaitList[url].length > 0) {
      setTimeout(function () {
        _receiverSendWaitList[url][0]()
      }, 0)
    }
  }
  
  let send = async function (url, data, options, callback) {
    url = new URL(url, document.baseURI).href
    
    await _AddSendWait(url)
    
    if (typeof(options) === 'function' && !callback) {
      callback = options
      options = undefined
    }
    
    let mode = 'iframe'
    if (options && options.mode) {
      mode = options.mode
    }
    
    let receiver
    let receiverElement
    if (_receiverElementList[url]) {
      receiver = _receiverElementList[url]
    }
    else if (mode === 'iframe') {
      receiverElement = document.createElement("iframe"); 
      receiverElement.style.display = 'none'
      receiverElement.src = url
      document.body.appendChild(receiverElement)
    }
    else if (mode === 'popup') {
      let target = undefined
      if (options && options.target) {
        target = options.target
      }
      let features = undefined
      if (options && options.features) {
        features = options.features
      }
      
      receiver = window.open(url, target, features)
    }
    
    // ----------------
    
    let autoClose = false
    if (options) {
      if (options.autoClose === true) {
        autoClose = options.autoClose
      }
      else if (typeof(options.autoClose) === 'undefined'
          && options.mode === 'popup') {
        autoClose = false
      }
    }
    
    
    // ---------------
    let getReceiver = function () {
      if (!receiver && mode === 'iframe') {
        receiver = receiverElement.contentWindow
      } 
      return receiver
    }
    
    let result = await _sendToReceiver(getReceiver, url, data)
    
    if (autoClose === false) {
      if (!_receiverElementList[url]) {
        _receiverElementList[url] = receiver
      }
    }
    
    // ---------------
    
    if (autoClose === true) {
      if (mode === 'iframe') {
        receiverElement.parentNode.removeChild(receiverElement)
      }
      else {
        receiver.close()
      }
      delete _receiverReadyList[url]
    }
    
    if (typeof(callback) === 'function') {
      callback(result)
    }
    
    return result
  }
  
  // -----------------------
  
  let _sendToReceiver = async function (getReceiver, url, data) {
    await _waitReceiverReady(url)
    
    let receiver = getReceiver()
    //console.log(receiver)
    receiver.postMessage({
      eventName: 'send',
      data: data,
      url: location.href
    }, url)
    
    return new Promise(function (resolve, reject) {
      _pushReceiverReturnQueue(url, function (result) {
        resolve(result)
      })
    })
    
  }
  
  let _receiverReturnQueue = {}
  
  let _pushReceiverReturnQueue = function (url, callback) {
    if (!_receiverReturnQueue[url]) {
      _receiverReturnQueue[url] = []
    }
    if (_receiverReturnQueue[url].indexOf(callback) === -1) {
      _receiverReturnQueue[url].push(callback)
    }
  }
  
  
  // ------------------------
  
  let _messageHandler = function (event) {
    //console.log(event, location.href.slice(location.href.lastIndexOf('/') + 1))
    if (typeof(event.data) !== 'object'
            || !event.data.eventName) {
      return false
    }
    let eventName = event.data.eventName
    let data = event.data.data
    let url = event.data.url
    
    //console.log(eventName, data, location.href)
    
    //let origin = event.origin
    let source = event.source
    //let url = event.source.location.href
    
    if (eventName === 'return') {
      _returnEventHandler(url, data)
    }
    else if (eventName === 'send') {
      _sendEventHandler(source, url, data)
    }
    else if (eventName === 'ready') {
      _readyEventHandler(url)
    }
  }
  
  let _returnEventHandler = function (url, data) {
    //console.log(_receiverReturnQueue)
    if (Array.isArray(_receiverReturnQueue[url]) === false) {
      return false
    }

    _receiverReturnQueue[url].forEach(function (callback) {
      if (typeof(callback) !== 'function') {
        return false
      }
      callback(data)
    })

    // 清空呼叫的資料
    _receiverReturnQueue[url] = []
    _ExecuteNextSendWait(url)
    return true
  }
  
  let _sendEventHandler = async function (source, origin, input) {
    let result
    
    if (typeof(_receiveHandler) === 'function') {
      result = await _receiveHandler(input)
    }
    
    source.postMessage({
      eventName: 'return',
      data: result,
      url: location.href
    }, origin)
  }
  
  let _readyEventHandler = function (origin) {
    _receiverReadyList[origin] = true
    //console.log(_receiverWaitList[origin], origin, location.href)
    if (typeof(_receiverWaitList[origin]) === 'function') {
      _receiverWaitList[origin]()
      delete _receiverWaitList[origin]
    }
  }
  
  let _waitReceiverReady = function (url) {
    //console.log(_receiverReadyList[url], _receiverWaitList[url])
    if (_receiverReadyList[url] === true) {
      return true
    }
    
    return new Promise(function (resolve, reject) {
      _receiverWaitList[url] = function () {
        resolve(true)
      }
      //console.log(_receiverReadyList[url], _receiverWaitList[url], url)
    })
  }
  
  window.addEventListener("message", _messageHandler, true)
  
  // -----------------------
  
  
  // -----------------------
  
  let _receiveHandler
  
  let onReceive = function (callback) {
    if (typeof(callback) !== 'function') {
      return false
    }
    _receiveHandler = callback
  }
  
  // -------------------------------
  
  return {
    send: send,
    onReceive: onReceive
  }
}