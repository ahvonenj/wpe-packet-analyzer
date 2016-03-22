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

	// Find the bitcount of the packet with the most bits
	var maxbits = 0;

	for(var key in self.packets)
	{
		if(self.packets.hasOwnProperty(key))
		{
			var packet = self.packets[key];

			if(packet.bits.length > maxbits)
			{
				maxbits = packet.bits.length;
			}
		}
	}

	console.log(maxbits);
}

Wpa.prototype.GetPacketsAndAnalyze = function()
{
	this.GetPacketsFromDOM();
	this.AnalyzePackets();
}

Wpa.prototype.Log = function(str, color)
{
	var self = this;
	color = color || 'black';

	this.$log.append('<span style = "color: ' + color + ';">' + str + '</span><br/>');
}

Wpa.prototype.ClearLog = function()
{
	var self = this;
	this.$log.empty();
}