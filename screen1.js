
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';

const Screen1 = ({ navigation }) => {

return (
    <View style={styles.container}>
     <Text style={[styles.imageText, {fontWeight: 'bold', color: 'black', fontSize: 30, marginBottom: 20}]}> Clôture virtuelle</Text>


      <Image
        source={require('../assets/Vache-normande-ferme-coupigny-TheExplorers-valentin-pacaut-1600x900.jpg')}
        style={styles.image}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Screen2')} // Naviguer vers Screen2
      >
        <Text style={styles.buttonText}>choisir le frontière  </Text>

      </TouchableOpacity>
    </View>
  );
};

export default Screen1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '80%',
    height: '70%',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
