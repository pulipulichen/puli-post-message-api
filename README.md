# puli-post-message-api
PostMessage API

https://pulipulichen.github.io/puli-post-message-api/puli-post-message-api.min.js

icon: https://www.iconninja.com/conversation-circular-symbol-icon-612279

----

# Sender

````
let api = PuliPostMessageAPI()

let url = 'receiver.html'
let result = await api.send(url, data)
````

----

# Receiver

````
let api = PuliPostMessageAPI()

api.addReceiveListener(function (data) {
  return `I got "${data}"` + new Date()
})
````