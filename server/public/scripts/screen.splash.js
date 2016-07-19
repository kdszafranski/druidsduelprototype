druid.screens["splash-screen"] = (function() {
    var game = druid.game,
        settings = druid.settings,
        firstRun = true;
        
    function setup(getLoadProgress) {
        var scr = $("#splash-screen")[0];

        function checkProgress() {
            var p = getLoadProgress() * 100;
            $(".indicator").css("width", p + "%");
            if(p == 100) {
                $(".continue").css("display", "block");
                $("#splash-screen").bind("click", function() {
                    druid.game.showScreen("main-menu");
                });
            } else {
                setTimeout(checkProgress, 30);
            }
        }
        
        checkProgress();
        
    }
    
    function run(getLoadProgress) {
        if(firstRun) {
            setup(getLoadProgress);
            firstRun = false;
        }
        $("#version .version-number span").html(settings.gameVersionNumber);
    }
    
    return {
        run: run
    };
})();