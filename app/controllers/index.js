var joli = require('/joli/joli').connect('joso');
require('my_lib');
require('currencies');
require('weather');
$.currencies.addEventListener('click', function(e) {
	main();
});
$.weather.addEventListener('click', function(e) {

});


$.index.open();
