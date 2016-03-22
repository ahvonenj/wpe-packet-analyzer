'use strict';

function Wpa($packet_table, $log)
{
	if(typeof $packet_table === 'undefined' || $($packet_table).length === 0)
	{
		throw new Error('WPA could not find a packet table!');
		return;
	}

	if(typeof $log === 'undefined' || $($log).length === 0)
	{
		throw new Error('WPA could not find a log element!');
		return;
	}

	this.$packet_table = $packet_table;
	this.$log = $log;

	this.packets = [];

	this.colors = 
	{
		RED: '#c0392b',
		GREEN: '#2bbc67',
		BLUE: '#2980b9',
		YELLOW: '#f1c40f',
		ORANGE: '#e78128',
		WIST: '#8e44ad',
		GRAY: '#7f8c8d'
	}
}

Wpa.prototype.GetPacketsFromDOM = function()
{
	var self = this;

	this.packets = [];

	this.$packet_table.find('tr:not(:first-child)').each(function()
	{
		var $this = $(this);
		var packetnum = $this.children('td').eq('0').text();
		var packetopt = $this.children('td').eq('1').data('opt');
		var packetbits = $this.children('td').eq('2').find('textarea').val();

		packetbits = packetbits.split(' ');

		if(packetbits[packetbits.length - 1] === '')
		{
			packetbits.splice(packetbits.length - 1, 1);
		}

		if(packetbits.length > 0)
		{
			self.packets.push(
			{
				num: packetnum,
				opt: packetopt,
				bits: packetbits
			});
		}
		else
		{
			console.log('WPA skipping empty bitted packet')
		}
	});
}

Wpa.prototype.AnalyzePackets = function()
{
	var self = this;

	if(this.packets.length === 0)
	{
		throw new Error('WPA has no packets to analyze!');
		return;
	}

	self.ClearLog();

	self.Log('Analysis result', null, true);

	self.Loop(function(packet, i)
	{
		self.Log('Packet #' + i, self.colors.WIST);
	});

	// Find the bitcount of the packet with the most bits
	var maxbits = 0;

	self.Loop(function(packet)
	{
		if(packet.bits.length > maxbits)
		{
			maxbits = packet.bits.length;
		}
	});

	self.Loop(function(packet)
	{
		for(var i = 0; i < maxbits; i++)
		{
			if(typeof packet.bits[i] === 'undefined')
			{
				self.Log('.. ', self.colors.RED);
			}
			else
			{
				self.Log(packet.bits[i] + ' ', self.colors.GRAY);
			}
		}

		self.LogNewLine();
	});
}

Wpa.prototype.Loop = function(callback)
{
	var self = this;

	var i = 0;

	for(var key in self.packets)
	{
		if(self.packets.hasOwnProperty(key))
		{
			var packet = self.packets[key];
			callback(packet, i);
			i++;
		}
	}
}

Wpa.prototype.GetPacketsAndAnalyze = function()
{
	this.GetPacketsFromDOM();
	this.AnalyzePackets();
}

Wpa.prototype.SavePackets = function()
{
	var self = this;

	this.GetPacketsFromDOM();

	if(this.packets.length === 0)
	{
		throw new Error('WPA has no packets save!');
		return;
	}

	var name = window.prompt('Save file name?');

	localStorage.setItem(name, JSON.stringify(self.packets));
}

Wpa.prototype.LoadPackets = function(key)
{
	var packets = JSON.parse(localStorage.getItem(key));
	console.log(packets);
}

Wpa.prototype.Log = function(str, color, newline)
{
	var self = this;
	color = color || 'black';

	if(newline)
		var nl = '<br/><br/>';
	else
		var nl = '';

	this.$log.append('<span style = "color: ' + color + ';">' + str + '</span>' + nl);
}

Wpa.prototype.LogNewLine = function()
{
	var self = this;
	this.$log.append('<br/><br/>');
}

Wpa.prototype.ClearLog = function()
{
	var self = this;
	this.$log.empty();
}