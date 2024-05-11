import { StyleSheet, View, TouchableOpacity, Text } from "react-native";

export default function HomeScreen({ navigation }) {

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Yam Master!</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OnlineGameScreen')}>
          <Text style={styles.buttonText}>JOUER EN LIGNE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('VsBotGameScreen')}>
          <Text style={styles.buttonText}>JOUER CONTRE LE BOT</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 46,
    fontWeight: "bold",
    marginBottom: 50,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});
