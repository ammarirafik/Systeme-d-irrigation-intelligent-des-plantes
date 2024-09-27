import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';

export default function MapScreen() {
  const [coordinates, setCoordinates] = useState([]);

  const handleMapPress = event => {
    const { nativeEvent } = event;
    const newCoordinate = {
      latitude: nativeEvent.coordinate.latitude,
      longitude: nativeEvent.coordinate.longitude,
    };
    setCoordinates([...coordinates, newCoordinate]);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        {/* Dessiner la ligne de frontière */}
        <Polyline
          coordinates={coordinates}
          strokeWidth={2} // Épaisseur de la ligne
          strokeColor="blue" // Couleur de la ligne
        />
      </MapView>
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Frontières :</Text>
        <FlatList
          data={coordinates}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <Text style={styles.overlayText}>
              {`Point ${index + 1}: Latitude ${item.latitude}, Longitude ${item.longitude}`}
            </Text>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 10,
  },
  overlayText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
