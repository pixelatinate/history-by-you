import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import MapView, { Callout, Marker } from "react-native-maps";
import type { LocationWithEntries } from "@history-by-you/db";
import { getLocations } from "./lib/data";

// UT Knoxville — matches the original project's origin and apps/web's default.
const INITIAL_REGION = {
  latitude: 35.9544,
  longitude: -83.9296,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function App() {
  const [locations, setLocations] = useState<LocationWithEntries[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Couldn&apos;t load locations: {error}</Text>
      </View>
    );
  }

  if (!locations) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={INITIAL_REGION}>
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{ latitude: location.point[1], longitude: location.point[0] }}
            pinColor="#D9042B"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{location.name}</Text>
                {location.entries[0] ? <Text>{location.entries[0].body}</Text> : null}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  callout: { maxWidth: 220, gap: 4 },
  calloutTitle: { fontWeight: "600" },
});
