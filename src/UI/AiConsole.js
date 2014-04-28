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
	
	var Level = {
		DEBUG: 4,
		INFO: 3,
		WARN: 2,
		ERROR: 1,
		OFF: 0
	};
	
	var _prefs = Preferences.get("Logging", {level: Level.DEBUG}, 1.0);

	
	function log(msg, level){
		if(_prefs.level > level){
			console.log(msg);
		}
	}
	
	function debug(msg){
		log(msg, Level.DEBUG);
	}
	
	function info(msg){
		log(msg, Level.INFO);
	}
	
	function warn(msg){
		log(msg, Level.WARN);
	}
	
	function error(msg){
		log(msg, Level.ERROR);
	}
	
	return {
		log:   log,
		debug:   debug,
		info:   info,
		warn:   warn,
		error: error
	};
	
});