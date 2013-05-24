function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    var __parentSymbol = arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    var $ = this;
    var exports = {};
    __parentSymbol.activity.onCreateOptionsMenu = function(e) {
        var __alloyId10 = {
            id: "opt_currencies",
            title: "Options"
        };
        $.__views.opt_currencies = e.menu.add(_.pick(__alloyId10, Alloy.Android.menuItemCreateArgs));
        $.__views.opt_currencies.applyProperties(_.omit(__alloyId10, Alloy.Android.menuItemCreateArgs));
    };
    $.__views.option_menu && $.addTopLevelView($.__views.option_menu);
    exports.destroy = function() {};
    _.extend($, $.__views);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;