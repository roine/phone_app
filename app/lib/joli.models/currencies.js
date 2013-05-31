

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
