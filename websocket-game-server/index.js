const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var uniqid = require('uniqid');
const GameService = require('./services/game.service');
const { warn } = require('console');
const { disconnect } = require('process');

// ---------------------------------------------------
// -------- CONSTANTS AND GLOBAL VARIABLES -----------
// ---------------------------------------------------
let games = [];
let queue = [];

// ------------------------------------
// -------- EMITTER METHODS -----------
// ------------------------------------

const updateClientsViewTimers = (game) => {
  if (game.player1Socket != null) {
    game.player1Socket.emit('game.timer', game.gameState.timer);
  }
  if (game.player2Socket != null) {
    game.player2Socket.emit('game.timer', game.gameState.timer);
  }
};

const playerDisconnection = (game) => {
  if (game.player1Socket != null) {
    game.player1Socket.emit('game.player-disconnection');
  }
  if (game.player2Socket != null) {
    game.player2Socket.emit('game.player-disconnection');
  }
};

const updateClientsCurrentTurn = (game) => {
  setTimeout(() => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.current-turn', GameService.send.forPlayer.currentTurn('player:1', game.gameState));
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.current-turn', GameService.send.forPlayer.currentTurn('player:2', game.gameState));
    }
  }, 200)
}

const updateClientsSkipButton = (game, isVisible) => {
  setTimeout(() => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.skip-button', GameService.send.forPlayer.skipButton('player:1', game.gameState, isVisible, false));
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.skip-button', GameService.send.forPlayer.skipButton('player:2', game.gameState, isVisible, false));
    }
  }, 200);
  if (isVisible) {
    setTimeout(() => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.skip-button', GameService.send.forPlayer.skipButton('player:1', game.gameState, isVisible, true));
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.skip-button', GameService.send.forPlayer.skipButton('player:2', game.gameState, isVisible, true));
    }
  }, 2000)
  }
  
}

const updateClientsViewDecks = (game) => {
  setTimeout(() => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:1', game.gameState));
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewState('player:2', game.gameState));
    }
  }, 200);
};

const updateClientsViewEndDecks = (game) => {
  setTimeout(() => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewEndState());
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.deck.view-state', GameService.send.forPlayer.deckViewEndState());
    }
  }, 200);
};

const updateClientsViewChoices = (game) => {
  setTimeout(() => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:1', game.gameState));
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.choices.view-state', GameService.send.forPlayer.choicesViewState('player:2', game.gameState));
    }
  }, 200);
}

const updateClientsViewGrid = (game) => {
  setTimeout(() => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:1', game.gameState));
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.grid.view-state', GameService.send.forPlayer.gridViewState('player:2', game.gameState));
    }
  }, 200)
}

const updateClientsViewEndGame = (game, wantRetry, retryButton) => {
  setTimeout(() => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.end', GameService.send.forPlayer.viewEndGame(game.gameState.winner, wantRetry, retryButton, "player:1"));
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.end', GameService.send.forPlayer.viewEndGame(game.gameState.winner, wantRetry, retryButton, "player:2"));
    }
  }, 200)
}

const updateClientsViewPlayerInfo = (game) => {
  setTimeout(() => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.player-info.view-state', GameService.send.forPlayer.playerInfoViewState('player:1', game.gameState));
      game.player1Socket.emit('game.opponent-info.view-state', GameService.send.forPlayer.playerInfoViewState('player:2', game.gameState));
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.player-info.view-state', GameService.send.forPlayer.playerInfoViewState('player:2', game.gameState));
      game.player2Socket.emit('game.opponent-info.view-state', GameService.send.forPlayer.playerInfoViewState('player:1', game.gameState));
    }
  }, 200)
}

const updateViewNewGame = (game) => {
    if (game.player1Socket != null) {
      game.player1Socket.emit('game.retry');
    }
    if (game.player2Socket != null) {
      game.player2Socket.emit('game.retry');
    }
}

// ---------------------------------
// -------- GAME METHODS -----------
// ---------------------------------

const createGame = (player1Socket, player2Socket) => {

  // init objet (game) with this first level of structure:
  // - gameState : { .. evolutive object .. }
  // - idGame : just in case ;)
  // - player1Socket: socket instance key "joueur:1"
  // - player2Socket: socket instance key "joueur:2"
  const newGame = GameService.init.gameState();
  newGame['idGame'] = uniqid();
  newGame['player1Socket'] = player1Socket;
  newGame['player2Socket'] = player2Socket;

  // push game into 'games' global array
  games.push(newGame);

  let gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

  // just notifying screens that game is starting
  games[gameIndex].player1Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:1', games[gameIndex]));
  games[gameIndex].player2Socket.emit('game.start', GameService.send.forPlayer.viewGameState('player:2', games[gameIndex]));

  // we update views
  updateClientsViewTimers(games[gameIndex]);
  updateClientsViewDecks(games[gameIndex]);
  updateClientsViewGrid(games[gameIndex]);
  updateClientsViewPlayerInfo(games[gameIndex]);
  updateClientsCurrentTurn(games[gameIndex]);

  const gameId = games[gameIndex].idGame;

  // timer every second
  const gameInterval = setInterval(() => {
    
    const newGameIndex = GameService.utils.findGameIndexById(games, gameId);
    if (newGameIndex != -1 && gameIndex != newGameIndex) {
      gameIndex = newGameIndex;
    }

    if (games[gameIndex].gameState.winner != null) {

      games[gameIndex].gameState.timer = 15;
      endGame();
    }
    
    // timer variable decreased
    games[gameIndex].gameState.timer--;

    // emit timer to both clients every seconds
    updateClientsViewTimers(games[gameIndex]);

    // if timer is down to 0, we end turn
    if (games[gameIndex].gameState.timer === 0) {

      // switch currentTurn variable
      games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
      
      // reset timer
      games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

      // reset deck / choices / grid states
      games[gameIndex].gameState.deck = GameService.init.deck();
      games[gameIndex].gameState.choices = GameService.init.choices();
      games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);

      // reset views also
      updateClientsViewTimers(games[gameIndex]);
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
      updateClientsViewGrid(games[gameIndex]);
      updateClientsViewPlayerInfo(games[gameIndex]);
      updateClientsCurrentTurn(games[gameIndex]);
    }

  }, 1000);

  
  const endGame = () => {
    clearInterval(gameInterval);

    console.log(games[gameIndex].gameState.winner);
    updateClientsViewEndDecks(games[gameIndex]);

    games[gameIndex].gameState.timer = 1500;
    updateClientsViewTimers(games[gameIndex]);

    const endGameInterval = setInterval(() => {
      games[gameIndex].gameState.timer--;
      updateClientsViewTimers(games[gameIndex]);

      if ((games[gameIndex].player1Socket == null && games[gameIndex].player2Socket == null)) {
        console.log("end game");
        clearInterval(endGameInterval);
        playerDisconnection(games[gameIndex]);
        games.splice(gameIndex, 1);
        console.log(games.length);
        return;
      }

      if (games[gameIndex].gameState.timer == 0) {
        console.log("end game");
        clearInterval(endGameInterval);
        let player1Socket = null;
        let player2Socket = null;
        
        if (games[gameIndex].gameState.wantRetry) {
            updateViewNewGame(games[gameIndex]);
            player1Socket = games[gameIndex].player1Socket;
            player2Socket = games[gameIndex].player2Socket;
            playerLeaveTheGame(games[gameIndex], games[gameIndex].player1Socket);
            playerLeaveTheGame(games[gameIndex], games[gameIndex].player2Socket);
        } else {
          playerDisconnection(games[gameIndex]);
        }

        games.splice(gameIndex, 1);
        console.log(games.length);
        if (player1Socket != null && player2Socket != null) {
          createGame(player2Socket, player1Socket);
        }
        return;
      }
  
    }, 1000);
  }

  // remove intervals at deconnection
  player1Socket.on('disconnect', () => {
    games[gameIndex].gameState.winner = GameService.game.setWinner(games[gameIndex], 'player:2', "player:1 has disconnected");
    updateClientsViewEndGame(games[gameIndex], false, false);
    
    playerLeaveTheGame(games[gameIndex], games[gameIndex].player1Socket, gameIndex);
  });

  player2Socket.on('disconnect', () => {
    games[gameIndex].gameState.winner = GameService.game.setWinner(games[gameIndex], 'player:1', "player:2 has disconnected");
    updateClientsViewEndGame(games[gameIndex], false, false);

    playerLeaveTheGame(games[gameIndex], games[gameIndex].player2Socket, gameIndex);
  });

};

const newPlayerInQueue = (socket) => {

  queue.push(socket);

  // 'queue' management
  if (queue.length >= 2) {
    const player1Socket = queue.shift();
    const player2Socket = queue.shift();
    createGame(player1Socket, player2Socket);
  }
  else {
    socket.emit('queue.added', GameService.send.forPlayer.viewQueueState());
  }
};

const playerLeaveTheQueue = (socket) => {
  if(queue.indexOf(socket) != null){
    queue.splice(queue.indexOf(socket), 1);
  }
};

const playerLeaveTheGame = (game ,socket) => {
  updateClientsViewEndDecks(game);
  if (game.player1Socket == socket) {
    console.log("le 1 quitte")
    game.player1Socket = null;
  } else {
    console.log("le 2 quitte")
    game.player2Socket = null;
  }
};

// ---------------------------------------
// -------- SOCKETS MANAGEMENT -----------
// ---------------------------------------

io.on('connection', socket => {
  console.log(`[${socket.id}] socket connected`);

  socket.on('queue.join', () => {
    console.log(`[${socket.id}] new player in queue `)
    newPlayerInQueue(socket);
  });

  socket.on('queue.leave', () => {
    console.log(`[${socket.id}] player leave the queue `)
    playerLeaveTheQueue(socket);
  });

  socket.on('vsBotGame.start', () => {
    console.log(`[${socket.id}] new player start vsBot game `)
    createVsBotGame(socket);
  });

  socket.on('game.dices.roll', () => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);

    // if not last throw
    if (games[gameIndex].gameState.deck.rollsCounter < games[gameIndex].gameState.deck.rollsMaximum) {

      // dices management
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;
      updateClientsSkipButton(games[gameIndex], false);
    }
    // if last throw
    else {

      // dices management 
      games[gameIndex].gameState.deck.dices = GameService.dices.roll(games[gameIndex].gameState.deck.dices);
      games[gameIndex].gameState.deck.rollsCounter++;
      games[gameIndex].gameState.deck.dices = GameService.dices.lockEveryDice(games[gameIndex].gameState.deck.dices);

    }

    // combinations management
    const dices = games[gameIndex].gameState.deck.dices;
    const isDefi = Math.floor(Math.random() * 10) + 1 == 1 ? true : false;
    const isSec = games[gameIndex].gameState.deck.rollsCounter === 2;

    const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
    games[gameIndex].gameState.choices.availableChoices = combinations;

    if (games[gameIndex].gameState.deck.rollsCounter > games[gameIndex].gameState.deck.rollsMaximum && games[gameIndex].gameState.choices.availableChoices.length == 0) {
      games[gameIndex].gameState.timer = 5;
      updateClientsSkipButton(games[gameIndex], false);
    } else if (games[gameIndex].gameState.deck.rollsCounter > games[gameIndex].gameState.deck.rollsMaximum && games[gameIndex].gameState.choices.availableChoices.length > 0) {
      updateClientsSkipButton(games[gameIndex], true);
    }

    // emit to views new state
    updateClientsViewDecks(games[gameIndex]);
    updateClientsViewChoices(games[gameIndex]);
  });

  socket.on('game.skip.turn', () => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    games[gameIndex].gameState.timer = 2;
    games[gameIndex].gameState.deck = GameService.init.deck();
    games[gameIndex].gameState.choices = GameService.init.choices();
    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
  });

  socket.on('game.dices.lock', (idDice) => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    const indexDice = GameService.utils.findDiceIndexByDiceId(games[gameIndex].gameState.deck.dices, idDice);

    // reverse flag 'locked'
    games[gameIndex].gameState.deck.dices[indexDice].locked = !games[gameIndex].gameState.deck.dices[indexDice].locked;

    updateClientsViewDecks(games[gameIndex]);
  });

  socket.on('game.want.retry', (wantRetry) => {
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    if (wantRetry) {
      if (games[gameIndex].gameState.wantRetry == null) {
        console.log("juste un");
        games[gameIndex].gameState.wantRetry = true;
        updateClientsViewEndGame(games[gameIndex], true, true);
      }
    } else {
      games[gameIndex].gameState.wantRetry = false;
      updateClientsViewEndGame(games[gameIndex], false, false);
      console.log("non");
      playerLeaveTheGame(games[gameIndex], socket, gameIndex);
    }
    
    
  });

  socket.on('game.choices.selected', (data) => {

    // gestion des choix
    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);
    games[gameIndex].gameState.choices.idSelectedChoice = data.choiceId;

    // gestion de la grid
    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.updateGridAfterSelectingChoice(data.choiceId, games[gameIndex].gameState.grid);

    
    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
  });

  socket.on('game.grid.selected', (data) => {

    const gameIndex = GameService.utils.findGameIndexBySocketId(games, socket.id);

    games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);
    games[gameIndex].gameState.grid = GameService.grid.selectCell(data.cellId, data.rowIndex, data.cellIndex, games[gameIndex].gameState.currentTurn, games[gameIndex].gameState.grid);
    
    let score = GameService.grid.score(games[gameIndex], games[gameIndex].gameState.currentTurn, games[gameIndex].gameState.grid);
    
    if (games[gameIndex].gameState.currentTurn === 'player:1') {
      games[gameIndex].gameState.player1Info.pawns--;
      games[gameIndex].gameState.player1Info.score = score.score;
    } else {
      games[gameIndex].gameState.player2Info.pawns--;
      games[gameIndex].gameState.player2Info.score = score.score;
    }

    if (score.winner) {
      games[gameIndex].gameState.winner = GameService.game.setWinner(games[gameIndex], games[gameIndex].gameState.currentTurn);
    }

    if (games[gameIndex].gameState.winner != null) {
      updateClientsViewEndGame(games[gameIndex], false, true);
    } else if (games[gameIndex].gameState.player1Info.pawns == 0 || games[gameIndex].gameState.player2Info.pawns == 0) {
        if (games[gameIndex].gameState.player1Info.score == games[gameIndex].gameState.player2Info.score) {
          games[gameIndex].gameState.winner = GameService.game.setWinner(games[gameIndex], 'Draw')
        } else if (games[gameIndex].gameState.player1Info.score > games[gameIndex].gameState.player2Info.score) {
          games[gameIndex].gameState.winner = GameService.game.setWinner(games[gameIndex], 'player:1')
        } else {
          games[gameIndex].gameState.winner = GameService.game.setWinner(games[gameIndex], 'player:2')
        }
        updateClientsViewEndGame(games[gameIndex], false, true);
    }

    // Here calcul score

    games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
    games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

    games[gameIndex].gameState.deck = GameService.init.deck();
    games[gameIndex].gameState.choices = GameService.init.choices();

    updateClientsViewTimers(games[gameIndex]);
    updateClientsViewDecks(games[gameIndex]);
    updateClientsViewChoices(games[gameIndex]);
    updateClientsViewGrid(games[gameIndex]);
    updateClientsViewPlayerInfo(games[gameIndex]);
    updateClientsCurrentTurn(games[gameIndex]);

    if(games[gameIndex].gameState.currentTurn == 'player:2' || games[gameIndex].gameState.botVsBot) {
      AiBot(games[gameIndex]);
    }
  });

  socket.on('disconnect', reason => {
    console.log(`[${socket.id}] socket disconnected - ${reason}`);
    playerLeaveTheQueue(socket);
  });
});

// -----------------------------------
// -------- SERVER METHODS -----------
// -----------------------------------

app.get('/', (req, res) => res.sendFile('index.html'));

http.listen(3000, function () {
  console.log('listening on *:3000');
});


// ---------------------------------------
// -------- BOT GAME METHODS -------------
// ---------------------------------------

const createVsBotGame = (playerSocket) => {
  const botVsBot = false;

  console.log(`[] start new vsBot game `)

  const newGame = GameService.init.gameState();
  newGame['idGame'] = uniqid();
  newGame['player1Socket'] = playerSocket;
  
  games.push(newGame);

  let gameIndex = GameService.utils.findGameIndexById(games, newGame.idGame);

  // we update views
  updateClientsViewTimers(games[gameIndex]);
  updateClientsViewDecks(games[gameIndex]);
  updateClientsViewGrid(games[gameIndex]);
  updateClientsViewPlayerInfo(games[gameIndex]);
  updateClientsCurrentTurn(games[gameIndex]);

  const gameId = games[gameIndex].idGame;
  games[gameIndex].gameState.botVsBot = botVsBot;

  if (botVsBot) {
    AiBot(games[gameIndex]);
  }

  const gameInterval = setInterval(() => {
    
    const newGameIndex = GameService.utils.findGameIndexById(games, gameId);
    if (newGameIndex != -1 && gameIndex != newGameIndex) {
      gameIndex = newGameIndex;
    }

    if (games[gameIndex].gameState.winner != null) {

      games[gameIndex].gameState.timer = 1500;
      endGame();
    }
    
    // timer variable decreased
    games[gameIndex].gameState.timer--;

    // emit timer to both clients every seconds
    updateClientsViewTimers(games[gameIndex]);

    // if timer is down to 0, we end turn
    if (games[gameIndex].gameState.timer <= 0) {

      // switch currentTurn variable
      games[gameIndex].gameState.currentTurn = games[gameIndex].gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
      
      // reset timer
      games[gameIndex].gameState.timer = GameService.timer.getTurnDuration();

      // reset deck / choices / grid states
      games[gameIndex].gameState.deck = GameService.init.deck();
      games[gameIndex].gameState.choices = GameService.init.choices();
      games[gameIndex].gameState.grid = GameService.grid.resetcanBeCheckedCells(games[gameIndex].gameState.grid);

      // reset views also
      updateClientsViewTimers(games[gameIndex]);
      updateClientsViewDecks(games[gameIndex]);
      updateClientsViewChoices(games[gameIndex]);
      updateClientsViewGrid(games[gameIndex]);
      updateClientsViewPlayerInfo(games[gameIndex]);
      updateClientsCurrentTurn(games[gameIndex]);

      if(games[gameIndex].gameState.currentTurn == 'player:2' || botVsBot) {
        AiBot(games[gameIndex]);
      }
    }

  }, 1000);

  const endGame = () => {
    clearInterval(gameInterval);

    console.log(games[gameIndex].gameState.winner);
    updateClientsViewEndDecks(games[gameIndex]);

    updateClientsViewTimers(games[gameIndex]);

    const endGameInterval = setInterval(() => {
      games[gameIndex].gameState.timer--;
      updateClientsViewTimers(games[gameIndex]);

      if (games[gameIndex].gameState.timer == 0) {
        console.log("end game");
        clearInterval(endGameInterval);
        playerDisconnection(games[gameIndex]);
        games.splice(gameIndex, 1);
        return;
      }
  
    }, 1000);
  }
}


const AiBot = (game) => {
  const botSpeed = "1000";

  if (game.gameState.winner == null) {
    setTimeout(() => {
      rollBot(game);

      setTimeout(() => {
        if (game.gameState.choices.availableChoices.length == 0) {
          console.log("aucun choix 1");
          rollBot(game);

          setTimeout(() => {
            if (game.gameState.choices.availableChoices.length == 0) {
              console.log("aucun choix 2");
              rollBot(game);

              setTimeout(() => {
                if (game.gameState.choices.availableChoices.length == 0) {
                  console.log("aucun choix 3");
                  game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
                  game.gameState.timer = GameService.timer.getTurnDuration();

                  game.gameState.deck = GameService.init.deck();
                  game.gameState.choices = GameService.init.choices();

                  updateClientsViewTimers(game);
                  updateClientsViewDecks(game);
                  updateClientsViewChoices(game);
                  updateClientsViewGrid(game);
                  updateClientsViewPlayerInfo(game);
                  updateClientsCurrentTurn(game);

                  if(game.gameState.botVsBot) {
                    AiBot(game);
                  }
                } else {
                  let selectedChoice = selectChoiceBot(game);
                  if (selectedChoice) {
                    setTimeout(() => {
                      selectGridBot(game, selectedChoice);
                    }, botSpeed);
                  } else {
                    game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
                    game.gameState.timer = GameService.timer.getTurnDuration();

                    game.gameState.deck = GameService.init.deck();
                    game.gameState.choices = GameService.init.choices();

                    updateClientsViewTimers(game);
                    updateClientsViewDecks(game);
                    updateClientsViewChoices(game);
                    updateClientsViewGrid(game);
                    updateClientsViewPlayerInfo(game);
                    updateClientsCurrentTurn(game);

                    if(game.gameState.botVsBot) {
                      AiBot(game);
                    }
                  }
                }
              }, botSpeed);
            } else {
              let selectedChoice = selectChoiceBot(game);
              if (selectedChoice) {
                setTimeout(() => {
                  selectGridBot(game, selectedChoice);
                }, botSpeed);
              } else {
                game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
                game.gameState.timer = GameService.timer.getTurnDuration();

                game.gameState.deck = GameService.init.deck();
                game.gameState.choices = GameService.init.choices();

                updateClientsViewTimers(game);
                updateClientsViewDecks(game);
                updateClientsViewChoices(game);
                updateClientsViewGrid(game);
                updateClientsViewPlayerInfo(game);
                updateClientsCurrentTurn(game);

                if(game.gameState.botVsBot) {
                  AiBot(game);
                }
              }
            }
          }, botSpeed);
        } else {
          let selectedChoice = selectChoiceBot(game);

          if (selectedChoice) {
            setTimeout(() => {
              selectGridBot(game, selectedChoice);
            }, botSpeed);
          } else {
            game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
            game.gameState.timer = GameService.timer.getTurnDuration();

            game.gameState.deck = GameService.init.deck();
            game.gameState.choices = GameService.init.choices();

            updateClientsViewTimers(game);
            updateClientsViewDecks(game);
            updateClientsViewChoices(game);
            updateClientsViewGrid(game);
            updateClientsViewPlayerInfo(game);
            updateClientsCurrentTurn(game);

            if(game.gameState.botVsBot) {
              AiBot(game);
            }
          }
        }
      }, botSpeed);
    }, botSpeed);

  }

};

const rollBot = (game) => {
  // if not last throw
  if (game.gameState.deck.rollsCounter < game.gameState.deck.rollsMaximum) {

    // dices management
    game.gameState.deck.dices = GameService.dices.roll(game.gameState.deck.dices);
    game.gameState.deck.rollsCounter++;
  }
  // if last throw
  else {
    // dices management 
    game.gameState.deck.dices = GameService.dices.roll(game.gameState.deck.dices);
    game.gameState.deck.rollsCounter++;
    game.gameState.deck.dices = GameService.dices.lockEveryDice(game.gameState.deck.dices);
  }

  // combinations management
  const dices = game.gameState.deck.dices;
  const isDefi = Math.floor(Math.random() * 10) + 1 == 1 ? true : false;
  const isSec = game.gameState.deck.rollsCounter === 2;

  const combinations = GameService.choices.findCombinations(dices, isDefi, isSec);
  game.gameState.choices.availableChoices = combinations;

  // emit to views new state
  updateClientsViewDecks(game);
  updateClientsViewChoices(game);
};

const selectChoiceBot = (game) => {
  // gestion des choix
  //game.gameState.choices.idSelectedChoice = idChoice;

  const ratedChoices = [];

  game.gameState.choices.availableChoices.forEach(choice => {
    let tempGrid = GameService.grid.selectCellById(choice.id, game.gameState.currentTurn, game.gameState.grid, 0);
    if (tempGrid !== game.gameState.grid) {
      ratedChoices.push([GameService.grid.score(game, game.gameState.currentTurn, tempGrid), choice.id, 0]);
    }
    tempGrid = GameService.grid.selectCellById(choice.id, game.gameState.currentTurn, game.gameState.grid, 1);
    if (tempGrid !== game.gameState.grid) {
      ratedChoices.push([GameService.grid.score(game, game.gameState.currentTurn, tempGrid), choice.id, 1]);
    }
  });

  let topScore = 0;
  let indexTopScore = 0;
  let isWinner = false;


  for (let i = 0; i < ratedChoices.length; i++) {
    if (!isWinner && ratedChoices[i][0].score >= topScore || ratedChoices[i][0].winner) {
        topScore = ratedChoices[i][0].score;
        indexTopScore = i;
        if (ratedChoices[i][0].winner) {
          isWinner = true;
        }
    }
}

  if (ratedChoices.length > 0) {
    game.gameState.choices.idSelectedChoice = ratedChoices[indexTopScore][1];
  }
  console.log("Top ID : " + game.gameState.choices.idSelectedChoice);
  // gestion de la grid
  game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
  game.gameState.grid = GameService.grid.updateGridAfterSelectingChoice(game.gameState.choices.idSelectedChoice, game.gameState.grid);

  updateClientsViewChoices(game);
  updateClientsViewGrid(game);

  return (ratedChoices[indexTopScore]);
};

const selectGridBot = (game, selectedChoice) => {
  game.gameState.grid = GameService.grid.resetcanBeCheckedCells(game.gameState.grid);
  game.gameState.grid = GameService.grid.selectCellById(game.gameState.choices.idSelectedChoice, game.gameState.currentTurn, game.gameState.grid, selectedChoice[2]);
  
  let score = GameService.grid.score(game, game.gameState.currentTurn, game.gameState.grid);
  
  if (game.gameState.currentTurn === 'player:1') {
    game.gameState.player1Info.pawns--;
    game.gameState.player1Info.score = score.score;
  } else {
    game.gameState.player2Info.pawns--;
    game.gameState.player2Info.score = score.score;
  }

  if (score.winner) {
    game.gameState.winner = GameService.game.setWinner(game, game.gameState.currentTurn);
  }

  if (game.gameState.winner != null) {
    updateClientsViewEndGame(game, false, false);
  } else if (game.gameState.player1Info.pawns == 0 || game.gameState.player2Info.pawns == 0) {
      if (game.gameState.player1Info.score == game.gameState.player2Info.score) {
        game.gameState.winner = GameService.game.setWinner(game, 'Draw')
      } else if (game.gameState.player1Info.score > game.gameState.player2Info.score) {
        game.gameState.winner = GameService.game.setWinner(game, 'player:1')
      } else {
        game.gameState.winner = GameService.game.setWinner(game, 'player:2')
      }
      updateClientsViewEndGame(game, false, false);
  }

  // Here calcul score

  game.gameState.currentTurn = game.gameState.currentTurn === 'player:1' ? 'player:2' : 'player:1';
  game.gameState.timer = GameService.timer.getTurnDuration();

  game.gameState.deck = GameService.init.deck();
  game.gameState.choices = GameService.init.choices();

  updateClientsViewTimers(game);
  updateClientsViewDecks(game);
  updateClientsViewChoices(game);
  updateClientsViewGrid(game);
  updateClientsViewPlayerInfo(game);
  updateClientsCurrentTurn(game);

  if(game.gameState.botVsBot) {
    AiBot(game);
  }
};