# Chrome-Shortcut-Head-Modifier
Modify the &lt;head> to custom a shortcut.

Chrome Shortcut Head Modifier

https://github.com/pulipulichen/Chrome-Shortcut-Head-Modifier

https://pulipulichen.github.io/Chrome-Shortcut-Head-Modifier/

https://findicons.com/icon/587162/shortcuts

----

# Error: ENOSPC: System limit for number of file watchers reached

https://stackoverflow.com/a/56156015

````
$ echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
````