function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    var $ = this;
    var exports = {};
    $.__views.index = Ti.UI.createTabGroup({
        height: Titanium.UI.FILL,
        id: "index"
    });
    $.__views.__alloyId1 = Ti.UI.createWindow({
        backgroundColor: "#fff",
        title: "Weather",
        id: "__alloyId1"
    });
    $.__views.__alloyId2 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#000",
        font: {
            fontSize: 20,
            fontFamily: "Helvetica Neue"
        },
        textAlign: "center",
        text: "I am Window 1",
        id: "__alloyId2"
    });
    $.__views.__alloyId1.add($.__views.__alloyId2);
    $.__views.weather = Ti.UI.createTab({
        window: $.__views.__alloyId1,
        title: "Weather",
        id: "weather"
    });
    $.__views.index.addTab($.__views.weather);
    $.__views.currencies = Ti.UI.createWindow({
        backgroundColor: "#fff",
        title: "Currencies",
        id: "currencies"
    });
    $.__views.currencies_tab = Ti.UI.createTab({
        window: $.__views.currencies,
        title: "Currencies",
        id: "currencies_tab"
    });
    $.__views.index.addTab($.__views.currencies_tab);
    $.__views.index && $.addTopLevelView($.__views.index);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.currencies_tab.addEventListener("click", function() {
        require("currencies").init($);
    });
    $.index.open();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;