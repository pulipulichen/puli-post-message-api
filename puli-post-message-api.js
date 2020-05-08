function PuliPostMessageAPI() {
  /**
   * 開啟視窗的呼叫者
   * @type type
   */
  let opener

  let docReady = function (fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
      // call on next available tick
      setTimeout(fn, 1);
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }
  
  // -----------------------
  
  let send = async function (url, data, options, callback) {
    if (typeof(options) === 'function' && !callback) {
      callback = options
      options = undefined
    }
    
    let mode = 'iframe'
    if (options && options.mode) {
      mode = options.mode
    }
    
    let receiver
    if (mode === 'iframe') {
      receiver = document.createElement("iframe"); 
      receiver.style.display = 'none'
      receiver.src = url
      document.body.appendChild(receiver)
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
    
    let result = await _sendToReceiver(receiver, url, data)
    
    let autoClose = true
    if (options && options.autoClose) {
      autoClose = options.autoClose
    }
    
    if (autoClose === true) {
      if (mode === 'iframe') {
        receiver.parentNode.removeChild(receiver)
      }
      else {
        receiver.close()
      }
    }
    
    return result
  }
  
  // -----------------------
  
  let _sendToReceiver = async function (receiver, url, data) {
    await waitReceiverReady(url)
    
    receiver.postMessage({
      eventName: 'send',
      data: data,
    }, url)
    
    let result = await waitReceiverReturn(url)
    return result
  }
  
  // -----------------------
  
  let onReceive = function (callback) {
    
  }
  
  return {
    send: send,
    onReceive: onReceive
  }
}