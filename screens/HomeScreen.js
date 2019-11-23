import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Button
} from 'react-native';
import { AndroidStorage } from '../services/AndroidStorage';

import { SensorView } from '../components/SensorView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const storage = new AndroidStorage();

export class HomeScreen extends React.Component {
  state = { deviceIP: null };
  componentWillMount() {
    storage.readStoredSettings('DeviceIP').then(deviceIP => {
      console.log('IP from storage: ', deviceIP);
      if (!deviceIP) {
        this.props.navigation.navigate('Settings');
      }
      this.setState({ deviceIP: deviceIP });
    });
  }
  onIpChange = newIP => {
    this.setState({ deviceIP: newIP });
  };

  didFocusSubscription = this.props.navigation.addListener(
    'didFocus',
    payload => {
      newIP = JSON.stringify(this.props.navigation.getParam('newIP', null));
      if (newIP !== 'null') {
        console.log('new ip:', newIP);
        this.onIpChange(newIP.slice(1, -1));
      }
    }
  );

  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Settings');
          }}
        >
          <Image
            style={{ width: 50, height: 50 }}
            source={require('../assets/setting.png')}
          />
        </TouchableOpacity>
      )
    };
  };

  showSettings = () => {
    this.props.navigation.navigate('Settings');
  };

  render() {
    const { deviceIP } = this.state;
    if (deviceIP !== null) {
      console.log('starting SensorView with: ', deviceIP);
      return (
        <View style={styles.container}>
          <SensorView ipAddress={deviceIP}></SensorView>
        </View>
      );
    } else {
      return (
        <View style={styles.container}>
          <Button
            title="Please, configure!"
            onPress={this.showSettings}
          ></Button>
        </View>
      );
    }
  }
}
