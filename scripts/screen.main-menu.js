druid.screens["main-menu"] = (function() {
    var game = druid.game,
        firstRun = true;
        
    function setup() {
        $("#main-menu ul.menu").bind("click", function(e) {
            if(e.target.nodeName.toLowerCase() === "button") {
                var action = e.target.getAttribute("name");
                var map = e.target.getAttribute("value");
                game.showScreen(action, map);
            }
        });
    }
    
    function run() {
        if(firstRun) {
            setup();
            firstRun = false;
        }
    }
    
    return {
        run: run
    };
})();