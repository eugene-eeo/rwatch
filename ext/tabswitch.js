!function() {
    var hidden = 'hidden';
    var visibilitychange = 'visbilitychange';
    var attrs = [
        {h: 'hidden',       v: 'visibilitychange'},
        {h: 'msHidden',     v: 'msvisibilitychange'},
        {h: 'webkitHidden', v: 'webkitvisibilitychange'},
    ];

    for (var i = 0; i < attrs.length; i++) {
        hidden           = attrs[i].h;
        visibilitychange = attrs[i].v;
        if (typeof document[hidden] !== "undefined") {
            break;
        }
    }

    window.tabswitch = function(config) {
        document.addEventListener(visibilitychange, function() {
            if (document[hidden]) {
                config.gone();
            } else {
                config.back();
            }
        }, false);
    };
}();
