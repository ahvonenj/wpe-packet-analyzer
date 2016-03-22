$(document).on('click', '#newpacket', function()
{
	var $wpa_packet_table = $('#wpa-packet-table');
	var rowcount = $wpa_packet_table.find('tr').length;
	var $clone = $wpa_packet_table.find('tr').eq(1).clone();

	$clone.find('td:first-child').text(rowcount);
	$clone.find('textarea').val('');
	$wpa_packet_table.append($clone);
});

$(document).on('click', '#analyzepackets', function()
{
	wpa.GetPacketsAndAnalyze();
});

$(document).on('click', '#savepackets', function()
{
	wpa.SavePackets();
});

$(document).on('click', '#loadpackets', function()
{
	$('.wpa-hider').fadeIn();
	$('#loadpacketsmodal').fadeIn();
});

$(document).on('click', '.wpa-load-packet-btn', function()
{
	$('.wpa-hider').fadeIn();
	$('#loadpacketsmodal').fadeIn();

	wpa.LoadPackets($(this).data('load'));
});

$(document).on('click', '.wpa-modal-close', function()
{
	$('.wpa-hider').fadeOut();
	$(this).parent('div').parent('div.wpa-modal').fadeOut();
});

$(document).on('click', '#wpa-packet-table td:first-child', function()
{
	if($('#wpa-packet-table tr').length - 1 <= 3)
	{
		return;
	}

	var $this = $(this);
	$this.parent('tr').remove();

	var i = 1;

	$('#wpa-packet-table tr').each(function()
	{
		if($(this).children('td').length > 0)
		{
			$(this).children('td').eq(0).text(i);
			i++;
		}
	});
});

$(document).on('mouseenter', '#wpa-packet-table td:first-child', function()
{
	var $this = $(this);

	$this.data('num', $this.text());
	$this.text('X');
});

$(document).on('mouseleave', '#wpa-packet-table td:first-child', function()
{
	var $this = $(this);

	$this.text($this.data('num'));
});
