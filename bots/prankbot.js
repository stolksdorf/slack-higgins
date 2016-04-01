var jared_pester = ['HER JARED', 'WHATS UP JARED'];

module.exports = {
  listenFor : ['user_typing'],
  response : function(msg, info, Higgins){
    if(info.user == 'meggeroni'){
      Higgins.reply(_.sample(jared_pester));
    }
  }
}
