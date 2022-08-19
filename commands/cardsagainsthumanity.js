const {Command, WhisperedCommand} = require('../lib/command')
const {create, list: channelList} = require('../lib/channel')

// list of all white cards in the base game
const WHITE_CARDS = [
    'Coat hanger abortions.',
    'Man meat.',
    'Autocannibalism.',
    'Vigorous jazz hands.',
    'Flightless birds.',
    'Pictures of boobs.',
    'Doing the right thing.',
    'The violation of our most basic human rights.',
    'Viagra®.',
    'Self-loathing.',
    'Spectacular abs.',
    'A balanced breakfast.',
    'Roofies.',
    'Concealing a boner.',
    'Amputees.',
    'The Big Bang.',
    'Former President George W. Bush.',
    'The Rev. Dr. Martin Luther King, Jr.',
    'Smegma.',
    'Being marginalized.',
    'Cuddling.',
    'Laying an egg.',
    'The Pope.',
    'Aaron Burr.',
    'Genital piercings.',
    'Fingering.',
    'A bleached asshole.',
    'Horse meat.',
    'Fear itself.',
    'Science.',
    'Elderly Japanese men.',
    'Stranger danger.',
    'The terrorists.',
    'Praying the gay away.',
    'Same-sex ice dancing.',
    'Ethnic cleansing.',
    'Cheating in the Special Olympics.',
    'German dungeon porn.',
    'Bingeing and purging.',
    'Making a pouty face.',
    'William Shatner.',
    'Heteronormativity.',
    'Nickelback.',
    'Tom Cruise.',
    'The profoundly handicapped.',
    'The placenta.',
    'Chainsaws for hands.',
    'Arnold Schwarzenegger.',
    'An icepick lobotomy.',
    'Goblins.',
    'Object permanence.',
    'Dying.',
    'Foreskin.',
    'A falcon with a cap on its head.',
    'Hormone injections.',
    'Dying of dysentery.',
    'Sexy pillow fights.',
    'The invisible hand.',
    'A really cool hat.',
    'Sean Penn.',
    'Heartwarming orphans.',
    'The clitoris.',
    'The Three-Fifths compromise.',
    'A sad handjob.',
    'Men.',
    'Historically black colleges.',
    'A micropenis.',
    'Raptor attacks.',
    'Agriculture.',
    'Vikings.',
    'Pretending to care.',
    'The Underground Railroad.',
    'My humps.',
    'Being a dick to children.',
    'Geese.',
    'Bling.',
    'Sniffing glue.',
    'The South.',
    'An Oedipus complex.',
    'Eating all of the cookies before the AIDS bake-sale.',
    'Sexting.',
    'YOU MUST CONSTRUCT ADDITIONAL PYLONS.',
    'Mutually-assured destruction.',
    'Sunshine and rainbows.',
    'Count Chocula.',
    'Sharing needles.',
    'Being rich.',
    'Skeletor.',
    'A sausage festival.',
    'Michael Jackson.',
    'Emotions.',
    'Farting and walking away.',
    'The Chinese gymnastics team.',
    'Necrophilia.',
    'Spontaneous human combustion.',
    'Yeast.',
    'Leaving an awkward voicemail.',
    'Dick Cheney.',
    'White people.',
    'Penis envy.',
    'Teaching a robot to love.',
    'Sperm whales.',
    'Scrubbing under the folds.',
    'Panda sex.',
    'Whipping it out.',
    'Catapults.',
    'Masturbation.',
    'Natural selection.',
    'Opposable thumbs.',
    'A sassy black woman.',
    'AIDS.',
    'The KKK.',
    'Figgy pudding.',
    'Seppuku.',
    'Gandhi.',
    'Preteens.',
    'Toni Morrison\'s vagina.',
    'Five-Dollar Footlongs™.',
    'Land mines.',
    'A sea of troubles.',
    'A zesty breakfast burrito.',
    'Christopher Walken.',
    'Friction.',
    'Balls.',
    'Dental dams.',
    'A can of whoop-ass.',
    'A tiny horse.',
    'Waiting \'til marriage.',
    'Authentic Mexican cuisine.',
    'Genghis Khan.',
    'Old-people smell.',
    'Feeding Rosie O\'Donnell.',
    'Pixelated bukkake.',
    'Friends with benefits.',
    'The token minority.',
    'The Tempur-Pedic® Swedish Sleep System™.',
    'A thermonuclear detonation.',
    'Take-backsies.',
    'The Rapture.',
    'A cooler full of organs.',
    'Sweet, sweet vengeance.',
    'RoboCop.',
    'Keanu Reeves.',
    'Drinking alone.',
    'Giving 110%.',
    'Flesh-eating bacteria.',
    'The American Dream.',
    'Taking off your shirt.',
    'Me time.',
    'A murder most foul.',
    'The inevitable heat death of the universe.',
    'The folly of man.',
    'That thing that electrocutes your abs.',
    'Cards Against Humanity.',
    'Fiery poops.',
    'Poor people.',
    'Edible underpants.',
    'Britney Spears at 55.',
    'All-you-can-eat shrimp for $4.99.',
    'Pooping back and forth. Forever.',
    'Fancy Feast®.',
    'Jewish fraternities.',
    'Being a motherfucking sorcerer.',
    'Pulling out.',
    'Picking up girls at the abortion clinic.',
    'The homosexual agenda.',
    'The Holy Bible.',
    'Passive-agression.',
    'Ronald Reagan.',
    'Vehicular manslaughter.',
    'Nipple blades.',
    'Assless chaps.',
    'Full frontal nudity.',
    'Hulk Hogan.',
    'Daddy issues.',
    'The hardworking Mexican.',
    'Natalie Portman.',
    'Waking up half-naked in a Denny\'s parking lot.',
    'God.',
    'Sean Connery.',
    'Saxophone solos.',
    'Gloryholes.',
    'The World of Warcraft.',
    'Homeless people.',
    'Scalping.',
    'Darth Vader.',
    'Eating the last known bison.',
    'Guys who don\'t call.',
    'Hot Pockets®.',
    'A time travel paradox.',
    'The milk man.',
    'Testicular torsion.',
    'Dropping a chandelier on your enemies and riding the rope up.',
    'World peace.',
    'A salty surprise.',
    'Poorly-timed Holocaust jokes.',
    'Smallpox blankets.',
    'Licking things to claim them as your own.',
    'The heart of a child.',
    'Robert Downey, Jr.',
    'Lockjaw.',
    'Eugenics.',
    'A good sniff.',
    'Friendly fire.',
    'The taint; the grundle; the fleshy fun-bridge.',
    'Wearing underwear inside-out to avoid doing laundry.',
    'Hurricane Katrina.',
    'Free samples.',
    'Jerking off into a pool of children\'s tears.',
    'A foul mouth.',
    'The glass ceiling.',
    'Republicans.',
    'Explosions.',
    'Michelle Obama\'s arms.',
    'Getting really high.',
    'Attitude.',
    'Sarah Palin.',
    'The Übermensch.',
    'Altar boys.',
    'My soul.',
    'My sex life.',
    'Pedophiles.',
    '72 virgins.',
    'Pabst Blue Ribbon.',
    'Domino\'s™ Oreo™ Dessert Pizza.',
    'A snapping turtle biting the tip of your penis.',
    'The Blood of Christ.',
    'Half-assed foreplay.',
    'My collection of high-tech sex toys.',
    'A middle-aged man on roller skates.',
    'Bitches.',
    'Bill Nye the Science Guy.',
    'Italians.',
    'A windmill full of corpses.',
    'Adderall™.',
    'Crippling debt.',
    'A stray pube.',
    'Prancing.',
    'Passing a kidney stone.',
    'A brain tumor.',
    'Leprosy.',
    'Puppies!',
    'Bees?',
    'Frolicking.',
    'Repression.',
    'Road head.',
    'A bag of magic beans.',
    'An asymmetric boob job.',
    'Dead parents.',
    'Public ridicule.',
    'A mating display.',
    'A mime having a stroke.',
    'Stephen Hawking talking dirty.',
    'African children.',
    'Mouth herpes.',
    'Overcompensation.',
    'Riding off into the sunset.',
    'Being on fire.',
    'Tangled Slinkys.',
    'Civilian casualties.',
    'Auschwitz.',
    'My genitals.',
    'Not reciprocating oral sex.',
    'Lactation.',
    'Being fabulous.',
    'Shaquille O\'Neal\'s acting career.',
    'My relationship status.',
    'Asians who aren\'t good at math.',
    'Alcoholism.',
    'Incest.',
    'Grave robbing.',
    'Hope.',
    '8 oz. of sweet Mexican black-tar heroin.',
    'Kids with ass cancer.',
    'Winking at old people.',
    'The Jews.',
    'Justin Bieber.',
    'Doin\' it in the butt.',
    'A lifetime of sadness.',
    'The Hamburglar.',
    'Swooping.',
    'Classist undertones.',
    'New Age music.',
    'Not giving a shit about the Third World.',
    'The Kool-Aid Man.',
    'A hot mess.',
    'Tentacle porn.',
    'Lumberjack fantasies.',
    'The gays.',
    'Scientology.',
    'Estrogen.',
    'GoGurt®.',
    'Judge Judy.',
    'Dick fingers.',
    'Racism.',
    'Surprise sex!',
    'Police brutality.',
    'Passable transvestites.',
    'The Virginia Tech Massacre.',
    'When you fart and a little bit comes out.',
    'Oompa-Loompas.',
    'A fetus.',
    'Obesity.',
    'Tasteful sideboob.',
    'Hot people.',
    'BATMAN!!!',
    'Black people.',
    'A gassy antelope.',
    'Sexual tension.',
    'Third base.',
    'Racially-biased SAT questions.',
    'Porn stars.',
    'A Super Soaker™ full of cat pee.',
    'Muhammed (Praise Be Unto Him).',
    'Puberty.',
    'A disappointing birthday party.',
    'An erection that lasts longer than four hours.',
    'White privilege.',
    'Getting so angry that you pop a boner.',
    'Wifely duties.',
    'Two midgets shitting into a bucket.',
    'Queefing.',
    'Wiping her butt.',
    'Golden showers.',
    'Barack Obama.',
    'Nazis.',
    'A robust mongoloid.',
    'An M. Night Shyamalan plot twist.',
    'Getting drunk on mouthwash.',
    'Lunchables™.',
    'Women in yogurt commercials.',
    'John Wilkes Booth.',
    'Powerful thighs.',
    'Mr. Clean, right behind you.',
    'Multiple stab wounds.',
    'Cybernetic enhancements.',
    'Serfdom.',
    'Kanye West.',
    'Women\'s suffrage.',
    'Children on leashes.',
    'Harry Potter erotica.',
    'The Dance of the Sugar Plum Fairy.',
    'Lance Armstrong\'s missing testicle.',
    'Parting the Red Sea.',
    'The Amish.',
    'Dead babies.',
    'Child beauty pageants.',
    'AXE Body Spray.',
    'Centaurs.',
    'Copping a feel.',
    'Grandma.',
    'Famine.',
    'The Trail of Tears.',
    'The miracle of childbirth.',
    'Finger painting.',
    'A monkey smoking a cigar.',
    'The Make-A-Wish® Foundation.',
    'Anal beads.',
    'The Force.',
    'Kamikaze pilots.',
    'Dry heaving.',
    'Active listening.',
    'Ghosts.',
    'The Hustle.',
    'Peeing a little bit.',
    'Another goddamn vampire movie.',
    'Shapeshifters.',
    'The Care Bear Stare.',
    'Hot cheese.',
    'A mopey zoo lion.',
    'A defective condom.',
    'Teenage pregnancy.',
    'A Bop It™.',
    'Expecting a burp and vomiting on the floor.',
    'Horrifying laser hair removal accidents.',
    'Boogers.',
    'Unfathomable stupidity.',
    'Breaking out into song and dance.',
    'Soup that is too hot.',
    'Morgan Freeman\'s voice.',
    'Getting naked and watching Nickelodeon.',
    'MechaHitler.',
    'Flying sex snakes.',
    'The true meaning of Christmas.',
    'My inner demons.',
    'Pac-Man uncontrollably guzzling cum.',
    'My vagina.',
    'A homoerotic volleyball montage.',
    'Actually taking candy from a baby.',
    'Crystal meth.',
    'Exactly what you\'d expect.',
    'Natural male enhancement.',
    'Passive-aggressive Post-it notes.',
    'Inappropriate yodeling.',
    'Lady Gaga.',
    'The Little Engine That Could.',
    'Vigilante justice.',
    'A death ray.',
    'Poor life choices.',
    'A gentle caress of the inner thigh.',
    'Embryonic stem cells.',
    'Nicolas Cage.',
    'Firing a rifle into the air while balls deep in a squealing hog.',
    'Switching to Geico®.',
    'The chronic.',
    'Erectile dysfunction.',
    'Home video of Oprah sobbing into a Lean Cuisine®.',
    'A bucket of fish heads.',
    '50,000 volts straight to the nipples.',
    'Being fat and stupid.',
    'Hospice care.',
    'A pyramid of severed heads.',
    'Getting married, having a few kids, buying some stuff, retiring to Florida, and dying.',
    'A subscription to Men\'s Fitness.',
    'Crucifixion.',
    'A micropig wearing a tiny raincoat and booties.',
    'Some god-damn peace and quiet.',
    'Used panties.',
    'A tribe of warrior women.',
    'The penny whistle solo from "My Heart Will Go On."',
    'An oversized lollipop.',
    'Helplessly giggling at the mention of Hutus and Tutsis.',
    'Not wearing pants.',
    'Consensual sex.',
    'Her Majesty, Queen Elizabeth II.',
    'Funky fresh rhymes.',
    'The art of seduction.',
    'The Devil himself.',
    'Advice from a wise, old black man.',
    'Destroying the evidence.',
    'The light of a billion suns.',
    'Wet dreams.',
    'Synergistic management solutions.',
    'Growing a pair.',
    'Silence.',
    'An M16 assault rifle.',
    'Poopy diapers.',
    'A live studio audience.',
    'The Great Depression.',
    'A spastic nerd.',
    'Rush Limbaugh\'s soft, shitty body.',
    'Tickling Sean Hannity, even after he tells you to stop.',
    'Stalin.',
    'Brown people.',
    'Rehab.',
    'Capturing Newt Gingrich and forcing him to dance in a monkey suit.',
    'Battlefield amputations.',
    'An uppercut.',
    'Shiny objects.',
    'An ugly face.',
    'Menstrual rage.',
    'A bitch slap.',
    'One trillion dollars.',
    'Chunks of dead prostitute.',
    'The entire Mormon Tabernacle Choir.',
    'The female orgasm.',
    'Extremely tight pants.',
    'The Boy Scouts of America.',
    'Stormtroopers.',
    'Throwing a virgin into a volcano.'
]
const BLACK_CARDS = []


/**
 * 
 * @param {function(...string): string} combine - A method that takes up to 3 strings of text from white cards, and combines them into a single string using the prompt on the black card
 * @param {string} displayText - The text that is shown when the black card is displayed to the players
 */
function BlackCard(combine, displayText) {
    /** @type {function(...string): string} - A method that takes up to 3 strings of text from white cards, and combines them into a single string using the prompt on the black card */
    this.combine = combine
    if (displayText) this.displayText = displayText
    else {
        /** @type {string} - The text that is shown when the black card is displayed to the players */
        this.displayText = combine('_____','_____','_____')
    }
    BLACK_CARDS.push(this)
}
//#region 
// adding all black cards to the deck

new BlackCard((card1) => `Why can\'t I sleep at night? ${card1}`, 'Why can\'t I sleep at night?')
new BlackCard((card1) => `I got 99 problems but ${card1} ain't one.`)
new BlackCard((card1) => `What\'s a girl\'s best friend? ${card1}`, 'What\'s a girl\'s best friend?')
new BlackCard((card1) => `What\'s that smell? ${card1}`, 'What\'s that smell?')
new BlackCard((card1) => `This is the way the world ends. Not with a bang but with ${card1}.`)
new BlackCard((card1) => `What is Batman\'s guilty pleasure? ${card1}`, 'What is Batman\'s guilty pleasure?')
new BlackCard((card1) => `TSA guidelines now prohibit ${card1} on airplanes.`)
new BlackCard((card1) => `What ended my last relationship? ${card1}`, 'What ended my last relationship?')
new BlackCard((card1) => `MTV's new reality show features eight washed-up celebrities living with ${card1}.`)
new BlackCard((card1) => `I drink to forget ${card1}.`)
new BlackCard((card1) => `I'm sorry, Professor, but I couldn't complete my homework because of ${card1}.`)
new BlackCard((card1) => `Alternative medicine is now embracing the curative powers of ${card1}.`)
new BlackCard((card1) => `What\'s that sound? ${card1}`, 'What\'s that sound?')
new BlackCard((card1) => `What\'s the next Happy Meal® toy? ${card1}`, 'What\'s the next Happy Meal® toy?')
new BlackCard((card1) => `It's a pity that kids these days are all getting involved with ${card1}.`)
new BlackCard((card1) => `In the new Disney Channel Original Movie, Hannah Montana struggles with ${card1} for the first time.`)
new BlackCard((card1) => `${card1}. That's how I want to die.`)
new BlackCard((card1) => `What does Dick Cheney prefer? ${card1}`, 'What does Dick Cheney prefer?')
new BlackCard((card1) => `What\'s the most emo? ${card1}`, 'What\'s the most emo?')
new BlackCard((card1) => `Instead of coal, Santa now gives the bad children ${card1}.`)
new BlackCard((card1) => `Next from J.K. Rowling: Harry Potter and the Chamber of ${card1}.`)
new BlackCard((card1) => `A romantic, candlelit dinner would be incomplete without ${card1}.`)
new BlackCard((card1) => `White people like ${card1}.`)
new BlackCard((card1) => `${card1}. Betcha can't have just one!`)
new BlackCard((card1) => `War! What is it good for? ${card1}`, 'War! What is it good for?')
new BlackCard((card1) => `BILLY MAYS HERE FOR ${card1}.`)
new BlackCard((card1) => `${card1}. High five, bro.`)
new BlackCard((card1) => `During sex, I like to think about ${card1}.`)
new BlackCard((card1) => `What did I bring back from Mexico? ${card1}`, 'What did I bring back from Mexico?')
new BlackCard((card1) => `What are my parents hiding from me? ${card1}`, 'What are my parents hiding from me?')
new BlackCard((card1) => `What will always get you laid? ${card1}`, 'What will always get you laid?')
new BlackCard((card1) => `What would grandma find disturbing, yet oddly charming? ${card1}`, 'What would grandma find disturbing, yet oddly charming?')
new BlackCard((card1) => `What did the U.S. airdrop to the children of Afghanistan? ${card1}`, 'What did the U.S. airdrop to the children of Afghanistan?')
new BlackCard((card1) => `What helps Obama unwind? ${card1}`, 'What helps Obama unwind?')
new BlackCard((card1) => `What\'s there a ton of in heaven? ${card1}`, 'What\'s there a ton of in heaven?')
new BlackCard((card1) => `Major League Baseball has banned ${card1} for giving players an unfair advantage.`)
new BlackCard((card1) => `When I am a billionaire, I shall erect a 50-foot statue to commemorate ${card1}.`)
new BlackCard((card1) => `What\'s the new fad diet? ${card1}`, 'What\'s the new fad diet?')
new BlackCard((card1) => `When I am the President of the United States, I will create the Department of ${card1}.`)
new BlackCard((card1) => `${card1}. It's a trap!`)
new BlackCard((card1) => `How am I maintaining my relationship status? ${card1}`, 'How am I maintaining my relationship status?')
new BlackCard((card1) => `What will I bring back in time to convince people that I am a powerful wizard? ${card1}`, 'What will I bring back in time to convince people that I am a powerful wizard?')
new BlackCard((card1) => `While the United States raced the Soviet Union to the moon, the Mexican government funneled millions of pesos into research on ${card1}.`)
new BlackCard((card1) => `Coming to Broadway this season, ${card1}: The Musical.`)
new BlackCard((card1) => `What\'s my secret power? ${card1}`, 'What\'s my secret power?')
new BlackCard((card1) => `What gives me uncontrollable gas? ${card1}`, 'What gives me uncontrollable gas?')
new BlackCard((card1) => `But before I kill you, Mr. Bond, I must show you ${card1}.`)
new BlackCard((card1) => `What never fails to liven up the party? ${card1}`, 'What never fails to liven up the party?')
new BlackCard((card1) => `What am I giving up for Lent? ${card1}`, 'What am I giving up for Lent?')
new BlackCard((card1) => `What do old people smell like? ${card1}`, 'What do old people smell like?')
new BlackCard((card1) => `The class field trip was completely ruined by ${card1}.`)
new BlackCard((card1) => `When Pharaoh remained unmoved, Moses called down a plague of ${card1}.`)
new BlackCard((card1) => `I do not know with which weapons World War III will be fought, but World War IV will be fought with ${card1}.`)
new BlackCard((card1) => `What\'s Teach for America using to inspire inner city students to succeed? ${card1}`, 'What\'s Teach for America using to inspire inner city students to succeed?')
new BlackCard((card1) => `In Michael Jackson's final moments, he thought about ${card1}.`)
new BlackCard((card1) => `Why do I hurt all over? ${card1}`, 'Why do I hurt all over?')
new BlackCard((card1) => `Studies show that lab rats navigate mazes 50% faster after being exposed to ${card1}.`)
new BlackCard((card1) => `Why am I sticky? ${card1}`, 'Why am I sticky?')
new BlackCard((card1) => `What\'s my anti-drug? ${card1}`, 'What\'s my anti-drug?')
new BlackCard((card1) => `${card1}: Good to the last drop.`)
new BlackCard((card1) => `What did Vin Diesel eat for dinner? ${card1}`, 'What did Vin Diesel eat for dinner?')
new BlackCard((card1) => `${card1}: kid-tested, mother-approved.`)
new BlackCard((card1) => `What gets better with age? ${card1}`, 'What gets better with age?')
new BlackCard((card1) => `What\'s the next superhero/sidekick duo? ${card1}`, 'What\'s the next superhero/sidekick duo?')
new BlackCard((card1) => `Dear Abby, I'm having some trouble with ${card1} and would like your advice.`)
new BlackCard((card1) => `After the earthquake, Sean Penn brought ${card1} to the people of Haiti.`)
new BlackCard((card1) => `In L.A. County Jail, word is you can trade 200 cigarettes for ${card1}.`)
new BlackCard((card1) => `Maybe she's born with it. Maybe it's ${card1}.`)
new BlackCard((card1) => `Life for American Indians was forever changed when the White Man introduced them to ${card1}.`)
new BlackCard((card1) => `Next on ESPN2, the World Series of ${card1}.`)
new BlackCard((card1) => `Here is the church. Here is the steeple. Open the doors. And there is ${card1}.`)
new BlackCard((card1) => `How did I lose my virginity? ${card1}`, 'How did I lose my virginity?')
new BlackCard((card1) => `During his childhood, Salvador Dalí produced hundreds of paintings of ${card1}.`)
new BlackCard((card1) => `In 1,000 years, when paper money is a distant memory, how will we pay for goods and services? ${card1}`, 'In 1,000 years, when paper money is a distant memory, how will we pay for goods and services?')
new BlackCard((card1) => `What don\'t you want to find in your Kung Pao chicken? ${card1}`, 'What don\'t you want to find in your Kung Pao chicken?')
new BlackCard((card1) => `The Smithsonian Museum of Natural History has just opened an exhibit on ${card1}.`)
new BlackCard((card1) => `Daddy, why is Mommy crying? ${card1}`, 'Daddy, why is Mommy crying?')
new BlackCard((card1, card2) => `And the Academy Award for ${card1} goes to ${card2}.`)
new BlackCard((card1, card2) => `For my next trick, I will pull ${card1} out of ${card2}.`)
new BlackCard((card1, card2) => `I never truly understood ${card1} until I encountered ${card2}.`)
new BlackCard((card1, card2) => `Rumor has it that Vladimir Putin's favorite delicacy is ${card1} stuffed with ${card2}.`)
new BlackCard((card1, card2) => `Lifetime® presents ${card1}, the story of ${card2}.`)
new BlackCard((card1, card2) => `In M. Night Shyamalan's new movie, Bruce Willis discovers that ${card1} had really been ${card2} all along.`)
new BlackCard((card1, card2) => `Step 1: ${card1}. Step 2: ${card2}. Step 3: Profit.`)
new BlackCard((card1, card2) => `${card1} is a slippery slope that leads to ${card2}.`)
new BlackCard((card1, card2) => `In a world ravaged by ${card1}, our only solace is ${card2}.`)
new BlackCard((card1, card2) => `That's right, I killed ${card1}. How, you ask? ${card2}.`)
new BlackCard((card1, card2) => `When I was tripping on acid, ${card1} turned into ${card2}.`)
new BlackCard((card1, card2, card3) => `${card1} + ${card2} = ${card3}.`)
new BlackCard((card1, card2, card3) => `${card1}. ${card2}. ${card3}.`, 'Make a haiku. (with 3 white cards)')

//#endregion
/**
 * @constructor
 * @param {import('./command').User} user the User object
 */
function CardPlayer(user) {
    /** @type {string} - the twitch username of the player */
    this.username = user.username
    /** @type {string} - the twitch display-name of the player */
    this['display-name'] = user["display-name"]
    /** @type {number} - the number of strikes the user has gotten for running out of time */
    this.strikes = 0 
    /** @type {Array<string>} - the white cards in the player's hand */
    this.hand = []
    /** @type {Array<number>} - An array of numbers representing the indexes of white cards the player has chosen, starting from 0. Each number points to a card in the player's hand*/
    this.choiceIndexes = []
    /** @type {number} - the number of points the player has  */
    this.points = 0
}

var cardsAH = {
    Player: CardPlayer,
    /** @type {number} - the number of rounds left. one round is over when each player has their turn as Card Czar */
    roundsLeft: 1, 
    /** @type {Array<CardPlayer>} - the players currently in the game */
    players: [],
    /** @type {number} - then index of of the player in the players array that is the Card Czar */
    czarIndex: 0,
    /** @type {boolean} - whether a card game is ongoing */
    isRunning: false,
    /** @type {Object<string,NodeJS.Timeout>} - the several timeouts that the game has to trigger game phases (play, playRemind), which can be cleared when needed */
    timeouts: {
        /** ends the current play phase and starts the choose phase */
        play: undefined,
        /** reminds the players that there are 30s left in the play phase */
        playRemind: undefined,
        /** punishes the Cards Czar for taking too long to choose */
        czarSlow: undefined
    },
    /** @type {Object<string,Function>} - the functions stored internally that trigger certain events in the game */
    events: {},
    /** @type {BlackCard} - The current black card prompt in play */
    blackCard: undefined,
    /** @type {BlackCard[]} - the black cards currently in the deck undrawn */
    blackDrawPile: [],
    /** @type {string[]} - the white cards currently in the deck undrawn */
    whiteDrawPile: [],
    /** @type {string[]} - the white cards discarded this game */
    whiteDiscardPile: [],
    /** @type {CardPlayer[]} - the array of players that have submitted their choices, in a shuffled order which the Czar is to choose the best answer from. */
    answeringPlayers: [],
    /** @type {string} - can be 'join', 'play', or 'choose' */
    phase: undefined,
    /** @type {function(CardPlayer, number): string[]} - deal a certain number of white cards to a specified player, removing it from the draw pile and adding it to their hand */
    deal(player, num = 1) {
        // if there aren't enough white cards in the draw pile, move all white cards in the discard pile into the draw pile first
        if (this.whiteDrawPile.length < num) {
            this.whiteDrawPile = this.whiteDrawPile.concat(this.whiteDiscardPile)
            this.whiteDiscardPile = []
        }
        // draw a num number of cards from the white deck at random
        let drawnCards = []
        for (let i = 0; i < num; i++) {
            drawnCards.push(this.whiteDrawPile.splice(Math.floor(Math.random() * this.whiteDrawPile.length), 1)[0])
        }
        // add the cards to the player's hand
        player.hand.push(...drawnCards)
        return drawnCards
    },
    /** resets the game */
    reset() {
        this.roundsLeft = 1
        this.answeringPlayers = []
        this.czarIndex = 0
        this.players = []
        this.isRunning = false
        this.timeouts = {
            play: undefined,
            playRemind: undefined,
            czarSlow: undefined
        }
        this.events = {}
        this.blackCard = undefined
        this.blackDrawPile = []
        this.whiteDrawPile = []
        this.whiteDiscardPile = []
        this.phase = undefined
    }
}


create.prototype.cards = cardsAH

new Command(['cards', 'cardsagainsthumanity'], function (bot, action) {
    /** @type {typeof cardsAH} */
    let cards = bot.channel.cards
    /**
     * start the phase where players play their white cards to answer the prompt
     * @param {boolean} start - is this the first turn of the game?
     */
    cards.events.startPlayPhase = function(start = false) {
        // if it's the first game, deal 10 cards to each player and actually start the play phase in 5s
        if (start) {
            bot.respond(`A new game of cards has begun! ${cards.players.map(p => p["display-name"]).join(', ')}, each of you have been dealt 10 white cards. Check your whispers to see your hand.`)
            cards.players.forEach(pl => {
                // deal 10 cards to the player
                let cardsDrawn = cards.deal(pl, 10)
                let text = 'You have been dealt these cards: '
                // empty the array of cards and append them to the text to be whispered. if the text is too long to be sent before the array is empty, send the text and reset the text to ''
                while (cardsDrawn.length > 0) {
                    if (text.length > 450) {
                        bot.client.whisper(pl.username, text.trim())
                        text = ''
                    }
                    text += `#${11 - cardsDrawn.length}: ${cardsDrawn.shift()} `
                }
                bot.client.whisper(pl.username, text.trim())
            })
            setTimeout(() => {
                cards.phase = 'play'
                // appoint the first player as the Card Czar
                let czar = cards.players[0]
                // put a random black card from the draw pile into play
                cards.blackCard = cards.blackDrawPile.splice(Math.floor(Math.random() * cards.blackDrawPile.length), 1)[0]
                // the number of white cards needed to complete the prompt
                let numOfCards = cards.blackCard.combine.length
                bot.respond(`A new round has begun! ${czar["display-name"]} is the Card Czar and the black card prompt is: ${cards.blackCard.displayText} Whisper me ^cards choose ${'𝘯𝘶𝘮1 𝘯𝘶𝘮2 𝘯𝘶𝘮3 '.slice(0,8*numOfCards)}to choose the white cards in your hand to make the funniest answer.${numOfCards == 3 ? ' forsenScoots this prompt need 3 cards, I\'ll deal you 2 additional white cards.': ''}`, false, 480)
                if (numOfCards == 3) {
                    cards.players.forEach((player, i) => {
                        if (i != cards.czarIndex) {
                            // if it's a 3-card prompt, draw another 2 cards
                            let [card1, card2] = cards.deal(player,2)
                            bot.client.whisper(player.username, `You've been dealt these cards: #11: ${card1}, #12: ${card2}`)
                        }
                    })
                }
                // players will be allowed to whisper the bot the white cards they want to play for 1 min.
                // after which, display the player choices to the Card Czar to choose.
                cards.timeouts.play = setTimeout(() => {
                    cards.events.startChoosePhase()
                }, 60000);
                // in 30s, remind the players that 30s are left, and call out the players who haven't made their submission yet for public humiliation.
                cards.timeouts.playRemind = setTimeout(() => {
                    bot.respond(`30 seconds left to submit your cards. ${cards.players.filter((player,i) => player.choiceIndexes.length == 0 && !(cards.czarIndex == i)).map((pl) => pl["display-name"]).join(', ')}, please make your submissions FeelsWeirdMan Example Usage: /w spergbot02 ^cards choose ${' 1 2 3'.slice(0,numOfCards*2)}`)
                }, 30000);
            }, 5000)
        } else {
            // if it's not the 1st game, start the play phase immediately
            cards.phase = 'play'

            // move to the next czar
            cards.czarIndex++
            if (cards.roundsLeft <= 1 && cards.players.length <= cards.czarIndex) {
                // if the last player of the round has their turn as czar and there are no rounds left, end the game, sort and display the points each player has.
                bot.respond(`game ended nam. The final scores are:${cards.players.sort((a,b) => b.points - a.points).map((player,i) => ` #${i+1}: ${player["display-name"]} (${player.points} point${player.points == 1 ? '':'s'})`)}`)
                cards.reset()
            } else {
                // if the last player in the round has had their turn, loop back to the first player
                if (cards.players.length <= cards.czarIndex) {
                    cards.czarIndex = 0
                    cards.roundsLeft--
                }
                let czar = cards.players[cards.czarIndex]
                // put a random black card from the draw pile into play
                cards.blackCard = cards.blackDrawPile.splice(Math.floor(Math.random() * cards.blackDrawPile.length), 1)[0]
                // the number of white cards needed to complete the prompt
                let numOfCards = cards.blackCard.combine.length
                bot.respond(`A new round has begun! ${czar["display-name"]} is the Card Czar and the black card prompt is: ${cards.blackCard.displayText} Whisper me ^cards choose ${'𝘯𝘶𝘮1 𝘯𝘶𝘮2 𝘯𝘶𝘮3 '.slice(0,8*numOfCards)}to choose the white cards in your hand to make the funniest answer.${numOfCards == 3 ? ' forsenScoots this prompt need 3 cards, I\'ll deal you 2 additional white cards.': ''}`, false, 480)
                if (numOfCards == 3) {
                    cards.players.forEach((player, i) => {
                        if (i != cards.czarIndex) {
                            // if it's a 3-card prompt, draw another 2 cards
                            let [card1, card2] = cards.deal(player,2)
                            bot.client.whisper(player.username, `You've been dealt these cards: #11: ${card1}, #12: ${card2}`)
                        }
                    })
                }
                
                // start a timeout to start the choose phase
                cards.timeouts.play = setTimeout(() => {
                    cards.events.startChoosePhase()
                }, 60000);
                // in 30s, remind the players that 30s are left, and call out the players who haven't made their submission yet for public humiliation.
                cards.timeouts.playRemind = setTimeout(() => {
                    // console.log(cards)
                    bot.respond(`30 seconds left to submit your cards. ${cards.players.filter((player, i) => player.choiceIndexes.length == 0 && !(cards.czarIndex == i)).map(pl => pl["display-name"]).join(', ')}, please make your submissions FeelsWeirdMan Example Usage: /w spergbot02 ^cards choose ${' 1 2 3'.slice(0,numOfCards*2)}`)
                }, 30000);
            }
        }
    }
    // consolidate player answers and start the phase where the Card Czar chooses the funniest answer to the prompt
    cards.events.startChoosePhase = function() {
        cards.phase = 'choose'
        /** @type {CardPlayer} */
        let czar;
        /** @type {CardPlayer[]} */
        let kickedPlayers = []
        cards.players.forEach((player,i,arr) => {
            if (i == cards.czarIndex) {
                czar = player
            } else {
                if (player.choiceIndexes.length == 0) {
                    // if they still haven't made a submission, give them a strike
                    player.strikes++
                    console.log(`\nplayer ${player["display-name"]} has been given a strike`)
                    if (player.hand.length > 10) {
                        // if the player has more than 10 cards, ie from a 3 cards prompt, yoink their cards back to 10
                        cards.whiteDiscardPile.push(...player.hand.splice(10))

                    }
                    if (player.strikes >= 3) {
                        // if they have received 3 strikes, remove them from the game and add the white cards in their hand back into the draw pile
                        arr.splice(i,1)
                        kickedPlayers.push(player)
                        cards.whiteDiscardPile.push(...player.hand)
                    }
                }
            }
        })
        if (kickedPlayers.length != 0) {
            bot.respond(`The players: ${kickedPlayers.map(player => player["display-name"]).join(', ')} have received too many strikes and have been kicked. FeelsWeirdMan`)
        }
        if (cards.players.length < 3) {
            bot.respond('There are currently too few players. Ending game. FeelsBadMan')
            cards.reset()
        } else {
            if (cards.answeringPlayers.length == 0) {
                // if noone answered, just start the next play phase
                cards.phase = undefined
                bot.respond('noone has answered the prompt ForsenY . Starting the next round...')
                setTimeout(() => {
                    cards.events.startPlayPhase()
                }, 5000);
            } else if (cards.answeringPlayers.length == 1) {
                // if there is only one answerer, they win automatically
                let winner = cards.answeringPlayers[0]
                bot.respond(`${winner["display-name"]} was the only one to give an answer: ${cards.blackCard.combine(...winner.choiceIndexes.map(i => {
                    let text = winner.hand[i]
                    return text.slice(0, text.length - (text[text.length - 1] == '.' ? 1 : 0))
                }))} FeelsDankMan they've automatically been awarded a point.`)
                winner.points++
                // remove the cards that the winner chose and add it to the discard pile
                winner.hand = winner.hand.filter((text, i) => {
                    let indexMatches = winner.choiceIndexes.includes(i)
                    if (indexMatches) {
                        cards.whiteDiscardPile.push(text)
                    }
                    return !indexMatches
                })
                // the cards drawn to bring the number of cards in the winner's hand back to 10
                let noOfCardsDrawn = 10 - winner.hand.length
                cards.deal(winner,noOfCardsDrawn)
                let whisperText = `You've drawn ${noOfCardsDrawn == 1 ? 'a new card': `${noOfCardsDrawn} new cards`}: `
                winner.hand.forEach((cardText, i) => {
                    whisperText += `#${i+1}: ${cardText} `
                    if (i + 1 == noOfCardsDrawn) whisperText += 'Your other cards are: '
                })
                bot.client.whisper(winner.username, whisperText.trim())
                cards.phase = undefined
                winner.choiceIndexes = []
                cards.answeringPlayers = []
                setTimeout(() => {
                    cards.events.startPlayPhase()
                }, 5000);
            } else {
                bot.respond(`${czar["display-name"]}, choose the funniest answer out of the following, using the command ^cards choose 𝘯𝘶𝘮`)
                cards.answeringPlayers.forEach((player, index) => {
                    let answer = cards.blackCard.combine(...player.choiceIndexes.map(i => {
                        let text = player.hand[i]
                        // remove the annoying period at the end if there is one
                        if (text[text.length - 1] == '.') text = text.slice(0,text.length - 1)
                        return text
                    }))
                    bot.respond(`#${index + 1}: ${answer}`)
                })
                // set a timeout for when the czar takes too long to make a response
                cards.timeouts.czarSlow = setTimeout(() => {
                    cards.phase = undefined
                    // give the czar a strike and remove him from the game if he has 3
                    czar.strikes++
                    bot.respond(`${czar["display-name"]} took too long to choose the funniest answer. FeelsWeirdMan`)
                    if (czar.strikes >= 3) {
                        cards.players.splice(cards.czarIndex,1)
                        // set back the czar index so that the next play phase will bump it back to the next player in line
                        cards.czarIndex--
                        bot.respond(`${czar["display-name"]} has been given too many strikes and has been kicked from the game. FeelsWeirdMan`)
                    }
                    
                    if (cards.players.length < 3) {
                        bot.respond('Not emough players. Ending game :(')
                        cards.reset()
                    } else {
                        cards.phase = undefined
                        cards.answeringPlayers.forEach(player => {
                            // empty each player's choices
                            player.choiceIndexes = []
                            player.points++
                        })
                        cards.answeringPlayers = []
                        // set a timeout for the next play phase to start
                        setTimeout(() => {
                            cards.events.startPlayPhase()
                        }, 5000);
                    }
                }, 60000);
            }
        }
    }
    switch (action) {
        // start a new cards against humanity game 
        case 'start':
            if (!cards.isRunning) {
                let turnNum = bot.parser.read()
                if (/^\d+$/.test(turnNum) && 0 < Number(turnNum) && Number(turnNum) < 11) {
                    turnNum = Number(turnNum)
                } else {
                    turnNum = 1
                }
                // add the user as the 1st player
                cards.players.push(new cards.Player(bot.user))
                cards.roundsLeft = turnNum
                cards.isRunning = true
                cards.phase = 'join' // start a 'joining' phase for users to join the game
                setTimeout(() => {
                    // after 1 min, check if there are enough players to start the game
                    if (cards.players.length >= 3) {
                        // load the black and white cards onto the deck
                        cards.whiteDrawPile = WHITE_CARDS.slice()
                        cards.blackDrawPile = BLACK_CARDS.slice()
                        cards.events.startPlayPhase(true)
                    } else {
                        bot.respond('Not enough players have joined the game and it has been cancelled :(')
                        cards.reset()
                    }
                }, 60000)
                bot.respond(`${bot.user["display-name"]} has a started a game of Cards against Humanity ${bot.f('PagChomp')} The game will start in 60 seconds. Do "^cards join" to join the game`)
                bot.cool()
            }
            break;

        // join a card game started by another player
        case 'join':
            if (cards.isRunning && cards.phase == 'join') {
                // if at least one of the channels has a card game that has that player, disallow the player from joining the game
                if (channelList.some(ch => ch.cards.players.some(player => player.username == bot.user.username))) {
                    bot.respond(`${bot.user["display-name"]}, you already have a game in progress! :(`)
                    bot.cool(10000)
                } else {
                    // add the player
                    cards.players.push(new cards.Player(bot.user))
                    bot.respond(`${bot.user["display-name"]} joined the game!`)
                    bot.cool()
                }
            }
            break;
        
        // the Card Czar uses this command to choose the answer they think is the funniest
        case 'choose':
            if (cards.isRunning && cards.phase == 'choose' && cards.players.findIndex(player => player.username == bot.user.username) == cards.czarIndex) {
                let num = bot.parser.read()
                if (/^\d+$/.test(num)) {
                    // the index of the winner chosen by the czar
                    let winnerIndex = Number(num)
                    if (1 <= winnerIndex && winnerIndex <= cards.answeringPlayers.length) {
                        // grab the winning player and award them a point
                        cards.phase = undefined
                        clearTimeout(cards.timeouts.czarSlow)
                        let winningPlayer = cards.answeringPlayers[winnerIndex - 1]
                        winningPlayer.points++
                        bot.respond(`That answer belongs to ${winningPlayer["display-name"]}! PagChomp ${winningPlayer["display-name"]} wins 1 point!`)
                        // remove the white cards that each answering player has submitted and place them in the discard pile
                        cards.answeringPlayers.forEach(player => {
                            player.hand = player.hand.filter((text, i) => {
                                let indexMatches = player.choiceIndexes.includes(i)
                                if (indexMatches) {
                                    cards.whiteDiscardPile.push(text)
                                }
                                return !indexMatches
                            })
                            player.choiceIndexes = []
                            // the cards drawn to bring the number of cards in the player's hand back to 10
                            let noOfCardsDrawn = 10 - player.hand.length
                            cards.deal(player,noOfCardsDrawn)
                            let whisperText = `You've drawn ${noOfCardsDrawn == 1 ? 'a new card': `${noOfCardsDrawn} new cards`}: `
                            player.hand.forEach((cardText, i, arr) => {
                                whisperText += `#${i+1}: ${cardText} `
                                if (i + 1 == noOfCardsDrawn) whisperText += 'Your other cards are: '
                            })
                            bot.client.whisper(player.username, whisperText.trim())
                        })
                        cards.answeringPlayers = []
                        // set a timeout for the next play phase to start
                        setTimeout(() => {
                            cards.events.startPlayPhase()
                        }, 5000);
                    }
                }
            }
            break;

        default:
            if (!cards.isRunning) {
                bot.respond('Usage: do ^cards start to start a new game of Cards against Humanity')
            } else if (cards.phase == 'play') {
                bot.respond(`The current black card is: ${cards.blackCard.displayText} Choose ${cards.blackCard.combine.length == 1?'a':'the'} white card${cards.blackCard.combine.length == 1?'':'s'} in your hand to make the funniest answer by whispering me ^cards choose${' 𝘯𝘶𝘮1 𝘯𝘶𝘮2 𝘯𝘶𝘮3'.slice(0,cards.blackCard.combine.length*8)}`)
            } else if (cards.phase == 'choose') {
                bot.respond(`${cards.players[cards.czarIndex]["display-name"]}, choose the funniest answer using the command ^cards choose 𝘯𝘶𝘮`)
            } else if (cards.phase == 'join') {
                bot.respond('To join the game, do the command ^cards join')
            }
            bot.cool()
            break
    }

    // console.log(cards)
})

new WhisperedCommand('cards', function (bot, action) {
    // figure out which channel the user is playing from
    let channel = channelList.find(ch => ch.cards.players.some(pl => pl.username == bot.user.username))
    // if the user is playing a cardgame and that channel's cardgame is running
    if (channel && channel.cards.isRunning && channel.cards.phase == 'play') {
        /** @type {typeof cardsAH} */
        let cards = channel.cards
        let playerIndex = cards.players.findIndex(pl => pl.username == bot.user.username)
        switch (action) {
            case 'choose':
                if (playerIndex != cards.czarIndex) {
                    let player = cards.players[playerIndex]
                    // based on the number of cards the prompt requires, get the card numbers that the player has chosen for that prompt
                    let arr = bot.read(cards.blackCard.combine.length)
                    // check that each element of the array can be an integer and there are no repeats
                    if (arr.every(ele => /^\d+$/.test(ele)) && (!arr.some((ele, index, arr) => arr.slice(index + 1).includes(ele)) || arr.length <= 1)) {
                        let choices = arr.map(ele => Number(ele))
                        // finally, check if each specified index is within the acceptable range and that it is different from the current one the player chose
                        if (choices.every(num => 1 <= num && num <= player.hand.length) && !(choices.length == player.choiceIndexes.length && choices.every((ele, index) => ele == player.choiceIndexes[index]))) {
                            // if this is the first time submitting a choice, slot the player into cards.answeringPlayers at random
                            if (player.choiceIndexes.length == 0) {
                                cards.answeringPlayers.splice(Math.floor(Math.random() * (arr.length + 1)),0,player)
                            }
                            // update the player's choice 
                            player.choiceIndexes = choices.map(i => i - 1)
                            let answerCards = player.choiceIndexes.map(i => {
                                let text = player.hand[i]
                                if (text[text.length - 1] == '.') text = text.slice(0,text.length - 1)
                                return text
                            })
                            let answer = cards.blackCard.combine(...answerCards)
                            bot.respond(`Your answer is ${answer} If you want to change this, whisper me the same command with a different combination of numbers`)
                            // check whether all non-czar players have made their submission. if they have, we can start the choose phase prematurely.
                            if (cards.players.every((pl, i) => pl.choiceIndexes.length != 0 || cards.czarIndex == i)) {
                                clearTimeout(cards.timeouts.play)
                                clearTimeout(cards.timeouts.playRemind)
                                cards.events.startChoosePhase()
                            }
                        }
                    }
                }

                break;
            case 'mycards':
                let player = cards.players[playerIndex]
                bot.respond(`Your cards are: ${player.hand.map((text, i) => `#${i+1}: ${text}`).join(' ')}`)
                break;
        
            default:
                bot.respond('Usage: ^cards choose/mycards')
                break;
        }
    }
})