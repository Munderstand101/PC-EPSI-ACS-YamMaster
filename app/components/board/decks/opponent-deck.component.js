import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dice.component";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDice } from '@fortawesome/free-solid-svg-icons/faDice';

const OpponentDeck = () => {
  const socket = useContext(SocketContext);
  const [displayOpponentDeck, setDisplayOpponentDeck] = useState(false);
  const [opponentDices, setOpponentDices] = useState(Array(5).fill({ value: "", locked: true }))
  const [rollsCounter, setRollsCounter] = useState(1);
  const [rollsMaximum, setRollsMaximum] = useState(3);

  useEffect(() => {
    socket.on("game.deck.view-state", (data) => {
      setDisplayOpponentDeck(data['displayOpponentDeck']);
      if (data['displayOpponentDeck']) {
        setRollsCounter(data['rollsCounter']);
        setRollsMaximum(data['rollsMaximum']);
        setOpponentDices(data['dices']);
      }
    });
  }, []);

  return (
    <View style={styles.deckOpponentContainer}>
      <View style={styles.nbRollIcon}>
        {[...Array(rollsMaximum+1 - rollsCounter)].map(() => (
          <FontAwesomeIcon icon={faDice} size={24} color="white"/>
        ))}
      </View>
      <View style={styles.diceContainer}>
        {opponentDices.map((diceData, index) => (
          <Dice
            key={index}
            locked={diceData.locked}
            value={diceData.value}
            opponent={true}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deckOpponentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  diceContainer: {
    flexDirection: "row",
    width: "70%",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  nbRollText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nbRollIcon: {
    flexDirection: "row",
    width: "25%",
    justifyContent: "space-evenly",
    height: 32,
    padding: 4,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#222222"
  },
});

export default OpponentDeck;
