/**
 * App/AiClient.js
 *
 * Start roBrowser ai engine
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Ned Wilde
 */

// Errors Handler (hack)
require.onError = function (err) {
	'use strict';

	if (require.defined('UI/Components/Error/Error')) {
		require('UI/Components/Error/Error').addTrace(err);
		return;
	}

	require(['UI/Components/Error/Error'], function( Errors ){
		Errors.addTrace(err);
	});
};

require( {
	baseUrl: './src/',
	paths: {
		text:   'Vendors/text.require',
		jquery: 'Vendors/jquery-1.9.1'
	}
},
	['Engine/AiEngine'],
	function( AiEngine ){
		'use strict';

		AiEngine.init();
	}
);