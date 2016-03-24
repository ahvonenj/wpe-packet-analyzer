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
	this.analysismeta = {};

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

	this.analysismeta = {};

	if(this.packets.length === 0)
	{
		throw new Error('WPA has no packets to analyze!');
		return;
	}

	self.ClearLog();

	self.Log('Analysis result', null, true, false, false);


	// Log each packet normally at first
	self.Log('--Analyzed packets--', self.colors.BLUE, true);

	self.Loop(function(packet)
	{
		self.Log('Packet #' + packet.num + ' (' + packet.length + ' bytes)', self.colors.WIST, true, false, false);

		self.LogH('<a href = "#" class = "copyablebytes">');

		for(var i = 0; i < packet.bytes.length; i++)
		{
			self.Log(packet.bytes[i] + ' ', self.colors.GRAY, false, true);
		}

		self.LogH('</a>');

		self.OutputBuffer(true);
		self.LogNewLine();
	});

	// Find the bytecount of the packet with the most and lest bytes
	var maxbytes = 0;
	var largestpacket = null;

	self.Loop(function(packet)
	{
		if(packet.bytes.length > maxbytes)
		{
			maxbytes = packet.length;
		}
	});

	this.analysismeta.maxbytes = maxbytes;


	var minbytes = 99999999999;

	self.Loop(function(packet)
	{
		if(packet.bytes.length < minbytes)
		{
			minbytes = packet.length;
		}
	});

	this.analysismeta.minbytes = minbytes;


	// Log packets while showing null bytes relative to largest packet
	self.Log('--Packet null bytes relative to largest packet (' + this.analysismeta.minbytes + '-' + this.analysismeta.maxbytes + ' bytes)--', self.colors.BLUE, true, false, false);
	self.Loop(function(packet)
	{
		var nullfound = false;

		self.LogD('Packet #' + packet.num+ ' (' + packet.length + ' bytes)', self.colors.WIST, true, false, 'hoverinfo', { asd: packet.num }, false, false);

		self.LogH('<a href = "#" class = "copyablebytes">');

		for(var i = 0; i < self.analysismeta.maxbytes; i++)
		{
			if(typeof packet.bytes[i] === 'undefined')
			{
				if(!nullfound)
				{
					self.LogH('</a>');
					self.OutputBuffer(true);
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
			self.OutputBuffer(true);
		}
		
		self.LogNewLine();
	});


	// Log differing packets
	self.Log('--Offsets that are different in every analyzed packet (using smaller packet as a base)--', self.colors.BLUE, true, false, false);

	(function()
	{
		var still_different = false;
		var different = false;
		var was_different = false;
		var delta_begin = null;
		var delta_end = null;

		for(var key in self.packets)
		{
			if(self.packets.hasOwnProperty(key))
			{
				self.LogD('Packet #' + self.packets[key].num, self.colors.WIST, true, false, 'hoverinfo', { asd: self.packets[key].num }, false, false);

				still_different = false;
				different = false;
				was_different = false;
				delta_begin = null;
				delta_end = null;

				for(var i = 0; i < self.analysismeta.minbytes; i++)
				{
					console.log(delta_begin)
					var bit = self.packets[key].bytes[i];

					if(typeof bit === 'undefined')
					{
						self.Log('.. ', self.colors.RED);
					}
					else
					{
						different = false;

						var a = [];

						for(var key2 in self.packets)
						{
							if(self.packets.hasOwnProperty(key2))
							{
								var bit2 = self.packets[key2].bytes[i];

								if(bit === bit2)
								{
									different = false;
								}
								else
								{
									different = true;
									break;
								}
							}
						}

						if(different)
						{
							if(!was_different)
							{
								delta_begin = i;

								self.DataInjection('<a href = "#" class = "copyablebytes hoverbytes" data-wpa = "">');
							}

							self.Log(bit + ' ', self.colors.GREEN, false, true);
							was_different = true;
						}
						else
						{
							if(was_different)
							{
								delta_end = i;
								self.DataInjection('</a>', { begin: delta_begin, end: delta_end });
							}

							was_different = false;

							self.Log(bit + ' ', self.colors.GRAY, false, true);
							self.OutputBuffer(true);
						}
					}
				}

				self.LogNewLine();
			}
		}
	})();
}

Wpa.prototype.Loop = function(callback)
{
	var self = this;

	var ll = 0;

	for(var key in self.packets)
	{
		if(self.packets.hasOwnProperty(key))
		{
			var packet = self.packets[key];
			callback(packet, ll);
			ll++;
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

Wpa.prototype.Log = function(str, color, newline, buffered, isbyte)
{
	var self = this;
	color = color || 'black';
	buffered = buffered || false;

	if(typeof isbyte === 'undefined')
		isbyte = true;

	if(newline)
		var nl = '<br/><br/>';
	else
		var nl = '';

	if(isbyte)
		var b = 'byte';
	else
		var b = '';

	if(buffered || self.datainjectionstate === 'waiting')
	{
		this.logbuffer += '<span class = "' + b + '" style = "color: ' + color + ';">' + str + '</span>' + nl;
	}
	else
	{
		this.$log.append('<span class = "' + b + '" style = "color: ' + color + ';">' + str + '</span>' + nl);
	}
}

Wpa.prototype.LogD = function(str, color, newline, buffered, clss, data, isbyte)
{
	var self = this;
	color = color || 'black';
	buffered = buffered || false;
	clss = clss || '';

	if(typeof isbyte === 'undefined')
		isbyte = true;

	if(newline)
		var nl = '<br/><br/>';
	else
		var nl = '';

	if(isbyte)
		var b = 'byte';
	else
		var b = '';

	data = self.StringifyWpa(data);

	if(buffered || self.datainjectionstate === 'waiting')
	{
		this.logbuffer += '<span class = "' + b + ' ' + clss + '" data-wpa = "' + data + '" style = "color: ' + color + ';">' + str + '</span>' + nl;
	}
	else
	{
		this.$log.append('<span class = "' + b + ' ' + clss + '" data-wpa = "' + data + '" style = "color: ' + color + ';">' + str + '</span>' + nl);
	}
}

Wpa.prototype.LogH = function(html)
{
	var self = this;
	this.logbuffer += html;
}

Wpa.prototype.dataelement = '';
Wpa.prototype.datainjectionstate = 'ready';
Wpa.prototype.datainjectionidx = null,

Wpa.prototype.DataInjection = function(d, obj)
{
	var self = this;

	if(self.datainjectionstate === 'ready')
	{
		self.dataelement = d;
		self.datainjectionidx = self.logbuffer.length;
		self.datainjectionstate = 'waiting';
	}
	else if(self.datainjectionstate === 'waiting')
	{
		self.dataelement = $(self.dataelement).attr('data-wpa', self.StringifyWpa(obj)).prop('outerHTML').replace(/>(.*)/gi, '') + '>';
		self.logbuffer =  [self.logbuffer.slice(0, self.datainjectionidx), self.dataelement, self.logbuffer.slice(self.datainjectionidx), d].join('');
		self.dataelement = '';

		self.datainjectionstate = 'ready';
	}
}

Wpa.prototype.OutputBuffer = function(clearbuffer)
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
	if(typeof wpa === 'undefined')
		return {};
	else
		return JSON.parse(wpa.replace(/&quot;/g, '"').replace(/&apos;/g, "'"));
}

Wpa.prototype.StringifyWpa = function(obj)
{
	console.log(obj)
	return JSON.stringify(obj).replace(/"/g, "&quot;").replace(/'/g, '&apos;');
}