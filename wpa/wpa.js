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
		var packetbytes = $this.children('td').eq('2').find('textarea').val();

		packetbytes = packetbytes.split(' ');

		if(packetbytes[packetbytes.length - 1] === '')
		{
			packetbytes.splice(packetbytes.length - 1, 1);
		}

		if(packetbytes.length > 0)
		{
			self.packets.push(new Packet(packetnum, packetopt, packetbytes));
		}
		else
		{
			console.log('WPA skipping empty packet')
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
		self.Log(packet.bytesToString(), self.colors.GRAY, false, true);
		self.LogH('</a>');

		self.LogBuffer(true);
		self.LogNewLine();
	});

	// Find the bytecount of the packet with the most bytes
	var maxbits = 0;
	var largestpacket = null;

	self.Loop(function(packet)
	{
		if(packet.bytes.length > maxbits)
		{
			maxbits = packet.length;
		}
	});

	self.Log('--Packet null bytes relative to largest packet (' + maxbits + ' bytes)--', self.colors.BLUE, true);
	self.Loop(function(packet)
	{
		var nullfound = false;

		self.LogI('Packet #' + packet.num, self.colors.WIST, true, false, { asd: packet.num });

		self.LogH('<a href = "#" class = "interactivebits">');

		for(var i = 0; i < maxbits; i++)
		{
			if(typeof packet.bytes[i] === 'undefined')
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
				self.Log(packet.bytes[i] + ' ', self.colors.GRAY, false, true);
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
			var strbytes = packet.bytes.join(' ');

			var toappend = '<tr>';
			toappend += '<td>' + packet.num + '</td>';
			toappend += '<td><input type="button" value="Open" class="wpa-packet-opt"></td>';
			toappend += '<td><textarea class="wpa-packet-textarea">' + strbytes + '</textarea></td>';
			toappend += '</tr>';

			$('#wpa-packet-table').append(toappend);

			console.log(packet);
		}
	}

	this.packets = packets;
}

Wpa.prototype.DemoLoadPackets = function()
{
	var packets = JSON.parse('[{"num":"1","opt":{},"bytes":["52","52","A0","41","FF","5D","46","E2","7F","2A","64","4D","7B","99","C4","75","EE","37","3E","9F","53","01","00","00","A8","00","00","00","00","00","02","00","01","00","00","00","00","00","00","00","40","00","00","00","3D","7D","3F","10","3D","7D","3F","10","03","00","0A","16","14","00","91","01","00","00","29","00","60","78","F1","56","00","00","00","00","01","00","00","00","01","00","00","00","01","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","40","00","00","00","3D","7D","3F","10","3D","7D","3F","10","03","00","0A","16","14","00","96","01","00","00","29","00"]},{"num":"2","opt":{},"bytes":["52","52","A0","41","FF","5D","46","E2","7F","2A","64","4D","7B","99","C4","75","62","88","3E","9F","53","01","00","00","A8","00","00","00","00","00","02","00","01","00","00","00","00","00","00","00","40","00","00","00","3D","7D","3F","10","3D","7D","3F","10","03","00","0A","16","14","00","91","01","00","00","29","00","74","78","F1","56","00","00","00","00","01","00","00","00","01","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","5E","89","4E","37","00","00","00","00","00","00","00","00","40","00","00","00","3D","7D","3F","10","3D","7D","3F","10","03","00","0A","16","14","00","96","01","00","00","29","00","74","78","F1","56","00","00","00","00","00","01","00","00","81","00","00","00","03","00","00","00","EE","21","EE","21","3D","7D","3F","10","00","00","00","00","00","00","00","00","1D","EA","5A","3A"]},{"num":"3","opt":{},"bytes":["52","52","A0","41","FF","5D","46","E2","7F","2A","64","4D","7B","99","C4","75","BA","DC","3E","9F","53","01","00","00","E8","00","00","00","00","00","03","00","01","00","00","00","00","00","00","00","40","00","00","00","3D","7D","3F","10","3D","7D","3F","10","03","00","0A","16","14","00","91","01","00","00","29","00","8A","78","F1","56","00","00","00","00","FB","01","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","0D","B5","CE","3A","00","00","00","00","00","00","00","00","40","00","00","00","3D","7D","3F","10","3D","7D","3F","10","03","00","0A","16","14","00","91","01","00","00","29","00","8A","78","F1","56","00","00","00","00","01","00","00","00","01","00","00","00","01","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","40","00","00","00","3D","7D","3F","10","3D","7D","3F","10","03","00","0A","16","14","00","96","01","00","00","29","00","8A","78","F1","56","00","00","00","00","00","01","00","00","8C","00","00","00","04","00","00","00","EE","21","EE","21","3D","7D","3F","10","00","00","00","00","00","00","00","00","00","00","00","00"]},{"num":"4","opt":{},"bytes":["52","52","A0","41","FF","5D","46","E2","7F","2A","64","4D","7B","99","C4","75","FD","39","3F","9F","53","01","00","00","A8","00","00","00","00","00","02","00","01","00","00","00","00","00","00","00","40","00","00","00","3D","7D","3F","10","3D","7D","3F","10","03","00","0A","16","14","00","91","01","00","00","29","00","A2","78","F1","56","00","00","00","00","01","00","00","00","01","00","00","00","00","00","00","00","00","00","00","00","00","00","00","00","6C","3E","31","3A","00","00","00","00","00","00","00","00","40","00","00","00","3D","7D","3F","10","3D","7D","3F","10","03","00","0A","16","14","00","96","01","00","00","29","00","A2","78","F1","56","00","00","00","00","00","01","00","00","7E","00","00","00","05","00","00","00","EE","21","EE","21","3D","7D","3F","10","00","00","00","00","00","00","00","00","75","D5","AA","39"]}]');

	$('#wpa-packet-table tr:not(:first-child)').remove();

	for(var key in packets)
	{
		if(packets.hasOwnProperty(key))
		{
			var packet = packets[key];
			var strbytes = packet.bytes.join(' ');

			var toappend = '<tr>';
			toappend += '<td>' + packet.num + '</td>';
			toappend += '<td><input type="button" value="Open" class="wpa-packet-opt"></td>';
			toappend += '<td><textarea class="wpa-packet-textarea">' + strbytes + '</textarea></td>';
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

Wpa.prototype.LogI = function(str, color, newline, buffered, hoverinfo)
{
	var self = this;
	color = color || 'black';
	buffered = buffered || false;

	if(newline)
		var nl = '<br/><br/>';
	else
		var nl = '';

	hoverinfo = JSON.stringify(hoverinfo).replace(/"/g, "&quot;").replace(/'/g, '&apos;').replace(/&/g, '&amp;');

	if(buffered)
	{
		this.logbuffer += '<span class = "hoverinfo" data-wpa = "' + hoverinfo + '" style = "color: ' + color + ';">' + str + '</span>' + nl;
	}
	else
	{
		this.$log.append('<span class = "hoverinfo" data-wpa = "' + hoverinfo + '" style = "color: ' + color + ';">' + str + '</span>' + nl);
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

Wpa.prototype.ParseWpa = function(wpa)
{
	return JSON.parse(wpa.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&'));
}