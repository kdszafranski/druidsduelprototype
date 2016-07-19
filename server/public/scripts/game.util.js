druid.util = (function() {
    var settings = druid.settings;
    
    function getCursorType(name) {
        switch(name) {
            case "none":
                return;
                break;
            case "select":
                return 0;
                break;
            case "cast":
                return 0;
                break;
            case "fly":
                return 0;
                break;
            case "move":
                return 1;
                break;
            case "multimove":
                return 1;
                break;
            case "attack":
                return 2;
                break;
            case "shoot":
                return 2;
                break;
            case "relic":
                return 3;
                break;
            default:
                return 0;
        }
    }
    
    function getUnitMoveFromName(unitName) {
        switch(unitName) {
            case "soldier":
                return settings.soldierMove;
                break;
            case "archer":
                return settings.archerMove;
                break;
            case "knight":
                return settings.knightMove;
                break;
            case "walker":
                return settings.walkerMove;
                break;
            case "wolf":
                return settings.wolfMove;
                break;
            case "eagle":
                return settings.eagleMove;
                break;
            case "bear":
                return settings.bearMove;
                break;
            case "turtle":
                return settings.turtleMove;
                break;
        }
    }
    
    function getUnitMoves(type) {
        // return moves;
        if(type == 21 || type == 29 || type == 37 || type == 45) {
            return settings.soldierMove;               
        }                                   
        if(type == 22 || type == 30 || type == 38 || type == 46) {
            return settings.archerMove;                
        }                                   
        if(type == 23 || type == 31 || type == 39 || type == 47) {
            return settings.knightMove;                
        }                                   
        if(type == 24 || type == 32 || type == 40 || type == 48) {
            return settings.walkerMove;                
        }                                   
        if(type == 25 || type == 33 || type == 41 || type == 49) {
            return settings.wolfMove;                 
        }                                  
        if(type == 26 || type == 34 || type == 42 || type == 50) {
            return settings.eagleMove;              
        }                                   
        if(type == 27 || type == 35 || type == 43 || type == 51) {
            return settings.bearMove;    
        }                                 
        if(type == 28 || type == 35 || type == 44 || type == 52) {
            return settings.turtleMove;
        }

        return -1;
    }
    
    function getUnitShotRange(unitType) {
        switch(unitType) {
            case 22:
                return settings.archerShoot;
                break;
            case 30:
                return settings.archerShoot;
                break;
            case 38:
                return settings.archerShoot;
                break;
            case 46:
                return settings.archerShoot;
                break;
            case 24:
                return settings.walkerShoot;
                break;
            case 32:
                return settings.walkerShoot;
                break;
            case 40:
                return settings.walkerShoot;
                break;
            case 48:
                return settings.walkerShoot;
                break;
            default:
                return 0;
        }
    }
    
    function getPlayerColor(playerNumber) {
        switch(playerNumber) {
            case 0:
                return "Blue";
                break;
            case 1:
                return "Yellow";
                break;
            case 2:
                return "Red";
                break;
            case 3:
                return "Black";
                break;
            default:
                return "";
        }
    }
    
    function getPlayerDisplayColor(color) {
        switch(color) {
            case "blue":
                return "#5bbcc2";
                break;
            case "yellow":
                return "#e5ce08";
                break;
            case "red":
                return "#b93131";
                break;
            case "black":
                return "#000000";
                break;
            default:
                return "#000";
        }
    }
    
    function getPlayerNumberFromOwner(ownerNumber) {
        switch(ownerNumber) {
            case 17:
                return 0;
                break;
            case 18: 
                return 1;
                break;
            case 19:
                return 2;
                break;
            case 20:
                return 3;
                break;
            default:
                return -1;
        }
    }
    
    function getOwnerColor(ownerNumber) {
        switch(ownerNumber) {
            case 17:
                return "Blue";
                break;
            case 18: 
                return "Yellow";
                break;
            case 19:
                return "Red";
                break;
            case 20:
                return "Black";
                break;
            default:
                return "";
        }
    }
    
    // returns the relic obstacle type number used to draw the correct obstacle art
    function getRelicTypeForOwner(ownerNumber) {
        switch(ownerNumber) {
            case 17:
                return 12;
                break;
            case 18: 
                return 13;
                break;
            case 19:
                return 14;
                break;
            case 20:
                return 15;
                break;
            default:
                return "11";
        }
    }
    
    function getPlayerUnitTypes(playerNumber) {
        var codes = [];
        switch(playerNumber) {
            case 0:
                codes = [21, 22, 23, 24, 25, 26, 27, 28];
                break;
            case 1:
                codes = [29, 30, 31, 32, 33, 34, 35, 36];
                break;
            case 2:
                codes = [37, 38, 39, 40, 41, 42, 43, 44];
                break;
            case 3:
                codes = [45, 46, 47, 48, 49, 50, 51, 52];
                break;
            default:
                return;
        }
        return codes;
    }
    
    
    function getUnitTypeFromName(playerNumber, typeName) {
        units = getPlayerUnitTypes(playerNumber);
        switch(typeName) {
            case "soldier":
                return units[0];
                break;
            case "archer":
                return units[1];
                break;
            case "knight":
                return units[2];
                break;
            case "walker":
                return units[3];
                break;
            case "wolf":
                return units[4];
                break;
            case "eagle":
                return units[5];
                break;
            case "bear":
                return units[6];
                break;
            case "turtle":
                return units[7];
                break;
            default:
                return units[0];
        }
    }
    
    function getUnitNameFromType(type) {
        
        if(type == 21 || type == 29 || type == 37 || type == 45) {
            return "soldier";               
        }                                   
        if(type == 22 || type == 30 || type == 38 || type == 46) {
            return "archer";                
        }                                   
        if(type == 23 || type == 31 || type == 39 || type == 47) {
            return "knight";                
        }                                   
        if(type == 24 || type == 32 || type == 40 || type == 48) {
            return "walker";                
        }                                   
        if(type == 25 || type == 33 || type == 41 || type == 49) {
            return "wolf";                 
        }                                  
        if(type == 26 || type == 34 || type == 42 || type == 50) {
            return "eagle";                 
        }                                   
        if(type == 27 || type == 35 || type == 43 || type == 51) {
            return "bear";                
        }                                 
        if(type == 28 || type == 36 || type == 44 || type == 52) {
            return "turtle";
        }

        return -1;
    }
    
    // 11 : "blue",
    // 12 : "yellow",
    // 13 : "red",
    // 14 : "black"
    function getOwnerNumberFromPlayer(playerNumber) {
        switch(playerNumber) {
            case 0:
                return 17;
                break;
            case 1: 
                return 18;
                break;
            case 2:
                return 19;
                break;
            case 3:
                return 20;
                break;
            default:
                return;
        }
    }
    
    // returns true if one of the given moves contains the target x and y location
    function isInRange(x, y, moves) {
        for(i = 0; i < moves.length; i++) {
            thisMove = moves[i];
            if(thisMove.x == x && thisMove.y == y) {
                return thisMove;
            }
        }
        return false;
    }
    
    return {
        getCursorType: getCursorType,
        getUnitMoves: getUnitMoves,
        getUnitShotRange: getUnitShotRange,
        getPlayerColor: getPlayerColor,
        getPlayerNumberFromOwner: getPlayerNumberFromOwner,
        getOwnerColor: getOwnerColor,
        getPlayerDisplayColor: getPlayerDisplayColor,
        getPlayerUnitTypes: getPlayerUnitTypes,
        getUnitNameFromType: getUnitNameFromType,
        getOwnerNumberFromPlayer: getOwnerNumberFromPlayer,
        getUnitTypeFromName: getUnitTypeFromName,
        getRelicTypeForOwner: getRelicTypeForOwner,
        isInRange: isInRange
    };
    
})();