const _ = require('lodash');
const fetch = require('node-fetch');
const Slack = require('pico-slack');

const getWords = async (constraint, word, topic) => {
  const response = await fetch('https://api.datamuse.com/words?' + constraint + word +'&qe=sp&md=p&max=1')
  const data = await response.json();

  console.log("get words:", data);
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
   // console.log(words, rhymes);
  const poem = [trigger, 'is as the', words[0], 'or the', words[1], '\n', 'even', words[2], 'cannot compare to the', rhymes[0]].join(' ');
   // console.log("make poem:", poem);
  return poem;
};

const response = async (msg)=>{
  if(!Slack.has(msg.text, 'bardbot', 'poem')) return;

  const poem = await makePoem(msg.text);
  Slack.sendAs('BardBot', ':rose:', msg.channel, poem);
  // console.log(msg.text, poem, "response goes here");
}

try{
  // Code that might fail
  Slack.onMessage(response);
  // console.log("tester")

}catch(err){
   // Code that will run when it fails
  Slack.error('you done goofed');
}
//

// Slack.onMessage((msg)=>{
//   Slack.send(msg.channel, 'hey chris');
// })

//todo
//plural handling
//make makePoem give a poem or false
