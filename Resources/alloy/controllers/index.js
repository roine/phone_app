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
    var __alloyId4 = [];
    $.__views.view1 = Ti.UI.createView({
        id: "view1",
        backgroundImage: "debut_dark.png"
    });
    __alloyId4.push($.__views.view1);
    $.__views.from = Ti.UI.createTextField({
        id: "from",
        keyboardType: Titanium.UI.KEYBOARD_NUMBER_PAD,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        color: "#336699",
        top: "5%",
        left: "5%",
        width: "90%",
        height: "10%"
    });
    $.__views.view1.add($.__views.from);
    $.__views.picker = Ti.UI.createPicker({
        id: "picker",
        top: "20%",
        selectionIndicator: "true",
        useSpinner: "true",
        height: "80%"
    });
    $.__views.view1.add($.__views.picker);
    $.__views.to = Ti.UI.createTextField({
        id: "to",
        keyboardType: Titanium.UI.KEYBOARD_NUMBER_PAD,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        color: "#336699",
        top: "85%",
        left: "5%",
        width: "90%",
        height: "10%"
    });
    $.__views.view1.add($.__views.to);
    $.__views.view2 = Ti.UI.createView({
        id: "view2",
        backgroundColor: "#246"
    });
    __alloyId4.push($.__views.view2);
    $.__views.view3 = Ti.UI.createView({
        id: "view3",
        backgroundColor: "#48b"
    });
    __alloyId4.push($.__views.view3);
    $.__views.scrollableView = Ti.UI.createScrollableView({
        views: __alloyId4,
        id: "scrollableView",
        showPagingControl: "true"
    });
    $.__views.currencies_opt.add($.__views.scrollableView);
    $.__views.currencies = Ti.UI.createTab({
        window: $.__views.currencies_opt,
        title: "Currencies",
        id: "currencies"
    });
    $.__views.index.addTab($.__views.currencies);
    $.__views.index && $.addTopLevelView($.__views.index);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.currencies.addEventListener("click", function() {
        require("currencies").init($);
    });
    $.index.open();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;