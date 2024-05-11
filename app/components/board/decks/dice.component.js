import React, {useEffect, useState} from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDiceOne } from '@fortawesome/free-solid-svg-icons/faDiceOne';
import { faDiceTwo } from '@fortawesome/free-solid-svg-icons/faDiceTwo';
import { faDiceThree } from '@fortawesome/free-solid-svg-icons/faDiceThree';
import { faDiceFour } from '@fortawesome/free-solid-svg-icons/faDiceFour';
import { faDiceFive } from '@fortawesome/free-solid-svg-icons/faDiceFive';
import { faDiceSix } from '@fortawesome/free-solid-svg-icons/faDiceSix';
import { faSquare } from '@fortawesome/free-solid-svg-icons/faSquare';


const Dice = ({ index, locked, value, onPress, opponent }) => {
  const handlePress = () => {
    if (!opponent) {
      onPress(index);
    }
  };

  return (
    <>
      {(value == 1 || value == 2 || value == 3 || value == 4 || value == 5 || value == 6) && (
          <TouchableOpacity
            style={[styles.dice,  opponent && styles.opponentColor, locked && styles.lockedDice]}
            onPress={handlePress}
            disabled={opponent}
          >
            {value == 1 && (<FontAwesomeIcon style={styles.diceIcon} icon={faDiceOne} size={50} color="#222222"/>)}
            {value == 2 && (<FontAwesomeIcon icon={faDiceTwo} size={50} color="#222222"/>)}
            {value == 3 && (<FontAwesomeIcon icon={faDiceThree} size={50} color="#222222"/>)}
            {value == 4 && (<FontAwesomeIcon icon={faDiceFour} size={50} color="#222222"/>)}
            {value == 5 && (<FontAwesomeIcon icon={faDiceFive} size={50} color="#222222"/>)}
            {value == 6 && (<FontAwesomeIcon icon={faDiceSix} size={50} color="#222222"/>)}
            {value != 1 && value != 2 && value != 3 && value != 4 && value != 5 && value != 6 && (<FontAwesomeIcon icon={faSquare} size={50} color="#222222"/>)}
          </TouchableOpacity>
      )}
      
      {value != 1 && value != 2 && value != 3 && value != 4 && value != 5 && value != 6 && (
        <TouchableOpacity
          style={[styles.dice,  opponent && styles.opponentColor]}
          onPress={handlePress}
          disabled={opponent}
        >
          <FontAwesomeIcon icon={faSquare} size={50} color="#222222"/>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  dice: {
    width: 50,
    height: 50,
    backgroundColor: "#A785DF",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    borderRadius: 10,
  },
  lockedDice: {
    marginTop: 0,
    marginBottom: 40,
    transform: [{rotate: '45deg'}],
  },
  diceText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  opponentColor: {
    backgroundColor: "#F28383",
  },
});

export default Dice;
