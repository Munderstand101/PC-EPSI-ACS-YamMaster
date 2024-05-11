// choices.component.js
import React, { useState, useEffect, useContext } from "react";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';

const Choices = () => {
    
    const socket = useContext(SocketContext);

    const [displayChoices, setDisplayChoices] = useState(false);
    const [canMakeChoice, setCanMakeChoice] = useState(false);
    const [idSelectedChoice, setIdSelectedChoice] = useState(null);
    const [availableChoices, setAvailableChoices] = useState([]);

    useEffect(() => {

        socket.on("game.choices.view-state", (data) => {
            setDisplayChoices(data['displayChoices']);
            setCanMakeChoice(data['canMakeChoice']);
            setIdSelectedChoice(data['idSelectedChoice']);
            setAvailableChoices(data['availableChoices']);
        });

    }, []);

    const handleSelectChoice = (choiceId) => {

        if (canMakeChoice) {
            setIdSelectedChoice(choiceId);
            socket.emit("game.choices.selected", { choiceId });
        }
        
    };

    return (
        <ScrollView horizontal contentContainerStyle={styles.scrollContainer}>
            <View style={styles.choicesContainer}>
            {displayChoices &&
                availableChoices.length != 0 ?
                    availableChoices.map((choice) => (
                        <TouchableOpacity
                            key={choice.id}
                            style={[
                                styles.choiceButton,
                                idSelectedChoice === choice.id && styles.selectedChoice,
                                !canMakeChoice && styles.disabledChoice
                            ]}
                            onPress={() => handleSelectChoice(choice.id)}
                            disabled={!canMakeChoice}
                        >
                            <Text style={[
                                styles.choiceText,
                                idSelectedChoice === choice.id && styles.selectedChoiceText,
                            ]}>
                                {choice.value
                            }</Text>
                        </TouchableOpacity>
                    ))
                :
                <TouchableOpacity
                    style={styles.emptyChoice}
                    disabled
                >      
                    <FontAwesomeIcon icon={faBan} size={24} color={"#FFD37D"} />
                </TouchableOpacity>

            }
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        minWidth: "100%",
        alignItems: 'center',
    },
    choicesContainer: {
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-evenly",
        width: "100%",
        marginVertical: 5,
    },
    choiceButton: {
        backgroundColor: "#222222",
        borderRadius: 10,
        margin: 5,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minWidth: 100,
        borderWidth: 3,
        borderColor: "#222222",
    },
    selectedChoice: {
        backgroundColor: "#FFD37D",
        borderWidth: 3,
        borderColor: "#222222",
    },
    selectedChoiceText: {
        color: "#222222",
    },
    choiceText: {
        fontSize: 16,
        fontWeight: "bold",
        padding: 10,
        color: "#FFD37D"
    },
    emptyChoice: {
        backgroundColor: "#222222",
        borderRadius: 10,
        margin: 5,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minWidth: 100,
        padding: 12,
        fontSize: 16,
        borderWidth: 3,
        borderColor: "#FFD37D",
    }
});

export default Choices;
