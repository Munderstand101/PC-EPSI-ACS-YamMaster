import React, {useEffect, useContext, useState} from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SocketContext } from "../../../contexts/socket.context";

const Grid = () => {

    const socket = useContext(SocketContext);

    const [displayGrid, setDisplayGrid] = useState(false);
    const [canSelectCells, setCanSelectCells] = useState([]);
    const [grid, setGrid] = useState([]);
    const [playerId, setPlayerId] = useState("");

    const handleSelectCell = (cellId, rowIndex, cellIndex) => {
        if (canSelectCells) {
            socket.emit("game.grid.selected", { cellId, rowIndex, cellIndex });
        }
    };

    useEffect(() => {
        socket.on("game.grid.view-state", (data) => {
            console.log(data);
            setDisplayGrid(data['displayGrid']);
            setCanSelectCells(data['canSelectCells'])
            setGrid(data['grid']);
            setPlayerId(data['playerId']);
        });
    }, []);

    return (
        <View style={styles.gridContainer}>
            {displayGrid &&
                grid.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((cell, cellIndex) => (
                            <TouchableOpacity
                                key={cell.id}
                                style={[
                                    styles.cell,
                                    cell.owner === playerId && styles.playerOwnedCell,
                                    cell.owner !== null && cell.owner !== playerId && styles.opponentOwnedCell,
                                    (cell.canBeChecked && !(cell.owner === "player:1") && !(cell.owner === "player:2")) && styles.canBeCheckedCell,
                                    rowIndex !== 0 && styles.topBorder,
                                    cellIndex !== 0 && styles.leftBorder,
                                ]}
                                onPress={() => handleSelectCell(cell.id, rowIndex, cellIndex)}
                                disabled={!cell.canBeChecked}
                            >
                                <Text style={[styles.cellText, cell.owner !== null && styles.ownedCellText]}>{cell.viewContent}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        flex: 7,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        margin: 3,
        backgroundColor: "#222222",
        margin: 10,
        padding: 3,
        borderRadius: 15,
    },
    row: {
        flexDirection: "row",
        flex: 1,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 3,
    },
    cell: {
        flexDirection: "row",
        flex: 2,
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        marginHorizontal: 3,
        backgroundColor: "white",
    },
    cellText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    ownedCellText: {
        color: "white",
    },
    playerOwnedCell: {
        backgroundColor: "#A785DF",
        opacity: 0.9,
    },
    opponentOwnedCell: {
        backgroundColor: "#F28383",
        opacity: 0.9,
    },
    canBeCheckedCell: {
        backgroundColor: "#FFD37D",
    },
});

export default Grid;
