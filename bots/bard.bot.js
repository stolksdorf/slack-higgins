const Slack = require('pico-slack');
const _ = require('lodash');


// const getPoem = (text)=>{
//   return _.find('bardbot', (trigger)=>{

//   })
// }

const response = (msg)=>{
  if(!Slack.msgHas(msg.text, 'bardbot', 'poem')) return;

  // const poem = getPoem(msg.text)
  Slack.sendAs('BardBot', ':rose:', msg, msg.text);

  Slack.log(msg, msg.text);
}

Slack.onMessage(response);
