import React, { useState, useContext, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import Dice from "./dice.component";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDice } from '@fortawesome/free-solid-svg-icons/faDice';

const PlayerDeck = () => {
  
  const socket = useContext(SocketContext);
  const [displayPlayerDeck, setDisplayPlayerDeck] = useState(false);
  const [dices, setDices] = useState(Array(5).fill(false));
  const [displayRollButton, setDisplayRollButton] = useState(false);
  const [rollsCounter, setRollsCounter] = useState(0);
  const [rollsMaximum, setRollsMaximum] = useState(3);
  const [skipIsVisible, setSkipIsVisible] = useState(false);
  const [skipIsClickable, setSkipIsClickable] = useState(false);

  useEffect(() => {

    socket.on("game.deck.view-state", (data) => {

      setDisplayPlayerDeck(data['displayPlayerDeck']);

      if (data['displayPlayerDeck']) {
        setDisplayRollButton(data['displayRollButton']);
        setRollsCounter(data['rollsCounter']);
        setRollsMaximum(data['rollsMaximum']);
        setDices(data['dices']);
      }

    });

    socket.on("game.skip-button", (data) => {
      
      setSkipIsVisible(data['isVisible']);
      setSkipIsClickable(data['isClickable']);

    });

  }, []);

  const toggleDiceLock = (index) => {

    const newDices = [...dices];

    if (newDices[index].value !== '' && displayRollButton) {
      socket.emit("game.dices.lock", newDices[index].id);
    }
  };

  const rollDices = () => {
    if (rollsCounter <= rollsMaximum) {
      socket.emit("game.dices.roll");
    }
  };

  const skip = () => {
    if (skipIsClickable) {
      setSkipIsClickable(false);
      socket.emit("game.skip.turn");
    }
  };

  return (

    <View style={styles.deckPlayerContainer}>

      {displayPlayerDeck && (

        <>
          <View style={styles.diceContainer}>
            {dices.map((diceData, index) => (
              <Dice
                key={diceData.id}
                index={index}
                locked={diceData.locked}
                value={diceData.value}
                onPress={toggleDiceLock}
              />
            ))}
          </View>

          {displayRollButton && (

            <>
              <TouchableOpacity style={styles.rollButton} onPress={rollDices}>
                <Text style={styles.rollButtonText}>Roll</Text>
                <View style={styles.rollButtonIcon}>
                  {[...Array(rollsMaximum+1 - rollsCounter)].map(() => (
                    <FontAwesomeIcon icon={faDice} size={24} color="white"/>
                  ))}
                </View>
                
              </TouchableOpacity>
            </>

          )}

            {skipIsVisible && rollsMaximum < rollsCounter && (
              <TouchableOpacity style={[styles.skipButton, !skipIsClickable && styles.skipButtonDisabled]} onPress={skip} disabled={!skipIsClickable} >
                <Text style={styles.skipButtonText}>SKIP</Text>
              </TouchableOpacity>
            )}

        </>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  deckPlayerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rollInfoContainer: {
    marginBottom: 10,
  },
  rollInfoText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  diceContainer: {
    flexDirection: "row",
    width: "70%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rollButton: {
    width: "30%",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222",
  },
  rollButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  rollButtonIcon: {
    flexDirection: "row",
    width: "70%",
    justifyContent: "space-evenly"
  },
  skipButton: {
    width: "15%",
    marginLeft: "50%",
    backgroundColor: "green",
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222222"
  },
  skipButtonDisabled: {
    backgroundColor: "#777777"
  },
  skipButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});

export default PlayerDeck;
