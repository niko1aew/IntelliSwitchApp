import { AsyncStorage } from 'react-native';

export class AndroidStorage {
  writeStoredSettings = async keyValuePairs => {
    try {
      for (let [key, value] of Object.entries(keyValuePairs)) {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.log('Error saving data: ', error);
    }
  };

  readStoredSettings = async key => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      } else {
        return null;
      }
    } catch (error) {
      console.log('Error retrieving data');
    }
  };
}
