var joli;

var Currencies = function() {
    function showAddLabel() {
        var label = Ti.UI.createLabel({
            text: "⊕",
            font: {
                fontSize: 250
            },
            shadowColor: "#ff0000",
            shadowOffset: {
                x: 50,
                y: 50
            },
            color: "white",
            opacity: .8,
            width: Ti.UI.SIZE,
            height: Ti.UI.SIZE,
            textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
        });
        labels.push(label);
        Titanium.UI.currentWindow.add(label);
    }
    function showSavedCurrencyPair() {}
    function registerEvents() {
        $.scrollableView.addEventListener("scrollend", updateCurrentView, false);
        for (i in labels) {
            var label = labels[i];
            (function(label) {
                label.addEventListener("click", addNewCurrencyPair, false);
            })(label);
        }
        $.AddCurrencyPair.addEventListener("swipe", closeCurrencyPairOption, false);
    }
    function hasSave() {
        return models.currency_pairs.findOneBy("view_index", currentView);
    }
    function updateCurrentView(e) {
        currentView = e.currentPage;
    }
    function closeCurrencyPairOption(e) {
        ("left" == e.direction || "right" == e.direction) && $.AddCurrencyPair.close();
    }
    function addNewCurrencyPair() {
        a = new joli.query().select().from("currencies");
        cur = a.execute();
        var row = [];
        for (i in cur) row[i] = Ti.UI.createPickerRow({
            title: cur[i].code + " - " + cur[i].money
        });
        $.picker.add(row);
        $.picker2.add(row);
        var change = {};
        $.picker.addEventListener("change", function(e) {
            change["from"] = e.selectedValue[0];
            change["to"] && saveChangePicker(change);
        }, false);
        $.picker2.addEventListener("change", function(e) {
            change["to"] = e.selectedValue[0];
            change["from"] && saveChangePicker(change);
        }, false);
        $.AddCurrencyPair.open();
    }
    joli = require("/joli/joli").connect("joso");
    var models = function() {
        var m = {};
        m.currency_pairs = new joli.model({
            table: "currency_pair",
            columns: {
                id: "INTEGER PRIMARY KEY AUTOINCREMENT",
                from_currency: "STRING",
                to_currency: "STRING",
                view_index: "INTEGER"
            }
        });
        m.currencies = new joli.model({
            table: "currencies",
            columns: {
                id: "INTEGER PRIMARY KEY AUTOINCREMENT",
                code: "STRING UNIQUE",
                money: "STRING UNIQUE"
            }
        });
        return m;
    }();
    joli.models.initialize();
    var $, currentView = 1, labels = [];
    var init = function(controller) {
        $ = $ || controller;
        loadCurrencies();
        hasSave ? showAddLabel() : showSavedCurrencyPair();
        registerEvents();
    };
    var saveChangePicker = function(change) {
        var toUpdate = models.currency_pairs.count({
            where: {
                "view_index = ?": currentView
            }
        });
        if (toUpdate) {
            q = new joli.query().update("currency_pair").set({
                from_currency: change["from"],
                to_currency: change["to"]
            }).where("view_index = ? ", currentView);
            q.execute() && q.save();
        } else {
            var currencypair = new joli.record(models.currencypairs);
            currencypair.fromArray({
                from_currency: change["from"],
                to_currency: change["to"],
                view_index: currentView
            });
            currencypair.save();
        }
    };
    var loadCurrencies = function() {
        if (models.currencies.count()) return;
        if (!Titanium.Network.online) {
            alert("No connection whatsoever to internet dude!");
            return;
        }
        var message = "Please wait while loading: {0}%";
        var loading = Titanium.UI.createAlertDialog({
            title: "Loading",
            message: message.format("0"),
            persistent: true
        });
        loading.show();
        var xhr = Ti.Network.createHTTPClient({
            onload: function() {
                json = JSON.parse(this.responseText);
                j = 0;
                total = Object.keys(json).length;
                for (i in json) {
                    j++;
                    var currency = models.currencies.newRecord({
                        code: i,
                        money: json[i]
                    });
                    percentage = Math.round(100 * (j / total));
                    loading.setMessage(message.format(percentage));
                    currency.save();
                }
                loading.hide();
            },
            onerror: function(e) {
                alert("Error:" + JSON.stringify(e));
            },
            timeout: 5e3
        });
        xhr.open("GET", Alloy.CFG.exchange.URLCurrencies + "?app_id=" + Alloy.CFG.exchange.key);
        xhr.send();
    };
    return {
        init: init,
        loadCurrencies: loadCurrencies
    };
}();

exports.init = function(controller) {
    Currencies.init(controller);
};