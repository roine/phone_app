var Currencies = (function() {
	// 	load joli ORM
	var joli = require('/joli/joli').connect('joso');

	// set  the $ which refere to the base controller
	var $;

	var init = function(controller) {
		String.prototype.format = String.prototype.f = function() {
			var s = this, i = arguments.length;

			while (i--) {
				s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
			}
			return s;
		};
		loadCurrencies();
		$ = $ || controller;
		addLabel = Ti.UI.createLabel({
			text : '\u2295',
			font : {
				fontSize : 200
			},
			shadowColor : '#ff0000',
			shadowOffset : {
				x : 50,
				y : 50
			},
			color : 'silver',
			opacity : .8,
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE,
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
		});
		$.currencies.add(addLabel);

		$.currencies.backgroundGradient = {
			type : 'linear',
			colors : ['#3498db', '#2980b9'],
			startPoint : {
				x : '50%',
				y : '0%'
			},
			endPoint : {
				x : '50%',
				y : '100%'
			},
			backFillStart : false
		};
		addLabel.addEventListener('click', addNewCurrencyPair)

	}
	function addNewCurrencyPair() {
		Ti.UI.backgroundColor = 'white';
		var win = Ti.UI.createWindow({
			layout : 'vertical',
			backgroundColor : 'white',
			width : 90
		});
		win.open({
			modal : true
		});

		a = new joli.query().select().from('currencies');
		cur = a.execute();
		var row = [];
		for (i in cur) {
			row[i] = Ti.UI.createPickerRow({
				title : cur[i].code + " - " + cur[i].money
			});
		}

		var picker = Ti.UI.createPicker({
			top : 50,
			selectionIndicator : true
		});
		var picker2 = Ti.UI.createPicker({
			top : 100,
			selectionIndicator : true
		});

		picker.add(row);
		picker2.add(row);
		change = {};
		picker.addEventListener('change', function(e) {
			change['from'] = e.selectedValue[0];
			if (change['to']) {
				saveChangePicker(change);
			}
		}, false);
		picker2.addEventListener('change', function(e) {
			change['to'] = e.selectedValue[0];
			if (change['from']) {
				saveChangePicker(change);
			}
		}, false);

		win.add(picker);
		win.add(picker2)
		win.open();

	}

	var saveChangePicker = function(change) {
		var currencypairs = new joli.model({
			table : "currencypairs",
			columns : {
				id : "INTEGER PRIMARY KEY AUTOINCREMENT",
				from : "STRING",
				to : "STRING"
			},
			methods : {
				update : function(change) {
					for (i in change) {
						if (currencypairs.count())
							this.set(i, change[i]);
						else
							this.newRecord(i, change[i]);
					}

				}
			}
		});
		joli.models.initialize();
		var currencypair = models.currencypairs.update();
		currencypair.save();

	}
	var loadCurrencies = function() {
		currencies = new joli.model({
			table : "currencies",
			columns : {
				id : "INTEGER PRIMARY KEY AUTOINCREMENT",
				code : "STRING UNIQUE",
				money : "STRING UNIQUE"
			}
		});
		joli.models.initialize();

		// table exists
		if (currencies.count()) {
			return;
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

	return {
		init : init,
		loadCurrencies : loadCurrencies
	};

})();

exports.init = function(controller) {
	Currencies.init(controller);
}
