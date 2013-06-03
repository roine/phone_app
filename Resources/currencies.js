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
            title: cur[i].code + " - " + cur[i].money,
            custom: cur[i].id
        });
        var selected = getCurrencyId();
        $.picker.add(row);
        $.picker.setSelectedRow(0, selected[0], false);
        $.picker2.add(row);
        $.picker2.setSelectedRow(0, selected[1], false);
        var change = {};
        $.picker.addEventListener("change", function(e) {
            change["from"] = {
                value: e.selectedValue[0],
                row: e.rowIndex
            };
            change["to"] && saveChangePicker(change);
        }, false);
        $.picker2.addEventListener("change", function(e) {
            change["to"] = {
                value: e.selectedValue[0],
                row: e.rowIndex
            };
            change["from"] && saveChangePicker(change);
        }, false);
        $.AddCurrencyPair.open();
    }
    joli = require("/joli/joli").connect("joso");
    var models = function() {
        var m = {};
        m.currency_pairs = new joli.model({
            table: "currency_pairs",
            columns: {
                id: "INTEGER PRIMARY KEY AUTOINCREMENT",
                from_currency: "STRING",
                from_currency_id: "INTEGER",
                to_currency: "STRING",
                to_currency_id: "INTEGER",
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
    var $, currentView = 1, labels = [];
    var init = function(controller) {
        joli.models.initialize();
        $ = $ || controller;
        loadCurrencies();
        hasSave ? showAddLabel() : showSavedCurrencyPair();
        registerEvents();
    };
    getCurrencyId = function() {
        if (!hasSave() || !currentView) return;
        var q = new joli.query().select().from("currency_pairs").where("view_index = ?", currentView).execute();
        if (q.length > 1) {
            alert("Problem with duplicate data for one view");
            return;
        }
        return [ q[0].from_currency_id, q[0].to_currency_id ];
    };
    var saveChangePicker = function(change) {
        var toUpdate = models.currency_pairs.count({
            where: {
                "view_index = ?": currentView
            }
        });
        if (toUpdate) {
            q = new joli.query().update("currency_pairs").set({
                from_currency: change.from.value,
                from_currency_id: change.from.row,
                to_currency: change.to.value,
                to_currency_id: change.to.row
            }).where("view_index = ? ", currentView);
            q.execute() && q.save();
        } else {
            var currencypair = new joli.record(models.currency_pairs);
            currencypair.fromArray({
                from_currency: change.from.value,
                from_currency_id: change.from.row,
                to_currency: change.to.value,
                to_currency_id: change.to.row,
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
        init: init
    };
}();

exports.init = function(controller) {
    Currencies.init(controller);
};