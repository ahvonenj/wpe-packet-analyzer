function Packet(num, opt, bytes, bytesdec)
{
	var self = this;

	this.num = (typeof num === 'undefined') ? null : num;
	this.opt = opt || {};
	this.bytes = bytes || [];
	this.bytesdec = bytesdec || [];

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