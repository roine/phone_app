function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    var $ = this;
    var exports = {};
    $.__views.index = Ti.UI.createTabGroup({
        height: Titanium.UI.FILL,
        fullscreen: "true",
        navBarHidden: "true",
        id: "index"
    });
    $.__views.__alloyId6 = Ti.UI.createWindow({
        backgroundColor: "#fff",
        title: "Weather",
        id: "__alloyId6"
    });
    $.__views.__alloyId7 = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#000",
        font: {
            fontSize: 20,
            fontFamily: "Helvetica Neue"
        },
        textAlign: "center",
        text: "I am Window 1",
        id: "__alloyId7"
    });
    $.__views.__alloyId6.add($.__views.__alloyId7);
    $.__views.weather = Ti.UI.createTab({
        window: $.__views.__alloyId6,
        title: "Weather",
        id: "weather"
    });
    $.__views.index.addTab($.__views.weather);
    $.__views.currencies = Ti.UI.createWindow({
        backgroundColor: "#fff",
        title: "Currencies",
        id: "currencies",
        borderColor: "red"
    });
    var __alloyId8 = [];
    $.__views.view = Ti.UI.createView({
        backgroundGradient: {
            colors: [ "#3498db", "#2980b9" ]
        },
        id: "view"
    });
    __alloyId8.push($.__views.view);
    $.__views.scrollableView = Ti.UI.createScrollableView({
        views: __alloyId8,
        id: "scrollableView",
        showPagingControl: "true"
    });
    $.__views.currencies.add($.__views.scrollableView);
    $.__views.currencies_tab = Ti.UI.createTab({
        window: $.__views.currencies,
        title: "Currencies",
        id: "currencies_tab"
    });
    $.__views.index.addTab($.__views.currencies_tab);
    $.__views.index && $.addTopLevelView($.__views.index);
    $.__views.currency_option = Ti.UI.createWindow({
        backgroundColor: "white",
        id: "currency_option",
        layout: "vertical",
        left: "100%",
        width: "100%"
    });
    $.__views.currency_option && $.addTopLevelView($.__views.currency_option);
    $.__views.AddCurrencyPair = Ti.UI.createWindow({
        backgroundColor: "white",
        layout: "vertical",
        left: 0,
        width: "100%",
        id: "AddCurrencyPair"
    });
    $.__views.AddCurrencyPair && $.addTopLevelView($.__views.AddCurrencyPair);
    $.__views.picker = Ti.UI.createPicker({
        id: "picker",
        top: "50",
        selectionIndicator: "true"
    });
    $.__views.AddCurrencyPair.add($.__views.picker);
    $.__views.picker2 = Ti.UI.createPicker({
        id: "picker2",
        top: "100",
        selectionIndicator: "true"
    });
    $.__views.AddCurrencyPair.add($.__views.picker2);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.currencies_tab.addEventListener("click", function() {
        require("currencies").init($);
    });
    String.prototype.format = String.prototype.f = function() {
        var s = this, i = arguments.length;
        while (i--) s = s.replace(new RegExp("\\{" + i + "\\}", "gm"), arguments[i]);
        return s;
    };
    $.index.open();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;