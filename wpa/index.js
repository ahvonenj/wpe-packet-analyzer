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

$(document).on('click', '#deletepackets', function()
{
	var r = confirm("Delete ALL packets?");

	if(r)
	{
		wpa.DeletePackets();
	}
});

$(document).on('click', '#help', function()
{
	alert('- Hold C to copy a group of bytes (which are hovered over with mouse) to clipboard\n' + 
		'- Hold Z and click on bytes to mark them as important\n' +
		'- Hold X and click on bytes to mark them as not important\n' +
		'- Hold A while hovering over a byte to see its decimal form\n' +
		'- NOTE: Offsets start from 0!')
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

$(document).on('click', '.byte', function(e)
{
	if(keysdown.indexOf('z') > -1)
 	{
		$(this).toggleClass('markedbyte');
		$(this).removeClass('obsoletebyte');
	}
	else if(keysdown.indexOf('x') > -1)
	{
		$(this).toggleClass('obsoletebyte');
		$(this).removeClass('markedbyte');
	}
});

$(document).on('click', '.copyablebytes, .hoverbytes', function(e)
{
	if(keysdown.indexOf('c') > -1)
 	{
		copyTextToClipboard($(this).children('span').text());
		Hopper.Hop(e, 'Copied!');
	}
});

$(document).on('mouseenter', '.offsethover', function(e)
{
	var $data = $(this).data('wpa');

	if(typeof $data === 'undefined' || $data === null)
		return;

	var data = $data;

	if(typeof data.offset === 'undefined')
	{
		var $e = Hopper.HoverOn(e, 'Offset: ' + data.begin + ' - ' + data.end);
	}
	else
	{
		var $e = Hopper.HoverOn(e, 'Offset: ' + data.offset);
	}

	$(this).on('mouseleave', function()
	{
		Hopper.HoverOut($e);
	});
});

var keysdown = [];

$(document).on('keydown', function(e)
{
    // Evaluate keycode into a lowercase human-readable letter
    var key = String.fromCharCode(e.which).toLowerCase();

    if(keysdown.indexOf(key) === -1)
    {
    	keysdown.push(key);
    }
});

$(document).on('keyup', function(e)
{
    // Evaluate keycode into a lowercase human-readable letter
    var key = String.fromCharCode(e.which).toLowerCase();

    keysdown.splice(keysdown.indexOf(key), 1);
});

 $(document).on('mouseenter', '#wpa-analyze span.byte', function(e)
 {
 	if(keysdown.indexOf('a') > -1)
 	{
	 	var hex = $(this).text();
	 	var dec = parseInt(hex, 16);

		var $e = Hopper.HoverOn(e, hex + ' => ' + dec, { x: 0, y: -45});

		wpa.CLog('(Hex) ' + hex + ' => (Dec) ' + dec);

		$(this).on('mouseleave', function()
		{
			Hopper.HoverOut($e, true);
		});
	}
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

 setInterval(function()
 {
 	console.log(keysdown)
 }, 500)

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