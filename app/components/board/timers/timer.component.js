import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';

const Timer = () => {

    const socket = useContext(SocketContext);
    const [timer, setTimer] = useState(0);
    const [isEnd, setIsEnd] = useState(false);

    useEffect(() => {

        socket.on("game.timer", (data) => {
            setTimer(data);
        });

        socket.on("game.end", () => {
            setIsEnd(true);
        });

    }, []);

    return (
        <>
            { !isEnd && 
                <View style={styles.timerContainer}>
                    <Text style={styles.text}>{timer}</Text>
                </View>
            }
        </>
    );
};

const styles = StyleSheet.create({
    timerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        width: "30%"
    },
    text: {
        fontSize: 64,
        fontWeight: 'bold',
        color: "#222222",
    }
});

export default Timer;
