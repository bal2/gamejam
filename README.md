# Christmas game jam

This repository contains the code I wrote for a Christmas themed game jam at work. Please note that the code is very ugly and doesn't follow any best practices! :)

The game itself is pretty simple. You play as a reindeer and goes around picking up presents for points. Red presents gives special abilities, like speed boost or extra points.

Online multiplayer is handled through websockets, using the socket.io library. Everything is evaluated on the server, meaning that the game gets pretty laggy with lots of players. It's also very easy to exploit the server by sending commands to it via the browser console. The server doesn't have any sense of FPS, so it won't care if you suddenly send thousand move messages to it. As I said, the code doesn't follow any best practices!

An instance of the game can be found at [https://reindeer.woofie.dev](https://reindeer.woofie.dev).