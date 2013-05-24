var Currencies = (function() {
	// 	load joli ORM
	var joli = require('/joli/joli').connect('joso');

	var models = (function() {

		var m = {};

		m.currency_pairs = new joli.model({
			table : 'currency_pair',
			columns : {
				id : "INTEGER PRIMARY KEY AUTOINCREMENT",
				from_currency : "STRING",
				to_currency : "STRING",
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
	var $, currentView = 1;

	var init = function(controller) {

		String.prototype.format = String.prototype.f = function() {
			var s = this, i = arguments.length;

			while (i--) {
				s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
			}
			return s;
		};

		$ = $ || controller;

		$.view1.backgroundGradient = {
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

		$.view2.backgroundGradient = {
			type : 'linear',
			colors : ['#e74c3c', '#c0392b'],
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

		loadCurrencies();

		var addLabel = [];
		for (var i = 0, total = 2; i < total; i++) {
			addLabel[i] = Ti.UI.createLabel({
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
			addLabel[i].addEventListener('click', addNewCurrencyPair)
		}

		$.scrollableView.addEventListener('scrollend', function(e) {
			if (!hasSave()) {
				addLabel[currentView].hide()
			}
		});
		$.view1.add(addLabel[0]);
		$.view2.add(addLabel[1]);
		if (!hasSave()) {
			addLabel[currentView].hide()
		}

	}
	function hasSave(view) {
		return models.currency_pairs.findOneBy('view_index', currentView);
	}

	function addNewCurrencyPair() {
		var win = Ti.UI.createWindow({
			layout : 'vertical',
			backgroundColor : 'white',
			left : 0,
			width : '100%'
		});

		var pWidth = Ti.Platform.displayCaps.platformWidth;
		var pHeight = Ti.Platform.displayCaps.platformHeight;
		Ti.App.SCREEN_WIDTH = (pWidth > pHeight) ? pHeight : pWidth;
		Ti.App.SCREEN_HEIGHT = (pWidth > pHeight) ? pWidth : pHeight;

		var slide_it_left = Titanium.UI.createAnimation();
		slide_it_left.left = Ti.App.SCREEN_WIDTH;
		// to put it back to the left side of the window
		slide_it_left.duration = 300;
		var slide_it_right = Titanium.UI.createAnimation();
		slide_it_right.left = Ti.App.SCREEN_WIDTH;
		slide_it_left.duration = 300;

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
		var change = {};
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
		win.open(slide_it_left);
		win.addEventListener('swipe', function(e) {
			if (e.direction == 'left' || e.direction == 'right') {
				win.close(slide_it_right)
			}
		});

	}

	var saveChangePicker = function(change) {

		joli.models.initialize();
		var checkIsset = new joli.query().select('from_currency, COUNT(*) as total').from('currency_pair').where('view_index = ?', currentView).execute('array');
		for (i in checkIsset) {
			var toUpdate = checkIsset[i]['total'];
		}

		if (toUpdate) {
			q = new joli.query().update('currency_pair').set({
				from_currency : change['from'],
				to_currency : change['to']
			}).where('view_index = ? ', currentView);
			q.execute() && q.save();

		} else {
			var currencypair = new joli.record(currencypairs);
			currencypair.fromArray({
				from_currency : change['from'],
				to_currency : change['to'],
				view_index : currentView
			});
			currencypair.save();
		}

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
