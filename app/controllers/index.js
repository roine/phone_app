$.currencies.addEventListener('click', function() {
	var currencies = require('currencies').init($);
})
$.index.addEventListener('swipe', function(e) {
	Ti.API.info(JSON.stringify(e));
	if (e.direction == 'up') {
		$.index.setActiveTab(1);
		var currencies = require('currencies').init($);
	}

});

$.index.open();
