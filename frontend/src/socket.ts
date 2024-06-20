import { Socket, io } from "socket.io-client";

const URL = import.meta.env.VITE_SERVER_ADDRESS!;

class ClientSocket {
  socket: Socket | null;
  connected: boolean;
  addedEvents: any[];

  constructor() {
    //init instance variables
    this.socket = null;
    this.connected = false; //bool used to check if socket is connected
    this.addedEvents = []; //array to hold added event listeners
  }

  //connect function initiates or confirms a connection. Requires:
  //1. host to connect to
  //2. Optional: callback to run once connected
  //3. Optional: auth object to send in handshake
  //4. Optional: query object to send in handshake
  //5. Optional: options (in place of 4 and 5)
  connect = (callbackWhenConnected?: VoidFunction, jwtToken?: string) => {
    callbackWhenConnected = callbackWhenConnected || (() => {});
    //initiate connection only if not already connected
    if (!this.connected) {
      this.socket = io(URL, {
        auth: {
          jwtToken,
        },
        withCredentials: true,
        autoConnect: false,
      });
      this.socket?.connect();
      //run callback once connection is confirmed
      this.addEvent("connect", () => {
        this.connected = true;
        if (typeof callbackWhenConnected === "function") {
          callbackWhenConnected();
        }
      });
    } else {
      //still run the callback in the event socket was already connected
      callbackWhenConnected();
    }
  };

  //close function terminates the connection
  close = () => {
    if (!this.socket) return;
    this.socket.close();
    this.connected = false;
    this.addedEvents = [];
  };

  //addEvent function adds a new event listener and requires:
  // 1. the event name
  // 2. optional callback to run
  addEvent = (eventName: string, callback: (...args: any[]) => void) => {
    if (!this.socket) return;
    //see if this event has already been added, before adding
    const eventExists = this.addedEvents.find((e) => e === eventName);
    if (!eventExists) {
      const callbackToRun =
        typeof callback === "function" ? callback : () => {};
      this.socket.on(eventName, callbackToRun);
      this.addedEvents.push(eventName);
    } else {
      console.log(`Did not add ${eventName} again`);
    }
  };

  //emitEvent function emits an event to the server
  emitEvent = (eventName: string, ...data: any) => {
    if (!this.socket) return;
    this.socket.emit(eventName, ...data);
  };
}

export const socket = new ClientSocket();
