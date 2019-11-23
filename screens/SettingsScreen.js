import React from 'react';
import { Text, View, Button, TextInput } from 'react-native';
// import {AsyncStorage} from 'react-native';
import { AndroidStorage } from '../services/AndroidStorage';

const storage = new AndroidStorage();

export class SettingsScreen extends React.Component {
  state = {
    validIP: false,
    deviceIP: null,
    inputIP: null
  };

  validateIP = ip => {
    var re = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return re.test(ip);
  };

  onChangeText = text => {
    isIPvalid = this.validateIP(text);
    this.setState({ validIP: isIPvalid });
    if (isIPvalid) {
      this.setState({ deviceIP: text });
    } else {
      this.setState({ inputIP: text });
    }
  };

  componentDidMount() {
    storage.readStoredSettings('DeviceIP').then(deviceIP => {
      if (deviceIP) {
        this.setState({ validIP: true, deviceIP: deviceIP });
      }
    });
  }

  saveAndClose = () => {
    const { validIP, deviceIP } = this.state;

    if (deviceIP && validIP) {
      storage
        .writeStoredSettings(JSON.parse('{"DeviceIP":"' + deviceIP + '"}'))
        .then(() => {
          this.props.navigation.navigate('Home', { newIP: deviceIP });
        });
    } else {
      alert('IP not correct!');
    }
  };
  render() {
    const { validIP, deviceIP, inputIP } = this.state;
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}
      >
        <Text style={{ fontSize: 30 }}>Switch IP:</Text>
        <TextInput
          style={{
            height: 40,
            width: '100%',
            borderColor: 'gray',
            borderWidth: 1,
            margin: 5,
            paddingHorizontal: 10,
            backgroundColor: validIP ? '#b8f2cd' : '#f2f2b8'
          }}
          placeholder="Enter correct IP here!"
          onChangeText={text => this.onChangeText(text)}
          value={validIP ? deviceIP : inputIP}
        />
        <Button onPress={this.saveAndClose} title="Save" />
      </View>
    );
  }
}
