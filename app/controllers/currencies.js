function saveCurrencieChoice() {
	alert('d')
}

function addPicker() {
	if($.column1 && $.column2)
	a = new joli.query().select().from('currencies');
	cur = a.execute();
	// Create a Picker.
	var column1 = Ti.UI.createPickerColumn();
	var column2 = Ti.UI.createPickerColumn();
	for (i in cur) {
		var row = Ti.UI.createPickerRow({
			title : cur[i].code
		});
		column1.addRow(row);
		column2.addRow(row);
	}
	$.picker.add([column1, column2])
}

function main() {

	currencies = new joli.model({
		table : "currencies",
		columns : {
			id : "INTEGER PRIMARY KEY AUTOINCREMENT",
			code : "STRING UNIQUE",
			money : "STRING UNIQUE"
		}
	});
	joli.models.initialize();

	if (currencies.count()) {
		addPicker();
	} else {
		if (!Titanium.Network.online) {
			alert('No connection whatsoever to internet dude!');
			return;
		}
		var message = "Please wait while loading: {0}%"
		var loading = Titanium.UI.createAlertDialog({
			title : "Loading",
			message : message.format("0")
		});

		loading.show();
		var xhr = Ti.Network.createHTTPClient({
			onload : function(e) {

				json = JSON.parse(this.responseText);
				var currency = new joli.record(currencies);
				j = 0;
				total = Object.keys(json).length;
				for (i in json) {
					j++;
					currency.fromArray({
						code : i,
						money : json[i]
					});
					percentage = Math.round(((j / total) * 100));
					loading.setMessage(message.format(percentage));

					currency.save();
				}
				loading.hide();
			},
			onerror : function(e) {
				alert("Error:" + JSON.stringify(e));
			},
			timeout : 5000
		});
		xhr.open("GET", Alloy.CFG.exchange.URLCurrencies + "?app_id=" + Alloy.CFG.exchange.key);
		xhr.send();
	}

}