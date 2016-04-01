var _ = require('lodash');
var jared_pester = ['HEY JARED', 'WHATS UP JARED'];

module.exports = {
  listenFor : ['user_typing'],
  response : function(msg, info, Higgins){
    if(info.user == 'meggeroni'){
      Higgins.reply(_.sample(jared_pester));
    }
  }
}
