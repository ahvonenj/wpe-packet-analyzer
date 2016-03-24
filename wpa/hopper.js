var Hopper = 
{
	Hop: function(e, text)
	{
		var $div = $('<div/>');

		$div.css('position', 'absolute');
		$div.css('background-color', 'white');
		$div.css('border', '1px solid black');
		$div.css('width', 'auto');
		$div.css('height', '35px');
		$div.css('padding-left', '5px');
		$div.css('padding-right', '5px');
		$div.css('line-height', '35px');
		$div.css('display', 'none');
		$div.css('top', e.clientY - $div.height() - 5);

		$div.text(text);

		$('body').append($div);
		$div.css('left', e.clientX - ($div.width() / 2));
		$div.show();

		$div.fadeOut('slow', function() { $div.remove(); });
	},

	HoverOn: function(e, text, offset)
	{
		offset = offset || { x: 0, y: 0 };

		var $div = $('<div/>');

		$div.css('position', 'absolute');
		$div.css('background-color', 'white');
		$div.css('border', '1px solid black');
		$div.css('width', 'auto');
		$div.css('height', '35px');
		$div.css('padding-left', '5px');
		$div.css('padding-right', '5px');
		$div.css('line-height', '35px');
		$div.css('display', 'none');
		$div.css('top', e.clientY - $div.height() - 15 + offset.y);

		$div.text(text);

		$('body').append($div);
		$div.css('left', e.clientX - ($div.width() / 2) + offset.x);
		$div.show();

		return $div;
	},

	HoverOut: function($element, instant)
	{
		instant = instant || false;

		if(instant)
		{
			$element.remove();
		}
		else
		{
			$element.fadeOut('slow', function() { $element.remove(); });
		}
	}
}