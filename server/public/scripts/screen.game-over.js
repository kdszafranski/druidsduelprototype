druid.screens["game-over"] = (function() {
    var game = druid.game,
        storage = druid.storage,
        firstRun = true;
    
    function setup() {
        $("#game-over button").bind("click", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                var action = e.target.getAttribute("name");
                game.showScreen(action);
            }
        });
    }
    
    function run() {
        if(firstRun) {
            setup();
            firstRun = false;
        }
        populateList();
        
        // hide other shiz
        $("#game-status #new-game-form").css("display", "none");
        
        // clean up for next time.
        storage.set("playerEndGameData", null);
    }
    
    function populateList() {
        var stats = getStats();
        var delta = 0;
        var timeData = stats.gameTime;
        var gameID = stats.gameID;
        var firstPlayer = stats.firstPlayer;
        var thePlayer, i;
        
        // extract player data for each player
        var playerBlue = stats.playerData[0];
        var playerYellow = stats.playerData[1];

        if(stats.playerData[2] != undefined) {
            var playerRed = stats.playerData[2];
        }
        if(stats.playerData[3] != undefined) {
            var playerBlack = stats.playerData[3];
        }
        
        // Update Winner UI
        for(i = 0; i < stats.playerData.length; i++) {
            thePlayer = stats.playerData[i];
            if(thePlayer.active == true) {
                // this is the winner
                $("#game-over .stat-base-game-winner span").html(thePlayer.color);
            }
        }
        
        // Update game ID UI
        $("#game-over .stat-base-game-id span").html(gameID);
        
        // Update game time UI
        $("#game-over .stat-base-game-time span").html(timeData);
        
        $("#game-over .stat-base-first-player span").html(firstPlayer);
        
        // turns
        $("#game-over .stat-turns span.blue").html(playerBlue.turn);
        $("#game-over .stat-turns span.yellow").html(playerYellow.turn);
        if(playerRed != undefined) {
            $("#game-over .stat-turns span.red").html(playerRed.turn);
        } else {
            $("#game-over .stat-turns span.red").html("");
        }
        if(playerBlack != undefined) {
            $("#game-over .stat-turns span.black").html(playerBlack.turn);
        } else {
            $("#game-over .stat-turns span.black").html("");
        }
        
        // mana generation
        var perturn = 0;
        perturn = Math.round(playerBlue.stat_mana_gen / playerBlue.turn);
        $("#game-over .stat-mana-gen span.blue").html(playerBlue.stat_mana_gen + "<br />(" + perturn + "/turn)");
        
        perturn = Math.round(playerYellow.stat_mana_gen / playerYellow.turn);
        $("#game-over .stat-mana-gen span.yellow").html(playerYellow.stat_mana_gen + "<br />(" + perturn + "/turn)");
        
        if(playerRed != undefined) {
            perturn = Math.round(playerRed.stat_mana_gen / playerRed.turn);
            $("#game-over .stat-mana-gen span.red").html(playerRed.stat_mana_gen + "<br />(" + perturn + "/turn)");
        } else {
            $("#game-over .stat-mana-gen span.red").html("");
        }
        
        if(playerBlack != undefined) {
            perturn = Math.round(playerBlack.stat_mana_gen / playerBlack.turn);
            $("#game-over .stat-mana-gen span.black").html(playerBlack.stat_mana_gen + "<br />(" + perturn + "/turn)");
        } else {
            $("#game-over .stat-mana-gen span.black").html("");
        }
        
        // mana spent
        $("#game-over .stat-mana-spent span.blue").html(playerBlue.stat_mana_spent);
        $("#game-over .stat-mana-spent span.yellow").html(playerYellow.stat_mana_spent);
        if(playerRed != undefined) {
            $("#game-over .stat-mana-spent span.red").html(playerRed.stat_mana_spent);
        } else {
            $("#game-over .stat-mana-spent span.red").html("");
        }
        if(playerBlack != undefined) {
            $("#game-over .stat-mana-spent span.black").html(playerBlack.stat_mana_spent);
        } else {
            $("#game-over .stat-mana-spent span.black").html("");
        }
        
        // mana delta
        delta = playerBlue.stat_mana_gen - playerBlue.stat_mana_spent;
        $("#game-over .stat-mana-delta span.blue").html(delta);
        
        delta = playerYellow.stat_mana_gen - playerYellow.stat_mana_spent;
        $("#game-over .stat-mana-delta span.yellow").html(delta);
        
        if(playerRed != undefined) {
            delta = playerRed.stat_mana_gen - playerRed.stat_mana_spent;
            $("#game-over .stat-mana-delta span.red").html(delta);
        } else {
            $("#game-over .stat-mana-delta span.red").html("");
        }
        if(playerBlack != undefined) {
            delta = playerBlack.stat_mana_gen - playerBlack.stat_mana_spent;
            $("#game-over .stat-mana-delta span.black").html(delta);
        } else {
            $("#game-over .stat-mana-delta span.black").html("");
        }
        
        // new units
        $("#game-over .stat-units-placed span.blue").html(playerBlue.stat_units_placed);
        $("#game-over .stat-units-placed span.yellow").html(playerYellow.stat_units_placed);
        if(playerRed != undefined) {
            $("#game-over .stat-units-placed span.red").html(playerRed.stat_units_placed);
        } else {
            $("#game-over .stat-units-placed span.red").html("");
        }
        if(playerBlack != undefined) {
            $("#game-over .stat-units-placed span.black").html(playerBlack.stat_units_placed);
        } else {
            $("#game-over .stat-units-placed span.black").html("");
        }
        
        // unit captures
        $("#game-over .stat-units-captured span.blue").html(playerBlue.stat_units_captured);
        $("#game-over .stat-units-captured span.yellow").html(playerYellow.stat_units_captured);
        if(playerRed != undefined) {
            $("#game-over .stat-units-captured span.red").html(playerRed.stat_units_captured);
        } else {
            $("#game-over .stat-units-captured span.red").html("");
        }
        if(playerBlack != undefined) {
            $("#game-over .stat-units-captured span.black").html(playerBlack.stat_units_captured);
        } else {
            $("#game-over .stat-units-captured span.black").html("");
        }
        
        // animal upgrades
        $("#game-over .stat-units-upgraded span.blue").html(playerBlue.stat_units_upgraded);
        $("#game-over .stat-units-upgraded span.yellow").html(playerYellow.stat_units_upgraded);
        if(playerRed != undefined) {
            $("#game-over .stat-units-upgraded span.red").html(playerRed.stat_units_upgraded);
        } else {
            $("#game-over .stat-units-upgraded span.red").html("");
        }
        if(playerBlack != undefined) {
            $("#game-over .stat-units-upgraded span.black").html(playerBlack.stat_units_upgraded);
        } else {
            $("#game-over .stat-units-upgraded span.black").html("");
        }
        
    }
    
    function getStats() {
        return storage.get("playerEndGameData") || [];
    }
    
    return {
        run : run
    };
        
})();