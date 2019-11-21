import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,Image } from 'react-native';
import { AndroidStorage } from '../services/AndroidStorage';

import {SensorView} from '../components/SensorView'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#454147',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const storage = new AndroidStorage();

export class HomeScreen extends React.Component {
    state = { deviceIP: null }
    componentWillMount() {
      console.log('componentWillMount')
      storage.readStoredSettings("DeviceIP").then((deviceIP)=>{
        console.log("IP from storage: ", deviceIP);
        this.setState({deviceIP: deviceIP});
      })
    }
  
    onIpChange=(newIP)=>{
      this.setState({deviceIP: newIP})
    }
  
    didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        newIP = JSON.stringify(this.props.navigation.getParam('newIP',null))
        if (newIP!=='null') {
          console.log('new ip:',newIP);
          this.onIpChange(newIP.slice(1,-1));
        }
        
      }
    );
  
    static navigationOptions = ({ navigation })=>{
      return {
        headerLeft: () => (
          <TouchableOpacity onPress={() => {
            navigation.navigate('Settings');
          }}>
          <Image
            style={ {width: 50, height: 50}}
            source={require('../assets/setting.png')}
          />
          </TouchableOpacity>
          ),
      }
    }
  
    render() {
      const {deviceIP} = this.state;
      if (deviceIP!==null){
        console.log('starting SensorView with: ', deviceIP)
        return (
          <View style={styles.container}>
            <SensorView ipAddress={deviceIP}></SensorView>
          </View>
        )
      }
      else {
        return (
          <Text>Loading settings...</Text>
        )
      }
        
      
      
    }
  }