const _ = require('lodash');
const utils = require('./utils');
const d = utils.d;


const names = {
	Dragbonborn : {
		Female : ['Akra','Aasathra','Antrara','Arava','Biri','Blendaeth','Burana','Chassath','Daar','Dentratha','Doudra','Driindar','Eggren','Farideh','Findex','Furrele','Gesrethe','Gilkass','Harann','Havilar','Hethress','Hillanot','}axi','Jezean','Jheri','Kadana','Kava','Koflnn','Megren','Mijira','Mishann','Nala','Nuthra','Perra','Pogranix','Pyxrin','Quespa','Raiann','Rezena','Ruloth','Saphara','Savaran','Sora','Surina','Synthrin','Tatyan','Thava','Uadflt','Vezera','Zykrofl'],
		Male : ['Adrex','Arjhan','Azzakh','Balasar','Baradad','Bharash','Bidreked','Dadalan','Dazzazn','Direcris','Donaar','Fax','Gargax','Ghesh','Gorbundus','Greethen','Heskan','Hirrathak','lldrex','Kaladan','Kerkad','KHflth','Kriv','Maagog','Medrash','Mehen','Mozikth','Mreksh','Mugrunden','Nadarr','Nithther','Norkruuth','Nykkan','Pandjed','Patrin','PUfink','Quarethon','Rathkran','Rhogar','Rivaan','Sethrekar','Shamash','Shedinn','Srorthen','Tarhun','Torinn','Trynnicus','Valorean','Vrondiss','Zedaar'],
		family : ['Akambheryliiax','Argenth rixus','Baharoosh','Beryntolthropal','Bhenkumbyrznaax','Caavylteradyn','Chumbyxirinnish','Clethtinthiallor','Daardendrian','Delmirev','Dhyrktelonis','Ebynichtomonis','Esstyrlynn','Fharngnarthnost','Ghaallixirn','Grrrmmballhyst','Gygazzylyshrift','Hashphronyxadyn','Hshhsstoroth','lmbixtellrhyst','Jerynomonis','Jharthraxyn','Kerrhylon','Kimbatuul','Lhamboldennish','Linxakasendalor','Mohradyllion','Mystan','Nemmonis','Norixius','Ophinshtalajiir','Orexijandilin','Pfaphnyrennish','Phrahdrandon','Pyraxtallinost','Qyxpahrgh','Raghthroknaar','Shestendeliath','Skaarzborroosh','Sumnarghthrysh','Tiammanthyilish','Turnuroth','Umbyrphrael','Vangdondalor','Verthisathurgiesh','Wiwyrholdalphiax','Wystongjiir','Xephyrbahnor','Yarjerit','Zzzxaaxthroth']
	},
	Dwarf : {
		Female : ['Anbera','Artin','Audhild','Balifra','Barbena','Bardryn','Bolhild','Dagnal','Dafifi','Delre','Diesa','Hdeth','Eridred','Falkrunn','Fallthra','Finelien','Gillydd','Gunnloda','Gurdis','Helgret','Helja','HHn','llde','Jarana','Kathra','Kilia','Kristryd','Liftrasa','Marastyr','Mardred','Morana','Nalaed','Nora','Nurkara','Orifi','Ovina','Riswynn','Sannl','Therlin','Thodris','Torbera','Tordrid','Torgga','Urshar','Valida','Vistra','Vonana','Werydd','Whurdred','Yurgunn'],
		Male   : ['Adrik','Alberich','Baern','Barendd','Beloril','Brottor','Dain','Dalgal','Darrak','Delg','Duergath','Dworic','Eberk','Einkil','Elaim','Erias','Fallond','Fargrim','Gardain','Ccur','Gimgen','Gimurt','Harbek','Kildrak','Kilvar','Morgran','Morkral','Nalral','Nordak','Nuraval','Oloric','Olunt','Orsik','Oskar','Rangfin1','Rehak','Rufik','Taan','Thoradhw','Thofln','Thradal','Tordek','TTaubon','TTavok','UHgar','Urahn','Vefi','Vonbm','Vondd','Vtrbin'],
		family : ['Aranore','Balderk','Battlehammer','Bigtoe','Bloodkith','Bofdarm','Brawnanvil','Brazzik','Broodfist','Burrowfound','Caebrek','Daerdahk','Dankil','Daraln','Deepdelver','Durthane','Eversharp','FaHack','Fire-forge','Foamtankard','Frostbeard','Glanhig','Goblinbane','Goldfinder','Gorunn','Graybeard','Hammerstone','Helcral','Holderhek','Ironfist','Loderr','Lutgehr','Morigak','Orcfoe','Rakankrak','Ruby-Eye','Rumnaheim','Silveraxe','Silverstone','Steelfist','Stoutale','Strakeln','Strongheart','Thrahak','Torevir','Torunn','Trollbleeder','Trueanvil','Trueblood','Ungart']
	},
	Elf : {
		Female : ['Adria','Ahinar','Althaea','Anastrianna','Andraste','Antinua','Arara','Baelitae','Bethrynna','Birel','Caelynn','Chaedi','Claira','Dara','Drusilia','Elama','Enna','Faral','Felosial','Hatae','lelenia','Ilanis','Irann','Jarsali','Jelenneth','Keyleth','Leshanna','Lia','Maiathah','Malquis','Meriele','Mialee','Myathethil','Naivara','Que|enna','Quillathe','Ridaro','Sariel','Shanairla','Shava','Silaqui','Sumnes','Theirastra','Thiala','Tiaathque','Traulam','Vadania','Valanthe','Valna','Xanaphia'],
		Male : ['Adran','Aelar','Aerdeth','Ahvain','Aramil','Arannis','Aust','Azaki','Beiro','Berrian','Caeldrim','Carric','Dayereth','Dreali','Efieril','Eiravel','Enialis','Erdan','Erevan','Fivin','Galinndan','Gennal','Hadarai','Halimath','Heian','Himo','Immeral','Ivellius','Korfel','Lamlis','Laucian','Lucan','Mindartis','Naal','Nutae','Paelias','Peren','Quarion','Riardon','Roler’l','Soveliss','Suhnae','Thamior','Tharivol','Theren','Theriatis','Thervan','Uthemar','Vanuath','Varis'],
		family : ['Aloro','Amakiir','Amastacia','Ariessus','Arnuanna','Berevan','Caerdonel','Caphaxath','Casilltenirra','Cithreth','Dalanthan','Eathalena','Erenaeth','Ethanasath','Fasharash','Firahel','Floshern','Galanodel','Goltorah','Hanali','Holimion','Horineth','Iathrana','temnr','lranapha','Koehlanna','Lathalas','Liadon','Meliamne','Mellerelel','Mystralath','Naflo','Netyoive','Ofandrus','Ostoroth','Othronus','Qualanthri','Raethran','Rothenel','Selevarun','Siannodel','Suithrasas','Sylvara nth','Teinithra','Tiltathana','Wasanthi','Withrethin','Xiloscient','Xistsrith','Yaeldrin']
	},
	Gnome : {
		Female : ['Abalaba','Bimpnottin','Breena','Buvvie','Callybon','Caramip','Carlin','Cumpen','Dalaba','Donella','Duvamil','Ella','Ellyjoybell','Ellywick','Enidda','Lilli','Loopmottin','Lorilla','Luthra','Mardnab','Meena','Menny','Mumpena','Nissa','Numba','Nyx','Oda','Oppah','Orla','Panana','Pynfle','Quilla','Ranala','Reddlepop','Roywyn','Salanop','Shamil','Sifiress','Symma','Tana','Tenena','Tervaround','Tippletoe','Ulla','Unvera','Veloptima','Virra','Waywocket','Yebe','Zanna'],
		Male : ['Alston','Alvyn','Anverth','Arumawann','Bilbron','Boddynock','Brocc','Burgell','Cockaby','Crampernap','Dabbledob','Delebean','Dimble','Eberdeb','Eldon','Erky','Fablen','Fibblestib','Fonkin','Frouse','Frug','Gerbo','Gimble','Glim','lgden','Jabble','Jebeddo','Kellen','Kipper','Namfoodle','Oppleby','Orryn','Paggen','PaHabar','Pog','Qualen','Ribbles','Rimple','Roondar','Sappw','Seebo','Senteq','Sindri','Umpen','Warryn','Wiggens','Wobbles','Wrenn','Zaffrab','Zook'],
		family : ['Albaratie','Bafflestone','Beren','Boondiggles','Cobblelob','Daergel','Dunben','Fabblestabble','Fapplestamp','Fiddlefen','Folkor','Garrick','Gimlen','Glittergern','Gobblefirn','Gummen','Horcusporcus','Humplebumple','Ironhide','LeFFery','Lingenhall','Loofollue','Maekkelferce','Miggledy','Munggen','Murnig','Musgraben','Nackle','Ningel','Nopenstallen','Nucklestamp','OFFund','Oomtrowl','Pilwicken','Pingun','Quillsharpener','Raulnor','Reese','Rofierton','Scheppen','Shadowcloak','Silverthread','Sympony','Tarkelby','Timbers','Turen','Umbodoben','Waggletop','Welber','Wildwander'],
	},
	Halfling : {
		Female : ['Alain','Andry','Anne','Bella','Blossom','Bree','Callie','Chenna','Cora','Dee','Dell','Eida','Eran','Euphemia','Georgina','Gynnie','Harriet','Jasmine','Jillian','Jo','Kithri','Lavinia','Lidda','Maegan','Marigold','Merla','Myria','Nedda','Nikki','Nora','Olivia','Paela','Pearl','Pennie','Philomena','Portia','Robbie','Rose','Sara','Seraphina','Sheena','Stacee','Tawna','Thea','Trym','Tyna','Vani','Verna','Wella','Willow'],
		Male : ['Alton','Ander','Bernie','Bobbin','Cade','Callus','Corrin','Dannad','Danniel','Eddie','Egart','Eldon','Errich','Fildo','Finnan','Franklin','Garret','Garth','Gilbert','Gob','Harol','lgor','Jasper','Keith','Kevin','Lazam','Lerry','Lindal','Lyle','Merrie','Mican','Milo','Morrin','Nebin','Nevil','Osborn','Ostran','Oswalt','Perrin','Poppy','Reed','Roscoe','Sam','Shardon','Tye','Ulmo','Wellby','Wendel','Wenner','Wes'],
		family : ['Appleblossom','Bigheart','Brightmoon','Brushgather','Cherrycheeks','Copperkettle','Deephollow','Elderberry','Fastfoot','Fatrabbit','Glenfellow','Coldfound','Goodbarrel','Goodearth','Greenbottle','Greenleaf','High-hill','Hilltopple','Hogcollar','Honeypot','Jamjar','Kettlewhistle','Leagallow','Littlefoot','Nimblefingers','Porridgepot','Quickstep','Reedfellow','Shadowquick','Silvereyes','Smoothhands','Stonebridge','Stoutbridge','Stoutman','Strongbones','Sunmeadow','Swiftwhistle','Tallfellow','Tealeaf','Tenpenny','Thistletop','Thorngage','Tosscobble','Underbough','Underfoot','Warmwater','Whispermouse','Wildcloak','Wildheart','Wiseacre']
	},
	'Half-Orc' : {
		Female : ['Arha','Baggi','Bendoo','Bilga','Brakka','Creega','Drenna','Ekk','Emen','Engong','Fistula','Caaki','Corga','Grai','Greeba','Grigi','Cynk','Hrathy','Huru','Ilga','Kabbarg','Kansif','Lagazi','Lezre','Morgen','Murook','Myev','Nagrette','Neega','Nella','Nogu','Oolah','Ootah','Ovak','Ownka','Puyet','Reeza','Shautha','Silgre','Sutha','Tagga','Tawar','Tomph','Ubada','Vanchu','Vola','Volen','Vorka','Yevelda','Zagga'],
		Male : ['Argran','Braak','Brug','Cagak','Dench','Dorn','Dren','Druuk','Feng','Gell','Gnarsh','Grurnbar','Gubrash','Hagren','Henk','Hogar','ldcflg','Infish','Karash','Karg','Keth','Korag','Krusk','Lubash','Megged','Mhurren','hflord','Morg','NH','Nybarg','Odorr','Ohr','Rendar','Resh','Ront','Rrath','Sark','Scrag','Sheggen','Shunuj','Tanghr','Tarak','Thar','Thokk','Trag','Ugarth','varg','VHberg','Yurk','Zed'],
	},
	Tiefling : {
		Female : ['Akta','AnaMs','Armara','Astaro','Ayn1','Azza','Beleth','Bryseis','Bune','Crielaa','Damam','Decarabia','Ea','Gadreel','Gomow','Hecat','Ishte','Jezebeth','Kay','Ishista','Kasdeya','Lenssa','Leih','Makaria','Manea','Markosian','Mafiema','Namnah','Nemem','Nfia','Orianna','Osah','Phehna','Prospenne','Purah','Pyra','Rkfia','Ronobe','Ronwe','Seddn','Seere','Sekhrnet','Senwaza','Shava','Shax','Sorath','Uzza','Vapum','Vepar','Venn'],
		Male : ['Abad','Ahrun','Akmen','Anmon','Andram','Astar','Balam','Barakas','Bathin','Cann','Chen1','Chner','Cressel','Danmkos','Ekmnon','Euron','Fennz','Forcas','Habor','Iados','Kauon','Leucs','Manmen','Mantus','Marbas','Melech','Menhhn','Modean','Mordai','Mormo','Morthos','Nicor','Nhgel','Oriax','Pawnon','Pehflos','Purson','Qemud','Raam','mmnmn','Smnmm','Skamos','Tethran','Thmhuz','Therai','Valafar','Vassago','Xappan','Zepar','Zephan'],
		family : ['Ambition','Art','Carrion','Chant','Creed','Death','Debauchery','Despan','Doom','Doubt','Dread','Ecstasy','Ennui','Entropy','Excellence','Fear','Glory','Gluttony','Grief','Hate','Hope','Horror','Idea','Ignominy','Laughter','Love','Lust','Mayhem','Mockery','Murder','Muse','Music','Mystery','Nowhere','Open','Pain','Passion','Poetry','Quest','Random','Reverence','Revulsion','Sonow','Temerity','Tormet','Tragedy','War','Virtue','Weary','Wit']
	},
	Human : {
		english : {
			Female : ['Adelaide','Agatha','Agnes','Alice','Aline','Anne','Avelina','Avice','Beatrice','Cecily','Egelina','Eleanor','Elizabeth','EHa','Eloise','Elysande','Emeny','Emma','Emmeline','Ermina','Eva','Galiena','Geva','Giselle','Griselda','Hadwisa','Helen','Herleva','Hugolina','Ida','Isabella','Jacoba','lane','Joan','Juliana','Katherine','Margery','Mary','Matilda','Maynild','Millicent','Oriel','Rohesia','Rosalind','Rosamund','Sarah','Susannah','Sybil','Williamina','Yvonne'],
			Male : ['Adan','Adelard','Aldous','Anselm','Arnold','Bernard','Bertram','Charles','Clerebold','Conrad','Diggory','Drogo','Everard','Frederick','Geoffrey','Gerald','Gilbert','Godfrey','Gunter','Guy','Henry','Heward','Hubert','Hugh','jocelyn','John','Lance','Manfred','Miles','Nicholas','Norman','Odo','Percival','Peter','Ralf','Randal','Raymond','Reynard','Richard','Robert','Roger','Roland','Rolf','Simon','Theobald','Theodonc','Thomas','Timm','William','Wymar'],
		},
		//TODO: bad translation
		celtic : {
			Female : ['Aife','Aina','Alane','Ardena','Arienh','Beatha','Bkgh','Bfiann','Caornh','Cara','Cinnia','Cordelia','Deheune','Divone','Donia','Doreena','Elsha','Enid','Ethne','EveHna','Hanna','Geneieve','Gilda','Gitta','Grania','Gwyndolin','Idelisa','Isolde','Keelin','Kennocha','Lavena','Ledey','Unnefle','Lyonesse','Mabina','Marvina','Mavis','Mirna','Morgan','Muriel','Nareena','Oriana','Regan','Ronat','Rowena','Sehna','Ula','Venetia','Wynne','Yseult'],
			Male : ['Airell','Airic','Alan','Anghus','Aodh','Bardon','Bearacb','Bevyn','Boden','Bran','Bras”','Bredon','Bflan','Bncflu','Bryant','Cadnmn','Caradoc','Cedflc','Conah','Conchobar','Condon','Darcy','DeWn','DHHon','Donaghy','Dona','Duer','Eghan','Ewyn','Ferghus','Galvyn','GHdas','Guy','Fiarvey','Iden','Irven','Karney','Kayne','Kelvyn','Kunsgnos','Leigh','Maccus','Moryn','Neak','Owyn','Pryderi','Reaghan','TaHefln','Tiernay','Turi'],
		},
		french : {
			Female : ['Aalis','Agatha','Agnez','Alberea','Alips','Amée','Amelot','Anne','Avelina','Blanche','Cateline','Cecilia','Claricia','Collette','Denisete','Dorian','Edehna','Emelina','Emmelot','Ermentrudis','Gibelina','Gila','Gillette','Guiburgis','Guillemette','Guoite','Hecelina','Heloysis','Helyoudis','Hodeardis','lsabellis','Jaquette','Jehan','Johanna','Juliote','Katerine','Luciana','Margot','Marguerite','Maria','Marie','Melisende','Odelina','Perrette','Petronilla','Sedilia','Stephana','Sybilla','Ysabeau','Ysabel'],
			Male : ['Ambroys','Arne','Andri','Andriet','Anthoine','Bernard','Charles','Charlot','Colin','Denis','Durant','Edouart','Eremon','Ernault','Ethor','Felix','Floquart','Galleren','Gaultier','Gilles','Guy','Henry','Hugo','lmbert','Jacques','Jacquot','Jean','Jehannin','Louis','Louys','Loys','Martin','Michel','Mille','Morelet','Nicolas','Nicolle','Oudart','Perrin','PhHpe','Pierre','Regnauh','Richart','Robert','Robinet','Sauvage','Simon','Talbot','Tanguy','Vincent'],
		},
		german : {
			Female : ['Adelhayt','AFFra','Agatha','Allet','Angnes','Anna','Apell','Applonia','Barbara','Brida','Brigita','Cecilia','Clara','Cristina','Dorothea','Duretta','Ella','ElS','Elsbeth','Engel','Enlein','EnndHn','Eva','Fela','Fronicka','Genefe','Geras','Cerhauss','Gertrudt','Guttel','Helena','lrmel','Jonata','Katerina','Kuen','Kungund','Lucia','Madalena','Magdalen','Margret','Marlein','Martha','Otilia','Ottilg','Peternella','Reusin','Sibilla','Ursel','Vrsula','Walpurg'],
			Male : ['Albrecht','Allexander','Baltasar','Benedick','Berhart','Caspar','Clas','Cristin','Cristofi','Dieterich','Engelhart','Erhart','Felix','Frantz','Fritz','Gerhart','Gotleib','Hans','Hartmann','Heintz','Herman','Jacob','Jeremias','Jorg','Kafll','Kilian','Linhart','Lorentz','Ludwig','Marx','Melchor','Mertin','Michel','Moritz','Osswald','Ott','Peter','Rudolicf','Ruprecht','Sewastian','Sigmund','Steftan','Symon','Thoman','Ulrich','Vallentin','Wendel','Wilhelm','WolFF','Wolfgang'],
		},
		greek : {
			Female : ['Acantha','Aella','Alektos','Alkippe','Andromeda','Antigone','Ariadne','Astraea','Chloros','Chryseos','Daphne','Despoina','Dione','Eileithyia','Elektra','Euadne','Eudora','Eunornia','Hekabe','Helene','Hermoione','Hippolyte','lanthe','lokaste','Iole','Iphigenia','Ismene','Kalliope','Kallisto','Kalypso','Karme','Kassandra','Kassiopeia','Kirke','Kleio','Klotho','Klytie','Kynthia','Leto','Megaera','Melaina','Melpomene','Nausikaa','Nemesis','Niobe','Ourania','Phaenna','Polymnia','Semele','Theia'],
			Male : ['Adonis','Adrastos','Aeson','Alas','Aineias','Aiolos','Alekto','Alkeides','Argos','Brontes','Damazo','Dardanos','Deimos','Diomedes','Endymion','Epimetheus','Erebos','Euandros','Canymedes','Glaukos','Hektor','Heros','Hippolytos','Iacchus','Iason','Kadmos','Kastor','Kephalos','Kepheus','Koios','Kreios','Laios','Leandros','Linos','Lykos','Melanthios','Menelaus','Mentor','Neoptolemus','Okeanos','Orestes','Pallas','Patroklos','Philandros','Phoibos','Phrixus','Priamos','Pyrrhos','Xanthos','Zephyros'],
		},
		indian : {
			Female : ['Abha','Aishwarya','Amala','Ananda','Ankita','Archana','Avani','Chandana','Chandrakanta','Chetan','Darshana','Devi','Dipti','Esha','Gauro','Gita','Indira','Indu','Jaya','Kala','Kalpana','Kamala','Kanta','Kashi','Kishori','Lalita','Lina','Madhur','Manju','Meera','Mohana','Mukta','Nisha','Nitya','Padma','Pratima','Priya','Rani','Sarala','Shakti','Shanta','Shobha','Sima','Sonal','Sumana','Sunita','Tara','Valli','Vijaya','Virnala'],
			Male : ['Abhay','Ahsan','Ajay','Ajit','Akhil','Amar','Amit','Ananta','Aseem','Ashok','Bahadur','Basu','Chand','Chandra','Damodar','Darhsan','Devdan','Dinesh','Dipak','Gopal','Govind','Harendra','Harsha','Ila','lsha','Johar','Kalyan','Kiran','Kumar','Lakshmana','Mahavir','Narayan','Naveen','Nirav','Prabhakar','Prasanna','Raghu','Rajanikant','Rakesh','Ranjeet','Rishi','Sanjay','Sekar','Shandar','Sumantral','Vijay','Vikram','Vimal','Vishal','Yash']
		}
	}
};

const humanFemale = _.reduce(names.Human, (acc, type)=>_.concat(acc, type.Female), []);
const humanMale = _.reduce(names.Human, (acc, type)=>_.concat(acc, type.Male), [])
names.Human.Female = humanFemale;
names.Human.Male = humanMale;

module.exports = {
	name : (gender, race)=>{
		if(!gender) gender = _.sample(['Female', 'Male']);
		if(!race || !names[race]) race = 'Human';
		return _.sample(names[race][gender]);
	},
	familyName : (race)=>{
		if(!race || !names[race]) race = 'Human';
		if(!names[race].family) return _.sample(_.concat(names[race].Female, names[race].Male));
		return _.sample(names[race].family)
	}
}

