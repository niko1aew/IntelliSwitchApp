import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  ImageBackground,
  Image
} from 'react-native';
import { SwitchService, connectWith } from '../services/SwitchService';

export class SensorView extends Component {
  deviceIP = this.props.ipAddress;
  device = new SwitchService(this.deviceIP, connectWith.API);
  componentDidUpdate() {
    if (
      this.props.ipAddress !== 'null' &&
      this.props.ipAddress !== this.deviceIP
    ) {
      console.log('Restarting service with new IP: ', this.props.ipAddress);
      this.deviceIP = this.props.ipAddress;
      this.device.changeIP(this.deviceIP);
      this.setState({ connStatus: 'Connecting to ' + this.deviceIP });
    }
  }

  state = {
    temperature: -100,
    humidity: -100,
    light: 'False',
    connected: false,
    connStatus: 'Not connected'
  };

  styles = StyleSheet.create({
    separator: {
      marginVertical: 8,
      borderBottomColor: '#737373',
      borderBottomWidth: StyleSheet.hairlineWidth
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(206, 206, 206, 0.8)',
      padding: 20,
      borderRadius: 8,
      width: 200,
      height: 200
    },
    sensorBlock: {
      display: 'flex',
      flexDirection: 'row',
      alignSelf: 'center'
    },
    switchLabel: {
      alignSelf: 'center',
      fontSize: 20
    },
    connectionScreen: {
      backgroundColor: 'white',
      width: '100%',
      height: '100%',
      flex: 1,
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center'
    },
    connectionImage: {
      width: 250,
      maxHeight: 300,
      alignSelf: 'center'
    },
    connectionText: {
      textAlign: 'center'
    },
    mainBackground: {
      width: '100%',
      height: '100%',
      flex: 1,
      flexDirection: 'row-reverse',
      justifyContent: 'center'
    }
  });

  componentDidMount() {
    this.device.emitter.addListener('connection-state', args => {
      this.setState({
        connected: args.server_status === 'connected' ? true : false
      });
    });

    this.device.emitter.addListener('sensor-state', args => {
      console.log(args);
      this.setState({
        connected: true,
        temperature: args.temperature,
        humidity: args.humidity,
        light: args.relay
      });
    });
    this.setState({ connStatus: 'Connecting to ' + this.deviceIP });
  }

  switchRelay = () => {
    console.log('switch');
    this.device.switchRelay();
  };

  render() {
    const { temperature, humidity, connected, light, connStatus } = this.state;
    if (!connected) {
      return (
        <View style={this.styles.connectionScreen}>
          <Image
            source={require('../assets/connecting.png')}
            style={this.styles.connectionImage}
          ></Image>
          <Text style={this.styles.connectionText}>{connStatus}</Text>
        </View>
      );
    }
    return (
      <ImageBackground
        source={
          light === 'True'
            ? require('../assets/light-bulbs.jpg')
            : require('../assets/light-bulbs-off.jpg')
        }
        style={this.styles.mainBackground}
      >
        <View style={this.styles.container}>
          <View style={this.styles.sensorBlock}>
            <View style={{ margin: 5 }}>
              <Image
                source={require('../assets/humidity.png')}
                style={{ width: 40, height: 40 }}
              ></Image>
              <Text style={{ fontSize: 30 }}>{humidity}%</Text>
            </View>
            <View style={{ margin: 5 }}>
              <Image
                source={require('../assets/temperature.png')}
                style={{ width: 40, height: 40 }}
              ></Image>
              <Text style={{ fontSize: 30 }}>{temperature}C</Text>
            </View>
            <View style={this.styles.separator} />
          </View>
          <Button
            title={light === 'True' ? 'Swich OFF' : 'Switch ON'}
            onPress={this.switchRelay}
          />
        </View>
      </ImageBackground>
    );
  }
}
