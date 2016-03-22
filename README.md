# wpe-packet-analyzer (WPA)

![](https://raw.githubusercontent.com/ahvonenj/wpe-packet-analyzer/master/wpe-bs.png)

When you have captured network packets with WPE and want to compare similar packets to find deltas and offsets, 
you would often have to fire up Microsoft Excel and get annoyed because:

A) It is hard to paste the packet data into excel (have to save the data into a text file first, to benefit from automatic column separation)  
B) Excel likes to fuck up the column widths and the is not enough space any way  
C) All the comparisons and analyzing must be done manually from scratch every time  
D) Analyzing more than 2 similar packets becomes unintuitive and time consuming

This simple little network packet bit analyzer tries to make analyzing packets captured with WPE a little bit easier and more automatic. 
wpe-packet-analyzer (WPA) automatically finds out packet bit deltas and offsets from given packets and pretty prints them out. 

**Later on, WPA will:**

A) Heuristically find out, if given packets seem to have `common blocks`, such as `time` or `id` bits at the beginning of the packet  
B) Help to convert hex bits to decimal and perhaps even back again if needed (ASCII presentation also a possibility, although usually not useful  
C) Assist with marking certain bits obsolete or socket-breaking  
D) Maybe accept WPE capture files and read input directly from them
E) Cure cancer and make data mining of software (read: games) not so painful and maybe even fun

**Definition of done:**  
If I am able to perform a simple filtered packet bitswap in under 5 minutes, then this tool has done its job.
