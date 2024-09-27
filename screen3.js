import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { StyleSheet } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBiyof114SEvTcsGJdVV3tKrzqAO-EwmR0",
  authDomain: "plante-9ebda.firebaseapp.com",
  databaseURL: "https://plante-9ebda-default-rtdb.firebaseio.com",
  projectId: "plante-9ebda",
  storageBucket: "plante-9ebda.appspot.com",
  messagingSenderId: "1079762827569",
  appId: "1:1079762827569:web:aa53c8713d706e52cf5810",
  measurementId: "G-5KN15EML5B"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Screen3 = ({ navigation }) => {
  const [humidity, setHumidity] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [light, setLight] = useState(null);
  const [predictionData, setPredictionData] = useState(null);

  useEffect(() => {
    const humidityRef = ref(database, 'humidite du sol');
    const temperatureRef = ref(database, 'temperature');
    const lightRef = ref(database, 'luminosite');

    onValue(humidityRef, (snapshot) => {
      const humidityValue = snapshot.val();
      setHumidity(humidityValue);
    });

    onValue(temperatureRef, (snapshot) => {
      const temperatureValue = snapshot.val();
      setTemperature(temperatureValue);
    });

    onValue(lightRef, (snapshot) => {
      const lightValue = snapshot.val();
      setLight(lightValue);
    });
  }, []);

  const fetchPrediction = async () => {
    try {
      const response = await fetch('http://192.168.1.101:5000/prediction');
      const data = await response.json();
      setPredictionData(data.prediction[0]);
    } catch (error) {
      console.error('Error fetching prediction:', error);
    }
  };

  const goToNextScreen = () => {

    navigation.navigate('Screen4', { predictionData });
  };


   return (
     <View style={styles.container}>
       <View style={styles.topSection}>
         <Button title="Get Prediction" onPress={fetchPrediction} />
         {predictionData && (
           <View style={styles.predictionContainer}>
             <View style={[styles.dataItem, { backgroundColor: 'lightgreen' }]}>
               <Text style={styles.dataText}>Plante: {predictionData.Plante}</Text>
             </View>
             {/* Ajout d'un espace entre les cadres de la plante et de la prédiction */}
             <View style={{ height: 10 }} />
             <View style={[styles.dataItem, { backgroundColor: 'lightblue' }]}>
               <Text style={styles.dataText}>Prediction: {predictionData.Prediction}</Text>
             </View>
           </View>
         )}
       </View>
       <View style={styles.middleSection}>
         <View style={[styles.dataContainer, { backgroundColor: 'orange' }]}>
           <Text style={styles.dataText}>Humidité : {humidity}</Text>
         </View>
         <View style={[styles.dataContainer, { backgroundColor: 'red' }]}>
           <Text style={styles.dataText}>Température : {temperature}</Text>
         </View>
         <View style={[styles.dataContainer, { backgroundColor: 'yellow' }]}>
           <Text style={styles.dataText}>Luminosité : {light}</Text>
         </View>
       </View>
       <View style={styles.bottomSection}>
         <Button title="Next Screen" onPress={goToNextScreen} style={styles.smallButton} />
       </View>
     </View>
   );



      };
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  predictionText: {
    fontSize: 30,
    color: 'black',
  },
  dataContainer: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  dataText: {
    fontSize: 20,
    color: 'black',
  },
  smallButton: {
    fontSize: 10,
  },
});

export default Screen3;

