import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, Platform } from 'react-native';
import PlayerDeck from "./decks/player-deck.component";
import OpponentDeck from "./decks/opponent-deck.component";
import Timer from "./timers/timer.component";
import Choices from "./choices/choices.component";
import Grid from "./grid/grid.component";
import PlayerInfo from "./player-info/player-info.component";
import OpponentInfo from "./player-info/opponent-info.component";
import EndGame from "../online-game/end-game.component";
import { SocketContext } from '../../contexts/socket.context';

const Board = ({ navigation }) => {

  const socket = useContext(SocketContext);
  const [isMyTurn, setIsMyTurn] = useState(false);

  socket.on("game.current-turn", (data) => {
    setIsMyTurn(data["isMyTurn"]);
  });

  socket.on("game.player-disconnection", () => {
    navigation.navigate('HomeScreen');
  });

  return (

    <View style={[styles.container, Platform.OS == "web" && styles.containerWeb]}>

      <View style={{ height: '7%' }} />

      <View style={styles.playersInfoContainer}>
        <PlayerInfo />
        <Timer />
        <OpponentInfo />
      </View>

      { !isMyTurn && 
        <>
        <View style={styles.row}>
          <OpponentDeck />
        </View>
      
        <View style={[styles.row]}>
          <Choices />
        </View>
        </>
      }

      <View style={[styles.row, { height: '45%' }]}>
        <Grid />
      </View>

      { isMyTurn && 
        <View style={[styles.row]}>
          <Choices />
        </View>
      }
      <View style={[styles.row, { height: '25%' }]}>
        <PlayerDeck />
      </View>

      <EndGame navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  containerWeb: {
    width: '50%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  playersInfoContainer: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
});

export default Board;
