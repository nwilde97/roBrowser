
define(function(require)
{
	'use strict';

	var UIManager          = require('UI/UIManager');
	var UIComponent        = require('UI/UIComponent');
	var htmlText           = require('text!./ConsoleMessage.html');
	var cssText            = require('text!./ConsoleMessage.css');
	
	var log = function(msg, type){
		var component = new UIComponent( 'ConsoleMessage', htmlText, cssText );
		component.onAppend = function(){
			this.ui.text(msg);
			this.ui.addClass(type);
		}
		component.append();
		return UIManager.addComponent(component);
	}
	
	return {
		log: log
	};

});