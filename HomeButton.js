import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
const HomeButton = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.goBack();
  };


  return (
    <TouchableOpacity style={styles.homeButton} onPress={handlePress}>
      <Image source={require('../assets/bouton-daccueil.png')} style={styles.homeIcon} />
    </TouchableOpacity>
  );
};

export default HomeButton;
const styles = StyleSheet.create({
  homeButton: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    zIndex: 1,
  },
  homeIcon: {
    width: 40,
    height: 30,
  },
});

