/**
 * Engine/AiEngine.js
 * 
 * Contains central logic for running AI
 * 
 */
define(function(require){
	
	var Queue = require("Utils/Queue");
	var Context = require("Core/Context");
	var LoginEngine = require("Engine/AI/LoginEngine");
	var AiConsole = require("UI/AiConsole");
	var Thread = require("Core/Thread");
	var DB = require("DB/DBManager");
	
	var _thread_ready = false;
	
	function init(){
		Context.checkSupport();
		
		var q = new Queue();

		// Waiting for the Thread to be ready
		q.add(function(){
			if (!_thread_ready) {
				Thread.hook('THREAD_ERROR', onThreadError );
				Thread.hook('THREAD_LOG',   onThreadLog );
				Thread.hook('THREAD_READY', function(){
					_thread_ready = true;
					q._next();
				});
				Thread.init();
			}
			else {
				q._next();
			}
		});
		
		q.add(function(){
			Thread.send( 'CLIENT_INIT', {
				files:   [],
				grfList: ROConfig.grfList || 'DATA.INI',
				save:    !!ROConfig.saveFiles
			}, function(){
				AiConsole.info("Done initializing file system", "system");
				q.next();
			} );
		});
		
		// Loading Game file (txt, lua, lub)
		q.add(function(){
			// GRF Host config
			if (ROConfig.remoteClient) {
				Thread.send( 'SET_HOST', ROConfig.remoteClient );
			}
			
			DB.onReady = function(){
				AiConsole.info("Database loaded", "system");
				q.next();
			};
			DB.onProgress = function(i, count) {
				
			};
			DB.init();
		});
		
		q.add(function(){
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
			

		});
		
		q.run();
	}
	
	function onThreadError( data )
	{
		console.warn.apply( console, data );
	}


	function onThreadLog( data )
	{
		AiConsole.info(data, "thread");
	}
	
	return {
		init: init
	};
	
});
