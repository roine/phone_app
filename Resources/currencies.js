var Currencies = function() {
    function events() {}
    var joli = require("/joli/joli").connect("joso");
    var $;
    var init = function(controller) {
        String.prototype.format = String.prototype.f = function() {
            var s = this, i = arguments.length;
            while (i--) s = s.replace(new RegExp("\\{" + i + "\\}", "gm"), arguments[i]);
            return s;
        };
        $ = $ || controller;
        loadCurrencies();
        events();
    };
    var loadCurrencies = function() {
        "sdsdf{0}".format("jojo");
        currencies = new joli.model({
            table: "currencies",
            columns: {
                id: "INTEGER PRIMARY KEY AUTOINCREMENT",
                code: "STRING UNIQUE",
                money: "STRING UNIQUE"
            }
        });
        joli.models.initialize();
        if (currencies.count()) addPicker(); else {
            if (!Titanium.Network.online) {
                alert("No connection whatsoever to internet dude!");
                return;
            }
            var message = "Please wait while loading: {0}%";
            var loading = Titanium.UI.createAlertDialog({
                title: "Loading",
                message: message.format("0")
            });
            loading.show();
            var xhr = Ti.Network.createHTTPClient({
                onload: function() {
                    json = JSON.parse(this.responseText);
                    var currency = new joli.record(currencies);
                    j = 0;
                    total = Object.keys(json).length;
                    for (i in json) {
                        j++;
                        currency.fromArray({
                            code: i,
                            money: json[i]
                        });
                        percentage = Math.round(100 * (j / total));
                        loading.setMessage(message.format(percentage));
                        currency.save();
                    }
                    addPicker();
                    loading.hide();
                },
                onerror: function(e) {
                    alert("Error:" + JSON.stringify(e));
                },
                timeout: 5e3
            });
            xhr.open("GET", Alloy.CFG.exchange.URLCurrencies + "?app_id=" + Alloy.CFG.exchange.key);
            xhr.send();
        }
    };
    var styleColumn = function(column) {
        column.setWidth("90%");
    };
    var addPicker = function() {
        if (null !== $.picker.getSelectedRow(0)) return;
        a = new joli.query().select().from("currencies");
        cur = a.execute();
        var column1 = Ti.UI.createPickerColumn();
        var column2 = Ti.UI.createPickerColumn();
        styleColumn(column1);
        styleColumn(column2);
        for (i in cur) {
            var row = Ti.UI.createPickerRow({
                title: cur[i].code + " - " + cur[i].money
            });
            column1.addRow(row);
            column2.addRow(row);
        }
        $.picker.add([ column1, column2 ]);
    };
    return {
        init: init,
        loadCurrencies: loadCurrencies
    };
}();

exports.init = function(controller) {
    Currencies.init(controller);
};