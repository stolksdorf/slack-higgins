const Slack = require('pico-slack');
const {format} = require('date-fns');

Object.defineProperty(Object.prototype, 'map', {
	enumerable: false,
	value: function (fn){ return Object.keys(this).map((key,idx,src)=>fn(this[key],key,idx,src))}
});
Object.defineProperty(Object.prototype, 'reduce', {
	enumerable: false,
	value: function(fn, init){ return Object.keys(this).reduce((a,key,idx,src)=>fn(a,this[key],key,idx,src),init);}
});

// https://api.slack.com/methods/files.upload


const getScottsDMid = ()=>{
	//return 'D1C1Y883V';

	//return 'D1KCY2U7M';


	return Slack.dms.reduce((dmID, name, id)=>{
		if(name == 'scott') return id;
		return dmID;
	}, null);
}


const createTodoPost = async ()=>{
	const date = format(Date.now(), 'ddd, Do MMM')
	return Slack.api('files.upload', {
		channels : getScottsDMid(),
		content :`- [] `,
		filetype : 'post',
		filename : `Todo - ${date}.md`,
		title : `Todo - ${date}`

	})
}

Slack.onMessage((msg)=>{
	if(msg.isDirect && msg.text == 'todo'){
		createTodoPost()
			.then(()=>Slack.msg(msg.channel, "Done!"));
	}


});