var joli;
var Currencies = (function() {
	// 	load joli ORM

	joli = require('/joli/joli').connect('joso');
	// Ti.include('joli.models/currencies.js');

	var models = (function() {

		var m = {};

		m.currency_pairs = new joli.model({
			table : 'currency_pairs',
			columns : {
				id : "INTEGER PRIMARY KEY AUTOINCREMENT",
				from_currency : "STRING",
				from_currency_id : "INTEGER",
				to_currency : "STRING",
				to_currency_id : "INTEGER",
				view_index : "INTEGER"
			}
		});

		m.currencies = new joli.model({
			table : 'currencies',
			columns : {
				id : "INTEGER PRIMARY KEY AUTOINCREMENT",
				code : "STRING UNIQUE",
				money : "STRING UNIQUE"
			}
		});

		return m;
	})();

	// set  the $ which refere to the base controller
	var $, currentView = 1, labels = [];

	var init = function(controller) {
		joli.models.initialize();
		$ = $ || controller;

		// load the currencies if necessary
		loadCurrencies();
		if (!hasSave) {
			showSavedCurrencyPair();
		} else {
			showAddLabel();
		}
		registerEvents();

	}
	function showAddLabel() {
		var label = Ti.UI.createLabel({
			text : '\u2295',
			font : {
				fontSize : 250
			},
			shadowColor : '#ff0000',
			shadowOffset : {
				x : 50,
				y : 50
			},
			color : 'white',
			opacity : .8,
			width : Ti.UI.SIZE,
			height : Ti.UI.SIZE,
			textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER
		});
		labels.push(label);

		Titanium.UI.currentWindow.add(label);
	}

	function showSavedCurrencyPair() {

	}

	function registerEvents() {
		$.scrollableView.addEventListener('scrollend', updateCurrentView, false);
		for (i in labels) {
			var label = labels[i];
			(function(label) {
				label.addEventListener('click', addNewCurrencyPair, false);
			})(label);
		}
		$.AddCurrencyPair.addEventListener('swipe', closeCurrencyPairOption, false);
	}

	/*
	 * Helper
	 */
	function hasSave(view) {
		return models.currency_pairs.findOneBy('view_index', currentView);
	}

	/*
	 * End Helper
	 */

	/*
	 * Event callbacks
	 */
	function updateCurrentView(e) {
		currentView = e.currentPage;
	}

	function closeCurrencyPairOption(e) {
		if (e.direction == 'left' || e.direction == 'right') {
			$.AddCurrencyPair.close();
		}
	}

	function addNewCurrencyPair() {

		a = new joli.query().select().from('currencies');
		cur = a.execute();
		var row = [];
		for (i in cur) {
			row[i] = Ti.UI.createPickerRow({
				title : cur[i].code + " - " + cur[i].money,
				custom: cur[i].id
			});
		}
		var selected = getCurrencyId();
		$.picker.add(row);
		$.picker.setSelectedRow(0, selected[0], false);
		$.picker2.add(row);
		$.picker2.setSelectedRow(0, selected[1], false);

		var change = {};

		$.picker.addEventListener('change', function(e) {
			change['from'] = {
				value : e.selectedValue[0],
				row : e.rowIndex
			};

			if (change['to']) {
				saveChangePicker(change);
			}
		}, false);
		
		$.picker2.addEventListener('change', function(e) {
			change['to'] = {
				value : e.selectedValue[0],
				row : e.rowIndex
			};
			if (change['from']) {
				saveChangePicker(change);
			}
		}, false);

		$.AddCurrencyPair.open();

	}

	/*
	 * End Event Callback
	 */

	getCurrencyId = function() {
		if (!hasSave() || !currentView) {
			return;
		}

		var q = new joli.query().select().from('currency_pairs').where('view_index = ?', currentView).execute();
		if (q.length > 1) {
			alert('Problem with duplicate data for one view');
			return;
		}
		return [q[0].from_currency_id, q[0].to_currency_id];
	}
	var saveChangePicker = function(change) {
		var toUpdate = models.currency_pairs.count({
			where : {
				'view_index = ?' : currentView
			}
		});
		if (toUpdate) {
			q = new joli.query().update('currency_pairs').set({
				from_currency : change.from.value,
				from_currency_id : change.from.row,
				to_currency : change.to.value,
				to_currency_id : change.to.row
			}).where('view_index = ? ', currentView);
			q.execute() && q.save();

		} else {
			// create new entry
			var currencypair = new joli.record(models.currency_pairs);
			currencypair.fromArray({
				from_currency : change.from.value,
				from_currency_id : change.from.row,
				to_currency : change.to.value,
				to_currency_id : change.to.row,
				view_index : currentView
			});
			currencypair.save();
		}

	}
	var loadCurrencies = function() {

		// table exists

		if (models.currencies.count()) {
			return;
		} else {
			if (!Titanium.Network.online) {
				alert('No connection whatsoever to internet dude!');
				return;
			}
			var message = "Please wait while loading: {0}%"
			var loading = Titanium.UI.createAlertDialog({
				title : "Loading",
				message : message.format("0"),
				persistent : true
			});

			loading.show();
			var xhr = Ti.Network.createHTTPClient({
				onload : function(e) {

					json = JSON.parse(this.responseText);

					j = 0;
					total = Object.keys(json).length;
					for (i in json) {
						j++;
						// var currency = models.currencies.newRecord({
						// code : i,
						// money : json[i]
						// });
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
		init : init
	};

})();

exports.init = function(controller) {
	Currencies.init(controller);
}
