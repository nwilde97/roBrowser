/**
 * UI/AiConsole.js
 *
 * Console for logging message useful to AI
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Ned Wilde
 */
define(function(require){

	var Preferences = require("Core/Preferences");
	var ConsoleMessage = require("UI/Components/ConsoleMessage/ConsoleMessage");
	
	var Level = {
		DEBUG: 4,
		INFO: 3,
		WARN: 2,
		ERROR: 1,
		OFF: 0
	};
	
	var _prefs = Preferences.get("Logging", {level: Level.DEBUG}, 1.0);

	
	function log(msg, level, type){
		if(_prefs.level > level){
			console.log(msg);
			ConsoleMessage.log(msg, type);
		}
	}
	
	function debug(msg, type){
		log(msg, Level.DEBUG, type);
	}
	
	function info(msg, type){
		log(msg, Level.INFO, type);
	}
	
	function warn(msg, type){
		log(msg, Level.WARN, type);
	}
	
	function error(msg, type){
		log(msg, Level.ERROR, type);
	}
	
	return {
		log:   log,
		debug:   debug,
		info:   info,
		warn:   warn,
		error: error
	};
	
});