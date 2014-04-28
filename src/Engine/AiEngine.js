/**
 * Engine/AiEngine.js
 * 
 * Contains central logic for running AI
 * 
 */
define(function(require){
	
	var Context = require("Core/Context");
	var LoginEngine = require("Engine/AI/LoginEngine");
	var AiConsole = require("UI/AiConsole");
	
	function init(){
		Context.checkSupport();
		var _servers = [];
		if (ROConfig.servers instanceof Array) {
			_servers = ROConfig.servers;
		}
		if (_servers.length === 0) {
			AiConsole.info("No servers information has been setup. Exiting...", "system");
		}

		// Just 1 server, skip the WinList
		else if (_servers.length === 1 && ROConfig.skipServerList) {
			LoginEngine.init( _servers[0] );
		}
		else {
			//TODO display server list
		}
	}
	
	return {
		init: init
	};
	
});
