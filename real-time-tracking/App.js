import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import MapView from 'react-native-maps';

import { Amplify, PubSub } from 'aws-amplify';
import { AWSIoTProvider } from '@aws-amplify/pubsub';
import awsconfig from './src/aws-exports'

Amplify.configure(awsconfig)

Amplify.addPluggable(
  new AWSIoTProvider({
    aws_pubsub_region: 'ap-northeast-2',
    aws_pubsub_endpoint:
      'wss://a2ht7rbdkt6040-ats.iot.ap-northeast-2.amazonaws.com/mqtt'
  })
);

export default function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    let subscription;
    Amplify.PubSub.subscribe('$aws/things/real-time-tracking/shadow/get/accepted').subscribe({    
      next: data => {      
        /*
        Type of message:
        {
        "message": {
          "lat": "22",
          "long": "24"
          }
        }
*/  
        console.log('Message received:', data.value.message);
        setMessage(data.value.message);
      },
      error: error => console.error(error),    
      close: () => console.log('Done'),  
    });
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {
        message && (
          <View>
            <Text>Latitude: {message.lat}</Text>
            <Text>Longitude: {message.long}</Text>
          </View>
        )
      }
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 21.030270,
          longitude: 105.781902,
          latitudeDelta: 0.0622,
          longitudeDelta: 0.0121,
        }}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});