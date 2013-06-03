$.currencies_tab.addEventListener('click', function() {
	// open currencies tab

	//drop table
	// var db = Ti.Database.open('joso');
	// db.execute('drop table if exists currency_pair');
	// db.execute('drop table if exists currency_pairs');
	// db.close();
	var currencies = require('currencies').init($);
});

String.prototype.format = String.prototype.f = function() {
	var s = this, i = arguments.length;

	while (i--) {
		s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
	}
	return s;
};

$.index.open();
