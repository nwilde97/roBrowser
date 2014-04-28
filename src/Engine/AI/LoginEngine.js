/**
 * Engine/AiEngine.js
 *
 * AI Engine
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Ned Wilde
 */

define([
	'require',
	'Core/Thread',
	'Engine/SessionStorage',
	'Engine/AI/CharEngine',
	'Network/NetworkManager',
	'Network/PacketStructure',
	'Network/PacketVerManager',
	'UI/AiConsole'
],
function(
	require,
	Thread,
	Session,
	CharEngine,
	Network,
	PACKET,
	PACKETVER,
	AiConsole
)
{
	'use strict';

	/**
	 * @var {object} server object stored in clientinfo.xml
	 */
	var _server = null;


	/**
	 * @var {array} char-servers list
	 */
	var _charServers = [];


	/**
	 * @var {string} Stored username to send as ping
	 */
	var _loginID = '';


	/**
	 * Init Game
	 */
	function init( server )
	{

		Session.LangType = parseInt(server.langtype, 10);
		_server = server;

		// Add support for "packetver" definition in Server listing
		if ('packetver' in server && server.packetver !== '') {
			ROConfig.packetver = String(server.packetver);

			if (ROConfig.packetver.match(/^\d+$/)) {
				PACKETVER.set( parseInt(ROConfig.packetver, 10) );
			}
			else if (ROConfig.packetver.match(/auto/i)) {
				PACKETVER.set( 0, Infinity);
			}
			// executable already used
		}

		// Add support for "packetkeys" definition in server definition
		if ('packetKeys' in server && server.packetKeys !== '') {
			ROConfig.packetKeys = server.packetKeys;
		}

		// Add support for remote client in server definition
		if ('remoteClient' in server && server.remoteClient !== '') {
			ROConfig.remoteClient = server.remoteClient;
			Thread.send( 'SET_HOST', ROConfig.remoteClient );
		}

		// Add support for "socketProxy" in server definition
		if ('socketProxy' in server && server.socketProxy !== '') {
			ROConfig.socketProxy = server.socketProxy;
		}


		// GMs account list from server
		Session.AdminList = server['adminList'] || [];

		// Autologin features
		if (ROConfig.autoLogin && ROConfig.autoLogin.length === 2) {
			onConnectionRequest.apply( null, ROConfig.autoLogin);
		}
		else {
			//TODO Get login information
		}

		// Hook packets
		Network.hookPacket( PACKET.AC.ACCEPT_LOGIN,    onConnectionAccepted );
		Network.hookPacket( PACKET.AC.REFUSE_LOGIN,    onConnectionRefused );
		Network.hookPacket( PACKET.AC.REFUSE_LOGIN_R2, onConnectionRefused );
		Network.hookPacket( PACKET.SC.NOTIFY_BAN,      onServerClosed );
	}

	/**
	 * Reload WinLogin
	 */
	function reload()
	{
		AiConsole.info("Reloading (TODO)", "system");
		//TODO
		Network.close();
	}
	
	/**
	 * Trying to connect to Login server
	 *
	 * @param {string} username
	 * @param {string} password
	 */
	function onConnectionRequest( username, password )
	{
		// Store the ID to use for the ping
		_loginID = username;
		
		AiConsole.info("Attempting to connect to server", "system");

		// Try to connect
		Network.connect( _server.address, _server.port, function( success ) {
			// Fail to connect...
			if ( !success ) {
				AiConsole.info("Login attempt failed", "system");
				//TODO try logging in again
				return;
			}

			// Success, try to connect
			var pkt        = new PACKET.CA.LOGIN();
			pkt.ID         = username;
			pkt.Passwd     = password;
			pkt.Version    = parseInt(_server.version, 10);
			pkt.clienttype = parseInt(_server.langtype, 10);
			Network.sendPacket(pkt);
		});
	}


	/**
	 * Go back to intro window
	 */
	function onExitRequest()
	{
		//TODO
		AiConsole.info("Logging out (TODO)", "system");
	}


	/**
	 * User selected a char-server
	 *
	 * @param {number} index in server list
	 */
	function onCharServerSelected( index )
	{
		CharEngine.onExitRequest = reload;
		CharEngine.init( _charServers[index] );
	}


	/**
	 * Accepted connection from char-server
	 *
	 * @param {object} pkt - PACKET.AC.ACCEPT_LOGIN
	 */
	function onConnectionAccepted( pkt )
	{
		AiConsole.info("Connected to login server", "system");
		 
		Session.AuthCode  = pkt.AuthCode;
		Session.AID       = pkt.AID;
		Session.UserLevel = pkt.userLevel;
		Session.Sex       = pkt.Sex;
		_charServers      = pkt.ServerList;

		// Build list of servers
		var i, count = _charServers.length;
		var list     = new Array(count);
		for (i = 0; i < count; ++i) {
			list[i]  =  _charServers[i].property;
			list[i] +=  _charServers[i].name;
			list[i] +=  _charServers[i].state;
		}

		// No choice, connect directly to the server
		if (count === 1 && ROConfig.skipServerList) {
			CharEngine.onExitRequest = reload;
			CharEngine.init(_charServers[0]);
		}

		// Have to select server in the list
		else {
			//TODO
			AiConsole.info("Please select your server (TODO)", "system");
		}

		// Set ping
		var ping = new PACKET.CA.CONNECT_INFO_CHANGED();
		ping.ID  = _loginID;
		Network.setPing(function(){
			Network.sendPacket(ping);
		});
	}


	/**
	 * Received data from server, connection refused
	 *
	 * @param {object} pkt - PACKET.AC.REFUSE_LOGIN
	 */
	function onConnectionRefused( pkt )
	{
		AiConsole.warn("Connection refused (TODO)", "system");
		//TODO add better error message see trunk
		Network.close();
	}


	/**
	 * Received closed connection from server
	 *
	 * @param {object} pkt - PACKET.SC.NOTIFY_BAN
	 */
	function onServerClosed( pkt )
	{
		AiConsole.warn("Server is closed (TODO)", "system");
		//TODO add better error message see trunk
		Network.close();
	}


	/**
	 * Export
	 */
	return {
		init:   init,
		reload: reload
	};
});
