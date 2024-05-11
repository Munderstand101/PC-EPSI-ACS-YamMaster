import React, {useState, useEffect, useContext } from 'react';
import {Alert, Modal, StyleSheet, Text, Pressable, View} from 'react-native';
import { SocketContext } from '../../contexts/socket.context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChessKnight } from '@fortawesome/free-solid-svg-icons/faChessKnight'
import { faCrown } from '@fortawesome/free-solid-svg-icons/faCrown';

const EndGame = ({navigation}) => {

    const socket = useContext(SocketContext);

    const [modalVisible, setModalVisible] = useState(false);
    const [winner, setWinner] = useState({player: "", player1Info: {score: 0, pawns: 0}, player2Info: {score: 0, pawns: 0}});
    const [retryButton, setRetryButton] = useState(true);
    const [wantRetry, setWantRetry] = useState(false);
    const [message, setMessage] = useState("");
    const [timer, setTimer] = useState(0);
    const [me, setMe] = useState("");
    const [color, setColor] = useState("");


    useEffect(() => {

        socket.on("game.end", (data) => {
            setModalVisible(data['end']);
            setWinner(data['winner']);
            setWantRetry(data['wantRetry']);
            setRetryButton(data['retryButton']);
            setMe(data['me']);
            setMessage(data['message']);
            if(winner.player == me) {
              setColor("#A785DF");
            } else if ( winner.player == "Draw") {
              setColor("#FFD37D");
            } else {
              setColor("#F28383");
            }
        });

        socket.on("game.retry", () => {
          setModalVisible(false);
          navigation.navigate('OnlineGameScreen');
        });

        socket.on("game.timer", (data) => {
          setTimer(data);
      });

    }, []);

    leave = () => {
      socket.emit("game.want.retry", false)
      navigation.navigate('HomeScreen');
    };

  return (
    <View style={styles.centeredView}>
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { borderColor: color}]}>
            {message != "" && 
              <Text style={styles.modalMessageText}>
                  {message}
              </Text>
            }
            { winner.player == me ?
              <Text style={[styles.modalText, {color: color}]}>Gagné</Text>
            :
              <>
                { winner.player == "Draw" ?
                  <Text style={[styles.modalText, {color: color}]}>Egalité</Text>
                :
                <Text style={[styles.modalText, {color:color}]}>Perdu</Text>
                }
              </>
            }
            <View style={styles.viewInfo}>
              <View>
                <Text style={[styles.viewInfoTextOne]}>player:1</Text>
                <Text style={[styles.viewInfoTextOne]}>
                  <FontAwesomeIcon icon={faCrown} size={16} color="#A785DF" />
                  {winner.player1Info.score}</Text>
                <Text style={[styles.viewInfoTextOne]}>
                  <FontAwesomeIcon icon={faChessKnight} size={16} color="#A785DF" />
                  {winner.player1Info.pawns}
                </Text>
              </View>
              <View>
                <Text style={[styles.viewInfoTextTwo]}>player:2</Text>
                <Text style={[styles.viewInfoTextTwo]}>
                  {winner.player2Info.score}
                  <FontAwesomeIcon icon={faCrown} size={16} color="#F28383" />
                </Text>
                <Text style={[styles.viewInfoTextTwo]}>
                  {winner.player2Info.pawns}
                  <FontAwesomeIcon icon={faChessKnight} size={16} color="#F28383" />
                </Text>
              </View>
            </View>
            { retryButton && (
              <Pressable
                  style={[styles.button, ]}
                  disabled={wantRetry}
                  onPress={() => { socket.emit("game.want.retry", true) }}>
                  <Text style={styles.textStyle}>
                      { wantRetry ? "Retry " : "Want Retry " }
                      { wantRetry && "(" + timer + ")" }
                  </Text>
              </Pressable>
            )}
            
            <Pressable
              style={[styles.button]}
              onPress={() => leave()}
            >
              <Text style={styles.textStyle}>Quit { !wantRetry && "(" + timer + ")" }</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#00000077",
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 10,
  },
  viewInfo: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginBottom: 20,
  },
  viewInfoTextOne: {
    fontSize: 16,
    width: "100%",
    color: "#A785DF",
    fontWeight: "bold",
    marginRight: 6,
  },
  viewInfoTextTwo: {
    fontSize: 16,
    textAlign: "right",
    color: "#F28383",
    fontWeight: "bold",
    marginLeft: 6,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#222222",
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: "bold",
  },
  modalMessageText: {
    marginBottom: 15,
    textAlign: 'center',
    color: "green",
    fontWeight: "bold",
    padding: 6,
    borderWidth: 2,
    borderColor: "green",
    borderRadius: 10,
  },
});

export default EndGame;