import EventEmitter from 'EventEmitter';

const SERVER_TIMEOUT_MS = 6000;
const POLLING_INTERVAL_MS = 5000;
const CONNECT_RETRY_INTERVAL_MS = 4000;
const SERVER_ONLINE_MSG = { server_status: 'connected' };
const SERVER_OFFLINE_MSG = { server_status: 'disconnected' };

export const connectWith = {
  SOCKET: 'socket',
  API: 'api'
};

export class SwitchService {
  constructor(ipAddress, connType) {
    this.connType = connType;
    this.deviceIP = ipAddress;
    this.socket = null;
    this.connected = false;
    this.deviceState = null;
    this.emitter = new EventEmitter();
    this.pingInterval = null;
    this.pingTimeout = null;
    this.connectInterval = null;
    this.connect(ipAddress);
  }

  connect = deviceIP => {
    console.log('Openning to ', deviceIP);
    if (this.connType === connectWith.SOCKET) {
      console.log('Openning socket... ', deviceIP);
      if (this.socket) this.disconnect();

      const socketAddress = 'ws://'.concat(deviceIP);

      console.log('Connecting to ', socketAddress);
      this.socket = new WebSocket(socketAddress);

      this.socket.onopen = () => {
        console.log('Socket connected');
        this.getState();
        this.startPolling();
      };

      this.socket.onclose = e => {
        this.stopPolling();
        this.connected = false;
        console.log(
          `Socket is closed. Reconnect will be attempted in ${CONNECT_RETRY_INTERVAL_MS /
            1000} seconds.`
        );
        this.connectInterval = setTimeout(
          this.check,
          CONNECT_RETRY_INTERVAL_MS
        );
      };

      this.socket.onmessage = msg => {
        console.log('RECV: ', msg.data);

        try {
          this.processSwitchData(msg.data);
        } catch (ex) {
          console.log(ex.message);
        }
      };

      this.socket.onerror = err => {
        this.connected = false;
        console.log(
          'Socket encountered error: ',
          err.message,
          'Closing socket'
        );
        this.disconnect();
      };
    }

    if (this.connType === connectWith.API) {
      console.log('Openning API... ', deviceIP);
      try {
        this.postCommand({ action: 'device_state' });
        this.startPolling();
      } catch (err) {
        console.log(err.message);
        this.emitter.emit('connection-state', SERVER_OFFLINE_MSG);
      }
    }
  };

  startPolling = () => {
    if (this.connectInterval) clearTimeout(this.connectInterval);
    this.pingInterval = setInterval(() => {
      this.getState();
      this.pingTimeout = setTimeout(() => {
        this.emitter.emit('connection-state', SERVER_OFFLINE_MSG);
        console.log('Server not responding. connected=false');
        if (this.connType === connectWith.SOCKET) this.socket.close();
      }, SERVER_TIMEOUT_MS);
    }, POLLING_INTERVAL_MS);
  };

  stopPolling = () => {
    clearInterval(this.pingInterval);
    clearTimeout(this.pingTimeout);
  };
  postCommand = commandObj => {
    fetch(`http://${this.deviceIP}/api/`, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commandObj)
    })
      .then(res => res.text())
      .then(response => {
        this.emitter.emit('connection-state', SERVER_ONLINE_MSG);
        console.log(response);
        this.processSwitchData(response);
      })
      .catch(err => {
        console.log('Fetch error: ', err.message);
      });
  };

  processSwitchData = function(dataRaw) {
    data = JSON.parse(dataRaw);
    if (data.msg_type === 'state') {
      this.connected = true;
      this.deviceState = data;
      this.emitter.emit('sensor-state', {
        temperature: data.temperature,
        humidity: data.humidity,
        relay: data.relay
      });
    }
    clearTimeout(this.pingTimeout);
  };

  disconnect = () => {
    if (this.connType === connectWith.SOCKET) this.socket.close();
    clearInterval(this.pingInterval);
    clearTimeout(this.pingTimeout);
    clearInterval(this.connectInterval);
    this.emitter.emit('connection-state', SERVER_OFFLINE_MSG);
  };

  changeIP = newIP => {
    console.log('Changing socket to: ', newIP);
    this.disconnect();
    this.deviceIP = newIP;
    this.connect(newIP);
  };
  check = () => {
    !this.socket || this.socket.readyState == WebSocket.CLOSED;
    console.log('Socket down. Attempting connect...');
  };

  ping = () => {
    this.send('ping');
  };
  getState = () => {
    if (this.connType === connectWith.SOCKET)
      this.send('{"action":"device_state"}');
    else this.postCommand({ action: 'device_state' });
  };

  switchRelay = () => {
    if (this.connType === connectWith.SOCKET) {
      this.send('{"dev_type":"relay", "action":"switch"}');
    } else {
      this.postCommand({ dev_type: 'relay', action: 'switch' });
    }
  };

  send = data => {
    try {
      console.log('SEND: ', data);
      this.socket.send(data);
    } catch (error) {
      console.log('Error sending: ', data);
      this.connected = false;
    }
  };
}
