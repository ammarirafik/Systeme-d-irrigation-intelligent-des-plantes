import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { initializeApp } from 'firebase/app';
import { ref, getDatabase, onValue } from 'firebase/database';
import axios from 'axios';
import HomeButton from './HomeButton';

const Screen3 = ({ navigation }) => {
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


  console.log("Initializing Firebase...");
  const app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully.");

  const [prediction, setPrediction] = useState(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    const getDataFromFirebase = () => {
      try {
        const database = getDatabase();
        const predictionRef = ref(database, 'predictions/0');

        onValue(predictionRef, (snapshot) => {
          const predictionValue = snapshot.val();
          if (predictionValue) {
            setPrediction(predictionValue);
          } else {
            console.log('Aucune prédiction disponible dans Firebase');
          }
        });
      } catch (error) {
        console.error('Erreur lors de la récupération de la prédiction depuis Firebase : ', error);
      }
    };

    getDataFromFirebase();
  }, []);

  const handleStart = () => {
    console.log("Bouton 'Démarrer le Servomoteur' pressé");
    axios.get('http://192.168.1.102/startServo')
      .then(response => {
        setResponseText(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de l'envoi de la requête startServo :", error);
        setResponseText("Erreur lors de l'envoi de la requête startServo");
      });
  }

  const handleStop = () => {
    console.log("Bouton 'Arrêter le Servomoteur' pressé");
    axios.get('http://192.168.1.102/stopServo')
      .then(response => {
        setResponseText(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de l'envoi de la requête stopServo :", error);
        setResponseText("Erreur lors de l'envoi de la requête stopServo");
      });
  }

  return (
    <View style={styles.container}>
      {prediction && (
        <View>
          <Text style={[{fontWeight: 'bold', color: 'black', fontSize: 30, marginBottom: 20}]}>{prediction.Prediction}</Text>
        </View>
      )}

      <StatusBar style="auto" />

      {}
      <HomeButton />

      {}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.startButton]} onPress={handleStart}>
          <Text>Démarrer le Servomoteur</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
          <Text>Arrêter le Servomoteur</Text>
        </TouchableOpacity>
      </View>

      {}
      <Text>{responseText}</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 100,
  },
  button: {
    padding: 15,
    borderRadius: 5,
  },
  startButton: {
    marginRight: 5,
    backgroundColor: 'green',
  },
  stopButton: {
    marginLeft: 5,
    backgroundColor: 'red',
  },
});

export default Screen3;
