$(document).ready(function()
{
	$(document).on('click', '#newpacket', function()
	{
		var $wpa_packet_table = $('#wpa-packet-table');
		var rowcount = $wpa_packet_table.find('tr').length;

		$wpa_packet_table.append('<tr><td>' + rowcount + '</td><td><textarea class = "wpa-packet-textarea"></textarea></td>');
	});

	$('#wpa-packet-table').on('mouseover', 'td', function()
	{
		var $this = $(this);

		console.log('asd');

		$this.data('num', $this.text());
		$this.text('X');
	});

	$('#wpa-packet-table').on('mouseout', 'td', function()
	{
		var $this = $(this);

		console.log('dsa');

		$this.text($this.data('num'));
	});
});