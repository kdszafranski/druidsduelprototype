druid.audio = (function() {
    var extension,
        sounds,
        activeSounds;
    
    function initialize() {
        extension = formatTest();
        if(!extension) {
            return;
        }
        
        sounds = {};
        activeSounds = [];
    }
    
    function play(name) {
        var audio = getAudioElement(name);
        audio.play();
        activeSounds.push(audio);
    }
    
    function stop() {
        for(var i=activeSounds.length - 1; i >= 0; i--) {
            activeSounds[i].stop();
        }
        activeSounds = [];
    }
    
    function formatTest() {
        var exts = ["mp3"],
            i;
            
        for(i = 0; i < exts.length; i++) {
            if(Modernizr.audio[exts[i]] == "probably") {
                return exts[i];
            }
        }
        
        for(i = 0; i < exts.length; i++) {
            if(Modernizr.audio[exts[i]] == "maybe") {
                return exts[i];
            }
        }
    }
    
    function createAudio(name) {
        var el = new Audio("sounds/" + name + "." + extension);
        $(el).bind("ended", cleanActive);
        
        sounds[name] = sounds[name] || [];
        sounds[name].push(el);
        
        return el;
    }
    
    function cleanActive() {
        for(var i = 0; i < activeSounds.length; i++) {
            if(activeSounds[i].ended) {
                activeSounds.splice(i, 1);
            }
        }
    }
    
    function getAudioElement(name) {
        if(sounds[name]) {
            for(var i = 0, n = sounds[name].length; i < n; i++) {
                if(sounds[name][i].ended) {
                    return sounds[name][i];
                }
            }
        }
        return createAudio(name);
    }
    
    return {
        initialize: initialize,
        play : play,
        stop : stop
    };
    
})();