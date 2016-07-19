druid.screens["game-screen"] = (function() {
    var board = druid.board,
        settings = druid.settings,
        display = druid.display,
        input = druid.input,
        audio = druid.audio,
        players = druid.players,
        util = druid.util,
        storage = druid.storage,
        restarting = false,
        cursor,
        gameState = {},
        gameID = 0,
        firstRun = true;
    
    function runWithMap(mapName) {
        if(firstRun) {
            setup();
            firstRun = false;
        }
        startGame(mapName);
    }    
    
    // Binds events to constant elements
    function setup() {
        input.initialize();
        input.bind("selectUnit", selectUnit);
        
        // end turn button
        $("#game-screen .end-turn").bind("click", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                var action = e.target.getAttribute("name");
                changeTurn();
                e.preventDefault();            
            }
        });        
        $("#game-screen .end-turn").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("End Your Turn");
            }
        });
        
        // restart turn button
        $("#game-screen .restart-turn").bind("click", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                var action = e.target.getAttribute("name");
                restartTurn();
                e.preventDefault();            
            }
        });        
        $("#game-screen .restart-turn").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Restart Your Turn");
            }
        });
        
        // add bridge help text
        $("#game-screen .add-bridge").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Add a Bridge");
            }
        });
        
        // add soldier help text
        $("#game-screen .add-soldier").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Place a Guardian");
            }
        });
        
        // add archer help text
        $("#game-screen .add-archer").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Place a Hunter");
            }
        });
        
        // add knight help text
        $("#game-screen .add-knight").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Place a Striker");
            }
        });
        
        // add way-walker help text
        $("#game-screen .add-walker").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Place a Waywalker");
            }
        });
        
        // add land help text
        $("#game-screen .add-land").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Add or Remove Land");
            }
        });
        
        // add obstacle help text
        $("#game-screen .add-obstacle").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Add or Remove an Obstacle");
            }
        });
        
        // add obstacle help text
        $("#game-screen .land-steal").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Steal Land Ownership");
            }
        });
                
        // Animal Form Help Text
        $("#game-screen .add-wolf").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Transform into a Wolf");
            }
        });
        $("#game-screen .add-eagle").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Transform into an Eagle");
            }
        });
        $("#game-screen .add-bear").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Transform into a Bear");
            }
        });
        $("#game-screen .add-turtle").bind("mouseover", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                updateHelpText("Transform into a Turtle");
            }
        });
        
        // start a game with the given map name current game
        $("#game-status .start-game").bind("click", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                var newMap = $("#game-status select option:selected").val();
                startNewGame(newMap);
                e.preventDefault();
            }
        });
    }
    
    function startGame(mapName) {
        gameState = {
            endTime: 0, // time at the end of the game
            startTime: 0,  // unused
            turn: 0,
            numPlayers: 0,
            currentPlayerMana: 0,
            addBridgeSelect: false,
            addUnitSelect: false,
            addUnitType: "",
            alterLandSelect: false,
            alterObstacleSelect: false,
            landStealSelect: false,
            unitSelected: false,
            selectedX: null,
            selectedY: null,
            selectedMoveRange: null,
            selectedShotRange: null,
            selectedOwner: null,
            selectedType: null,
            selectionTargetMoves: null,
            selectedUnitActions: null,
            firstPlayerColor: ""
        };
        cursor = {
            x : 0,
            y : 0,
            selected : false
        };
        
        gameID = Math.floor(Math.random()*100001);
        storage.set("druidGameData", null);
        
        // Displays game status UI HTML
        $("#game-status").css("display", "block");
        $("#game-status #new-game-form").css("display", "block");
        
        // let's do this!
        board.initialize(mapName, function() {
            var boardProps = board.getMapProperties();
            var music = $("#musicplayer");
            music.get(0).volume = .08;
            music.get(0).currentTime = 0;
            music.get(0).play();
                        
            // load board-supplied game variable overrides
            loadSettingsFromBoard(boardProps);
            
            display.initialize(function() {
                players.initialize(gameState.numPlayers, function() {
                    setupDefeatBonus();
                    audio.initialize();
                    changeTurn();
                    // start game timer
                    gameState.startTime = Date.now();
                    gameState.firstPlayerColor = util.getPlayerColor(players.getCurrentPlayer()); 
                    updateGameRules();
                });                
            });
        });
   
    }
    
    // Overrides default game settings with those supplied by this map
    function loadSettingsFromBoard(boardProps) {
        if(boardProps.players > 0 && boardProps.players != undefined) {
            // TODO: Pick one and use it!
            gameState.numPlayers = boardProps.players;
            settings.numPlayers = boardProps.players;
        } else {
            // this setting is required to be supplied by the map file and the game will choke w/o it
            console.log("This board does not specify the number of players!")
        }
        
        // if tile mana value is given, use that instead
        if(boardProps.tileManaValue > 0 && boardProps.tileManaValue != undefined) {
            settings.tileManaValue = boardProps.tileManaValue;
            console.log("Board dictates mana value as: " + settings.tileManaValue);
        } else {
            // set to default
            settings.tileManaValue = 2;
        }
        
        // if tile mana value is given, use that instead
        if(boardProps.relicValue > 0 && boardProps.relicValue != undefined) {
            settings.relicValue = boardProps.relicValue;
            console.log("Board dictates relic mana value as: " + settings.relicValue);
        } else {
            // set to default
            settings.relicValue = 10;
        } 
    }
    
    function updateHelpText(msg) {
        $(".game-board .help-text span").html(msg);
    }
    
    function updateGameRules() {
        $("#game-status .tile-mana-value span").html(settings.tileManaValue);
        $("#game-status .min-mana-value span").html(settings.minimumManaValue);
        $("#game-status .bridge-cost span").html(settings.bridgeCost);
        $("#game-status .relic-value span").html(settings.relicValue);
        $("#game-status .soldier-move span").html(settings.soldierMove + "/" + settings.wolfMove);
        $("#game-status .archer-range span").html(settings.archerShoot + "/" + settings.eagleMove);
        $("#game-status .knight-move span").html(settings.knightMove + "/" + settings.bearMove);
        $("#game-status .walker-move span").html(settings.walkerMove);
        $("#game-status .walker-shoot span").html(settings.walkerShoot);
        $("#version .version-number span").html(settings.gameVersionNumber);
    }
    
    function updateGameInfo() {
        var color = util.getPlayerColor(players.getCurrentPlayer()).toLowerCase();
        var hexColor = util.getPlayerDisplayColor(color);
                
        $("#game-status .current-player span").html(color);
        $("#game-screen .game-board").css("border-bottom-color", hexColor);
        $("#mana-jar .player-mana span").html(gameState.currentPlayerMana);
        $("#mana-jar .player-mana span").css("color", hexColor);
        updateManaJarBackground(color);
        
        $("#game-status .game-turn span").html(gameState.turn);
        $("#game-status .map-title span").html(board.getMapTitle());
        
        // dump gameState into the textarea
        $(".gameState-info").val(JSON.stringify(gameState, null, 4));
        
    }
    
    function updateManaJarBackground(color) {
        switch(color) {
            case "blue":
                $("#mana-jar").removeClass();
                $("#mana-jar").addClass("blue-turn");
                break;
            case "yellow":
                $("#mana-jar").removeClass();
                $("#mana-jar").addClass("yellow-turn");
                break;
            case "red":
                $("#mana-jar").removeClass();
                $("#mana-jar").addClass("red-turn");
                break;
            case "black":
                $("#mana-jar").removeClass();
                $("#mana-jar").addClass("black-turn");
                break;
        }
    }
    
    function updateLocationUI(info) {
        if(info) {
            $(".game-info .tile-coords span").html(info.tileX + ', ' + info.tileY);
            $(".game-info .tile-type span").html(info.tileType);
            $(".game-info .tile-owner span").html(info.tileOwnerVerbose);
            $(".game-info .tile-is-traversable span").html(info.isTraversable.toString());
            $(".game-info .tile-has-relic span").html(info.hasRelic.toString());
            $(".game-info .tile-is-occupied span").html(info.isOccupied.toString());
            $(".game-info .tile-occupant span").html(info.tileOccupant);
        }
    }
        
    // Controls UI button states based on the current game state
    function updateGameButtonUI() {
        $("#game-screen .end-turn").css("display", "block");
        
        if(gameState.currentPlayerMana < settings.bridgeCost) {
            $("#game-screen .add-bridge").addClass("inactive");
            $("#game-screen .add-bridge").unbind("click", addBridgeHandler);
        } else {
            $("#game-screen .add-bridge").removeClass("inactive");
            // bind new action
            var addBridgeHandler = function(e) {
                if(e.target.nodeName.toLowerCase() === "button") {
                    var action = e.target.getAttribute("name");
                    setAddBridgeState();
                    e.preventDefault();            
                }
            };
            $("#game-screen .add-bridge").bind("click", addBridgeHandler);
        }
        
        if(gameState.currentPlayerMana < settings.soldierCost) {
            $("#game-screen .add-soldier").addClass("inactive");
            $("#game-screen .add-soldier").unbind("click", addSoldierHandler);
        } else {
            $("#game-screen .add-soldier").removeClass("inactive");
            // bind new action
            var addSoldierHandler = function(e) {
                if(e.target.nodeName.toLowerCase() === "button") {
                    var action = e.target.getAttribute("name");
                    setAddUnitState("soldier");
                    e.preventDefault();            
                }
            };
            $("#game-screen .add-soldier").bind("click", addSoldierHandler);
        }
        
        if(gameState.currentPlayerMana < settings.archerCost) {
            $("#game-screen .add-archer").addClass("inactive");
            $("#game-screen .add-archer").unbind("click", addArcherHandler);
        } else {
            $("#game-screen .add-archer").removeClass("inactive");
            // bind new action
            var addArcherHandler = function(e) {
                if(e.target.nodeName.toLowerCase() === "button") {
                    var action = e.target.getAttribute("name");
                    setAddUnitState("archer");
                    e.preventDefault();            
                }
            };
            $("#game-screen .add-archer").bind("click", addArcherHandler);
        }
        
        if(gameState.currentPlayerMana < settings.knightCost) {
            $("#game-screen .add-knight").addClass("inactive");
            $("#game-screen .add-knight").unbind("click", addKnightHandler);
        } else {
            $("#game-screen .add-knight").removeClass("inactive");
            // bind new action
            var addKnightHandler = function(e) {
                if(e.target.nodeName.toLowerCase() === "button") {
                    var action = e.target.getAttribute("name");
                    setAddUnitState("knight");
                    e.preventDefault();            
                }
            };
            $("#game-screen .add-knight").bind("click", addKnightHandler);
        }
        
        if(gameState.currentPlayerMana < settings.walkerCost) {
            $("#game-screen .add-walker").addClass("inactive");
            $("#game-screen .add-walker").unbind("click", addWalkerHandler);
        } else {
            $("#game-screen .add-walker").removeClass("inactive");
            // bind new action
            var addWalkerHandler = function(e) {
                if(e.target.nodeName.toLowerCase() === "button") {
                    var action = e.target.getAttribute("name");
                    setAddUnitState("walker");
                    e.preventDefault();            
                }
            };
            $("#game-screen .add-walker").bind("click", addWalkerHandler);
        }
        
        /* show walker spell buttons */
        

        if(gameState.selectedType == "walker") {
            $(".game-board .add-land").unbind("click", alterLandHandler);
            $(".game-board .add-land").css("display", "block");
            if(gameState.currentPlayerMana < settings.landCost) {
                $(".game-board .add-land").addClass("inactive");
                $(".game-board .add-land").unbind("click", alterLandHandler);
            } else {
                $(".game-board .add-land").removeClass("inactive");
                // bind new action
                var alterLandHandler = function(e) {
                    if(e.target.nodeName.toLowerCase() === "button") {
                        var action = e.target.getAttribute("name");
                        setAlterLandState();
                        e.preventDefault();            
                    }
                };
                $(".game-board .add-land").bind("click", alterLandHandler);
            }
            
            // Add Obstacle Button
            $(".game-board .add-obstacle").unbind("click", alterObstacleHandler);
            $(".game-board .add-obstacle").css("display", "block");
            if(gameState.currentPlayerMana < settings.obstacleCost) {
                $(".game-board .add-obstacle").addClass("inactive");
                $(".game-board .add-obstacle").unbind("click", alterObstacleHandler);
            } else {
                $(".game-board .add-obstacle").removeClass("inactive");
                // bind new action
                var alterObstacleHandler = function(e) {
                    if(e.target.nodeName.toLowerCase() === "button") {
                        var action = e.target.getAttribute("name");
                        setAlterObstacleState();
                        e.preventDefault();            
                    }
                };
                $(".game-board .add-obstacle").bind("click", alterObstacleHandler);
            }
                
            // Add Land Steal Button
            $(".game-board .land-steal").unbind("click", landStealHandler);
            $(".game-board .land-steal").css("display", "block");
            if(gameState.currentPlayerMana < settings.landStealCost) {
                $(".game-board .land-steal").addClass("inactive");
                $(".game-board .land-steal").unbind("click", landStealHandler);
            } else {
                $(".game-board .land-steal").removeClass("inactive");
                // bind new action
                var landStealHandler = function(e) {
                    if(e.target.nodeName.toLowerCase() === "button") {
                        var action = e.target.getAttribute("name");
                        setLandStealState();
                        e.preventDefault();            
                    }
                };
                $(".game-board .land-steal").bind("click", landStealHandler);
            }
        } else {
            $(".game-board .add-land").css("display", "none");
            $(".game-board .add-obstacle").css("display", "none");
            $(".game-board .land-steal").css("display", "none");
        }
        
        
        /* animal form buttons */
        // wolf upgrade button and event handler
        $(".game-board .add-wolf").unbind("click", addWolfHandler);
        if(gameState.selectedType == "soldier") {
            $(".game-board .add-wolf").css("display", "block");
            // $(".game-board .add-wolf").unbind("click", addWolfHandler);
            
            if(gameState.currentPlayerMana < settings.wolfCost) {
                $(".game-board .add-wolf").addClass("inactive");        
            } else {
                $(".game-board .add-wolf").removeClass("inactive");
                
                // bind new action
                var addWolfHandler = function(e) {
                    if(e.target.nodeName.toLowerCase() === "button") {
                        var action = e.target.getAttribute("name");
                        upgradeUnit("wolf");
                        e.preventDefault();            
                    }
                };
                $(".game-board .add-wolf").bind("click", addWolfHandler);
            }
        } else {
            $(".game-board .add-wolf").css("display", "none");
        }
        
        // eagle upgrade and button event handler
        if(gameState.selectedType == "archer") {
            $(".game-board .add-eagle").css("display", "block");
            $(".game-board .add-eagle").unbind("click", addEagleHandler);
            
            if(gameState.currentPlayerMana < settings.eagleCost) {
                $(".game-board .add-eagle").addClass("inactive");        
            } else {
                $(".game-board .add-eagle").removeClass("inactive");
                
                // bind new action
                var addEagleHandler = function(e) {
                    if(e.target.nodeName.toLowerCase() === "button") {
                        var action = e.target.getAttribute("name");
                        upgradeUnit("eagle");
                        e.preventDefault();            
                    }
                };
                $(".game-board .add-eagle").bind("click", addEagleHandler);
            }
        } else {
            $(".game-board .add-eagle").css("display", "none");
            $(".game-board .add-eagle").unbind("click", addEagleHandler);
        }
        
        // bear upgrade and button event handler        
        if(gameState.selectedType == "knight") {
            // knights cannot upgrade if they already took a step
            var thisKnight = board.getUnit(gameState.selectedX, gameState.selectedY);
            $(".game-board .add-bear").unbind("click", addBearHandler);

            if(thisKnight.actions == gameState.selectedUnitActions) {                
                $(".game-board .add-bear").css("display", "block");
                
                if(gameState.currentPlayerMana < settings.bearCost) {
                    $(".game-board .add-bear").addClass("inactive");
                } else {
                    $(".game-board .add-bear").removeClass("inactive");

                    // bind new action
                    var addBearHandler = function(e) {
                        if(e.target.nodeName.toLowerCase() === "button") {
                            var action = e.target.getAttribute("name");
                            upgradeUnit("bear");
                            e.preventDefault();            
                        }
                    };
                    $(".game-board .add-bear").bind("click", addBearHandler);
                }
            } else {
                $(".game-board .add-bear").css("display", "block");
                $(".game-board .add-bear").addClass("inactive");
                $(".game-board .add-bear").unbind("click", addBearHandler);
            }
        } else {
            $(".game-board .add-bear").css("display", "none");
            $(".game-board .add-bear").unbind("click", addBearHandler);
        }
        
        // turle upgrade and button event handler
        if(gameState.selectedType == "walker") {
            $(".game-board .add-turtle").css("display", "block");
            $(".game-board .add-turtle").unbind("click", addTurtleHandler);
            
            if(gameState.currentPlayerMana < settings.turtleCost) {
                $(".game-board .add-turtle").addClass("inactive");
            } else {
                $(".game-board .add-turtle").removeClass("inactive");
                
                // bind new action
                var addTurtleHandler = function(e) {
                    if(e.target.nodeName.toLowerCase() === "button") {
                        var action = e.target.getAttribute("name");
                        upgradeUnit("turtle");
                        e.preventDefault();            
                    }
                };
                $(".game-board .add-turtle").bind("click", addTurtleHandler);
            }
        } else {
            $(".game-board .add-turtle").css("display", "none");
            $(".game-board .add-turtle").unbind("click", addTurtleHandler);
        }
        
        // update remaining moves for the selected, if any
        updateMovesUI();
    }
    
    function updateMovesUI() {
        if(gameState.unitSelected) {
            // position the buttons
            var movesTextTop, movesTextLeft;
            movesTextTop = gameState.selectedY * settings.tileSpaceHeight/2;
            movesTextTop -= 27;
            if(gameState.selectedY % 2 == 0) {
                movesTextLeft = gameState.selectedX * settings.tileWidth;
            } else {
                movesTextLeft = (gameState.selectedX * settings.tileWidth) + (settings.tileWidth / 2);
            }
            movesTextLeft += 65;
            
            var movingUnit = board.getUnit(gameState.selectedX, gameState.selectedY);
            if(movingUnit.upgraded) {
                // adjust placement for the small animal icons
                movesTextTop += 18;
            }
            if(movingUnit.typeName == "walker") {
                movesTextTop -= 4;
            }
            
            $(".game-board .tile-occupant-moves").css("top", movesTextTop);
            $(".game-board .tile-occupant-moves").css("left", movesTextLeft);
            $(".game-board .tile-occupant-moves").css("display", "block");
            $(".game-board .tile-occupant-moves span").html(movingUnit.actions);
        } else {
            $(".game-board .tile-occupant-moves").css("display", "none");
        }
    }
    
    // Displays a brief text anmation display of provided message
    function announce(message) {
        $("#game-screen .announcement").html(message);
        $("#game-screen .announcement").removeClass("zoomfade");

        setTimeout(function() {
            $("#game-screen .announcement").addClass("zoomfade");
        }, 1);
    }
    
    function announcePlayerChange() {
        announce(util.getPlayerColor(players.getCurrentPlayer()) + " Player Go!");
    }
    
    // bounce the mana jar number to show there was a bonus added
    function announceManaBonus() {
        console.log("announce mana bonus");
        
        $("#mana-jar .player-mana").removeClass("mana_zoomfade");

        setTimeout(function() {
            $("#mana-jar .player-mana").addClass("mana_zoomfade");
        }, 1);
    }
    
    // This is where the magic happens!
    // Everty single click not on a button is directed through this function.
    // Works in tandem with gameState to determine what is intended and sees that it gets done.
    function selectUnit(x, y) {
        var thisUnit,
            movesRemaining = 0;
        
        if(arguments.length == 0) {
            selectUnit(cursor.x, cursor.y);
            console.log('selectUnit no args');
            return;
        }
        
        // boundary checking
        if( (x < 0 || y < 0 || y > settings.rows - 1) ||
            (y % 2 != 0 && x == settings.longCols - 1) ) {
                return;
            } else {
                // incoming click is just after selecting a unit. Deal with it according to the given results.
                if(gameState.unitSelected) {
                    if(thisMove = util.isInRange(x, y, gameState.selectionTargetMoves)) {
                        switch(thisMove.cursor) {
                            case "move":
                                movesRemaining = board.moveUnit(gameState.selectedX, gameState.selectedY, gameState.selectedOwner, thisMove);
                                audio.play("move");
                                break;
                            case "attack":
                                movesRemaining = board.attackUnit(gameState.selectedX, gameState.selectedY, gameState.selectedOwner, thisMove);
                                if(gameState.selectedType == "knight") {
                                    audio.play("sword");
                                } else {
                                    audio.play("hit");
                                }
                                countCapture();
                                break;
                            case "shoot":
                                if(board.shootUnit(gameState.selectedX, gameState.selectedY, gameState.selectedOwner, thisMove)) {
                                    audio.play("bow_shot");
                                } else {
                                    console.log("bad shoot data");
                                }
                                countCapture();
                                break;
                            case "cast":
                                audio.play("cast");
                                // handle land alteration
                                if(gameState.alterLandSelect) {
                                    movesRemaining = board.alterLand(gameState.selectedX, gameState.selectedY, gameState.selectedOwner, thisMove);
                                    x = gameState.selectedX;
                                    y = gameState.selectedY;
                                    spendMana("land");
                                    gameState.alterLandSelect = false;
                                    audio.play("add_land");
                                }
                                
                                // handle obstacle alerteration
                                if(gameState.alterObstacleSelect) {
                                    movesRemaining = board.alterObstacle(gameState.selectedX, gameState.selectedY, gameState.selectedOwner, thisMove);
                                    x = gameState.selectedX;
                                    y = gameState.selectedY;
                                    spendMana("obstacle");
                                    gameState.alterObstacleSelect = false;
                                    audio.play("remove_land");
                                }
                                
                                // handle land steal behaviour
                                if(gameState.landStealSelect) {
                                    movesRemaining = board.stealLand(gameState.selectedX, gameState.selectedY, gameState.selectedOwner, thisMove);
                                    x = gameState.selectedX;
                                    y = gameState.selectedY;
                                    spendMana("landsteal");
                                    gameState.landStealSelect = false;
                                    audio.play("land_steal");
                                }
                                break;
                            case "relic":
                                if(board.captureRelic(gameState.selectedX, gameState.selectedY, gameState.selectedOwner, thisMove)) {
                                    audio.play("relic_touch");
                                } else {
                                    console.log("bad relic move data");
                                }
                                break;
                            case "fly":
                                movesRemaining = board.flyUnit(gameState.selectedX, gameState.selectedY, gameState.selectedOwner, thisMove);
                                if(board.changeUnitBack(x, y)) {
                                    audio.play("flap");
                                    thisUnit = board.getUnit(x, y);
                                    thisUnit.actions = util.getUnitMoves(thisUnit.type);
                                }
                                break;
                        }
                        
                        // handle changing upgraded units back
                        checkUpgrades(x, y);
                        // check if a player has been effectively defeated
                        checkPlayers();
                        resetGameState();
                        
                        // select the same unit if it still has actions to take
                        setCursor(x, y, false);                        
                        if(movesRemaining > 0) {
                            selectUnit(x, y);
                        }
                    } else {
                        console.log("submit new click!");
                        resetGameState();
                        selectUnit(x, y);
                    }
                } else {
                    // nothing has been previously selected. Handle this click like new.
                    space = board.getLocationInformation(x, y);
                    curPlayer = players.getCurrentPlayer();
                    
                    if(space.tileOwner == util.getOwnerNumberFromPlayer(curPlayer) ||
                        space.tileType == 3 || space.tileType == 4 ) 
                    {
                        if(space.isOccupied && space.tileOccupant != "turtle") {
                            thisUnit = board.selectUnit(x, y);
                            
                            if(thisUnit.enabled) {
                                // This unit belongs to the player and is ready to go
                                moveRange = util.getUnitMoves(thisUnit.type);
                                shotRange = util.getUnitShotRange(thisUnit.type);
                                
                                // determine unit moves
                                if(space.tileOccupant == "eagle") {
                                    possibleMoves = board.getAllSpacesWithinRange(x, y, moveRange, false);
                                } else {
                                    // this allows travel one space at a time
                                    possibleMoves = board.getAdjacentLocations(x, y);
                                }
                                
                                finalMoves = determineFinalMoves(possibleMoves, space.tileOccupant, moveRange);
                                
                                // determine unit ranged attacks
                                if(shotRange > 0) {
                                    // only if add land/obstacle is in play should we consider the walker's shot range as legal
                                    // see setAlterLandState to determine the walker's casting moves.
                                    if(gameState.alterLandSelect == true || gameState.alterObstacleSelect) {
                                        console.log("should never get here for walker");
                                        finalShots = determineShots(x, y, space.tileOccupant, shotRange, false);
                                        finalOptions = finalShots;
                                    } else {
                                        finalOptions = finalMoves;
                                    }
                                    
                                    // Handle Archer
                                    if(space.tileOccupant == "archer") {
                                        finalShots = determineShots(x, y, space.tileOccupant, shotRange, true);
                                        finalOptions = finalMoves.concat(finalShots);
                                    }
                                } else {
                                    finalOptions = finalMoves;
                                }
                                
                                display.redrawTiles(board.getBoard(), function(){
                                    display.setAllCursors(finalOptions);
                                    display.redrawTileContents(board.getObstacles(), board.getUnits(), function(){
                                    });
                                    // audio.play("select_unit");
                                });
                                
                                resetGameState();
                                gameState.selectionTargetMoves = finalOptions;
                                gameState.unitSelected = true;
                                gameState.selectedX = x;
                                gameState.selectedY = y;
                                gameState.selectedType = space.tileOccupant;
                                gameState.selectedMoveRange = moveRange;
                                gameState.selectedShotRange = shotRange;
                                gameState.addBridgeSelect = false;
                                gameState.selectedOwner = util.getOwnerNumberFromPlayer(curPlayer);
                                gameState.selectedUnitActions = moveRange;
                            } else {
                                // new click is on another player so clear the visuals.
                                console.log("redrawing on new click on disabled unit, outside of moves");
                                display.redrawTiles(board.getBoard(), function(){
                                    display.redrawTileContents(board.getObstacles(), board.getUnits(), function(){
                                    });
                                });
                            }
                        } else if(space.tileType != 3 && space.tileType != 4) {
                            // I own the space, but nobody is home.
                            if(gameState.addUnitSelect == true && space.tileType <= 2 && space.hasRelic == false) {
                                board.addUnit(x, y, players.getCurrentPlayer(), gameState.addUnitType, function() {
                                    
                                    // If the player doesn't have a walker on the board, it comes in active
                                    var addedUnit = board.getUnit(x, y);
                                    handleNewWaywalker(addedUnit);
                                    
                                    display.redrawTiles(board.getBoard(), function(){
                                        display.redrawTileContents(board.getObstacles(), board.getUnits(), function(){
                                            audio.play("spawn");
                                            spendMana(gameState.addUnitType);
                                            updateGameButtonUI();
                                            // selectTile(x, y, space);
                                            setCursor(x, y, false);
                                            resetGameState();
                                            gameState.addUnitSelect = false;
                                            gameState.addUnitType = "";
                                        });
                                    });
                                });
                            }
                        }
                    } else if(space.tileOwner != util.getOwnerNumberFromPlayer(curPlayer) ||
                              space.hasRelic ||
                              space.tileType == 3 ||
                              space.tileType == 4)
                    {
                        // build a bridge if that's what we're trying to do
                        if(gameState.addBridgeSelect == true && space.tileType == 0) {
                            board.addBridge(x, y, function() {
                                display.redrawTiles(board.getBoard(), function(){
                                    display.redrawTileContents(board.getObstacles(), board.getUnits(), function(){
                                        audio.play("build_bridge");
                                        spendMana("bridge");
                                        gameState.addBridgeSelect = false;
                                    });
                                });
                            });
                        } else {
                            // new click is on another player so clear the visuals.
                            console.log("redrawing on new click, somewhere outside of moves");
                            display.redrawTiles(board.getBoard(), function(){
                                display.redrawTileContents(board.getObstacles(), board.getUnits(), function(){
                                });
                            });
                        } 
                        resetGameState();
                    }
                }
                
            }
            selectTile(x, y, space);
            updateGameButtonUI();
            updateGameInfo();
            updateLocationUI(space);
    }
    
    // Determines the results of every possible move within the given range
    function determineFinalMoves(possibleMoves, movingUnitType, moveRange) {
        var finalMoves = [],
            result,
            thisMove;
        
        for(i = 0; i < possibleMoves.length; i++) {
            thisMove = possibleMoves[i];
            if(thisMove != -1) {
                result = {
                    x: thisMove.tileX,
                    y: thisMove.tileY,
                    cursor: ""
                };
                
                if(thisMove.isTraversable) {
                    // check occupant
                    if(thisMove.isOccupied) {
                        // check for bridge
                        // get the unit on this space
                        theUnit = board.getUnit(thisMove.tileX, thisMove.tileY);
                        if(thisMove.tileType == 3 || thisMove.tileType == 4) {
                            // someone's on the bridge
                            units = util.getPlayerUnitTypes(players.getCurrentPlayer());
                            if(units.indexOf(theUnit.type) < 0) {
                                // enemy is on the bridge. Get'em!
                                if(theUnit.typeName != "turtle") {
                                    if(movingUnitType != "archer" && movingUnitType != "walker" && movingUnitType != "wolf") {
                                        result.cursor = "attack";
                                        finalMoves.push(result);
                                    }
                                }
                            }
                        } else {
                            // ground tile, is it your guy? Archers and wolves cannot attack adjacent spaces.
                            if(movingUnitType != "archer" && movingUnitType != "wolf" && movingUnitType != "walker") {
                                if(players.getCurrentPlayer() != util.getPlayerNumberFromOwner(thisMove.tileOwner)) {
                                    // enemy!
                                    if(theUnit.typeName != "turtle") {
                                        result.cursor = "attack";
                                        finalMoves.push(result);
                                    }
                                }
                            }
                        }
                    } else {
                        if(movingUnitType == "eagle") {
                            result.cursor = "fly";
                        } else {
                            result.cursor = "move";
                        }
                        finalMoves.push(result);
                    }
                } else {
                    if(thisMove.hasRelic === true) {
                        if(thisMove.tileOwner != util.getOwnerNumberFromPlayer(players.getCurrentPlayer())) {
                            if(movingUnitType != "eagle") {
                                result.cursor = "relic";
                                finalMoves.push(result);
                            }
                        }
                    }
                }   
            }
            
        } // end for loop
        return finalMoves;
    }
    
    // Figures out the results of shooting at the locations in the given range
    function determineShots(x, y, unitType, shotRange, returnOnlyAtRange) {
        var possibleShots = [],
            finalShots = [],
            result,
            thisShot,
            theUnit,
            currentLocation;
        
        possibleShots = board.getAllSpacesWithinRange(x, y, shotRange, returnOnlyAtRange);
        
        // loop through the above and mark each as a result
        for(var j = 0; j < possibleShots.length; j++) {
            thisShot = possibleShots[j];
                        
            if(thisShot != -1) {
                result = {
                    x: thisShot.tileX,
                    y: thisShot.tileY,
                    cursor: ""
                };
                
                // Handle archer
                if(unitType == "archer") {
                    theUnit = board.getUnit(thisShot.tileX, thisShot.tileY);
                    if(thisShot.isOccupied) {
                        // check for bridge
                        if(thisShot.tileType == 3 || thisShot.tileType == 4) {
                            // someone's on the bridge
                            units = util.getPlayerUnitTypes(players.getCurrentPlayer());
                            if(units.indexOf(theUnit.type) < 0) {
                                // enemy is on the bridge. Get'em!
                                if(theUnit.typeName != "turtle") {
                                    result.cursor = "shoot";
                                    finalShots.push(result);
                                }
                            }
                        } else {
                            // ground tile, is it your guy?
                            if(players.getCurrentPlayer() != util.getPlayerNumberFromOwner(thisShot.tileOwner)) {
                                // enemy!
                                if(theUnit.typeName != "turtle") {
                                    result.cursor = "shoot";
                                    finalShots.push(result);
                                }
                            }
                        }
                    }
                }
             
                // Handle walker
                if(unitType == "walker") {
                    // handle altering land targets
                    if(gameState.alterLandSelect) {
                        if(thisShot.tileType == 0) {
                            // open space
                            result.cursor = "cast";
                            finalShots.push(result);
                        }

                        if(thisShot.tileType != 3 && thisShot.tileType != 4 && !thisShot.hasRelic) {
                            if(thisShot.tileType == 1 || thisShot.tileType == 2) {
                                result.cursor = "cast";
                                finalShots.push(result);                                  
                            }
                            // cannot cast adjacent if it's occupied!
                            if(!thisShot.isOccupied) {
                                result.cursor = "cast";
                                finalShots.push(result);
                            }
                        }
                    }
                    
                    // handle altering obstacle targets
                    if(gameState.alterObstacleSelect) {
                        if(thisShot.tileType > 0) {
                            if(!thisShot.isOccupied && thisShot.tileType != 3 
                                && thisShot.tileType != 4
                                && !thisShot.hasRelic) 
                            {
                                result.cursor = "cast";
                                finalShots.push(result);                                              
                            }
                        }
                    }
                    
                    // handle land steal targets
                    if(gameState.landStealSelect) {
                        if(thisShot.tileType > 0) {
                            if( !thisShot.isOccupied 
                                && thisShot.tileType != 3 
                                && thisShot.tileType != 4
                                && !thisShot.hasRelic
                                && thisShot.isTraversable) 
                            {
                                result.cursor = "cast";
                                finalShots.push(result);                                              
                            }
                        }
                    }
                }
            }
        }

        return finalShots;
    }
    
    // returns results for Waywalker casting alter land in adjacent spaces
    function determineWalkerCloseShots(x, y, unitType) {
        var possibleShots = [],
            finalShots = [],
            result,
            thisShot,
            theUnit,
            currentLocation;
        
        possibleShots = board.getAdjacentLocations(x, y);
        
        // loop through the above and mark each as a result
        for(var j = 0; j < possibleShots.length; j++) {
            thisShot = possibleShots[j];
                        
            if(thisShot != -1) {
                result = {
                    x: thisShot.tileX,
                    y: thisShot.tileY,
                    cursor: ""
                };
 
                // Can cast: 1. unoccupied 2. open space 3. not a relic 
                if(unitType == "walker") {
                    // handle altering land targets
                    if(gameState.alterLandSelect) {
                        if(thisShot.tileType == 0) {
                            // open space
                            result.cursor = "cast";
                            finalShots.push(result);
                        }
                        
                        // Walker can't alter occupied adjacent land
                        if(thisShot.tileType != 3 && thisShot.tileType != 4 && !thisShot.hasRelic) {
                            if(thisShot.tileType == 1 || thisShot.tileType == 2) {
                                if(!thisShot.isOccupied) {
                                    result.cursor = "cast";
                                    finalShots.push(result);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return finalShots;
    }
    
    function selectTile(x, y, locationInformation) {
        if(arguments.length == 0) {
            selectTile(cursor.x, cursor.y);
            console.log('selectTile no args');
            return;
        }
        
        //setCursor(x, y, true);
        updateLocationUI(locationInformation);
    }
    
    function setCursor(x, y, select) {
        cursor.x = x;
        cursor.y = y;
        cursor.selected = select;
        
        display.setCursor(cursor.x, cursor.y, select);
        display.redrawTiles(board.getBoard(), function(){
            display.redrawTileContents(board.getObstacles(), board.getUnits(), function(){});
        });
    }
    
    function resetGameState() {
        gameState.addBridgeSelect = false;
        gameState.unitSelected = false;
        gameState.addUnitSelect = false;
        gameState.alterLandSelect = false;
        gameState.alterObstacleSelect = false;
        gameState.landStealSelect = false;
        gameState.selectedX = null;
        gameState.selectedY = null;
        gameState.selectedMoveRange = null;
        gameState.selectedShotRange = null;
        gameState.selectionTargetInfo = null;
        gameState.selectionTargetMoves = null;
        gameState.selectedOwner = null;
        gameState.selectedType = null;
    }
    
    // TODO: Debugging only. No other module needs access to this.
    function getGameState() {
        return gameState;
    }
    
    function calculatePlayerMana() {
        var totalMana;
        var curPlayer = players.getPlayer(players.getCurrentPlayer());
        var tileCount = board.getCurrentPlayerTileCount( util.getOwnerNumberFromPlayer(players.getCurrentPlayer()) );
        
        gameState.currentPlayerMana = (tileCount.groundTiles * settings.tileManaValue) + 
                                      (tileCount.relics * settings.relicValue);
        
        // if it's under the minimum, add the bank up to the minimum
        if(gameState.currentPlayerMana < settings.minimumManaValue) {
            totalMana = gameState.currentPlayerMana + curPlayer.manaBank;
            
            if(totalMana > settings.minimumManaValue) {
                // bring them to the minimum only, then wipe the bank and update the last turn record
                gameState.currentPlayerMana = settings.minimumManaValue;
                curPlayer.manaBank = 0;
            } else {                
                // if they player built up to the min, but doesn't do anything with it, their bank should remain at the minimum.
                // Not entirely fair if they are building up with moves, but odds are they're screwed anyway.
                if(curPlayer.lastTurnMana == settings.minimumManaValue) {
                    gameState.currentPlayerMana = settings.minimumManaValue;
                } else {
                    // bank this mana for next turn
                    gameState.currentPlayerMana = totalMana;
                    curPlayer.manaBank += gameState.currentPlayerMana;
                }
            }
        }
        
        curPlayer.lastTurnMana = gameState.currentPlayerMana;
        // update this player's total Mana generation
        curPlayer.stat_mana_gen += gameState.currentPlayerMana;
        // update defeat notices
        updateDefeatBonus(curPlayer);
        announceManaBonus();
    }
    
    function setupDefeatBonus() {
        var i;        
        var elements = $("#game-status .defeat label span");
        
        for(i = 0; i < elements.length; i++) {
            $(elements[i]).html("0");
        }
        
        for(i = 0; i < gameState.numPlayers; i++) {
            $(elements[i]).html("5");
        }
    }
    
    function updateDefeatBonus(player) {
        console.log(player.color + " has earned " + player.stat_mana_gen + " mana so far.");
        var manaBonus = Math.floor(player.stat_mana_gen * settings.defeatedPlayerManaBonusPercent);
        if(manaBonus < 5) {
            manaBonus = 5;
        }
        
        switch(player.color) {
            case "Blue":
                $("#game-status .defeat-blue span").html(manaBonus);
                break;
            case "Yellow":
                $("#game-status .defeat-yellow span").html(manaBonus);
                break;
            case "Red":
                $("#game-status .defeat-red span").html(manaBonus);
                break;
            case "Black":
                $("#game-status .defeat-black span").html(manaBonus);
                break;
            default:
                return;
        }
    }
    
    function wipeDefeatBonus(player) {
        var manaBonus = 0;
        
        switch(player.color) {
            case "Blue":
                $("#game-status .defeat-blue span").html(manaBonus);
                break;
            case "Yellow":
                $("#game-status .defeat-yellow span").html(manaBonus);
                break;
            case "Red":
                $("#game-status .defeat-red span").html(manaBonus);
                break;
            case "Black":
                $("#game-status .defeat-black span").html(manaBonus);
                break;
            default:
                return;
        }
    }
    
    function spendMana(unitType) {
        var curPlayer = players.getPlayer(players.getCurrentPlayer());
        
        switch(unitType) {
            case "bridge":
                gameState.currentPlayerMana -= settings.bridgeCost;
                curPlayer.stat_mana_spent += settings.bridgeCost;
                break;
            case "land":
                gameState.currentPlayerMana -= settings.landCost;
                curPlayer.stat_mana_spent += settings.landCost;
                break;
            case "obstacle":
                gameState.currentPlayerMana -= settings.obstacleCost;
                curPlayer.stat_mana_spent += settings.obstacleCost;
                break;
            case "landsteal":
                gameState.currentPlayerMana -= settings.landStealCost;
                curPlayer.stat_mana_spent += settings.landStealCost;
                break;
            case "soldier":
                gameState.currentPlayerMana -= settings.soldierCost;
                curPlayer.stat_mana_spent += settings.soldierCost;
                curPlayer.stat_units_placed++;
                break;
            case "archer":
                gameState.currentPlayerMana -= settings.archerCost;
                curPlayer.stat_mana_spent += settings.archerCost;
                curPlayer.stat_units_placed++;
                break;
            case "knight":
                gameState.currentPlayerMana -= settings.knightCost;
                curPlayer.stat_mana_spent += settings.knightCost;
                curPlayer.stat_units_placed++;
                break;
            case "walker":
                gameState.currentPlayerMana -= settings.walkerCost;
                curPlayer.stat_mana_spent += settings.walkerCost;
                curPlayer.stat_units_placed++;
                break;
            case "wolf":
                gameState.currentPlayerMana -= settings.wolfCost;
                curPlayer.stat_mana_spent += settings.wolfCost;
                curPlayer.stat_units_upgraded++;
                break;
            case "eagle":
                gameState.currentPlayerMana -= settings.eagleCost;
                curPlayer.stat_mana_spent += settings.eagleCost;
                curPlayer.stat_units_upgraded++;
                break;
            case "bear":
                gameState.currentPlayerMana -= settings.bearCost;
                curPlayer.stat_mana_spent += settings.bearCost;
                curPlayer.stat_units_upgraded++;
                break;
            case "turtle":
                gameState.currentPlayerMana -= settings.turtleCost;
                curPlayer.stat_mana_spent += settings.turtleCost;
                curPlayer.stat_units_upgraded++;
                break;
        }
    }
    
    // Ends one player's turn and begins the next
    function changeTurn() {
        setCursor(0, 0, false);
        
        players.cyclePlayer(function() {
            newPlayer = players.getPlayer(players.getCurrentPlayer());

            board.enablePlayerUnits(players.getCurrentPlayer(), function () {
                display.redrawTiles(board.getBoard(), function() {
                    display.redrawTileContents(board.getObstacles(), board.getUnits(), function() {
                        gameState.turn = newPlayer.turn;
                        resetGameState();
                        audio.play("newturn");
                        calculatePlayerMana();
                        updateGameButtonUI();
                        updateGameInfo();
                        updateHelpText("");
                        announcePlayerChange();
                        saveGameData();
                    });
                });
            });
        });        
    }
    
    function setAddBridgeState() {
        var playerSpaces = [], moves = [], thisMove, result = {};

        setCursor(0, 0, false);
        resetGameState();
        gameState.addBridgeSelect = true;
        updateGameInfo();
        
        // display cursors to show where bridges can be placed
        bridgeSpaces = board.getAllOpenSpaces();
        for(i = 0; i < bridgeSpaces.length; i++) {
            thisMove = bridgeSpaces[i];
            if(thisMove != -1) {
                result = {
                    x: thisMove.tileX,
                    y: thisMove.tileY,
                    cursor: "select"
                };
                moves.push(result);
            }
        }
        
        display.setAllCursors(moves);
        updateGameInfo();
    }
    
    function setAddUnitState(type) {
        var playerSpaces = [], moves = [], thisMove, result = {};
        setCursor(0, 0, false);
        resetGameState();
        gameState.addUnitSelect = true;
        gameState.addUnitType = type;
        
        // display cursors to show where units can be placed
        playerSpaces = board.getAllSpacesForPlayer( util.getOwnerNumberFromPlayer(players.getCurrentPlayer()) );
        for(i = 0; i < playerSpaces.length; i++) {
            thisMove = playerSpaces[i];
            if(thisMove != -1) {
                if(thisMove.hasRelic == false && thisMove.isOccupied == false) {
                    result = {
                        x: thisMove.tileX,
                        y: thisMove.tileY,
                        cursor: "select"
                    };
                }
                moves.push(result);
            }
        }
        
        display.setAllCursors(moves);
        updateGameInfo();
        
        
    }
    
    function setAlterLandState() {
        var rangeShots = [], rangeShots2 = [], closeShots = [], finalShots = [];
        setCursor(0, 0, false);
        gameState.alterObstacleSelect = false;
        gameState.landStealSelect = false;
        shotRange = gameState.selectedShotRange;
        
        gameState.alterLandSelect = true;
        // finalShots = determineShots(gameState.selectedX, gameState.selectedY, "walker", shotRange, false);
        
        // Get ranges 2 and 3
        rangeShots = determineShots(gameState.selectedX, gameState.selectedY, "walker", 3, true);
        rangeShots2 = determineShots(gameState.selectedX, gameState.selectedY, "walker", 2, true);
        
        // Get range 1 separately as the rules for handling this is different
        closeShots = determineWalkerCloseShots(gameState.selectedX, gameState.selectedY, "walker");
        
        finalShots = closeShots.concat(rangeShots2.concat(rangeShots));
        
        gameState.selectionTargetMoves = finalShots;
        display.setAllCursors(finalShots);
        updateGameInfo();
    }
    
    function setAlterObstacleState() {
        setCursor(0, 0, false);

        gameState.alterLandSelect = false;
        gameState.landStealSelect = false;
        shotRange = gameState.selectedShotRange;
        
        gameState.alterObstacleSelect = true;
        finalShots = determineShots(gameState.selectedX, gameState.selectedY, "walker", shotRange, false);
        gameState.selectionTargetMoves = finalShots;

        display.setAllCursors(finalShots);
        updateGameInfo();
    }
    
    function setLandStealState() {
        setCursor(0, 0, false);

        gameState.alterObstacleSelect = false;
        gameState.alterLandSelect = false;
        shotRange = gameState.selectedShotRange;
        
        gameState.landStealSelect = true;
        finalShots = determineShots(gameState.selectedX, gameState.selectedY, "walker", shotRange, false);
        gameState.selectionTargetMoves = finalShots;

        display.setAllCursors(finalShots);
        updateGameInfo();
    }
    
    function countCapture() {
        var curPlayer = players.getPlayer(players.getCurrentPlayer());
        
        curPlayer.stat_units_captured++;
    }
    
    function upgradeUnit(type) {
        var enabled = true;
        gameState.addBridgeSelect = false;
        
        if(type == "turtle") {
            enabled = false;
        }
        
        if(board.changeUnit(
            gameState.selectedX, 
            gameState.selectedY, 
            gameState.selectedOwner, 
            players.getCurrentPlayer(),
            type,
            true, // upgraded
            enabled  // enabled
        ))
        {
            display.redrawTiles(board.getBoard(), function(){
                display.redrawTileContents(board.getObstacles(), board.getUnits(), function(){
                    audio.play(type);
                    spendMana(type);
                    updateGameInfo();
                    setCursor(x, y, false);
                    // resetGameState();
                    gameState.addUnitSelect = false;
                    gameState.addUnitType = "";
                    updateGameButtonUI();
                    selectUnit(gameState.selectedX, gameState.selectedY);
                });
            });
            
            
        }
    }
    
    function checkUpgrades(x, y) {
        var thisUnit = board.getUnit(x, y);
        
        if(thisUnit.upgraded) {
            if(!thisUnit.enabled) {
                if(!thisUnit.upgradeIsPersistent) {
                    if(board.changeUnitBack(x, y)) {
                        // audio.play("spawn");
                    }
                }
            }  
        }
    }
    
    // Handles a newly created Waywalker.
    // Determines if it's the only one the player has and if so, sets it as active.
    function handleNewWaywalker(addedUnit) {
        var numUnits = 0, owner;
        
        if(addedUnit.typeName == "walker") {
            owner = util.getOwnerNumberFromPlayer(players.getCurrentPlayer());
            numUnits = board.getPlayerUnitCountForType(owner, "walker");
            numUnits += board.getPlayerUnitCountForType(owner, "turtle");
            if(numUnits < 2) {
                // This refers to the one just added, so he's the sole walker
                addedUnit.actions = util.getUnitMoves(addedUnit.type);
                addedUnit.enabled = true;
            }
        }
    }
    
    // checks all players to make sure they are still ellible to be in the game.
    function checkPlayers() {
        var i, thePlayers, color, thisPlayer = {}, playerTiles = {};
        
        thePlayers = players.getActivePlayers();
        
        for(i = 0; i < thePlayers.length; i++) {
            // owns at least one tile
            playerTiles = board.getCurrentPlayerTileCount(
                    // needs owner number, not player number
                    util.getOwnerNumberFromPlayer(thePlayers[i])
                );
            
            if(playerTiles.groundTiles < 1) {
                players.defeatPlayer(thePlayers[i]);
                color = util.getPlayerColor(thePlayers[i]);
                // announce defeat
                // announce(color + " has been defeated!");
                
                // award the player who defeated this color a mana bonus
                var victor = players.getPlayer(players.getCurrentPlayer());
                var defeated = players.getPlayer(thePlayers[i]);
                var manaBonus = Math.floor(defeated.stat_mana_gen * settings.defeatedPlayerManaBonusPercent);
                manaBonus += defeated.manaBank;
                if(manaBonus < 5) {
                    manaBonus = 5;
                }
                
                // give the bonus immediately
                gameState.currentPlayerMana += manaBonus;
                victor.stat_mana_gen += manaBonus;
                console.log("Gained a mana bonus of ", manaBonus)
                announce("Defeated " + color + "! Gain " + manaBonus + " Mana!");
                announceManaBonus();
                audio.play("defeat_player");
                updateDefeatBonus(victor);
                wipeDefeatBonus(defeated);
            }
        }
        
        // if that was the only other player, you win!
        remainingPlayers = [];
        remainingPlayers = players.getActivePlayers();
        if(remainingPlayers.length == 1) {
            gameOver();
        }
    }
    
    function startNewGame(mapName) {
        stopGame();
        restarting = true;
        if(mapName != undefined) {
            console.log("starting a new game with " + mapName);
            runWithMap(mapName);
        } else {
            run();
        }
    }
    
    function saveGameData() {
        storage.set("druidGameData", {
            savedPlayerNumber : players.getCurrentPlayer() - 1,
            savedTiles : board.getBoard(),
            savedObstacles : board.getObstacles(),
            savedUnits : board.getUnits()
        });
    }
    
    function restartTurn() {
        var activeTurn = storage.get("druidGameData"),
            useActiveTurn;
            
        if(activeTurn) {
            useActiveTurn = window.confirm(
                    "Do you want to restart your turn?");
            if(useActiveTurn) {
                players.setCurrentPlayer(activeTurn.savedPlayerNumber); // actually this player - 1 so it correctly cycles...
                // reset the board data to the saved state from the last player change
                board.setBoard(activeTurn.savedTiles);
                board.setObstacles(activeTurn.savedObstacles);
                board.setUnits(activeTurn.savedUnits);
                
                changeTurn();
            }
        }
    }
    
    function gameOver() {
        // audio.play("gameover");
        stopGame();
        storage.set("playerEndGameData", {
            playerData : players.getPlayers(),
            gameTime : getTime(),
            gameID : getGameID(),
            firstPlayer : gameState.firstPlayerColor
        });
        storage.set("druidGameData", null);
        announce(util.getPlayerColor(players.getCurrentPlayer()) + " Wins!");
        
        setTimeout(function() {
            druid.game.showScreen("game-over");
        }, 3000);
        
    }
    
    function stopGame() {
        var music = $("#musicplayer");
        clearTimeout(gameState.timer);
        gameState.endTime = Date.now();
        
        music.get(0).pause();
    }
    
    function getTime() {
        gameState.endTime = Date.now();
        var timeDiff = gameState.endTime - gameState.startTime;
        // gives whole seconds
        timeDiff = timeDiff / 1000;
        var minutes = Math.round(timeDiff / 60);
        timeDiff = timeDiff % 60;
        var seconds = Math.round(timeDiff);

        // format seconds nicely        
        if(seconds.toString().length == 1) {
            return minutes + ":0" + seconds;
        } else {
            return minutes + ":" + seconds;
        }
    }
    
    function getGameID() {
        return gameID;
    }
    
    return {
        run: runWithMap,
        runWithMap: runWithMap,
        getGameState: getGameState,
        resetGameState: resetGameState,
        changeTurn: changeTurn,
        getTime: getTime,
        selectUnit: selectUnit,
        getGameID: getGameID
    };
})();