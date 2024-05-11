import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet } from 'react-native';
import { SocketContext } from '../../../contexts/socket.context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChessKnight } from '@fortawesome/free-solid-svg-icons/faChessKnight'
import { faCrown } from '@fortawesome/free-solid-svg-icons/faCrown';

const OpponentInfo = () => {

    const socket = useContext(SocketContext);
    const [playerScore, setPlayerScore] = useState(0);
    const [playerPawns, setPlayerPawns] = useState(12);

    useEffect(() => {

        socket.on("game.opponent-info.view-state", (data) => {
            setPlayerScore(data['score']);
            setPlayerPawns(data['pawns']);
            console.log(data);
        });

    }, []);
    
    return (

        <View style={styles.playerInfosContainer}>

            <View style={styles.row}>
                <Text style={styles.playerInfosText}>
                    {playerPawns}
                </Text>
                <FontAwesomeIcon icon={faChessKnight} size={32} color="#F28383" />
            </View>
            <View style={styles.row}>
                <Text style={styles.playerInfosText}>
                    {playerScore}
                </Text>
                <FontAwesomeIcon icon={faCrown} size={32} color="#F28383" />
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
            alignItems: 'flex-end',
            width: '35%',
            paddingRight: "8%",
          },
        playerInfosText : {
            marginRight: 5,
            fontSize: 32,
            fontWeight: 'bold',
            color: "#F28383"
        },
    });

export default OpponentInfo;
