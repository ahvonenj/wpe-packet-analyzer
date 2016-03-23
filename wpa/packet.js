function Packet(num, opt, bits)
{
	var self = this;

	this.num = (typeof num === 'undefined') ? null : num;
	this.opt = opt || {};
	this.bits = bits || [];

	Object.defineProperty(this, 'length', 
	{
	    get: function () 
	    {
	    	return this.bits.length;
	    }
	});
}

Packet.prototype.bitsToString = function()
{
	return this.bits.join(' ');
}