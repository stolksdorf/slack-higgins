const _ = require('lodash');
const fetch = require('node-fetch');
const Slack = require('pico-slack');

const getWords = async (constraint, word, topic) => {
  const response = await fetch('https://api.datamuse.com/words?' + constraint + word +'&qe=sp&md=p&max=1')
  const data = await response.json();
  //Slack.log("get words:", data);
  return data[0].word;
}

const makePoem = async (text)=>{
  const clean = _.split(text, ' ');
  const trigger = _.last(clean);

  const words = await Promise.all([
    getWords('rel_syn=', trigger),
    getWords('rel_gen=', trigger),
    getWords('rel_rhy=', trigger)
  ]);
  const rhymes = await Promise.all([
    getWords('rel_rhy=', words[1])
  ]);
  const poem = [trigger, 'is as the', words[0], 'or the', words[1], '\n', 'even', words[2], 'cannot compare to the', rhymes[0]].join(' ');
  Slack.log("make poem:", poem);
  return poem;
};

const response = (msg)=>{
  const text = msg.text
  if(!Slack.msgHas(text, 'bardbot', 'poem')) return;
  
  //const poem = getWords('rel_rhy', rose)
  //let poem = makePoem(msg.text)
  Slack.sendAs('BardBot', ':rose:', makePoem(text));
  Slack.log(text, makePoem(text));
}

try{
  // Code that might fail
  Slack.onMessage(response);
}catch(err){
  // Code that will run when it fails
  Slack.error('you done goofed');
}

