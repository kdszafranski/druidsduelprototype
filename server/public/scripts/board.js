druid.board = (function() {
    var util = druid.util;
    /* game functions */
    var settings,
        tiles,
        obstacles,
        units,
        longCols,
        shortCols,
        tileWidth,
        tileHeight,
        mapProperties,
        rows,
        numTileTypes;

    function initialize(requestedMap, callback) {
        settings = druid.settings;
        numTileTypes = settings.numTileTypes;
        longCols = settings.longCols;
        shortCols = settings.shortCols;
        tileWidth = settings.tileWidth;
        tileHeight = settings.tileHeight;
        rows = settings.rows;
        mapProperties = {};
        tiles = [];
        obstcales = [];        
        if(requestedMap != undefined) {
            loadMapFromJSON(requestedMap);            
        } else {
            loadMapFromJSON(null);
        }
        
        callback();
    }
    
    // TODO: Would need a lot of error-checking to accept user-generated maps
    function loadMapFromJSON(requestedMap) {
        
        if(requestedMap == null || requestedMap == undefined) {
            // nothing passed in, or it's broken, so use a map we know and trust
            requestedMap = "2_player_playtest";
        }
        mapFile = requestedMap;
        
        $.ajax({
        	url: "maps/" + mapFile + ".json",
        	method: 'get',
        	dataType: 'json',

        	// MUST load synchronous, as the engine would otherwise determine that it
        	// can't resolve dependencies because the ajax request hasn't finished yet.
        	// FIXME FFS!
        	async: false, 
        	success: function(data) {
        	    // get map info
                props = data.properties;
                mapProperties = {
                    title: props.title,
                    author: props.author,
                    players: props.numPlayers,
                    tileManaValue: props.tileManaValue,
                    relicValue: props.relicValue
                };
        	    
        	    settings.numPlayers = mapProperties.players;
        	    
        	    var thisTile;
        	    
        	    // load ground tiles
        	    tileArray = data.layers[0].data;
                tileArray.reverse(); // changes them to draw order
                ownerArray = data.layers[1].data;
                
                tiles = [];
                ownerIndex = 0;

                for(i = 0; i < rows+1; i++) {
                    tiles[i] = [];
                    for(j = 0; j < longCols; j++) {
                        thisTile = {
                            type : tileArray.pop(),         // store tile type as a number
                            owner : ownerArray[ownerIndex],  // match ownership layer to tile layer
                            flowerType : -1
                        };
                        tiles[i][j] = thisTile;
                        ownerIndex++;
                    }
                }

                // load obstacles
                obstaclesArray = data.layers[2].data;
                obstaclesArray.reverse();
                obstacles = [];
                
                for(i = 0; i < rows; i++) {
                    obstacles[i] = [];
                    for(j = 0; j < longCols; j++) {
                        obstacles[i][j] = obstaclesArray.pop();
                    }
                }
                
                // load units
                unitsArray = data.layers[3].data;
                unitsArray.reverse();
                units = [];
                
                for(i = 0; i < rows; i++) {
                    units[i] = [];
                    for(j = 0; j < longCols; j++) {
                        thisUnit = {
                            type: unitsArray.pop(),
                            enabled: false,
                            selected: false,
                            upgraded: false,
                            upgradeIsPersistent: false,
                            upgradedThisTurn: false,
                            formerType: null,
                            typeName: "",
                            captures: 0,
                            actions: 0
                        };
                        thisUnit.typeName = util.getUnitNameFromType(thisUnit.type);
                        thisUnit.actions = util.getUnitMoves(thisUnit.type);
                        thisUnit.formerType = thisUnit.type;
                        units[i][j] = thisUnit;
                    }
                }
        	},
        	error: function( xhr, status, error ){
        		throw( 
        			"Failed to load map via ajax " + error + "\n" +
        			xhr.responseText
        		);
        	}
        });
    }
    
    // finds clumps of land spaces and adds flowers to the tiles
    function generateFlowers() {
        var chance = .50;
        
        for(x = 0; x < tiles.length; x++) {
            tileRow = tiles[x];
            for(y = 0; y < tileRow.length; y++) {
                thisTile = tileRow[y];
                
            }      
        }
        
    }
    
    // TODO: following setters are very dangerous
    function setBoard(newTiles) {
        tiles = [];
        tiles = newTiles;
    }
    
    function setObstacles(newObstacles) {
        obstacles = [];
        obstacles = newObstacles;
    }
    
    function setUnits(newUnits) {
        units = [];
        units = newUnits;
    }
    
    // create a copy of the game board tiles only
    function getBoard() {
        var copy = [];
        var x;
        for(x = 0; x < tiles.length; x++) {
            copy[x] = tiles[x].slice(0);
        }
        return copy;
    }
    
    function getObstacles() {
        var copy = [];
        var x;
        for(x = 0; x < obstacles.length; x++) {
            copy[x] = obstacles[x].slice(0);
        }
        return copy;
    }
    
    function getUnits() {
        var copy = [];
        var x;
        for(x = 0; x < units.length; x++) {
            copy[x] = units[x].slice(0);
        }
        return copy;
    }
    
    // get the tile object from a given location
    function getTile(x, y) {
        if(outOfBounds(x, y)) {
            return -1;
        } else {
            return tiles[y][x];
        }
    }
    
    function getTileType(x, y) {        
        if(outOfBounds(x, y)) {
            return -1;
        } else {
            thisTile = tiles[y][x];
            return thisTile.type;
        }
    }
    
    function getTileOwner(x, y) {
        var thisTile;
        
        // check boundaries
        if(outOfBounds(x, y)) {
            return -1;
        } else {
            thisTile = tiles[y][x];
            return thisTile.owner;
        }
    }
    
    function getObstacle(x, y) {
        // check boundaries
        if(outOfBounds(x, y)) {
            return -1;
        } else {
            return obstacles[y][x];
        }
    }
    
    function getUnit(x, y) {
        // check boundaries
        if(outOfBounds(x, y)) {
            return -1;
        } else {
            return units[y][x];
        }
    }
    
    // owner = owner code
    // x and y is a board location
    function setTileOwner(x, y, owner) {
        if(outOfBounds(x, y)) {
            return -1;
        } else {
            thisTile = getTile(x, y);
            thisTile.owner = owner;
            tiles[y][x] = thisTile;
        }
    }
    
    function outOfBounds(x, y) {
        if(x === undefined || y === undefined) {
            return true;
        } else {
            if(x < 0 || y < 0 || x >= longCols || y >= rows)
            {
                return true;
            } else {
                return false;
            }
        }
    }
    
    function isTraversable(x, y) {
        if(outOfBounds(x, y)) {
            return false;
        } else {
            thisTile = tiles[y][x];
            thisObstacle = obstacles[y][x];
            if(thisTile.type > 0 && thisObstacle < 5) {
                return true;
            } else {
                return false;
            }
        }
    }
    
    function hasRelic(x, y) {
        if(outOfBounds(x, y)) {
            return false;
        } else {
            if(obstacles[y][x] > 10 && obstacles[y][x] < 16) {
                return true;
            } else {
                return false;
            }
        }
    }
    
    function isOccupied(x, y) {
        if(outOfBounds(x, y)) {
            return false;
        } else {
            thisUnit = units[y][x];
            if(thisUnit.type > 0) {
                return true;
            } else {
                return false;
            }
        }
    }
    
    function getLocationInformation(x, y) {        
        if(outOfBounds(x, y)) {
            return -1;
        } else {
            tileInformation = {
                tileX: x,
                tileY: y,
                tileType: getTileType(x, y),
                tileOwnerVerbose: util.getOwnerColor(getTileOwner(x, y)),
                tileOwner: getTileOwner(x, y),
                tileOccupant: "",
                tileOccupantMoves: "",
                isTraversable: isTraversable(x, y),
                hasRelic: hasRelic(x, y),
                isOccupied: isOccupied(x, y)
            };
            theOccupant = getUnit(x, y);
            tileInformation.tileOccupant = theOccupant.typeName;
            tileInformation.tileOccupantMoves = theOccupant.actions;

            return tileInformation;
        }
    }
    
    // Manages which unit is selected.
    // In invocation, compares all units to x and y, deselecting all but x, y.
    function selectUnit(x, y) {        
        for(var i = 0; i < units.length; i++) {
            unitRow = units[i];
            for(var j = 0; j < unitRow.length; j++) {
                thisUnit = unitRow[j];
                if(y == i && x == j) { // remember on direct access to units you have to reverse x and y.
                    thisUnit.selected = true;
                } else {
                    thisUnit.selected = false;
                }
                unitRow[j] = thisUnit;
            }
        }
        return getUnit(x, y);
    }
    
    function moveUnit(fromX, fromY, owner, moveData) {
        var moveUnit = {},
            oldTile = {},
            moveTile = {};
        
        if(moveData) {
            // get current unit
            moveUnit = getUnit(fromX, fromY);
            
            // update with new data. be sure to check actions remaining.
            moveUnit.enabled = false;
            if(moveUnit.actions - 1 > 0) {
                moveUnit.enabled = true;
            } else {
                moveUnit.enabled = false;
            }
            moveUnit.actions--;
            
            units[moveData.y][moveData.x] = moveUnit;
            
            // wipe old unit
            oldUnit = {
                type: 0,
                enabled: false,
                selected: false,
                upgraded: false,
                typeName: "",
                captures: 0,
                actions: 0
            };
            units[fromY][fromX] = oldUnit;
            
            // set owner of new tile unless it's a bridge
            newTile = getTile(moveData.x, moveData.y);
            if(newTile.type < 3) {
                setTileOwner(moveData.x, moveData.y, owner);
            } 
            
            return moveUnit.actions;
        } else {
            return -1;
        }
    }
    
    function attackUnit(fromX, fromY, owner, moveData) {
        var attackUnit;
        
        if(moveUnit(fromX, fromY, owner, moveData) > -1) {
            attackUnit = getUnit(moveData.x, moveData.y);
            attackUnit.captures++;
            if(settings.attackEndsTurn) {                
                if(util.getUnitNameFromType(attackUnit.type) != "bear") {
                    attackUnit.enabled = false;
                    attackUnit.actions = 0;
                }
            }

            return attackUnit.actions;
        } else {
            return -1;
        }
    }
    
    function flyUnit(fromX, fromY, owner, moveData) {
        var flyingUnit;
        
        if(moveUnit(fromX, fromY, owner, moveData)) {
            flyingUnit = getUnit(moveData.x, moveData.y);
            flyingUnit.captures++;
            if(settings.attackEndsTurn) {
                if(flyingUnit.typeName != "eagle") {
                    attackUnit.enabled = false;
                    attackUnit.actions = 0;
                }
            }
            // console.log("flying unit actions: ", flyingUnit.actions);
            return flyingUnit.actions;
        } else {
            return -1;
        }
    }
    
    function shootUnit(fromX, fromY, owner, shootData) {
        var shootUnit = {};
        if(shootData) {
            // wipe target
            targetUnit = {
                type: 0,
                enabled: false,
                selected: false,
                captures: 0,
                actions: 0,
                upgraded: false,
                typeName: ""
            };
            units[shootData.y][shootData.x] = targetUnit;

            // get current unit
            shootUnit = getUnit(fromX, fromY);

            // update with new data
            shootUnit.selected = false;
            shootUnit.captures++;
            if(shootUnit.actions - 1 > 0) {
                shootUnit.enabled = true;
            } else {
                shootUnit.enabled = false;
            }
            shootUnit.actions--;
            
            units[fromY][fromX] = shootUnit;
            
            return true;
        } else {
            return false;
        }
        
    }
    
    function captureRelic(fromX, fromY, owner, moveData) {
        if(moveData) {
            thisTile = getTile(moveData.x, moveData.y);
            thisTile.owner = owner;
            
            obstacles[moveData.y][moveData.x] = util.getRelicTypeForOwner(owner);
            
            if(settings.captureRelicEndsTurn) {
                capturingUnit = getUnit(fromX, fromY);
                capturingUnit.enabled = false;
                capturingUnit.actions = 0;
                if(capturingUnit.upgraded) {
                    changeUnitBack(fromX, fromY);
                }
            }
            // should it take an action regardless?

            return true;
        } else {
            return false;
        }
    }
    
    function getCurrentPlayerTileCount(owner) {
        var tileCount = {
            groundTiles: 0,
            relics: 0
        };
        for(x = 0; x < tiles.length; x++) {
            tileRow = tiles[x];
            for(y = 0; y < tileRow.length; y++) {
                thisTile = tileRow[y];
                
                if(thisTile.owner == owner) {                    
                    if(hasRelic(y, x)) {
                        tileCount.relics++;
                    } else {
                        tileCount.groundTiles++;
                    }
                }
            }      
        }
        return tileCount;
    }
    
    // returns location information for all spaces owned by owner (player)
    function getAllSpacesForPlayer(owner) {
        var spaces = [], tileRow, thisTile;
            
        for(x = 0; x < tiles.length; x++) {
            tileRow = tiles[x];
            for(y = 0; y < tileRow.length; y++) {
                thisTile = tileRow[y];
                possibleSpace = getLocationInformation(y, x);
                if(thisTile.owner == owner) {
                    spaces.push(possibleSpace);
                }
            }      
        }
        return spaces;
    }
    
    function getPlayerUnitCountForType(owner, typeName) {
        var unitCount = 0;
        var spaces = getAllSpacesForPlayer(owner);
        
        for(i = 0; i < spaces.length; i++) {
            if(spaces[i].tileOccupant == typeName) {
                unitCount++;
            }
        }
        return unitCount;
    }
    
    // returns all open land spaces for determining possible bridge locations
    function getAllOpenSpaces() {
        var spaces = [], tileRow, thisTile;
            
        for(x = 0; x < tiles.length; x++) {
            tileRow = tiles[x];
            for(y = 0; y < tileRow.length; y++) {
                thisTile = tileRow[y];
                possibleSpace = getLocationInformation(y, x);
                if(thisTile.type == 0) {
                    spaces.push(possibleSpace);
                }
            }      
        }
        return spaces;
    }
    
    function enablePlayerUnits(owner, callback) {
        unitCodes = util.getPlayerUnitTypes(owner);
        
        for(var x = 0; x < units.length; x++) {
            unitRow = units[x];
            for(var y = 0; y < unitRow.length; y++) {
                thisUnit = unitRow[y];
                if(unitCodes.indexOf(thisUnit.type) > -1) {
                    if(thisUnit.typeName == "turtle") {
                        // Turtles change back at the beginning of this player's turn
                        // TODO: could use changeUnitBack...
                        thisUnit.type = thisUnit.formerType;
                        thisUnit.formerType = null;
                        thisUnit.upgraded = false;
                        thisUnit.typeName = util.getUnitNameFromType(thisUnit.type);
                        thisUnit.upgradeIsPersistent = false;   
                    }
                    thisUnit.enabled = true;
                    thisUnit.selected = false;
                    thisUnit.actions = util.getUnitMoves(thisUnit.type);
                    thisUnit.upgradedThisTurn = false;
                } else {
                    thisUnit.enabled = false;
                    if(thisUnit.upgraded) {
                        if(thisUnit.upgradeIsPersistent == false) {
                            thisUnit.type = thisUnit.formerType;
                            thisUnit.formerType = null;
                            thisUnit.upgraded = false;
                            thisUnit.upgradedThisTurn = false;
                            thisUnit.typeName = util.getUnitNameFromType(thisUnit.type);
                        }
                    }
                }
                unitRow[y] = thisUnit;
            }      
        }

        callback();        
    }
    
    function addBridge(x, y, callback) {
        bridge = determineBridgeType(x, y);        
        tiles[y][x] = {
            type: bridge,
            owner: 0
        };
        
        callback();
    }
    
    function alterLand(fromX, fromY, owner, moveData) {
        var thisTile, castingUnit, type;
        var castingUnit = {},
            targetTile = {};
        
        if(moveData) {
            // get current unit
            castingUnit = getUnit(fromX, fromY);
            
            // update with new data. be sure to check actions remaining.
            if(castingUnit.actions - 1 > 0) {
                castingUnit.enabled = true;
            } else {
                castingUnit.enabled = false;
            }
            castingUnit.actions--;
            units[fromY][fromX] = castingUnit;
            
            thisTile = getTile(moveData.x,moveData.y);
            if(thisTile.type == 0) {
                // add land
                if(moveData.y % 2 == 0) {
                    type = 1;
                } else {
                    type = 2;
                }
                tiles[moveData.y][moveData.x] = {
                    type: type,
                    owner: 0
                };
            } else {
                // remove land
                tiles[moveData.y][moveData.x] = {
                    type: 0,
                    owner: 0
                };
                
                // wipe unit who's here
                units[moveData.y][moveData.x] = {
                    type: 0,
                    enabled: false,
                    selected: false,
                    upgraded: false,
                    typeName: "",
                    captures: 0,
                    actions: 0
                };
                
                // remove obstacle
                obstacles[moveData.y][moveData.x] = 0;
            }
            
            return castingUnit.actions;
        } else {
            return -1;
        }
    }
    
    function alterObstacle(fromX, fromY, owner, moveData) {
        var thisObst, castingUnit, type, thisTile;
        
        var castingUnit = {},
            targetTile = {};
        
        if(moveData) {
            // get current unit
            castingUnit = getUnit(fromX, fromY);
            
            // update with new data. be sure to check actions remaining.
            if(castingUnit.actions - 1 > 0) {
                castingUnit.enabled = true;
            } else {
                castingUnit.enabled = false;
            }
            castingUnit.actions--;
            
            units[fromY][fromX] = castingUnit;
            
            thisObst = getObstacle(moveData.x,moveData.y);
            if(thisObst == 0) {
                // add obstacle
                type = Math.floor(Math.random() * 6) + 5;
                obstacles[moveData.y][moveData.x] = type;
                thisTile = getTile(moveData.x, moveData.y);
                thisTile.owner = 0;
            } else {
                // remove obstacle
                obstacles[moveData.y][moveData.x] = 0;
            }
            
            return castingUnit.actions;
        } else {
            return -1;
        }
    }
    
    function stealLand(fromX, fromY, owner, moveData) {
        var castingUnit, type, thisTile;
        
        var castingUnit = {},
            targetTile = {};
        
        if(moveData) {
            // get current unit
            castingUnit = getUnit(fromX, fromY);
            
            // update with new data. be sure to check actions remaining.
            if(castingUnit.actions - 1 > 0) {
                castingUnit.enabled = true;
            } else {
                castingUnit.enabled = false;
            }
            castingUnit.actions--;            
            units[fromY][fromX] = castingUnit;
            
            // change land owner
            setTileOwner(moveData.x, moveData.y, owner);
            
            return castingUnit.actions;
        } else {
            return -1;
        }
    }
    
    function addUnit(x, y, playerNumber, typeName, callback) {
        newOwner = util.getOwnerNumberFromPlayer(playerNumber);
        unitType = util.getUnitTypeFromName(playerNumber, typeName);
        
        var newUnit = {
            type: unitType,
            enabled: false,
            selected: false,
            upgraded: false,
            upgradeIsPersistent: false,
            upgradedThisTurn: false,
            formerType: null,
            typeName: typeName,
            captures: 0,
            actions: 0
        };
        
        units[y][x] = newUnit;
        if( setTileOwner(x, y, newOwner) == -1) {
            console.log("here");
        }
        
        callback();
    }
    
    // changes the unit from one type to another, as in animal form upgrades
    function changeUnit(x, y, owner, playerNumber, typeName, upgraded, enabled) {
        theUnit = getUnit(x, y);
        theUnit.formerType = theUnit.type;
        theUnit.type = util.getUnitTypeFromName(playerNumber, typeName);
        theUnit.actions = util.getUnitMoves(theUnit.type);
        
        theUnit.upgraded = upgraded;
        theUnit.upgradedThisTurn = true;
        theUnit.typeName = util.getUnitNameFromType(theUnit.type);
        theUnit.enabled = enabled;
        if(typeName == "eagle") {
            theUnit.actions = 2;
        }
        if(typeName == "turtle") {
            theUnit.upgradeIsPersistent = true;
        }
        
        return true;
    }
    
    // Undoes previous changeUnit function on this unit
    function changeUnitBack(x, y) {
        theUnit = getUnit(x, y);
        theUnit.type = theUnit.formerType;
        theUnit.formerType = null;
        theUnit.upgraded = false;
        theUnit.typeName = util.getUnitNameFromType(theUnit.type);
        theUnit.upgradeIsPersistent = false;
        
        return true;
    }
    
    // Attempts to draw the best bridge type to visually match the surrounding tiles
    function determineBridgeType(x, y) {
        spaces = getAdjacentLocations(x, y);        
        NE = (spaces[1].tileType == undefined) ? 0 : spaces[1].tileType;
        SE = (spaces[3].tileType == undefined) ? 0 : spaces[3].tileType;
        SW = (spaces[5].tileType == undefined) ? 0 : spaces[5].tileType;
        NW = (spaces[7].tileType == undefined) ? 0 : spaces[7].tileType;
        type = 4;
        
        if(NW > 0 && NE == 0 && SW == 0) {
            type = 3;
        }
        if(NW == 0 && NE == 0 && SW == 0 && SE > 0) {
            type = 3;
        }
        if(NE == 0 && SE > 0 && SW == 3 && NW == 0) {
            type = 3;
        }
        if(NE == 0 && SE == 0 && (SW == 3 || SW == 4) && NW > 0) {
            type = 3;
        }
        if((NE > 0 || NE == 0) && (SE > 0) && (SW > 0 || SW == 0) || (NW > 0))
        {
            type = 3;
        } else if ((NE > 0 || NE == 0) && (SE > 0) && (SW > 0 || SW == 0) || (NW > 0)) {
            type = 4;
        }
        
        return type;
        
    }
    
    // returns an array of tileinfo objects of adjacent spaces to x, y
    function getAdjacentLocations(x, y) {
        var moves = [],
            target = {
                x : x,
                y : y
            },
            tileInfo;
        
        if(target.y % 2 == 0) {
            // handle long row target
            if(tileInfo = getLocationInformation(target.x, target.y - 2)) {
                // N
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x, target.y - 1)) {
                // NE
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x + 1, target.y)) {
                // E
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x, target.y + 1)) {
                // SE
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x, target.y + 2)) {
                // S
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x - 1, target.y + 1)) {
                // SW
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x - 1, target.y)) {
                // W
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x - 1, target.y - 1)) {
                // NW
                moves.push(tileInfo);
            }
        } else {
            // handle short row target
            if(tileInfo = getLocationInformation(target.x, target.y - 2)) {
                // N
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x + 1, target.y - 1)) {
                // NE
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x + 1, target.y)) {
                // E
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x + 1, target.y + 1)) {
                // SE
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x, target.y + 2)) {
                // S
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x, target.y + 1)) {
                // SW
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x - 1, target.y)) {
                // W
                moves.push(tileInfo);
            }
            if(tileInfo = getLocationInformation(target.x, target.y - 1)) {
                // NW
                moves.push(tileInfo);
            }
        }
        return moves;
    }

    // Indescriminantly gets all the valid spaces from x, y within given range.
    // returnOnlyAtRange: switch to return ONLY those spaces exactly at the given range.
    function getAllSpacesWithinRange(x, y, range, returnOnlyAtRange) {
        var moves = [],
            rangeMoves = [],
            count = 1,
            limit;
            
        // set current spot as the center
        var currentLocation = {
                x: x,
                y: y
            };
        
        while(count <= range) {
            // walk around each direction, expanding outward, gathering all x, y coords
            // REMEMBER! Each new currentLocation becomes the center, so we are only travelling diagonally
            
            // Go N. That's the new center. Don't get that info, we'll get it last so we are set to go N again from there.
            currentLocation.y -= 2;
            
            // Go SE to count * 2, which traverses down to and including the E spot from the starting location
            limit = count * 2;
            for(var se = 1; se <= limit; se++) {
                if(currentLocation.y % 2 == 0) {
                    // handle long row target
                    currentLocation.y++;
                } else {
                    currentLocation.x++;
                    currentLocation.y++;
                }
                if(returnOnlyAtRange == true && count == range) {
                    rangeMoves.push(getLocationInformation(currentLocation.x, currentLocation.y));
                } else {
                    moves.push(getLocationInformation(currentLocation.x, currentLocation.y));
                }
                
            }
            
            // Now turn SW and go the same distance.
            for(var sw = 1; sw <= limit; sw++) {
                if(currentLocation.y % 2 == 0) {
                    // handle long row target
                    currentLocation.x--;
                    currentLocation.y++;
                } else {
                    currentLocation.y++;
                }
                if(returnOnlyAtRange == true && count == range) {
                    rangeMoves.push(getLocationInformation(currentLocation.x, currentLocation.y));
                } else {
                    moves.push(getLocationInformation(currentLocation.x, currentLocation.y));
                }
            }
            
            // Now turn NW
            for(var nw = 1; nw <= limit; nw++) {
                if(currentLocation.y % 2 == 0) {
                    // handle long row target
                    currentLocation.x--;
                    currentLocation.y--;
                } else {
                    currentLocation.y--;
                }
                if(returnOnlyAtRange == true && count == range) {
                    rangeMoves.push(getLocationInformation(currentLocation.x, currentLocation.y));
                } else {
                    moves.push(getLocationInformation(currentLocation.x, currentLocation.y));
                }
            }
            
            // Now turn NE, this is the home stretch, and ends with us back at straight N of the start.
            for(var ne = 1; ne <= limit; ne++) {
                if(currentLocation.y % 2 == 0) {
                    // handle long row target
                    currentLocation.y--;
                } else {
                    currentLocation.x++;
                    currentLocation.y--;
                }
                if(returnOnlyAtRange == true && count == range) {
                    rangeMoves.push(getLocationInformation(currentLocation.x, currentLocation.y));
                } else {
                    moves.push(getLocationInformation(currentLocation.x, currentLocation.y));
                }
            }
            // increment that shit!
            count++;
        }
        
        if(returnOnlyAtRange == true) {
            return rangeMoves;
        } else {
            return moves;            
        }
    }
    
    // Returns a number from 1 - 4 which indicates the tile type
    // Note: this can return bridges
    function randomTile() {
        return Math.ceil(Math.random() * numTileTypes);
    }
    
    function print() {
        var str = "\r\n";
        var tile, tileRow, thisTile;
        
        for(var x = 0; x < tiles.length; x++) {
            tileRow = tiles[x];
            for(var y = 0; y < tileRow.length; y++) {
                thisTile = tileRow[y];
                str += thisTile.type + " ";
            }
            str += "\r\n";            
        }
        
        return str;
    }
    
    function getMapFile() {
        return mapFile;
    }
    
    function getMapProperties() {
        return mapProperties;
    }
    
    function getMapTitle() {
        return mapProperties.title;
    }
    
    
    return {
        initialize: initialize,
        print: print,
        getBoard: getBoard,
        getTile: getTile,
        getTileType: getTileType,
        getTileOwner: getTileOwner,
        getObstacles: getObstacles,
        getObstacle: getObstacle,
        getUnits: getUnits,
        getUnit: getUnit,
        getAdjacentLocations: getAdjacentLocations,
        getAllSpacesWithinRange: getAllSpacesWithinRange,
        getAllSpacesForPlayer: getAllSpacesForPlayer,
        getPlayerUnitCountForType: getPlayerUnitCountForType,
        getAllOpenSpaces: getAllOpenSpaces,
        isTraversable: isTraversable,
        hasRelic: hasRelic,
        getLocationInformation: getLocationInformation,
        getCurrentPlayerTileCount: getCurrentPlayerTileCount,
        selectUnit: selectUnit,
        enablePlayerUnits: enablePlayerUnits,
        moveUnit: moveUnit,
        attackUnit: attackUnit,
        flyUnit: flyUnit,
        shootUnit: shootUnit,
        addBridge: addBridge,
        alterLand: alterLand,
        alterObstacle: alterObstacle,
        addUnit: addUnit,
        changeUnit: changeUnit,
        changeUnitBack: changeUnitBack,
        captureRelic: captureRelic,
        getMapFile: getMapFile,
        getMapProperties: getMapProperties,
        getMapTitle: getMapTitle,
        setBoard: setBoard,
        setObstacles: setObstacles,
        setUnits: setUnits,
        stealLand: stealLand
    };
    
    
})();