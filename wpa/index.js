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
	refreshSavedPackets();
});

$(document).on('click', '#loadpackets', function()
{
	$('.wpa-hider').fadeIn();
	$('#loadpacketsmodal').fadeIn();
});

$(document).on('click', '.wpa-load-packet-btn', function()
{
	$('.wpa-hider').fadeOut();
	$('#loadpacketsmodal').fadeOut();

	wpa.LoadPackets($(this).data('load'));
});

$(document).on('click', '.wpa-delete-packet-btn', function()
{
	localStorage.removeItem($(this).data('delete'));
	refreshSavedPackets();
});

$(document).on('click', '.wpa-modal-close', function()
{
	$('.wpa-hider').fadeOut();
	$(this).parent('div').parent('div.wpa-modal').fadeOut();
});

$(document).on('click', '.wpa-modal-refresh', function()
{
	refreshSavedPackets();
});

$(document).on('click', '#wpa-packet-table td:first-child', function()
{
	if($('#wpa-packet-table tr:not(:first-child)').length - 1 < 2)
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

$(document).on('click', '.interactivebits', function(e)
{
	copyTextToClipboard($(this).children('span').text());
	Hopper.Hop(e, 'Copied!');
});

function refreshSavedPackets()
{
	$('#wpa-saved-packets tr:not(:first-child)').remove();

	for(i = 0; i < localStorage.length; i++)
	{
		var key = localStorage.key(i);
		var val = localStorage.getItem(key);

		if(key.substring(0, 4).indexOf('wpa-') > -1)
		{
			key = key.substring(4, key.length);
			$('#wpa-saved-packets').append('<tr><td>' + key + '</td><td><input type = "button" value = "LOAD" ' + 
			'class = "wpa-load-packet-btn" data-load = "wpa-' + key + '"/></td><td><input type = "button" value = "DELETE" ' + 
			'class = "wpa-delete-packet-btn" data-delete = "wpa-' + key + '"/></td></tr>');
		}
		else
		{
			console.log('Skipping non-wpa item');
		}
	}
}

function copyTextToClipboard(text) 
{
	var textArea = document.createElement("textarea");

	//
	// *** This styling is an extra step which is likely not required. ***
	//
	// Why is it here? To ensure:
	// 1. the element is able to have focus and selection.
	// 2. if element was to flash render it has minimal visual impact.
	// 3. less flakyness with selection and copying which **might** occur if
	//    the textarea element is not visible.
	//
	// The likelihood is the element won't even render, not even a flash,
	// so some of these are just precautions. However in IE the element
	// is visible whilst the popup box asking the user for permission for
	// the web page to copy to the clipboard.
	//

	// Place in top-left corner of screen regardless of scroll position.
	textArea.style.position = 'fixed';
	textArea.style.top = 0;
	textArea.style.left = 0;

	// Ensure it has a small width and height. Setting to 1px / 1em
	// doesn't work as this gives a negative w/h on some browsers.
	textArea.style.width = '2em';
	textArea.style.height = '2em';

	// We don't need padding, reducing the size if it does flash render.
	textArea.style.padding = 0;

	// Clean up any borders.
	textArea.style.border = 'none';
	textArea.style.outline = 'none';
	textArea.style.boxShadow = 'none';

	// Avoid flash of white box if rendered for any reason.
	textArea.style.background = 'transparent';


	textArea.value = text;

	document.body.appendChild(textArea);

	textArea.select();

	try 
	{
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Copying text command was ' + msg);
	} 
	catch(err) 
	{
		console.log('Oops, unable to copy');
	}

	document.body.removeChild(textArea);
}