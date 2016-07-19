druid.input = (function() {
    var keys = {
        37 : "KEY_LEFT",
        38 : "KEY_UP",
        39 : "KEY_RIGHT",
        40 : "KEY_DOWN",
        13 : "KEY_ENTER",
        32 : "KEY_SPACE",
        65 : "KEY_A",
        66 : "KEY_B",
        67 : "KEY_C",
        // alpha keys 68 - 87
        88 : "KEY_X",
        89 : "KEY_Y",
        90 : "KEY_Z"
    };
    var settings = druid.settings,
        inputHandlers;
        
    function initialize() {
        inputHandlers = [];
        var board = $("#game-screen .game-board");
        
        board.bind("mousedown", function(event) {
            handleClick(event, "CLICK", event);
        });
        
        board.bind("touchstart", function(event) {
            handleClick(event, "TOUCH", event.targetTouches[0]);
        });
        
        $(document).bind("keydown", function(event) {
            var keyName = keys[event.keyCode];
            if (keyName && settings.controls[keyName]) {
                event.preventDefault();
                trigger(settings.controls[keyName]);
            }
        });
    }
    
    function handleClick(event, control, click) {
        // is any action bound to this input control?
        var action = settings.controls[control];
        if(!action) {
            return;
        }
        
        var board = $("#game-screen .game-board")[0];
        var bRect = board.getBoundingClientRect();
        var bounds = {
            top: bRect.top + settings.gameboardOffset, // adjust for visual padding
            left: bRect.left
        };
        
        var rect = bounds, relX, relY, location;
        
        // click position relative to board
        relX = click.clientX - rect.left;
        relY = click.clientY - rect.top;
        
        // translates real coords to "board spots." Returns game location coorindates as x, y structure.
        location = getBoardLocation(relX, relY);
        
        // This is always directed to screen.game.selectUnit()
        trigger(action, location.x, location.y);
        
        // prevent default click behavior
        event.preventDefault();
    }
    
    function getBoardLocation(clickX, clickY) {
        var location, tileX, tileY, regionX, regionY, mouseMapX, mouseMapY,
            checkPoint, leftPoint, topPoint, rightPoint, bottomPoint, color,
            regionDX, regionDY;
        
        // First Step: Find out what region of the map the mouse is in.
        regionX = Math.floor(clickX / settings.tileWidth);
        regionY = Math.floor(clickY / settings.tileSpaceHeight * 2);

        // Second Step: Find out WHERE in the mousemap our mouse is, by finding MouseMapX and MouseMapY.
        mouseMapX = clickX % settings.tileWidth;
        mouseMapY = clickY % settings.tileSpaceHeight;
        
        // Third Step: Determine the color in the MouseMap at (MouseMapX,MouseMapY).
        checkPoint = {
            x: mouseMapX,
            y: mouseMapY
        };
        
        leftPoint = {
            x: 0,
            y: settings.tileSpaceHeight / 2
        };
        
        topPoint = {
            x: settings.tileWidth / 2,
            y: 0
        };
        
        rightPoint = {
            x: settings.tileWidth,
            y: settings.tileSpaceHeight / 2
        };
        
        bottomPoint = {
            x: settings.tileWidth / 2,
            y: settings.tileSpaceHeight
        }; 
        
        
        if(isPointLeft(leftPoint, topPoint, checkPoint)) {
            color = "red";
        } else if(isPointRight(rightPoint, topPoint, checkPoint)) {
            color = "yellow";
        } else if(isPointLeft(bottomPoint, leftPoint, checkPoint)) {
            color = "green";
        } else if(isPointRight(bottomPoint, rightPoint, checkPoint)) {
            color = "blue";
        } else if( isPointRight(leftPoint, topPoint, checkPoint) &&
            isPointLeft(rightPoint, topPoint, checkPoint) &&
            isPointRight(bottomPoint, leftPoint, checkPoint) &&
            isPointLeft(bottomPoint, rightPoint, checkPoint) ) {
                color = "white";
        } else {
            color = "none";
        }
        
        switch(color) {
            case "red":
                regionDX = -1;
                regionDY = -1;
                break;
            case "yellow":
                regionDX = 0;
                regionDY = -1;
                break;
            case "white":
                regionDX = 0;
                // this might be wrong, but it does correct for top and bottoms of the rows that I'm seeing
                if(mouseMapY >= tileSpaceHeight / 2) {
                    regionDY = -1;
                } else {
                    regionDY = 0;
                }
                break;
            case "green":
                regionDX = -1;
                regionDY = 0;
                break;
            case "blue":
                regionDX = 0;
                regionDY = 0;
                break;
        }
        
        location = {
            x: regionX + regionDX,
            y: regionY + regionDY
        };
        
        return location;
        
    }
    
    function isPointLeft(a, b, c) {
        return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)) < 0;
    }
    
    function isPointRight(a, b, c) {
        return ((b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x)) > 0;
    }
    
    function bind(action, handler) {
        // bind a handler to a game action
        if(!inputHandlers[action]) {
            inputHandlers[action] = [];
        }
        inputHandlers[action].push(handler);
    }
    
    function trigger(action) {
        //trigger a game action
        var handlers = inputHandlers[action],
            args = Array.prototype.slice.call(arguments, 1);
            
        if(handlers) {
            for(var i = 0; i < handlers.length; i++) {
                handlers[i].apply(null, args);
            }
        }
    }
    
    return {
        initialize : initialize,
        bind : bind
    };
})();