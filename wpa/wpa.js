function Wpa($packet_table)
{
	if(typeof $packet_table === 'undefined' || $($packet_table).length === 0)
	{
		throw new Error('WPA could not find a packet table!');
		return;
	}

	this.$packet_table = $packet_table;

	this.packets = [];
}

Wpa.prototype.GetPacketsFromDOM = function()
{
	var self = this;

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

		self.packets.push(
		{
			num: packetnum,
			opt: packetopt,
			bits: packetbits
		});
	});
}