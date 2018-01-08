const _ = require('lodash');
const utils = require('./utils');
const d = utils.d;

const People = require('./people.js');
const Supplement = require('./supplements.js');


const Life = {
	eventsByAge : (age=false)=>{
		let numOfEvents = 0;
		if(age){
			numOfEvents = utils.chart(age, {
				'0-20'  : ()=>1,
				'21—30' : ()=>d('1d4'),
				'31—40' : ()=>d('1d6'),
				'41—50' : ()=>d('1d8'),
				'51-60' : ()=>d('1d10'),
				'61-9999' : ()=>d('1dl2'),
			})
		}else{
			numOfEvents = utils.chart(d('1d100'), {
				'0l—20' : ()=>1,
				'21—59' : ()=>d('1d4'),
				'60—69' : ()=>d('1d6'),
				'70—89' : ()=>d('1d8'),
				'90—99' : ()=>d('1d10'),
				'00' : ()=>d('1dl2'),
			});
		}
		return _.times(numOfEvents, Life.event);
	},
	event : ()=>{
		return utils.chart(d('1d100'), {
			'01-10' : ()=>`You suffered a tragedy. ${Life.tradegy()}`,
			'11-20' : ()=>`You gained a bit of good fortune. ${Life.boon()}`,
			'21—30' : ()=>{
				let hadChild = '';
				if(d('1d10') == 1){
					hadChild = `You also had a child with this person: ${People.person({occupation : 'child'}, true)}`;
				}
				return `You fell in love or got married. Your Love: ${People.person({}, true)} ${hadChild}`;
			},
			'31—40' : ()=>`You made an enemy of an adventurer. Your Enemy: ${People.person({occupation: `${Supplement.class()} Adventurer`, relationship: 'Hostile'}, true)}`,
			'41—50' : ()=>`You made a friend of an adventurer. Your Friend: ${People.person({occupation: `${Supplement.class()} Adventurer`, relationship: 'Friendly'}, true)}`,
			'51-70' : ()=>`You spent time working in a job related to your background. Start the game with an extra ${d('2d6')} gp.`,
			'71—75' : ()=>`You met someone important; ${People.person({}, true)} Work with your DM as to why this person is important.`,
			'76—80' : ()=>`You went on an adventure. ${Life.adventure()} Work with your DM to determine the nature of the adventure and the creatures you encountered.`,
			'81—85' : ()=>`You had a supernatural experience. ${Life.supernatural()}`,
			'86—90' : ()=>`You fought in a battle. ${Life.war()} Work with your DM to come up with the reason for the battle and the factions involved.`,
			'91-95' : ()=>`You committed a crime or were wrongly accused of doing so. You were accused of ${Life.crime()}. ${Life.punishment()}`,
			'96—99' : ()=>`You encountered something magical. ${Life.arcane()}`,
			'00'    : ()=>`Something truly strange happened to you. ${Life.weirdStuff()}`,
		})
	},
	adventure : ()=>{
		return utils.chart(d('1d100'), {
			'01—10' : `You nearly died. You have nasty scars on your body, and you are missing an ear, ${d('ld3')} fingers, or ${d('ld4')} toes.`,
			'11—20' : `You suffered a grievous injury. Although the wound healed, it still pains you from time to time.`,
			'21—30' : `You were wounded, but in time you fully recovered.`,
			'31—40' : `You contracted a disease while exploring a filthy warren. You recovered from the disease, but you have a persistent cough, pockmarks on your skin, or prematurely gray hair.`,
			'41—50' : `You were poisoned by a trap or a monster. You recovered, but the next time you must make a saving throw against poison, you make the saving throw with disadvantage.`,
			'51—60' : `You lost something of sentimental value to you during your adventure. Remove one trinket from your possessions.`,
			'61—70' : `You were terribly frightened by something you encountered and ran away, abandoning your companions to their fate.`,
			'71—80' : `You learned a great deal during your adventure. The next time you make an ability check or a saving throw, you have advantage on the roll.`,
			'81—90' : `You found some treasure on your adventure. You have 2d6 gp left from your share of it.`,
			'9l—99' : `You found a considerable amount of treasure on your adventure. You have ${d('ld20') + 50} gp left from your share of it.`,
			'00' : `You came across a common magic item (of the DM's choice).`,
		})
	},
	arcane : ()=>{
		return _.sample([
			`You were charmed or frightened by a spell.`,
			`You were injured by the effect of a spell.`,
			`You witnessed a powerful spell being cast by a ${_.sample(['cleric','druid','sorcerer','warlock','wizard'])}.`,
			`You drank a potion (of the DM's choice).`,
			`You found a spell scroll (of the DM's choice) and succeeded in casting the Spell it contained.`,
			`You were affected by teleportation magic.`,
			`You turned invisible for a time.`,
			`You identified an illusion for what it was.`,
			`You saw a creature being conjured by magic.`,
			`Your fortune was read by a diviner. Roll twice on the Life Events table, but don't apply the results. Instead, the DM picks one event as a portent of your future (which might or might not come true).`,
		])
	},
	boon : ()=>{
		return _.sample([
			`A friendly wizard gave you a spell scroll containing one cantrip (of the DM's choice).`,
			`You saved the life of a commoner, who now owes you a life debt. This individual accompanies you on your travels and performs mundane tasks for you, but will leave if neglected, abused, or imperiled. Determine details about this character by using the  supplemental tables and working with your DM.`,
			`You found a riding horse.`,
			`You found some money. You have ${d('ld20')} gp in addition to your regular starting funds.`,
			`A relative bequeathed you a simple weapon of your choice.`,
			`You found something interesting. You gain one additional trinket.`,
			`You once performed a service for a local temple. The next time you visit the temple, you can receive healing up to your hit point maximum.`,
			`A friendly alchemist gifted you with a potion of healing or a flask of acid, as you choose.`,
			`You found a treasure map.`,
			`A distant relative left you a stipend that enables you to live at the comfortable lifestyle for ${d('1d20')} years. lf you choose to live at a higher lifestyle, you reduce the price of the lifestyle by 2 gp during that time period.`,
		])
	},
	crime : ()=>{
		return _.sample([`Murder`,`Theft`,`Burglary`,`Assault`,`Smuggling`,`Kidnapping`,`Extortion`,`Counterfeiting`])
	},
	punishment : ()=>{
		return utils.chart(d('1d12'), {
			'1—3' : `You did not commit the crime and were exonerated after being accused.`,
			'4—6' : `You committed the crime or helped do so, but nonetheless the authorities found you not guilty.`,
			'7—8' : `You were nearly caught in the act. You had to flee and are wanted in the community where the crime occurred.`,
			'9—12' : `You were caught and convicted. You spent time in jail, chained to an oar, or performing hard labor. You served a sentence of ${d('ld4')} years or succeeded in escaping after that much time.`
		})
	},
	supernatural : ()=>{
		return utils.chart(d('1d100'), {
			'01—05' : `You were ensorcelled by a fey and enslaved for ${d('1d6')} years before you escaped.`,
			'06—10' : `You saw a demon and ran away before it could do anything to you.`,
			'11-15' : `A devil tempted you. Make a DC 10 Wisdom saving throw. On a failed save, your alignment shifts one step toward evil (if it‘s not evil already), and you start the game with an additional ${d('1d20') + 50} gp.`,
			'16—20' : `You woke up one morning miles from your home, with no idea how you got there.`,
			'21—30' : `You visited a holy site and felt the presence of the divine there.`,
			'31—40' : `You witnessed a falling red star, a face appearing in the frost, or some other bizarre happening. You are certain that it was an omen of some sort.`,
			'41—50' : `You escaped certain death and believe it was the intervention of a god that saved you.`,
			'51—60' : `You witnessed a minor miracle.`,
			'61—70' : `You explored an empty house and found it to be haunted.`,
			'71—75' : `You were briefly possessed by a ${_.sample(['celestial', 'devil', 'demon', 'fey', 'elemental', 'undead'])}.`,
			'76—80' : `You saw a ghost.`,
			'81—85' : `You saw a ghoul feeding on a corpse.`,
			'36—90' : `A celestial or a fiend visited you in your dreams to give a warning of dangers to come.`,
			'91—95' : `You briefly visited the Feywild or the Shadowfell.`,
			'96—00' : `You saw a portal that you believe leads to another plane of existence.`
		})
	},

	tradegy : ()=>{
		return utils.chart(d('1d12'), {
			'1—2' : `A family member or a close friend died. Cause of death: ${Supplement.death()}`,
			'3' : `A friendship ended bitterly, and the other person is now hostile to you. The cause might have been a misunderstanding or something you or the former friend did.`,
			'4' : `You lost all your possessions in a disaster, and you had to rebuild your life.`,
			'5' : `You were imprisoned for a crime you didn't commit and spent ${d('1d6')} years at hard labor, in jail, or shackled to an oar in a slave galley.`,
			'6' : `War ravaged your home community, reducing everything to rubble and ruin. in the aftermath, youeither helped your town rebuild or moved somewhere else.`,
			'7' : `A lover disappeared without a trace. You have been looking for that person ever since.`,
			'8' : `A terrible blight in your home community caused crops to fail, and many starved. You lost a sibling or some other family member.`,
			'9' : `You did something that brought terrible shame to you in the eyes of your family. You might have been involved in a scandal, dabbled in dark magic, or offended someone important. The attitude of your family members toward you becomes indifferent at best, though they might eventually forgive you.`,
			'10' : `For a reason you were never told, you were exiled from your community. You then either wandered in the wilderness for a time or promptly found a new place to live.`,
			'11' : `A romantic relationship ended. ${_.sample(['It ended with bad feelings.', 'It ended amicably.'])}`,
			'12' : ()=>{
				const cause = Supplement.death();
				return `A current or prospective romantic partner of yours died. Cause of death: ${cause}. ${(cause=='Murdered'&& _.random(1,12)==1) ? ' You murdered them either directly or indirectly.' : ''}`
			}
		})
	},
	war : ()=>{
		return utils.chart(d('1d12'), {
			'1'     : `You were knocked out and left for dead. You woke up hours later with no recollection of the battle.`,
			'2—3'   : `You were badly injured in the fight, and you still bear the awful scars ofthose wounds.`,
			'4'     : `You ran away from the battle to save your life, but you still feel shame for your cowardice.`,
			'5—7'   : `You suffered only minor injuries, and the wounds all healed without leaving scars.`,
			'8—9'   : `You survived the battle, but you suffer from terrible nightmares in which you relive the experience.`,
			'10—11' : `You escaped the battle unscathed, though many of your Friends were injured or lost.`,
			'12'    : `You acquitted yourself well in battle and are remembered as a hero. You might have received a medal for your bravery.`,
		})
	},
	weirdStuff : ()=>{
		return utils.chart(d('1d12'), {
			'1' : `You were turned into a toad and remained in that form for ${d('1d4')} weeks.`,
			'2' : `You were petrified and remained a stone statue for a time until someone freed you.`,
			'3' : `You were enslaved by a hag, a satyr, or some other being and lived in that creature's thrall for ${d('1d6')} years.`,
			'4' : `A dragon held you as a prisoner for ${d('1d4')} months until adventurers killed it.`,
			'5' : `You were taken captive by a race of evil humanoids such as drow, kuo-toa, or quaggoths. You lived as a slave in the Underdark until you escaped.`,
			'6' : `You served a powerful adventurer as a hireling. You have only recently left that service. Your Former Employer: ${People.person({}, true)}`,
			'7' : `You went insane for ${d('1d6')} years and recently regained your sanity. A tic or some other bit of odd behavior might linger.`,
			'8' : `A lover of yours was secretly a silver dragon.`,
			'9' : `You were captured by a cult and nearly sacrificed on an altar to the foul being the cultists served. You escaped, but you fear they will find you.`,
			'10' : `You met a demigod, an archdevil, an archfey, a demon lord, or a titan, and you lived to tell the tale.`,
			'11' : `You were swallowed by a giant fish and spent a month in its gullet before you escaped.`,
			'12' : `A powerful being granted you a wish, but you squandered it on something frivolous.`,
		});
	}
}

module.exports = Life