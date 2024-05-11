// Durée d'un tour en secondes
const TURN_DURATION = 30;

const DECK_INIT = {
    dices: [
        { id: 1, value: '', locked: true },
        { id: 2, value: '', locked: true },
        { id: 3, value: '', locked: true },
        { id: 4, value: '', locked: true },
        { id: 5, value: '', locked: true },
    ],
    rollsCounter: 1,
    rollsMaximum: 3
};

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const PLAYER_INFO_INIT = {
    score: 0,
    pawns: 12,
};

const GRID_INIT = [
    [
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
    ]
];

const ALL_COMBINATIONS = [
    { value: 'Brelan1', id: 'brelan1' },
    { value: 'Brelan2', id: 'brelan2' },
    { value: 'Brelan3', id: 'brelan3' },
    { value: 'Brelan4', id: 'brelan4' },
    { value: 'Brelan5', id: 'brelan5' },
    { value: 'Brelan6', id: 'brelan6' },
    { value: 'Full', id: 'full' },
    { value: 'Carré', id: 'carre' },
    { value: 'Yam', id: 'yam' },
    { value: 'Suite', id: 'suite' },
    { value: '≤8', id: 'moinshuit' },
    { value: 'Sec', id: 'sec' },
    { value: 'Défi', id: 'defi' }
];

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: null,
        choices: {},
        deck: {},
        grid: {},
        player1Info: {},
        player2Info: {},
        winner: null,
        wantRetry: null,
        isEnd: false,
        botVsBot: false,
    }
}

const GameService = {

    init: {
        gameState: () => {
            const game = { ...GAME_INIT };
            game['gameState']['timer'] = TURN_DURATION;
            game['gameState']['deck'] = { ...DECK_INIT };
            game['gameState']['choices'] = { ...CHOICES_INIT };
            game['gameState']['grid'] = [ ...GRID_INIT];
            game['gameState']['player1Info'] = { ...PLAYER_INFO_INIT};
            game['gameState']['player2Info'] = { ...PLAYER_INFO_INIT};
            game['gameState']['winner'] = null;
            game['gameState']['wantRetry'] = null;
            game['gameState']['isEnd'] = false;
            game['gameState']['isVsBot'] = false;
            return game;
        },

        deck: () => {
            return { ...DECK_INIT };
        },

        choices: () => {
            return { ...CHOICES_INIT };
        },

        grid: () => {
            return [ ...GRID_INIT];
        },

        player1Info: () => {
            return [ ...PLAYER_INFO_INIT];
        },

        player2Info: () => {
            return [ ...PLAYER_INFO_INIT];
        }
    },

    send: {
        forPlayer: {
            viewGameState: (playerKey, game) => {
                return {
                    inQueue: false,
                    inGame: true,
                    idPlayer:
                        (playerKey === 'player:1')
                            ? game.player1Socket.id
                            : game.player2Socket.id,
                    idOpponent:
                        (playerKey === 'player:1')
                            ? game.player2Socket.id
                            : game.player1Socket.id
                };
            },

            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false,
                };
            },

            currentTurn: (playerKey, gameState) => {
                return {
                    isMyTurn: gameState.currentTurn === playerKey
                };
            },

            skipButton: (playerKey, gameState, isVisible, isClickable) => {
                return {
                    isVisible: gameState.currentTurn === playerKey && isVisible,
                    isClickable: isClickable,
                };
            },

            deckViewState: (playerKey, gameState) => {
                const deckViewState = {
                    displayPlayerDeck: gameState.currentTurn === playerKey,
                    displayOpponentDeck: gameState.currentTurn !== playerKey,
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices
                };
                return deckViewState;
            },

            deckViewEndState: () => {
                const deckViewEndState = {
                    displayPlayerDeck: false,
                    displayOpponentDeck: false,
                    displayRollButton: false,
                };
                return deckViewEndState;
            },

            choicesViewState: (playerKey, gameState) => {

                const choicesViewState = {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices
                }

                return choicesViewState;
            },

            gridViewState: (playerKey, gameState) => {

                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && (gameState.choices.availableChoices.length > 0),
                    grid: gameState.grid,
                    playerId: playerKey
                };

            },

            playerInfoViewState: (playerKey, gameState) => {

                return {
                    score:
                        (playerKey === 'player:1')
                            ? gameState.player1Info.score
                            : gameState.player2Info.score,
                    pawns:
                        (playerKey === 'player:1')
                            ? gameState.player1Info.pawns
                            : gameState.player2Info.pawns,
                };

            },

            viewEndGame: (winner, wantRetry, retryButton, me) => {
                return {
                    end: true,
                    winner: winner,
                    wantRetry: wantRetry,
                    retryButton: retryButton,
                    message: winner.message,
                    me: me,
                };
            },
        }
    },

    timer: {  
        getTurnDuration: () => {
            return TURN_DURATION;
        }
    },

    dices: {
        roll: (dicesToRoll) => {
            const rolledDices = dicesToRoll.map(dice => {
                if (dice.value === "") {
                    // Si la valeur du dé est vide, alors on le lance en mettant le flag locked à false
                    const newValue = String(Math.floor(Math.random() * 6) + 1); // Convertir la valeur en chaîne de caractères
                    return {
                        id: dice.id,
                        value: newValue,
                        locked: false
                    };
                } else if (!dice.locked) {
                    // Si le dé n'est pas verrouillé et possède déjà une valeur, alors on le relance
                    const newValue = String(Math.floor(Math.random() * 6) + 1);
                    return {
                        ...dice,
                        value: newValue
                    };
                } else {
                    // Si le dé est verrouillé ou a déjà une valeur mais le flag locked est true, on le laisse tel quel
                    return dice;
                }
            });
            return rolledDices;
        },

        lockEveryDice: (dicesToLock) => {
            const lockedDices = dicesToLock.map(dice => ({
                ...dice,
                locked: true // Verrouille chaque dé
            }));
            return lockedDices;
        }
    },

    choices: {
        findCombinations: (dices, isDefi, isSec) => {
            const availableCombinations = [];
            const allCombinations = ALL_COMBINATIONS;

            const counts = Array(7).fill(0); // Tableau pour compter le nombre de dés de chaque valeur (de 1 à 6)
            let hasPair = false; // Pour vérifier si une paire est présente
            let threeOfAKindValue = null; // Stocker la valeur du brelan
            let hasThreeOfAKind = false; // Pour vérifier si un brelan est présent
            let hasFourOfAKind = false; // Pour vérifier si un carré est présent
            let hasFiveOfAKind = false; // Pour vérifier si un Yam est présent
            let hasStraight = false; // Pour vérifier si une suite est présente
            let sum = 0; // Somme des valeurs des dés

            // Compter le nombre de dés de chaque valeur et calculer la somme
            for (let i = 0; i < dices.length; i++) {
                const diceValue = parseInt(dices[i].value);
                counts[diceValue]++;
                sum += diceValue;
            }

            // Vérifier les combinaisons possibles
            for (let i = 1; i <= 6; i++) {
                if (counts[i] === 2) {
                    hasPair = true;
                } else if (counts[i] === 3) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                } else if (counts[i] === 4) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                } else if (counts[i] === 5) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                    hasFiveOfAKind = true;
                }
            }

            const sortedValues = dices.map(dice => parseInt(dice.value)).sort((a, b) => a - b); // Trie les valeurs de dé

            // Vérifie si les valeurs triées forment une suite
            hasStraight = sortedValues.every((value, index) => index === 0 || value === sortedValues[index - 1] + 1);

            // Vérifier si la somme ne dépasse pas 8
            const isLessThanEqual8 = sum <= 8;

            // Retourner les combinaisons possibles via leur ID
            allCombinations.forEach(combination => {
                if (
                    (combination.id.includes('brelan') && hasThreeOfAKind && parseInt(combination.id.slice(-1)) === threeOfAKindValue) ||
                    (combination.id === 'full' && hasPair && hasThreeOfAKind) ||
                    (combination.id === 'carre' && hasFourOfAKind) ||
                    (combination.id === 'yam' && hasFiveOfAKind) ||
                    (combination.id === 'suite' && hasStraight) ||
                    (combination.id === 'moinshuit' && isLessThanEqual8) ||
                    (combination.id === 'defi' && isDefi && availableCombinations.length > 0)
                ) {
                    availableCombinations.push(combination);
                }
            });


            const notOnlyBrelan = availableCombinations.some(combination => !combination.id.includes('brelan'));

            if (isSec && availableCombinations.length > 0 && notOnlyBrelan) {
                availableCombinations.push(allCombinations.find(combination => combination.id === 'sec'));
            }

            return availableCombinations;
        }
    },

    grid: {

        resetcanBeCheckedCells: (grid) => {
            const updatedGrid = grid.map(row => row.map(cell => {
                return { ...cell, canBeChecked: false };    
            }));

            return updatedGrid;
        },

        updateGridAfterSelectingChoice: (idSelectedChoice, grid) => {

            const updatedGrid = grid.map(row => row.map(cell => {
                if (cell.id === idSelectedChoice && cell.owner === null) {
                    return { ...cell, canBeChecked: true };
                } else {
                    return cell;
                }
            }));

            return updatedGrid;
        },

        selectCell: (idCell, rowIndex, cellIndex, currentTurn, grid) => {
            const updatedGrid = grid.map((row, rowIndexParsing) => row.map((cell, cellIndexParsing) => {
                if ((cell.id === idCell) && (rowIndexParsing === rowIndex) && (cellIndexParsing === cellIndex)) {
                    return { ...cell, owner: currentTurn };
                } else {
                    return cell;
                }
            }));
        
            return updatedGrid;
        },

        selectCellById: (idCell, currentTurn, grid, nbCellChoose) => {
            let nbCell = 0;
            gridChange = false;
            const updatedGrid = grid.map((row, rowIndexParsing) => row.map((cell, cellIndexParsing) => {
                if (cell.id === idCell && cell.owner == null) {
                    if (nbCell == nbCellChoose) {
                        gridChange = true;
                        return { ...cell, owner: currentTurn };
                    } else {
                        nbCell++;
                        return cell;
                    }
                } else {
                    return cell;
                }
            }));
        
            if (gridChange) {
                return updatedGrid;
            } else {
                return grid;
            }
            
        },

        score: (game, currentTurn, grid) => {
            let suite = 0;
            let suiteScore = 0;
            let score = 0;
            let winner = false;
            grid.map((row, rowIndexParsing) => {
                suite = 0;
                suiteScore = 0;
                row.map((cell, cellIndexParsing) => {
                    if (cell.owner == currentTurn) {
                        suite++;
                        switch (suite) {
                            case 5:
                                winner = true;
                                break;
                            case 4:
                                suiteScore = 2;
                                break;
                            case 3: 
                                suiteScore = 1;
                                break;
                        }
                    } else {
                        suite = 0;
                    }
                });
                score = score + suiteScore;
            });

            suite = 0;
            suiteScore = 0;
            for (let column = 0; column < 5; column++) {
                suite = 0;
                suiteScore = 0;
                grid.map((row, rowIndexParsing) => {
                    if (row[column].owner == currentTurn) {
                        suite++;
                        switch (suite) {
                            case 5:
                                winner = true;
                                break;
                            case 4:
                                suiteScore = 2;
                                break;
                            case 3: 
                                suiteScore = 1;
                                break;
                        }
                    } else {
                        suite = 0;
                    }
                });
                score = score + suiteScore;
            };

            suite = 0;
            suiteScore = 0;

            for (let column = -2; column < 3; column++) {
                suite = 0;
                suiteScore = 0;
                grid.map((row, rowIndexParsing) => {
                    if (rowIndexParsing+column >= 0 && rowIndexParsing+column <= 4 && row[rowIndexParsing+column].owner == currentTurn) {
                        suite++;
                        switch (suite) {
                            case 5:
                                winner = true;
                                break;
                            case 4:
                                suiteScore = 2;
                                break;
                            case 3: 
                                suiteScore = 1;
                                break;
                        }
                    } else {
                        suite = 0;
                    }
                });
                score = score + suiteScore;
            }
            
            suite = 0;
            suiteScore = 0;
            for (let column = -2; column < 3; column++) {
                suite = 0;
                suiteScore = 0;
                grid.map((row, rowIndexParsing) => {
                    if (4-rowIndexParsing+column >= 0 && 4-rowIndexParsing+column <= 4 && row[4-rowIndexParsing+column].owner == currentTurn) {
                        suite++;
                        switch (suite) {
                            case 5:
                                winner = true;
                                break;
                            case 4:
                                suiteScore = 2;
                                break;
                            case 3: 
                                suiteScore = 1;
                                break;
                        }
                    } else {
                        suite = 0;
                    }
                });
                score = score + suiteScore;
            }
            

            return {
                score: score,
                winner: winner
            };
        },

    },

    game: {
        setWinner: (game, player, message = "") => {
            return {
                player: player,
                player1Info: game.gameState.player1Info,
                player2Info: game.gameState.player2Info,
                message: message
            }
        }

    },

    utils: {
        // Return game index in global games array by id
        findGameIndexById: (games, idGame) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

        findGameIndexBySocketId: (games, socketId) => {
            for (let i = 0; i < games.length; i++) {
                if ((games[i].player1Socket != null && games[i].player1Socket.id === socketId) || (games[i].player2Socket != null && games[i].player2Socket.id === socketId)) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

        findDiceIndexByDiceId: (dices, idDice) => {
            for (let i = 0; i < dices.length; i++) {
                if (dices[i].id === idDice) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        }
    }
}

module.exports = GameService;
