const path = require('path');
const fs = require('fs');
const datefns = require('date-fns');

const historyExportPath = "C:/Users/scott/Desktop/coolsville_export";
const dest = "C:/Users/scott/Desktop/coolsville_parsed"

const ignored_channels = ['diagnostics'];

const channels = fs.readdirSync(historyExportPath).filter((name)=>!path.extname(name))


const parseChannel = (channelName)=>{
	if(ignored_channels.includes(channelName)) return;
	console.time(`Finished ${channelName}`);

	const filenames = fs.readdirSync(path.join(historyExportPath, channelName)).sort();


	let res = []

	const parseFile = (filename)=>{
		const date = path.basename(filename, '.json');
		const contents = fs.readFileSync(path.join(historyExportPath, channelName, filename));

		let json;
		try{
			json = JSON.parse(contents)
		}catch(err){
			return;
		}
		json.map((entry)=>{
			if(!entry.user_profile || !entry.text) return;
			res.push({
				ts : entry.ts,
				//date : datefns.format(new Date(entry.ts * 1000), "YYYY-MM-DD H:mm:ss"),
				user : entry.user_profile.name,
				//channel : channelName,
				msg : entry.text
			})
		});
	}
	filenames.map(parseFile);
	fs.writeFileSync(path.join(dest, `${channelName}.json`), JSON.stringify(res));
	console.timeEnd(`Finished ${channelName}`);
};


channels.map(parseChannel)
