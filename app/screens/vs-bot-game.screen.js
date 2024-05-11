import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Button, Text } from "react-native";
import { SocketContext } from '../contexts/socket.context';
import Board from "../components/board/board.component";

export default function VsBotGameScreen({ navigation }) {
    
    const socket = useContext(SocketContext);

    useEffect(() => {

        socket.emit("vsBotGame.start");

    }, []);

    return (

        <View style={styles.container}>

            {!socket && (
                <>
                    <Text style={styles.paragraph}>
                        No connection with server...
                    </Text>
                    <Text style={styles.footnote}>
                        Restart the app and wait for the server to be back again.
                    </Text>
                </>
            )}

            {socket && (
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
    }
});
