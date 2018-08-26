
module.exports = {
	id     : 'test',
	handle : function(msg, info, reply, error){
		reply('*I worked!* _' + msg + '_\n```' + JSON.stringify(info, null, '  ') + '```');
	}
};