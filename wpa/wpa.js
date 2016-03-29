'use strict';

Array.prototype.allValuesSame = function() 
{
    for(var i = 1; i < this.length; i++)
    {
        if(this[i] !== this[0])
            return false;
    }

    return true;
}

Array.prototype.getUnique = function()
{
   var u = {}
   var a = [];

   for(var i = 0, l = this.length; i < l; ++i)
   {
      if(u.hasOwnProperty(this[i])) 
      {
         continue;
      }

      a.push(this[i]);
      u[this[i]] = 1;
   }

   return a;
}

Array.prototype.allUnique = function()
{
	if(this.getUnique().length === this.length)
		return true;
	else
		return false;
}

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

		var packetbytesdec = [];

		for(var i = 0; i < packetbytes.length; i++)
		{
			packetbytesdec[i] = parseInt(packetbytes[i], 16);
		}

		if(packetbytes[packetbytes.length - 1] === '')
		{
			packetbytes.splice(packetbytes.length - 1, 1);
		}

		if(packetbytes.length > 0)
		{
			self.packets.push(new Packet(packetnum, packetopt, packetbytes, packetbytesdec));
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

	// Clear and output log header
	self.ClearLog();
	self.Log('Analysis result', ['resultheader'], true);


	// Log each packet normally at first
	self.Log('--Analyzed packets--', ['sectionheader'], true);

	(function()
	{
		self.Loop(function(packet)
		{
			self.Log('Packet #' + packet.num + ' (' + packet.length + ' bytes)', ['packetheader'], true);

			var bytestolog = [];

			for(var i = 0; i < packet.bytes.length; i++)
			{
				bytestolog.push(packet.bytes[i]);
			}

			self.LogBytes(bytestolog, ['hoverbytes']);

			self.LogNewLine();
		});
	})();


	// Find the bytecount of the packet with the most and lest bytes
	(function()
	{
		var maxbytes = 0;
		var largestpacket = null;

		self.Loop(function(packet)
		{
			if(packet.bytes.length > maxbytes)
			{
				maxbytes = packet.length;
			}
		});

		self.analysismeta.maxbytes = maxbytes;


		var minbytes = 99999999999;

		self.Loop(function(packet)
		{
			if(packet.bytes.length < minbytes)
			{
				minbytes = packet.length;
			}
		});

		self.analysismeta.minbytes = minbytes;
	})();
	

	// Log packets while showing null bytes relative to largest packet
	self.Log('--Packet null bytes relative to largest packet (' + this.analysismeta.minbytes + '-' + this.analysismeta.maxbytes + ' bytes)--', ['sectionheader'], true);

	(function()
	{
		self.Loop(function(packet)
		{
			var nullfound = false;

			self.Log('Packet #' + packet.num + ' (' + packet.length + ' bytes)', ['packetheader'], true);

			var bytestolog = [];

			for(var i = 0; i < self.analysismeta.maxbytes; i++)
			{
				if(typeof packet.bytes[i] === 'undefined')
				{
					if(!nullfound)
					{
						self.LogBytes(bytestolog, ['copyablebytes', 'hoverbytes']);
						bytestolog = [];
					}

					bytestolog.push('..');

					nullfound = true;
				}
				else
				{
					bytestolog.push(packet.bytes[i]);
				}
			}

			if(nullfound)
			{
				self.LogBytes(bytestolog, ['nullbytes']);
			}
			else
			{
				self.LogBytes(bytestolog, ['copyablebytes', 'hoverbytes']);
			}
			
			self.LogNewLine();
		});
	})();


	// Log differing packets (THIS IS NOT OPTIMAL, BUT IT WILL DO)
	self.Log('--Offsets that are different in every analyzed packet (using smallest packet as a base)--', ['sectionheader'], true);

	(function()
	{
		var bytestolog = [];
		var difidxs = [];

		for(var i = 0; i < self.analysismeta.minbytes; i++)
		{
			var different = false;
			var bytesdec = [];

			self.Loop(function(packet)
			{
				bytesdec.push(packet.bytesdec[i]);
			});

			if(bytesdec.allUnique())
			{
				difidxs.push(i);
			}
		}

		self.Loop(function(packet)
		{
			self.Log('Packet #' + packet.num + ' (' + packet.length + ' bytes)', ['packetheader'], true);

			var bytes = packet.bytes;

			for(var i = 0; i < self.analysismeta.minbytes; i++)
			{
				if(difidxs.indexOf(i) > -1)
				{
					self.LogByte(bytes[i], ['dbggreen']);
				}
				else
				{
					self.LogByte(bytes[i]);
				}
			}

			self.LogNewLine();
		});
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
			callback(self.packets[key], ll);
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

Wpa.prototype.Log = function(str, classlist, newline)
{
	var self = this;
	var classstring = ' ' + classlist.join(' ');
	var ln = (newline) ? '<br/><br/>' : '';

	this.$log.append('<span class = "text' + classstring + '">' + str + '</span>' + ln);
}

Wpa.prototype.CLog = function(text)
{
	$('#wpa-console').val(text);
}

Wpa.prototype.CLear = function()
{
	$('#wpa-console').val('');
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

Wpa.prototype.CustomParseJSON = function(wpa)
{
	if(typeof wpa === 'undefined')
		return {};
	else
		return JSON.parse(wpa.replace(/&quot;/g, '"').replace(/&apos;/g, "'"));
}

Wpa.prototype.CustomStringifyJSON = function(obj)
{
	if(typeof obj === 'undefined')
		return '';
	else
		return JSON.stringify(obj).replace(/"/g, "&quot;").replace(/'/g, '&apos;');
}

Wpa.prototype.LogByte = function(byte, classlist, buffered)
{
	var self = this;

	var buffered = buffered || false;
	var classstring = (classlist && classlist.length > 0) ? ' ' + classlist.join(' ') : '';
	var empty = '<span class = "empty">&nbsp;</span>';
	empty = '';

	if(buffered)
	{
		this.logbuffer += '<span class = "byte' + classstring + '">' + byte + '</span> ' + empty;
	}
	else
	{
		this.$log.append('<span class = "byte' + classstring + '">' + byte + '</span> ' + empty);
	}
}

Wpa.prototype.LogBytes = function(bytes, groupclasslist, groupdata)
{
	var self = this;

	var classstring = (groupclasslist && groupclasslist.length > 0) ? ' ' + groupclasslist.join(' ') : '';
	groupdata = this.CustomStringifyJSON(groupdata);

	this.logbuffer += '<span class = "bytegroup' + classstring + '" data-wpa = "' + groupdata + '">';

	for(var key in bytes)
	{
		if(bytes.hasOwnProperty(key))
		{
			var byte = bytes[key];
			self.LogByte(byte, null, true);
		}
	}

	this.logbuffer += '</span>';

	this.OutputBuffer(true);
}