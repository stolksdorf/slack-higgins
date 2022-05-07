const Slack = require('../utils/pico-slack');
const utils = require('../utils');

const Target = new Date('2020-05-04T09:00:00-04:00');
const Message = `Don't you worry about it buddy, I'll take it from here.  You may be excited that the list has finally reached your day, but I think you have the patience to wait just one more.

You see I run this place, so I get to call the shots.  And today is a very special day.  _No, not because it's Star Wars Day_; that's boring & trivial.  This day is <@U0K7LK1FB>'s birthday, and she deserves so much more than what we're allowed to do during these difficult times.  But we have to work with what we've got, and what we've got is <#C2ZF179AT>.

Today's theme is :meg: *Meg* :meg: -- Everyone share a photo of that beautiful lady's smiling face, preferably with yourself included!  Jared & Meg are going to go on a friend-tour later today to give you the opportunity to take a new photo, but if you don't end up seeing her today, one of your favourite photos from times-past will do.  If you would like Jared & Meg to swing by your doorstep along their way, remember to _*Slam Dat Face*_ and (if you don't see this 'til later) maybe post in the thread to make sure they see it.

Of course, <@U0K7LK1FB> herself does not get the same theme.  That would be... weird.  No, Meg must take her own photos of each friend she visits.  And later, the photo she submits to <#C2ZF179AT> should be a photoshopped combination of all those friends together in one, celebrating her birthday, like we all wish we could. ᵇᵘᵗ ᵒⁿˡʸ ᶦᶠ ᵗʰᵃᵗ ˢᵒᵘⁿᵈˢ ᶠᵘⁿ ᶦ ᵈᵉᶠᶦⁿᶦᵗᵉˡʸ ᵈᵒⁿᵗ ʷᵃⁿᵗ ᵗᵒ ʲᵘˢᵗ ᵍᶦᵛᵉ ʰᵉʳ ᵐᵒʳᵉ ʷᵒʳᵏ ᵗᵒ ᵈᵒ`;

// Please nobody restart Higgins in the middle of today... :grimacing_b:
let hasSimonProccedMeYet = false;

Slack.onChannelMessage('happiness-and-cheer', (msg)=>{
	if (!isItMegsBirthday()) return;
	if (msg.user !== 'simon') return;
	if (hasSimonProccedMeYet) return;

	Slack.send(msg.channel_id, Message);
	hasSimonProccedMeYet = true;
});

const isItMegsBirthday = ()=>{
	const now = new Date();
	const isToday = now.getFullYear() == Target.getFullYear() &&
		now.getMonth() == Target.getMonth() &&
		now.getDate() == Target.getDate();
	return isToday && now.getHours() >= Target.getHours();
};

utils.onCommand('timezone', ()=>{
	Slack.log(`The server's timezone offset is ${new Date().getTimezoneOffset() / 60 * -1} hours.  The target time is ${Target.getHours()}.`);
});
