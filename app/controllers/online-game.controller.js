import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";

export default function OnlineGameController({ navigation }) {

    const socket = useContext(SocketContext);

    const [inQueue, setInQueue] = useState(false);
    const [inGame, setInGame] = useState(false);
    const [idOpponent, setIdOpponent] = useState(null);

    useEffect(() => {

        socket.emit("queue.join");
        setInQueue(false);
        setInGame(false);

        socket.on('queue.added', (data) => {
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
        });

        socket.on('game.start', (data) => {
            setInQueue(data['inQueue']);
            setInGame(data['inGame']);
            setIdOpponent(data['idOpponent']);
        });

    }, []);

    leave = () => {
        socket.emit("queue.leave");
        navigation.navigate('HomeScreen');
    };

    return (

        <View style={styles.container}>

            {!inQueue && !inGame && (
                <>
                    <Text style={styles.paragraph}>
                        Waiting for server datas...
                    </Text>
                </>
            )}

            {inQueue && (
                <>
                    <Text style={styles.paragraph}>
                        Waiting for another player...
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={() => leave()}>
                        <Text style={styles.buttonText}>Quitter</Text>
                    </TouchableOpacity>
                </>
            )}

            {inGame && (
                <>
                    <Board navigation={navigation} />
                </>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        width: '100%',
        height: '100%',
    },
    paragraph: {
        fontSize: 18,
        fontWeight: 'bold',
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