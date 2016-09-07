
module.exports = {
	url : '/test',
	handle : function(msg, info, reply, error){
		reply(`I worked ${msg} ${JSON.stringify(info, null, '  ')}`);
	}
}