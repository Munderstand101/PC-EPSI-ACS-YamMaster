import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChessKnight } from '@fortawesome/free-solid-svg-icons/faChessKnight';
import { faCrown } from '@fortawesome/free-solid-svg-icons/faCrown';

const PlayerInfo = () => {

    const socket = useContext(SocketContext);
    const [playerScore, setPlayerScore] = useState(0);
    const [playerPawns, setPlayerPawns] = useState(12);

    useEffect(() => {

        socket.on("game.player-info.view-state", (data) => {
            setPlayerScore(data['score']);
            setPlayerPawns(data['pawns']);
            console.log(data);
        });

    }, []);

    return (

        <View style={styles.playerInfosContainer}>

            <View style={styles.row}>
                <FontAwesomeIcon icon={faChessKnight} size={32} color="#A785DF" />
                <Text style={styles.playerInfosText}>
                    {playerPawns}
                </Text>
            </View>
            <View style={styles.row}>
                <FontAwesomeIcon icon={faCrown} size={32} color="#A785DF" />
                <Text style={styles.playerInfosText}>
                    {playerScore}
                </Text>
            </View>
           
        </View>
        
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
      },
    playerInfosContainer: {
        alignItems: 'start',
        width: '35%',
        paddingLeft: "8%",
      },
    playerInfosText : {
        marginLeft: 5,
        fontSize: 32,
        color: '#A785DF',
        fontWeight: 'bold'
    },
});

export default PlayerInfo;
