druid.game = (function() {
    var settings = druid.settings;
        
    // hide the active screen (if any) and show the screen with the specified id
    function showScreen(screenId) {
        if( $("#game .screen.active") ) {
            $("#game .screen.active").removeClass("active")
        }
        
        // extract screen parameters from arguments
        var args = Array.prototype.slice.call(arguments, 1);
        
        if(screenId == "game-screen") {
            var map = arguments[1];
            console.log(map);
        }
        
        // run the screen module
        druid.screens[screenId].run.apply(
            druid.screens[screenId], args
        );
        
        // display the screen html
        $("#" + screenId).addClass("active");
    }
    
    function setup() {
        // disable native touchmove behavior to prevent overscroll
        $(document).bind("touchmove", function(event) {
            event.preventDefault();
        });
        
        // hide the address bar on Android
        if(/Android/.test(navigator.userAgent)) {
            $('html')[0].style.height = "200%";
            setTimeout(function() {
                window.scrollTo(0,1);
            }, 0);
        }
        
    }
    
    // expose public methods
    return {
        showScreen : showScreen,
        setup: setup
    };
})();