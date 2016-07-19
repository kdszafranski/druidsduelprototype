druid.display = (function() {
    var util = druid.util,
        canvas, ctx,
        longCols, shortCols, rows,
        tileWidth,
        tileHeight,
        tiles,
        obstacles,
        firstRun = true,
        cursor,
        previousCycle,
        animations = [],
        gameboardOffset;
    var tileType = {
            0 : "empty",
            1 : "light",
            2 : "dark",
            3 : "bridge_left",
            4 : "bridge_right"
        };
        
    function setup() {
        var boardElement = $("#game-screen .game-board")[0];
        longCols = druid.settings.longCols;
        shortCols = druid.settings.shortCols;
        tileWidth = druid.settings.tileWidth;
        tileHeight = druid.settings.tileHeight;
        tileSpaceHeight = druid.settings.tileSpaceHeight;
        gameboardOffset = druid.settings.gameboardOffset;
        rows = druid.settings.rows;
        
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        $(canvas).addClass("board");
        
        canvas.width = tileWidth * longCols;
        // adjust the rows added if the canvas size is changed in CSS. Otherwise it will stretch the art
        // tileSpaceHeight/2 * (rows + 2)
        canvas.height = 550; 
        
        boardElement.appendChild(canvas);
        boardElement.appendChild(createBackground());
        // boardElement.appendChild(canvas);
        
        previousCycle = Date.now();
        requestAnimationFrame(cycle);
    }
    
    function initialize(callback) {
        if(firstRun) {
            setup();
            firstRun = false;
        }
        callback();
    }
    
    // animation loop
    //
    function cycle(time) {
        renderCursor(time);
        renderAnimations(time, previousCycle);
        previousCycle = time;
        requestAnimationFrame(cycle);
    }
    
    function createBackground() {
        var background = document.createElement("canvas"),
            bgctx = background.getContext("2d"),
            image = druid.images["images/bg-game-board.png"];
            
        $(background).addClass("background");
        background.width = 1008;
        background.height = 500;

        bgctx.drawImage( image, 0, 18 );
                
        return background;
    }
    
    function drawObstacle(type, x, y) {

        if(type > 0) {
            ctx.save();
            switch(type) {
                case 5:
                    imgX = 0 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 6:
                    imgX = 1 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 7:
                    imgX = 2 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 8:
                    imgX = 3 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 9:
                    imgX = 4 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 10:
                    imgX = 5 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 11:
                    imgX = 0 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 12:
                    imgX = 1 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 13:
                    imgX = 2 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 14:
                    imgX = 3 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 15:
                    imgX = 4 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                default:
                    return;
            }
            var image = druid.images["images/obstacle_sprite_sheet.png"];

            //  drawImage(image, source-x, source-y, source-w, source-h, dest-x, dest-y, dest-w, dest-h)
            ctx.drawImage( image, imgX, imgY, tileWidth, tileHeight, x, y, tileWidth, tileHeight );
            ctx.restore();
        }
    }
    
    function drawUnit(type, x, y, enabled) {

        if(type > 0) {
            switch(type) {
                case 21: // blue soldier
                    imgX = 0 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 22: // blue archer
                    imgX = 1 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 23: // blue knight
                    imgX = 2 * tileWidth;
                    imgY = 0 * tileHeight
                    break;
                case 24: // blue walker
                    imgX = 3 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 25: // blue wolf
                    imgX = 4 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 26: // blue eagle
                    imgX = 5 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;
                case 27: // blue bear
                    imgX = 6 * tileWidth;
                    imgY = 0 * tileHeight
                    break;
                case 28: // blue turtle
                    imgX = 7 * tileWidth;
                    imgY = 0 * tileHeight;
                    break;                
                case 29: // yellow soldier
                    imgX = 0 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 30: // yellow archer
                    imgX = 1 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 31: // yellow knight
                    imgX = 2 * tileWidth;
                    imgY = 1 * tileHeight
                    break;
                case 32: // yellow walker
                    imgX = 3 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 33: // yellow wolf
                    imgX = 4 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 34: // yellow eagle
                    imgX = 5 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 35: // yellow bear
                    imgX = 6 * tileWidth;
                    imgY = 1 * tileHeight
                    break;
                case 36: // yellow turtle
                    imgX = 7 * tileWidth;
                    imgY = 1 * tileHeight;
                    break;
                case 37: // red soldier
                    imgX = 0 * tileWidth;
                    imgY = 2 * tileHeight;
                    break;
                case 38: // red archer
                    imgX = 1 * tileWidth;
                    imgY = 2 * tileHeight;
                    break;
                case 39: // red knight
                    imgX = 2 * tileWidth;
                    imgY = 2 * tileHeight
                    break;
                case 40: // red walker
                    imgX = 3 * tileWidth;
                    imgY = 2 * tileHeight;
                    break;
                case 41: // red wolf
                    imgX = 4 * tileWidth;
                    imgY = 2 * tileHeight;
                    break;
                case 42: // red eagle
                    imgX = 5 * tileWidth;
                    imgY = 2 * tileHeight;
                    break;
                case 43: // red bear
                    imgX = 6 * tileWidth;
                    imgY = 2 * tileHeight
                    break;
                case 44: // red turtle
                    imgX = 7 * tileWidth;
                    imgY = 2 * tileHeight;
                    break;
                case 45: // brown soldier
                    imgX = 0 * tileWidth;
                    imgY = 3 * tileHeight;
                    break;
                case 46: // red archer
                    imgX = 1 * tileWidth;
                    imgY = 3 * tileHeight;
                    break;
                case 47: // red knight
                    imgX = 2 * tileWidth;
                    imgY = 3 * tileHeight
                    break;
                case 48: // red walker
                    imgX = 3 * tileWidth;
                    imgY = 3 * tileHeight;
                    break;
                case 49: // red wolf
                    imgX = 4 * tileWidth;
                    imgY = 3 * tileHeight;
                    break;
                case 50: // red eagle
                    imgX = 5 * tileWidth;
                    imgY = 3 * tileHeight;
                    break;
                case 51: // red bear
                    imgX = 6 * tileWidth;
                    imgY = 3 * tileHeight
                    break;
                case 52: // red turtle
                    imgX = 7 * tileWidth;
                    imgY = 3 * tileHeight;
                    break;
                default:
                    return;
            }
            var image = druid.images["images/unit_sprite_sheet.png"];
            ctx.save();
            if(enabled) {
                //  drawImage(image, source-x, source-y, source-w, source-h, dest-x, dest-y, dest-w, dest-h)
                ctx.drawImage( image, imgX, imgY, tileWidth, tileHeight, x, y, tileWidth, tileHeight );
            } else {
                // ctx.globalAlpha = 0.7;
                image = druid.images["images/unit_sprite_sheet_inactive.png"];
                
                ctx.drawImage( image, imgX, imgY, tileWidth, tileHeight, x, y, tileWidth, tileHeight );
            }
            ctx.restore();
        }
    }
    
    // type : tile indicator
    // x and y : pixel coordinates to draw at
    // scale : relative size to draw the tile
    // rot : rotation of drawing. unused as of 5/27/2013
    function drawTile(type, x, y, scale, rot) {
        ctx.save();
        switch(tileType[type]) {
            case "empty":
                return;
            case "light":
                imgX = 0 * tileWidth;
                break;
            case "dark":
                imgX = 1 * tileWidth;
                break;
            case "bridge_left":
                imgX = 2 * tileWidth;
                break;
            case "bridge_right":
                imgX = 3 * tileWidth;
                break;
            default:
                return;
        }
        var image = druid.images["images/summer_tile_sprite_sheet.png"];
                
        //  drawImage(image, source-x, source-y, source-w, source-h, dest-x, dest-y, dest-w, dest-h)
        ctx.drawImage( image, imgX, 0, tileWidth, tileHeight, x, y, tileWidth, tileHeight );

        ctx.restore();
    }
    
    function drawOwner(type, x, y) {
        // 11 : "blue",
        // 12 : "yellow",
        // 13 : "red",
        // 14 : "brown"
        ctx.save();
        switch(type) {
            case 0:
                return;
            case 17:
                imgX = 0 * tileWidth;
                break;
            case 18:
                imgX = 1 * tileWidth;
                break;
            case 19:
                imgX = 2 * tileWidth;
                break;
            case 20:
                imgX = 3 * tileWidth;
                break;
            default:
                return;
        }
        var image = druid.images["images/ownership_sprite_sheet.png"];
                
        //  drawImage(image, source-x, source-y, source-w, source-h, dest-x, dest-y, dest-w, dest-h)
        ctx.drawImage( image, imgX, 0, tileWidth, tileHeight, x, y, tileWidth, tileHeight );

        ctx.restore();
    }
    
    function redrawTiles(newTiles, callback) {
        if(!newTiles) {
            callback();
        }
        var x, y, offset, thisTile;

        tiles = newTiles;        
        ctx.clearRect(0,0,canvas.width, canvas.height);
        
        offset = 0;        
        y = gameboardOffset; //0;
        for(i = 0; i < tiles.length; i++) {
            tileRow = tiles[i];
            if(offset % 2 == 0) {
                // draw long row
                x = 0;
                for(j = 0; j < tileRow.length; j++) {
                    thisTile = tileRow[j];
                    drawTile(thisTile.type, x, y);
                    if(thisTile.owner > 0) {
                        drawOwner(thisTile.owner, x, y);
                    }
                    x += tileWidth;
                }
                y += tileSpaceHeight/2;
            } else {
                // indent short row, ignore the last tile (should always be 0 anyway)
                x = tileWidth/2;
                for(j = 0; j < tileRow.length; j++) {
                    thisTile = tileRow[j];
                    drawTile(thisTile.type, x, y);
                    if(thisTile.owner > 0) {
                        drawOwner(thisTile.owner, x, y);
                    }
                    x += tileWidth;
                }
                y += tileSpaceHeight/2;
            }
            offset++;
        }
        
        callback();
    }
    
    // draws everything that could be "on" a tile, including units and obstacles/relics.
    function redrawTileContents(newObstacles, newUnits, callback) {
        if(!newObstacles || !newUnits) {
            callback();
        }
        
        var x, y, offset, thisObstacle;

        obstacles = newObstacles;
        units = newUnits;    
        
        offset = 0;        
        y = 1; //-18;//tileSpaceHeight/2; //85 
        for(i = 0; i < obstacles.length; i++) {
            obsRow = obstacles[i];
            unitRow = units[i];
            if(offset % 2 == 0) {
                // draw long row
                x = 0;
                for(j = 0; j < obsRow.length; j++) {
                    thisUnit = unitRow[j];
                    drawObstacle(obsRow[j], x, y);
                    drawUnit(thisUnit.type, x, y, thisUnit.enabled);
                    x += tileWidth;
                }
                y += tileSpaceHeight/2;
            } else {
                // indent short row, ignore the last tile (should always be 0 anyway)
                x = tileWidth/2;
                for(j = 0; j < obsRow.length; j++) {
                    thisUnit = unitRow[j];
                    drawObstacle(obsRow[j], x, y);
                    drawUnit(thisUnit.type, x, y, thisUnit.enabled);
                    x += tileWidth;
                }
                y += tileSpaceHeight/2;
            }
            offset++;
        }
        callback();
    }
    
    function getTileType(type) {
        return tileType[type];
    }
    
    function drawSelectionCursor(x, y) {
        var image = druid.images["images/cursor_sprite_sheet.png"];
        
        // based on the long or short row, adjust raw y and x position for drawing
        if(y % 2 == 0) {
            // y is even
            drawY = Math.ceil(y / 2) * tileSpaceHeight;
            drawX = x * tileWidth;
        } else {
            // y is odd
            drawY = (tileSpaceHeight / 2) * y;
            drawX = (tileWidth / 2) + (tileWidth * x);
        }
        ctx.drawImage(image, imgX, 0, tileWidth, tileSpaceHeight, drawX, drawY, tileWidth, tileSpaceHeight);
    }
    
    // Generic cursor drawing function
    // TODO: convert main selection cursor to use this function
    function drawCursor(x, y, type) {
        var image = druid.images["images/cursor_sprite_sheet.png"],
            imgX = type * tileWidth;
        
        // based on the long or short row, adjust raw y and x position for drawing
        if(y % 2 == 0) {
            // y is even
            drawY = Math.ceil(y / 2) * tileSpaceHeight + gameboardOffset;
            drawX = x * tileWidth;
        } else {
            // y is odd
            drawY = (tileSpaceHeight / 2) * y + gameboardOffset;
            drawX = (tileWidth / 2) + (tileWidth * x);
        }

        ctx.drawImage(image, imgX, 0, tileWidth, tileSpaceHeight, drawX, drawY, tileWidth, tileSpaceHeight);
    }
    
    function renderCursor(time) {
        if(!cursor) {
            console.log('renderCursor has no cursor!');
            return;
        }
        var x = cursor.x,
            y = cursor.y;
        
        if(cursor.selected) {
            drawSelectionCursor(cursor.x, cursor.y);
        }
    }
    
    function clearCursor() {
        if(cursor) {
            var x = cursor.x,
                y = cursor.y;
            clearTile(x, y);
        }
    }
    
    function setCursor(x, y, selected) {
        clearCursor();
        if(arguments.length > 0) {
            cursor = {
                x : x,
                y : y,
                selected : selected
            };
        } else {
            cursor = null;
            console.log('cursor is null');
        }
    }
    
    function setAllCursors(spaces) {
        var thisSpace;
        
        for(i = 0; i < spaces.length; i++) {
            thisSpace = spaces[i];
            drawCursor(thisSpace.x, thisSpace.y, util.getCursorType(thisSpace.cursor));
        }
    }
    
    function clearTile(x, y) {
        // ctx.clearRect(x * tileWidth, y * tileSpaceHeight, tileWidth, tileSpaceHeight);
    }
    
    function addAnimation(runTime, fncs) {
        var anim = {
            runTime : runTime,
            startTime : Date.now(),
            pos : 0,
            fncs : fncs
        };
        animations.push(anim);
    }
    
    function renderAnimations(time, lastTime) {
        var anims = animations.slice(0), // copy list
            n = anims.length,
            animTime,
            anim,
            i;

        // call before() function
        for (i=0;i<n;i++) {
            anim = anims[i];
            if (anim.fncs.before) {
                anim.fncs.before(anim.pos);
            }
            anim.lastPos = anim.pos;
            animTime = (lastTime - anim.startTime);
            anim.pos = animTime / anim.runTime;
            anim.pos = Math.max(0, Math.min(1, anim.pos));
        }

        animations = []; // reset animation list

        for (i=0;i<n;i++) {
            anim = anims[i];
            anim.fncs.render(anim.pos, anim.pos - anim.lastPos);
            if (anim.pos == 1) {
                if (anim.fncs.done) {
                    anim.fncs.done();
                }
            } else {
                animations.push(anim);
            }
        }
    }
    
        
    function moveJewels(movedJewels, callback) {
        var n = movedJewels.length,
            oldCursor = cursor;
        cursor = null;
        movedJewels.forEach(function(e) {
            var x = e.fromX, y = e.fromY,
                dx = e.toX - e.fromX,
                dy = e.toY - e.fromY,
                dist = Math.abs(dx) + Math.abs(dy);
            addAnimation(200 * dist, {
                before : function(pos) {
                    pos = Math.sin(pos * Math.PI / 2);
                    clearJewel(x + dx * pos, y + dy * pos);
                },
                render : function(pos) {
                    pos = Math.sin(pos * Math.PI / 2);
                    drawJewel(
                        e.type,
                        x + dx * pos, y + dy * pos
                    );
                },
                done : function() {
                    if (--n == 0) {
                        cursor = oldCursor;
                        callback();
                    }
                }
            });
        });
    }
    
    function gameOver(callback) {
        callback();
    }
    
    function removeJewels(removedJewels, callback) {
        var n = removedJewels.length;
        removedJewels.forEach(function(e) {
            addAnimation(400, {
                before : function() {
                    clearJewel(e.x, e.y);
                },
                render : function(pos) {
                    ctx.save();
                    ctx.globalAlpha = 1 - pos;
                    drawJewel (
                        e.type, e.x, e.y,
                        1 - pos, pos * Math.PI * 2
                    );
                    ctx.restore();
                },
                done : function() {
                    if(--n == 0) {
                        callback();
                    }
                }
            });
        });
    }
    
    
    return {
        initialize : initialize,
        redrawTiles : redrawTiles,
        redrawTileContents: redrawTileContents,
        setCursor : setCursor,
        setAllCursors: setAllCursors,
        moveJewels : moveJewels,
        removeJewels : removeJewels
    };
})();













