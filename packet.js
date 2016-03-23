function Packet(num, opt, bytes)
{
	var self = this;

	this.num = (typeof num === 'undefined') ? null : num;
	this.opt = opt || {};
	this.bytes = bytes || [];

	Object.defineProperty(this, 'length', 
	{
	    get: function () 
	    {
	    	return this.bytes.length;
	    }
	});
}

Packet.prototype.bytesToString = function()
{
	return this.bytes.join(' ');
}