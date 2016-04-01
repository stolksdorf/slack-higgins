var _ = require('lodash');
var jared_pester = ['HEY JARED', 'WHATCHYA THINKING ABOUT JARED','WHAT ARE YOUR THOUGHTS JARED','SPIT IT OUT JARED','T-T-T-TODAY JARED','YOU SURE ARE TYPING A LOT JARED','THE SUSPENSE IS KILLING ME JARED','CANT WAIT TO HEAR YOUR THOUGHTS JARED','WHATS UP JARED'];

module.exports = {
  listenFor : ['user_typing'],
  response : function(msg, info, Higgins){
    if(info.user == 'jared'){
      Higgins.reply(_.sample(jared_pester));
    }
  }
}
