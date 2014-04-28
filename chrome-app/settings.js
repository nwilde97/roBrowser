// Your custom settings
// See parameters in http://www.robrowser.com/getting-started#API
var ROConfig = {
	development: true, // don't need to compile javascript files in chrome app since it's already a package.
	remoteClient : "http://grf.robrowser.com/",
	servers : [ {
		display : "Demo Server",
		desc : "roBrowser's demo server",
		address : "5.135.190.4",
		port : 7000,
		version : 25,
		langtype : 12,
		packetver : 20131223,
		packetKeys : true,
		socketProxy : "ws://5.135.190.4:443/",
		adminList : [ 2000000 ]
	} ],
	saveFiles : true,
	skipServerList : true,
	version : 1.266,
	autoLogin: ['nwild1', 'xxx'],
	character: 0,
	skipIntro: true,
	preferences: [
		{
			_key:"Audio", 
			_version: 1.0, 
			BGM:   {
				play:   false,
				volume: 0.5
			},	
			Sound: {
				play:   false,
				volume: 0.5
			}
		}
	]
};