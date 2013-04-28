function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    var __parentSymbol = arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    var $ = this;
    var exports = {};
    __parentSymbol.activity.onCreateOptionsMenu = function(e) {
        var __alloyId7 = {
            id: "curr_option",
            title: "Options"
        };
        $.__views.curr_option = e.menu.add(_.pick(__alloyId7, Alloy.Android.menuItemCreateArgs));
        $.__views.curr_option.applyProperties(_.omit(__alloyId7, Alloy.Android.menuItemCreateArgs));
    };
    $.__views.option_menu && $.addTopLevelView($.__views.option_menu);
    exports.destroy = function() {};
    _.extend($, $.__views);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;