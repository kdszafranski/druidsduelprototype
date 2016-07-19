druid.players = (function() {
    var firstRun = true,
        playerList,
        currentPlayer,
        util = druid.util;
    
        
    function setup(numPlayers) {
        var thisPlayer = {};
        playerList = [];
        for(i = 0; i < numPlayers; i++) {
            thisPlayer = {
                color: util.getPlayerColor(i),
                enabled: false,
                turn: 0,
                active: true,
                manaBank: 0,
                lastTurnMana: 0,
                stat_mana_gen: 0,
                stat_mana_spent: 0,
                stat_units_placed: 0,
                stat_units_lost: 0,
                stat_units_captured: 0,
                stat_units_upgraded: 0             
            };
            playerList[i] = thisPlayer;
        }
        // pick a random player to start the game
        currentPlayer = Math.floor(Math.random()*numPlayers);
    }
    
    function initialize(numPlayers, callback) {
        setup(numPlayers);
        callback();
    }
    
    function reset() {
        firstRun = true;
    }
    
    function setManaBank(mana) {
        manaBank = mana;
    }
    
    function getPlayerManaBank() {
        return manaBank;
    }
    
    function setLastTurnMana(mana) {
        lastTurnMana = mana;
    }
    
    function getPlayerLastTurnMana() {
        return lastTurnMana;
    }
    
    // returns the requested player object
    function getPlayer(index) {
        if(index >= 0 && index < playerList.length) {
            return playerList[index];
        } else {
            return -1;
        }        
    }
    
    // TODO: returns a copy of the player array. Probably only for debugging.
    function getPlayers() {
        var copy = [];
        var x;
        for(x = 0; x < playerList.length; x++) {
            copy[x] = playerList[x];
        }
        return copy;
    }
    
    function getCurrentPlayer() {
        return currentPlayer;
    }
    
    function isPlayerStillActive(playerNumber) {
        var thisPlayer;
        
        if(thisPlayer = getPlayer(playerNumber)) {
            return thisPlayer.active;
        } else {
            return -1;
        }
        
    }
    
    function getActivePlayers() {
        var copy = [];
        var x;
        
        for(x = 0; x < playerList.length; x++) {
            thisPlayer = playerList[x];
            if(thisPlayer.active == true) {
                copy.push(x);
                // should this just be the index (x)?
            }
        }
        return copy;
    }
    
    function defeatPlayer(playerNumber) {
        var thisPlayer;
        
        if(thisPlayer = getPlayer(playerNumber)) {
            thisPlayer.active = false;
            console.log("defeated player " + thisPlayer.color);
        } else {
            return -1;
        }
    }
    
    // player: index of playerList
    function setCurrentPlayer(player) {
        current = getCurrentPlayer();
        if(current != player) {
            currentPlayer = player;
        }
    }
    
    function cyclePlayer(callback) {
        var thisPlayer;
        
        // I only care about the active players at this point.
        // if next person is beyond the last, go to the beginning
        if(currentPlayer > playerList.length || currentPlayer + 1 >= playerList.length) {
            currentPlayer = 0;
        } else {
            currentPlayer++;
        }
        
        // find the next active player
        thisPlayer = playerList[currentPlayer];
        while(thisPlayer.active == false) {
            if(currentPlayer > playerList.length || currentPlayer + 1 >= playerList.length) {
                currentPlayer = 0;
            } else {
                currentPlayer++;
            }
            thisPlayer = playerList[currentPlayer];
        }
        
        // enable new current player, disable others
        for(i = 0; i < playerList.length; i++) {
            if(i == currentPlayer) {
                thisPlayer = playerList[i];
                thisPlayer.enabled = true;
                thisPlayer.turn++;
            } else {
                thisPlayer = playerList[i];
                thisPlayer.enabled = false;
            }
        }
        
        callback();
    }
    
    return {
        initialize: initialize,
        getPlayer: getPlayer,
        getPlayers: getPlayers,
        getActivePlayers: getActivePlayers,
        setManaBank: setManaBank,
        setLastTurnMana: setLastTurnMana,
        isPlayerStillActive: isPlayerStillActive,
        defeatPlayer: defeatPlayer,
        getCurrentPlayer: getCurrentPlayer,
        setCurrentPlayer: setCurrentPlayer,
        cyclePlayer: cyclePlayer,
        reset: reset
    };
    
})();