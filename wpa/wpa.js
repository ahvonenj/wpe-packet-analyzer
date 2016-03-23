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

	this.logbuffer = '';
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
			self.packets.push(new Packet(packetnum, packetopt, packetbits));
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


	self.Log('--Analyzed packets--', self.colors.BLUE, true);
	self.Loop(function(packet, i)
	{
		self.Log('Packet #' + packet.num + ' (' + packet.length + ' bytes)', self.colors.WIST, true);

		self.LogH('<a href = "#" class = "interactivebits">');
		self.Log(packet.bitsToString(), self.colors.GRAY, false, true);
		self.LogH('</a>');

		self.LogBuffer(true);
		self.LogNewLine();
	});

	// Find the bitcount of the packet with the most bits
	var maxbits = 0;
	var largestpacket = null;

	self.Loop(function(packet)
	{
		if(packet.bits.length > maxbits)
		{
			maxbits = packet.length;
		}
	});

	self.Log('--Packet null bytes relative to largest packet (' + maxbits + ' bbytes)--', self.colors.BLUE, true);
	self.Loop(function(packet)
	{
		var nullfound = false;

		self.Log('Packet #' + packet.num, self.colors.WIST, true);

		self.LogH('<a href = "#" class = "interactivebits">');

		for(var i = 0; i < maxbits; i++)
		{
			if(typeof packet.bits[i] === 'undefined')
			{
				if(!nullfound)
				{
					self.LogH('</a>');
					self.LogBuffer(true);
				}

				self.Log('.. ', self.colors.RED);

				nullfound = true;
			}
			else
			{
				self.Log(packet.bits[i] + ' ', self.colors.GRAY, false, true);
			}
		}

		if(!nullfound)
		{
			self.LogH('</a>');
			self.LogBuffer(true);
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

	localStorage.setItem('wpa-' + name, JSON.stringify(self.packets));
}

Wpa.prototype.LoadPackets = function(key)
{
	var packets = JSON.parse(localStorage.getItem(key));

	$('#wpa-packet-table tr:not(:first-child)').remove();

	for(var key in packets)
	{
		if(packets.hasOwnProperty(key))
		{
			var packet = packets[key];
			var strbits = packet.bits.join(' ');

			var toappend = '<tr>';
			toappend += '<td>' + packet.num + '</td>';
			toappend += '<td><input type="button" value="Open" class="wpa-packet-opt"></td>';
			toappend += '<td><textarea class="wpa-packet-textarea">' + strbits + '</textarea></td>';
			toappend += '</tr>';

			$('#wpa-packet-table').append(toappend);

			console.log(packet);
		}
	}

	this.packets = packets;
}

Wpa.prototype.Log = function(str, color, newline, buffered)
{
	var self = this;
	color = color || 'black';
	buffered = buffered || false;

	if(newline)
		var nl = '<br/><br/>';
	else
		var nl = '';

	if(buffered)
	{
		this.logbuffer += '<span style = "color: ' + color + ';">' + str + '</span>' + nl;
	}
	else
	{
		this.$log.append('<span style = "color: ' + color + ';">' + str + '</span>' + nl);
	}
}

Wpa.prototype.LogH = function(html)
{
	var self = this;
	this.logbuffer += html;
}

Wpa.prototype.LogBuffer = function(clearbuffer)
{
	clearbuffer = clearbuffer || false;

	this.$log.append(this.logbuffer);

	if(clearbuffer)
		this.logbuffer = '';
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