var _ = require('lodash');

module.exports = function(msg, info, reply, error) {
	if (!msg) {
		return error('Do you want ALL the type heads or something?? You gotta name the type head you want!');
	}

	var baseUri = 'http://jaredtyler.ca/mbti-heads.php';
	var queryParams = [];
	var isStressHead = false;

	if (_.includes(msg, 'stress') {
		isStressHead = true;
		queryParams.push('format=stress');
		msg = msg.replace('stress', '');
	}

	var type = msg.trim();
	queryParams.push('mbti=' + type);
	if (type.length != 4 || !type.match(/^[ie][ns][tf][jp]$/i)) {
		return error('Sadly, "' + type.toUpperCase() + '" is not actually a Myers-Briggs type...');
	}

	return reply({
		attachments: [
			{
				title : (isStressHead ? 'Stress' : 'Type') + ' Head for ' + type.toUpperCase(),
				title_link : 'http://16personalities.com/' + type.toLowerCase() + '-personality',
				image_url : baseUri + '?' + queryParams.join('&')
			}
		]
	});
};
