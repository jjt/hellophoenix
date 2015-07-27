import { Socket } from './phoenix';

const app = {
  initChat() {
    let socket = new Socket("/ws");
    socket.connect();
    let chan = socket.chan("rooms:lobby", {});
    chan.join().receive("ok", chan => {
      console.log("Welcome to Phoenix Chat!")
    });
  },
};

export default app;
