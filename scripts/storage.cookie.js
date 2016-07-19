druid.storage = (function() {
    var cookieKey = "DruidData";
    
    function load() {
        var re = new RegExp("(?:^|;)\\s?" + escape(cookieKey)
            + "=(x*?)(?:;|$)", "i"),
        match = document.cookie.match(re),
        data = match ? unescape(match[1] : "{}";
        return JSON.parse(data);
    }
    
    function set(key, data) {
        console.log('cookie here');
        var db = load();
        db[key] = data;
        document.cookie = cookieKey + "="
            + escape(JSON.stringify(db)) + "; path=/";
    }
    
    function get(key) {
        var db = load(),
            value = db[key];
        return (value !== undefined ? value : null);
    }
    
    return {
        set : set,
        get : get
    };
    
})();
