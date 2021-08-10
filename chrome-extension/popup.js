/* global changeColor, chrome, set, title, icon, titleInput, iconInput, hostIcon */


//let titleValue
//let iconURL
titleInput.addEventListener("change", validTitleIcon) 
iconInput.addEventListener("change", validTitleIcon)

titleInput.addEventListener("focus", selectThis) 
iconInput.addEventListener("focus", selectThis) 

setTimeout(() => {
  titleInput.select()
}, 100)

function selectThis () {
  this.select()
}

function validTitleIcon () {
  if (titleInput.value.trim() === '') {
    set.disabled = true
    return false
  }
  if (iconInput.value.trim() === '') {
    set.disabled = true
    return false
  }
  else {
    try {
      new URL(iconInput.value.trim())
    }
    catch (e) {
      set.disabled = true
      return false
    }
  }
  
  localStorage.setItem('config', JSON.stringify({
    title: titleInput.value.trim(),
    icon: iconInput.value.trim()
  }))
  
  set.disabled = false
}

// When the button is clicked, inject setPageBackgroundColor into current page
set.addEventListener("click", async () => {

  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});

  //window.alert(title.value + icon.value)

  chrome.storage.sync.set({data: {
      title: titleInput.value.trim(),
      icon: iconInput.value.trim()
    }});

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    function: setHead,
  });

  window.close()
});

let cache = localStorage.getItem('config')
if (cache) {
  cache = JSON.parse(cache)
  
  titleInput.value = cache.title
  iconInput.value = cache.icon
}


// When the button is clicked, inject setPageBackgroundColor into current page
hostIcon.addEventListener("click", async () => {
  var newURL = "https://tinypix.top/";
  chrome.tabs.create({ url: newURL });
});

// When the button is clicked, inject setPageBackgroundColor into current page
/*
 changeColor.addEventListener("click", async () => {
 
 let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
 
 chrome.scripting.executeScript({
 target: { tabId: tab.id },
 function: setPageBackgroundColor,
 });
 
 chrome.scripting.executeScript({
 target: { tabId: tab.id },
 function: setPageBackgroundColor,
 });
 });
 
 // The body of this function will be executed as a content script inside the
 // current page
 function setPageBackgroundColor() {
 chrome.storage.sync.get("color", ({ color }) => {
 document.body.style.backgroundColor = 'red';
 });
 }
 */

function setHead() {

  let removeElement = function (selector) {
    let eleList = document.querySelectorAll(selector)
    if (!eleList || eleList.length === 0) {
      return false
    }
    //console.log(ele)
    eleList.forEach(ele => {
      ele.parentElement.removeChild(ele)
    })
  }

  let removeManifest = function () {
    removeElement('head link[rel="manifest"]')
  }
  
  let parseIconLink = function(icon) {
    let filename = (new URL(icon)).pathname
    //console.log(filename)
    var link = document.createElement('link');
    link.rel = 'icon'
    link.href = icon
    
    if (filename.endsWith('.ico')) {
      // https://blog.pulipuli.info/favicon.ico
      //return `<link rel="icon" href="${icon}" type="image/x-icon">`
      link.type = "image/x-icon"
    }
    else if (filename.endsWith('.png')) {
      // https://lh3.googleusercontent.com/-tkBPlsBsFJg/V0M0b-gPKNI/AAAAAAACw9Y/Y-2BGg4z3H4/Image.jpg?imgmax=800
      //return `<link rel="icon" type="image/png" href="${icon}" />`
      link.type = "image/png"
    }
    else if (filename.endsWith('.jpg')
            || filename.endsWith('.jpeg')) {
      //return `<link rel="icon" type="image/jpeg" href="${icon}" />`
      link.type = "image/jpeg"
    }
    else if (filename.endsWith('.gif')) {
      //return `<link rel="icon" type="image/gif" href="${icon}" />`
      link.type = "image/gif"
    }
    
    return link
  }

  let setIcon = function (icon) {
    if (icon.startsWith('blob:')) {
      icon = icon.slice(5)
    }
    
    removeElement('head link[rel="shortcut icon"]')
    removeElement('head link[rel="icon"]')
    
    let link = parseIconLink(icon)
    
    var headID = document.getElementsByTagName('head')[0];
    
    //link.href = 'http://fonts.googleapis.com/css?family=Oswald&effect=neon';
    headID.appendChild(link);
  }

  chrome.storage.sync.get("data", ({ data }) => {
    let {title, icon} = data
    //document.body.style.backgroundColor = 'red';
    //console.log(title, icon)
    document.title = title

    removeManifest()
    setIcon(icon)

  });
  /*
   window.alert(titleValue + iconURL)
   //document.head.innerHTML = `<title`
   document.title = titleValue
   */
}
