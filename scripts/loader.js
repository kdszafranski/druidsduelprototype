var druid = {
    screens: {},
    images: {},
    settings: {
        longCols: 7,
        shortCols: 6,
        rows: 13,
        tileWidth: 144,
        tileHeight: 98,
        tileSpaceHeight: 64,
        numTileTypes: 4,
        gameboardOffset: 50,
        // map can override mana values
        tileManaValue: 2,
        relicValue: 10,
        minimumManaValue: 5,
        // moves
        soldierMove: 1,
        archerMove: 1,
        knightMove: 2,
        walkerMove: 3,
        wolfMove: 4,
        eagleMove: 6,
        bearMove: 3,
        turtleMove: 0,
        // shot ranges        
        archerShoot: 2,
        walkerShoot: 3,
        // costs
        soldierCost: 5,
        archerCost: 10,
        knightCost: 15,
        walkerCost: 20,
        wolfCost: 10,
        eagleCost: 10,
        bearCost: 10,
        turtleCost: 10,
        bridgeCost: 5,
        landCost: 3,
        obstacleCost: 3,
        landStealCost: 5,
        // game vars
        numPlayers: 0,
        attackEndsTurn: true,
        captureRelicEndsTurn: true,
        defeatedPlayerManaBonusPercent: .10,
        gameVersionNumber: "1.3.0p",
        controls : {
            CLICK : "selectUnit",
            TOUCH : "selectUnit"
        }
    }
};

// wait until main document is loaded
window.addEventListener("load", function () {
    
    // determine tile size
    // var tileProto = document.getElementById("tile-proto"),
    //     rect = tileProto.getBoundingClientRect();
        
    Modernizr.addTest("standalone", function() {
         return (window.navigator.standalone != false);
     });
     
       
     // extend yepnope with preloading
     yepnope.addPrefix("preload", function(resource) {
         resource.noexec = true;
         return resource;
     });
     
     var numPreload = 0;
     var numLoaded = 0;
      
     yepnope.addPrefix("loader", function(resource) {
          // console.log("Loading: " + resource.url);
          var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
          resource.noexec = isImage;
          
          numPreload++;
          resource.autoCallback = function(e) {
              //console.log("Finished loading: " + resource.url);
              numLoaded++;
              if(isImage) {
                  var image = new Image();
                  image.src = resource.url;
                  druid.images[resource.url] = image;
              }
          };
          return resource;
      });
      
      function getLoadProgress() {
          if(numPreload > 0) {
              return numLoaded / numPreload;
          } else {
              return 0;
          }
      }
    
    // loading stage 1
    Modernizr.load ([
        {
            load: [
                "scripts/storage.js",
                "scripts/jquery-1.9.1.min.js",
                "scripts/requestAnimationFrame.js",
                "scripts/game.js",
                "loader!images/bg_main_menu.png",
            ]
        },{
            test: Modernizr.standalone,
            yep: "scripts/screen.splash.js",
            nope: "scripts/screen.install.js",
            complete: function() {
                druid.game.setup();
                if(Modernizr.standalone) {
                    druid.game.showScreen("splash-screen",
                        getLoadProgress);
                } else {
                    druid.game.showScreen("install-screen");
                }
            }            
        }
    ]);
    
    // Modernizr.canvas = false;
    
    // loading stage 2
    if(Modernizr.standalone) {
        Modernizr.load([
        {
            load : [
                "loader!scripts/game.util.js",
                "loader!scripts/display.canvas.js",
                "loader!scripts/board.js",
                "loader!scripts/audio.js",
                "loader!scripts/input.js",
                "loader!scripts/game.players.js",
                "loader!scripts/screen.main-menu.js",
                "loader!scripts/screen.game-over.js",
                "loader!scripts/screen.game.js",
                "loader!images/summer_tile_sprite_sheet.png",
                "loader!images/obstacle_sprite_sheet.png",
                "loader!images/cursor_sprite_sheet.png",
                "loader!images/ownership_sprite_sheet.png",
                "loader!images/unit_sprite_sheet.png",
                "loader!images/unit_sprite_sheet_inactive.png",
                "loader!images/bg-game-board.png",
                "loader!images/turn-button-sprite.png",
                "loader!images/add-bridge-sprite.png",
                "loader!images/add-soldier-sprite.png",
                "loader!images/add-archer-sprite.png",
                "loader!images/add-knight-sprite.png",
                "loader!images/add-walker-sprite.png",
                "loader!images/add-wolf-sprite.png",
                "loader!images/add-eagle-sprite.png",
                "loader!images/add-bear-sprite.png",
                "loader!images/add-turtle-sprite.png",
                "loader!images/add-land-sprite.png",
                "loader!images/add-obstacle-sprite.png",
                "loader!images/land-steal-sprite.png",
                "loader!images/mana-jar-sprite.png",
                "loader!images/mm_button_sprite.png",
                "loader!images/tsg-logo.png",
                "loader!sounds/summer_theme.mp3"
            ]
        }
        ]);
    }


}, false);