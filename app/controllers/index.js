$.currencies_tab.addEventListener('click', function() {
	// open currencies tab

	//drop table
	// drop('currency_pairs');
	var currencies = require('currencies').init($);
});

function drop(table) {
	if(!table) return;
	var db = Ti.Database.open('joso');
	db.execute('drop table if exists '+table);
	db.close();
}

String.prototype.format = String.prototype.f = function() {
	var s = this, i = arguments.length;

	while (i--) {
		s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
	}
	return s;
};

$.index.open();
