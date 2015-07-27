import { Socket } from './phoenix';

let socket = new Socket("/ws")
socket.connect()
let chan = socket.chan("rooms:lobby", {})
chan.join().receive("ok", chan => {
  console.log("Welcome to Phoenix Chat!")
})

const app = {};

export default app;
