/**
 * Engine/CharEngine.js
 *
 * Char Engine
 * Manage char server, connection, character selection / creation / deletion, etc.
 *
 * This file is part of ROBrowser, Ragnarok Online in the Web Browser (http://www.robrowser.com/).
 *
 * @author Vincent Thibault
 */

define([
	'require',
	'Utils/jquery',
	'Engine/SessionStorage',
	'Engine/AI/MapEngine',
	'Network/NetworkManager',
	'Network/PacketStructure',
	'Network/PacketVerManager',
	'UI/Components/WinPopup/WinPopup',
	'UI/Components/InputBox/InputBox',
	'Core/Preferences',
	'UI/AiConsole'
], function(
	require,
	jQuery,
	Session,
	MapEngine,
	Network,
	PACKET,
	PACKETVER,
	WinPopup,
	InputBox,
	Preferences,
	AiConsole
)
{
	'use strict';


	/**
	 * @var {object} server data
	 */
	var _server = null;

	/**
	 * @var {number} where to create character ?
	 */
	var _creationSlot = 0;
	
	/**
	 * @var {number} max slots
	 */
	var _maxSlots = 3 * 9;


	/**
	 * var {Array} list of characters
	 */
	var _list = [];


	/**
	 * @var {Array} list of characters (index by slot)
	 */
	var _slots = [];

	/**
	 * var {number} sex
	 */
	var _sex = 0;


	/*
	 * Connect to char server
	 */
	function init( server )
	{
		// Storing variable
		_server = server;
		
		//Check ROConfig for any pre-selected characters and override preferences
		if(ROConfig.char !== "undefined"){
			Preferences.get('CharSelect', {
				index: 0
			}, 1.0 );
		}		

		AiConsole.info("Attempting to connect to character server", "system");
		// Connect to char server
		Network.connect( Network.utils.longToIP( server.ip ), server.port, function( success ){

			// Fail to connect...
			if (!success) {
				AiConsole.error("Failed to connect to character server", "system");
				return;
			}

			// Success, try to connect
			var pkt        = new PACKET.CH.ENTER();
			pkt.AID        = Session.AID;
			pkt.AuthCode   = Session.AuthCode;
			pkt.userLevel  = Session.UserLevel;
			pkt.Sex        = Session.Sex;
			pkt.clientType = Session.LangType;
			Network.sendPacket(pkt);

			// Server send back (new) AID
			Network.read(function(fp){
				Session.AID = fp.readLong();
			});
		});

		// Hook packets
		Network.hookPacket( PACKET.HC.ACCEPT_ENTER_NEO_UNION,        onConnectionAccepted );
		Network.hookPacket( PACKET.HC.REFUSE_ENTER,                  onConnectionRefused );
		Network.hookPacket( PACKET.HC.ACCEPT_MAKECHAR_NEO_UNION,     onCreationSuccess );
		Network.hookPacket( PACKET.HC.REFUSE_MAKECHAR,               onCreationFail );
		Network.hookPacket( PACKET.HC.ACCEPT_DELETECHAR,             onDeleteAnswer );
		Network.hookPacket( PACKET.HC.REFUSE_DELETECHAR,             onDeleteAnswer );
		Network.hookPacket( PACKET.HC.NOTIFY_ZONESVR,                onReceiveMapInfo );
		Network.hookPacket( PACKET.HC.ACCEPT_ENTER_NEO_UNION_HEADER, onConnectionAccepted );
		Network.hookPacket( PACKET.HC.ACCEPT_ENTER_NEO_UNION_LIST,   onConnectionAccepted );
		Network.hookPacket( PACKET.HC.NOTIFY_ACCESSIBLE_MAPNAME,     onMapUnavailable);
	}

	/**
	 * Request to go back to Login Window
	 */
	function onExitRequest()
	{
		require('Engine/LoginEngine').reload();
	}


	/**
	 * Connection accepted from char-server
	 * Displaying Character list
	 *
	 * @param {object} pkt - PACKET.HC.ACCEPT_ENTER_NEO_UNION
	 */
	function onConnectionAccepted( pkt )
	{
		pkt.sex = Session.Sex;

		// Start sending ping
		var ping = new PACKET.CZ.PING();
		ping.AID = Session.AID;
		Network.setPing(function(){
			Network.sendPacket(ping);
		});

		setInfo( pkt );
		
		if (ROConfig.char !== "undefined" &&  _slots[ROConfig.character]) {
			onConnectRequest( _slots[ROConfig.character] );
		} else {
			//TODO show character list
			AiConsole.info("Please select a character", "system")
		}
	}
	
	function setInfo( pkt )
	{
		_maxSlots           = pkt.TotalSlotNum;
		_sex                = pkt.sex;
		_slots.length       = 0;
		_list.length        =  0;

		if (pkt.charInfo) {
			var i, count = pkt.charInfo.length;
			for (i = 0; i < count; ++i) {
				var character = pkt.charInfo[i];
				character.sex = _sex;
				_list.push( character );
				_slots[ character.CharNum ] = character;
			}
		}

	};
	
	/**
	 * Server don't want the user to connect
	 *
	 * @param {object} pkt - PACKET.HC.REFUSE_ENTER
	 */
	function onConnectionRefused( pkt )
	{
		AiConsole.error("Connection to character server refused", "system");
	}


	/**
	 * No map server available
	 *
	 * @param {object} pkt - PACKET.HC.NOTIFY_ACCESSIBLE_MAPNAME
	 */
	function onMapUnavailable( pkt )
	{
		// no map server avaiable
		AiConsole.error("Failed to connect to map server", "system");
	}


	/**
	 * User want to delete a character
	 *
	 * @param {number} charID - Character ID
	 */
	function onDeleteRequest( charID )
	{
		//TODO
	}


	/*
	 * Answer from server to delete character
	 *
	 * @param {object} PACKET.HC.REFUSE_DELETECHAR or PACKET.HC.ACCEPT_DELETECHAR
	 */
	function onDeleteAnswer(pkt)
	{
		//TODO
	}


	/**
	 * Asking from CharSelect to create a character, moving to CharCreate window
	 *
	 * @param {number} index - slot where to create character
	 */
	function onCreateRequest( index )
	{
		//TODO
	}


	/**
	 * User want to create a character, send data to server
	 *
	 * @param {string} name
	 * @param {number} Str - strength stat
	 * @param {number} Agi - agility stat
	 * @param {number} Vit - vitality stat
	 * @param {number} Int - intelligence stat
	 * @param {number} Dex - dexterity stat
	 * @param {number} Luk - luck stat
	 * @param {number} hair - hair style
	 * @param {number} color - hair color
	 */
	function onCharCreationRequest( name, Str, Agi, Vit, Int, Dex, Luk, hair, color )
	{
		var pkt;

		// Old Packet required stats
		if (PACKETVER.min < 20120307) {
			pkt = new PACKET.CH.MAKE_CHAR();
			pkt.Str  = Str;
			pkt.Agi  = Agi;
			pkt.Vit  = Vit;
			pkt.Int  = Int;
			pkt.Dex  = Dex;
			pkt.Luk  = Luk;
		}
		else {
			pkt = new PACKET.CH.MAKE_CHAR2();
		}

		pkt.name    = name;
		pkt.head    = hair;
		pkt.headPal = color;
		pkt.CharNum = _creationSlot;

		Network.sendPacket(pkt);
	}


	/**
	 * Success to create a character
	 *
	 * @param {object} pkt - PACKET.HC.ACCEPT_MAKECHAR_NEO_UNION
	 */
	function onCreationSuccess( pkt )
	{
		//TODO
	}


	/**
	 * Fail to create a character
	 *
	 * @param {object} pkt - PACKET.HC.REFUSE_MAKECHAR
	 */
	function onCreationFail( pkt )
	{
		AiConsole.error("Character creation failed", "system");
		//TODO
	}


	/**
	 * User ask to connect with its player
	 *
	 * @param {object} entity to connect with
	 */
	function onConnectRequest( entity )
	{
		AiConsole.info("Character selected", "system");
		Session.Character = entity;

		var pkt = new PACKET.CH.SELECT_CHAR();
		pkt.CharNum = entity.CharNum;
		Network.sendPacket(pkt);
	}


	/**
	 * Player selection successful, get mapserver information to connect
	 *
	 * @param {object} pkt - PACKET.HC.NOTIFY_ZONESVR
	 */
	function onReceiveMapInfo( pkt )
	{
		Session.GID = pkt.GID;
		MapEngine.init( pkt.addr.ip, pkt.addr.port, pkt.mapName);
	}


	/*
	 * Captcha
	 *
	 * S 07e5 PACKET.CH.ENTER_CHECKBOT - Request for the captcha ?
	 * S 07e7 PACKET.CH.CHECKBOT - Send code
	 * R 07e8 PACKET.HC.CHECKBOT - image url ?
	 * R 07e9 PACKET.HC.CHECKBOT_RESULT - Result for captcha
	 */

	/*
	 * Rename (http://ragnarok.levelupgames.ph/main/new-loki-server-merge-faq/)
	 *
	 * S 08fc <char ID>.l <new name>.24B (new one) - Ask if valid
	 * S 028d PACKET.CH.REQ_IS_VALID_CHARNAME - Ask if valid
	 * R 028e PACKET.HC.ACK_IS_VALID_CHARNAME - Result
	 * S 028f PACKET.CH.REQ_CHANGE_CHARNAME (confirm)
	 */

	/*
	 * Change slot (http://ragnarok.levelupgames.ph/main/new-loki-server-merge-faq/)
	 *
	 * S 08d4 <from>.W <to>.W <unk>.W
	 * R 08d5 <len>.W <success>.W <unk>.W 
	 */

	/*
	 * Pincode
	 *
	 * S 08b8 <AID>.L <data>.4B - check PIN
	 * S 08c5 <AID>.L <data>.4B - request for PIN button ?
	 * S 08be <AID>.L <old>.4B <new>.4B - change PIN
	 * S 08ba <AID>.L <new>.4B - set PIN
	 * R 08b9 <seed>.L <AID>.L <state>.W
	 *	State:
	 *	0 = pin is correct
	 *	1 = ask for pin - client sends 0x8b8
	 *	2 = create new pin - client sends 0x8ba
	 *	3 = pin must be changed - client 0x8be
	 *	4 = create new pin ?? - client sends 0x8ba
	 *	5 = client shows msgstr(1896)
	 *	6 = client shows msgstr(1897) Unable to use your KSSN number
	 *	7 = char select window shows a button - client sends 0x8c5
	 *	8 = pincode was incorrect
	 */


	/**
	 * Export
	 */
	return {
		init:   init
	};
});