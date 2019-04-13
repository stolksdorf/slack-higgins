const Slack = require('pico-slack');


const hopping = [
	'blocking','bopping','chocking','chopping','clocking',
	'clopping','cocking','copping','crocking','cropping',
	'defrocking','destocking','docking','dopping','dropping',
	'estopping','flocking','flopping','frocking','grokking',
	'Hocking','knocking','locking','lopping','mocking',
	'mopping','nocking','plopping','pocking','popping',
	'propping','restocking','rocking','rollocking','shocking',
	'shopping','slocking','slopping','smocking','socking',
	'sopping','stocking','stopping','stropping','swapping',
	'swopping','topping','twocking','unblocking','undocking',
	'unfrocking','unlocking','unstopping','whopping','eavesdropping'
];

const on = [
	'aeon','baton','baun','beyond','blond','bon',
	'bonne','braun','brawn','bron','bronze','chian',
	'chiffon','chron','con','craun','cron','dawn',
	'denouement','don','draughn','drawn','faughn',
	'faune','fawn','flawn','fond','forgone','frohn',
	'gawne','gnawn','gon','gone','hon','pecan',
	'personne','phon','pon','pond','pron','respond',
	'salon','spawn','spon','swan','thereupon','tron',
	'upon','wilsonian','won','yuan'
]

const rand = (arr)=>arr[Math.floor(Math.random()*arr.length)];


Slack.onMessage((msg)=>{
	if(msg.channel == 'overwatch' && Slack.msgHas(msg.text, ['hopping on', 'hop on'])){
		Slack.sendAs('chrisbot', 'chris', 'overwatch', `${rand(hopping)} ${rand(on)}!`);
	}
})