const _ = require('lodash');
const Slack = require('pico-slack');

const quotes = [
	'_Man’s feelings are always purest and most glowing in the hour of meeting and of farewell._',
	'_Gone — flitted away,\nTaken the stars from the night and the sun\nFrom the day!\nGone, and a cloud in my heart._',
	'_How lucky I am to have something that makes saying goodbye so hard._',
	'_Man’s feelings are always purest and most glowing in the hour of meeting and of farewell_',
	'_Don’t be dismayed at goodbyes. A farewell is necessary before you can meet again. And meeting again, after moments or lifetime, is certain for those who are friends._',
	'_May the road rise up to meet you, may the wind be ever at your back. May the sun shine warm upon your face and the rain fall softly on your fields. And until we meet again, may God hold you in the hollow of his hand._',
	'_Be well, do good work, and keep in touch._',
	'_May your days be many and your troubles be few._',
	'_Let the best of the past be the worst of the future_',
	'_Good riddance._',
	'_God save you, sir!_',
	'_Go thy ways._',
	'_Rest you merry._',
	'_There lies your way._',
	'_Give me now leave, to leave thee._',
	'_Close the door on your way out._',
	'_We only part to meet again._',
	'_Nothing makes the earth seem so spacious as to have friends at a distance; they make the latitudes and longitudes._',
	'_Farewell! Thou art too dear for my possessing._',
	'_May your pockets be heavy and your heart be light,\nMay good luck pursue you each morning and night._',
	'_But fate ordains that dearest friends must part._',
	'_As contraries are known by contraries, so is the delight of presence best known by the torments of absence._',
	'_The return makes one love the farewell._',
	'_I wanted a perfect ending. Now I’ve learned, the hard way, that some poems don’t rhyme, and some stories don’t have a clear beginning, middle, and end. Life is about not knowing, having to change, taking the moment and making the best of it, without knowing what’s going to happen next._',
	'_Excuse me, then! You know my heart;\nBut dearest friends, alas! must part._',
	'_To die and part is a less evil; but to part and live, there, there is the torment.',
	'_No distance of place or lapse of time can lessen the friendship of those who are thoroughly persuaded of each other’s worth.',
	'_Can miles truly separate you from friends? If you want to be with someone you love, aren’t you already there?_',
	'_What shall I do with all the days and hours\nThat must be counted ere I see thy face?\nHow shall I charm the interval that lowers\nBetween this time and that sweet time of grace?_',
	'_Not to understand a treasure’s worth till time has stole away the slighted good, is cause of half the poverty we feel, and makes the world the wilderness it is._',
	'_She went her unremembering way,\nShe went and left in me\nThe pang of all the partings gone,\nAnd partings yet to be._',
	'_Only in the agony of parting do we look into the depths of love._',
	'_Love is missing someone whenever you’re apart, but somehow feeling warm inside because you’re close in heart._',
	'_There are no goodbyes for us. Wherever you are, you will always be in my heart._',
	'_Don’t cry because it’s over, smile because it happened._',
	'_Great is the art of beginning, but greater is the art of ending._',
	'_It’s time to say goodbye, but I think goodbyes are sad and I’d much rather say hello. Hello to a new adventure._',
	'_All changes, even the most longed for, have their melancholy; for what we leave behind us is a part of ourselves; we must die to one life before we can enter another._',
	'_Never say goodbye because goodbye means going away and going away means forgetting._',
	'_Remember me and smile, for it’s better to forget than to remember me and cry._',
	'_So long as the memory of certain beloved friends lives in my heart, I shall say that life is good._',
	'_They must often change, who would be constant in happiness or wisdom._',
	'_The pain of parting is nothing to the joy of meeting again._',
	'_To part is the lot of all mankind. The world is a scene of constant leave-taking, and the hands that grasp in cordial greeting today, are doomed ere long to unite for the the last time, when the quivering lips pronounce the word – Farewell._',
];


Slack.emitter.on('member_left_channel', (data) => {
	Slack.msg(data, _.sample(quotes));
});
