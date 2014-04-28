define(function(require) {

	var Network = require('Network/NetworkManager');
	var PACKET = require('Network/PacketStructure');
	var AiConsole = require('UI/AiConsole');
	var Session = require('Engine/SessionStorage');

	var _isInitialised = false;

	/**
	 * Connect to Map Server
	 * 
	 * @param {number}
	 *            IP
	 * @param {number}
	 *            port
	 * @param {string}
	 *            mapName
	 */
	function init(ip, port, mapName) {
		var _mapName = mapName;

		// Connect to char server
		Network.connect(Network.utils.longToIP(ip), port, function(success) {

			// Fail to connect...
			if (!success) {
				AiConsole.info("Failed to connect to map server", "system");
				return;
			}

			AiConsole.info("Connected to map server", "system");
			// Success, try to login.
			var pkt = new PACKET.CZ.ENTER();
			pkt.AID = Session.AID;
			pkt.GID = Session.GID;
			pkt.AuthCode = Session.AuthCode;
			pkt.clientTime = Date.now();
			pkt.Sex = Session.Sex;
			Network.sendPacket(pkt);

			// Server send back AID
			Network.read(function(fp) {
				// if PACKETVER < 20070521, client send GID...
				if (fp.length === 4) {
					Session.Character.GID = fp.readLong();
				}
			});

			// Ping
			var ping = new PACKET.CZ.REQUEST_TIME();
			Network.setPing(function() {
				ping.time = Date.now();
				Network.sendPacket(ping);
			});

			 Network.sendPacket(new PACKET.CZ.NOTIFY_ACTORINIT());

		}, true);

		// Do not hook multiple time
		if (_isInitialised) {
			return;
		}

		_isInitialised = true;

	}

	return {
		init : init
	};
});