function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    var $ = this;
    var exports = {};
    $.__views.index = Ti.UI.createTabGroup({
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
        icon: "KS_nav_ui.png",
        id: "weather"
    });
    $.__views.index.addTab($.__views.weather);
    $.__views.currencies_opt = Ti.UI.createWindow({
        backgroundColor: "#fff",
        title: "Currencies",
        id: "currencies_opt"
    });
    $.__views.__alloyId3 = Alloy.createController("option_menu", {
        id: "__alloyId3",
        __parentSymbol: $.__views.currencies_opt
    });
    $.__views.__alloyId3.setParent($.__views.currencies_opt);
    $.__views.picker = Ti.UI.createPicker({
        id: "picker",
        top: "50",
        selectionIndicator: "true",
        useSpinner: "true"
    });
    $.__views.currencies_opt.add($.__views.picker);
    $.__views.currencies = Ti.UI.createTab({
        window: $.__views.currencies_opt,
        title: "Currencies",
        icon: "KS_nav_views.png",
        id: "currencies"
    });
    $.__views.index.addTab($.__views.currencies);
    $.__views.index && $.addTopLevelView($.__views.index);
    exports.destroy = function() {};
    _.extend($, $.__views);
    require("/joli/joli").connect("joso");
    require("my_lib");
    require("currencies");
    require("weather");
    $.currencies.addEventListener("click", function() {
        main();
    });
    $.weather.addEventListener("click", function() {});
    $.index.open();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;