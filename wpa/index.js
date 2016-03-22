$(document).on('click', '#newpacket', function()
{
	var $wpa_packet_table = $('#wpa-packet-table');
	var rowcount = $wpa_packet_table.find('tr').length;

	$wpa_packet_table.append('<tr><td>' + rowcount + '</td><td><textarea class = "wpa-packet-textarea"></textarea></td>');
});