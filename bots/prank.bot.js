var _ = require('lodash');
var jared_pester = ['HEY CATHLEEN', 'WHATCHYA THINKING ABOUT CATHLEEN','WHAT ARE YOUR THOUGHTS CATHLEEN','SPIT IT OUT CATHLEEN','T-T-T-TODAY CATHLEEN','YOU SURE ARE TYPING A LOT CATHLEEN','THE SUSPENSE IS KILLING ME CATHLEEN','CANT WAIT TO HEAR YOUR THOUGHTS CATHLEEN','WHATS UP CATHLEEN'];
//,'ᶦ ᶠᵘᶜᵏᶦᶰᵍ ᶫᵒᵛᵉ ᶦᵗ ʷʰᵉᶰ ʸᵒᵘ ᵗʸᵖᵉ ʲᵃʳᵉᵈ'

module.exports = {
  channel : '*',
  handle : _.throttle(function(msg, info, Higgins){
    if(info.user == 'gobot'){
      Higgins.reply(_.sample(jared_pester));
    }
  }, 1000)
}
