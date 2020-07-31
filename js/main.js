var game = new Phaser.Game(1920, 1080, Phaser.CANVAS, '', {
    preload: preload,
    create: create,
    update: update
});

var assets = [
    'kocca',
    'drazic',
    'dragan',
    'marko',
    'deki',
    'dalibor',
    'tanja',
    'martina',
    'nevena',
    'srdjan'
];

var presentationImages = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9'
];
picture_animations=[];
slikePrezentacije = [];

for(var i=0;i<assets.length;i++)
	picture_animations[i]=[];


var dobitnaKombinacija = assets.length-1;
var horizontalSpacing = 180;
var verticalSpacing = 180;
var lockSpinButton = false;
var dobitniIndex = 0;

var joker = 'diamond';

var pocetak = true;

var paylines = [
    [ 1, 1, 1, 1, 1 ]
];

var reels;
var graphics;
var creditsText;
var scoreText;
var betText;
var reelStop;
var music;
var winning;

var credits = 1000;
var spinning = false;
var reels_position = 510;
var bet_multiply = 1;

// Symbol class
var Symbol = function(game, x, y, key, index) {
    Phaser.Sprite.call(this, game, x, y, key);
    this.scale.set(0.35);
    this.index = index;
    this.tweenY = this.y;
};
Symbol.prototype = Object.create(Phaser.Sprite.prototype);
Symbol.prototype.constructor = Symbol;

Symbol.prototype.update = function() {
    this.y = this.tweenY % 1800;

    var middle = 385;
    var range = 300;

};
var pocetak = true;
var rigWholeSlot = function(numberOfSpins){
	reels.forEach(function(reel) {
    		reel.rigSlot(reels.children.indexOf(reel),numberOfSpins);
    	});

    game.time.events.add(5500, spustiRoletnuPosleSpin);
}
var spustiRoletnuPosleSpin = function(){
	var down = game.add.tween(roletne).to({y: 0}, 500, Phaser.Easing.Linear.In);
	var showPicturePresentation = game.add.tween(slikePrezentacije[parseInt(presentationImages[numberOfSpins])]).to({alpha:1},0,Phaser.Easing.Linear.In);
	var up = game.add.tween(roletne).to({y: -1000}, 500, Phaser.Easing.Linear.In);

    up.onComplete.add(function(){
        lockSpinButton = false;
    });

	down.chain(showPicturePresentation,up);
	down.start();
}
Symbol.prototype.spin = function(rand) {
    this.tweenY = this.y;
    
    var target = this.tweenY + 600;
    var start = game.add.tween(this).to({tweenY: target}, 1000, Phaser.Easing.Back.In,false, this.index*200);
    
    var offset = 600;
    target += offset+(verticalSpacing*5);
    var mid = game.add.tween(this).to({tweenY: target}, offset/1.85, Phaser.Easing.Linear.InOut);
    
    target += 600;
    var end = game.add.tween(this).to({tweenY: target}, 1000, Phaser.Easing.Back.Out);
    
    var isLast = this.y == 720 && this.index == 4;
    var _this = this;
    
    end.onComplete.add(function() {
        reelStop.play();
        if(isLast){
        	for(var i=0;i<5;i++){
        		var animacija = game.add.tween(picture_animations[parseInt(presentationImages[numberOfSpins])][i]).to({alpha:1},0,Phaser.Easing.Linear.In);
        		animacija.start();
        	}
        }
    });

    start.chain(mid, end);
    start.start();
};

// Reel class
var Reel = function(game, index) {
    Phaser.Group.call(this, game);

    
    for (var i = 0; i < assets.length; i++) {
        this.add(new Symbol(game, index*horizontalSpacing, i*verticalSpacing, assets[i], index));
    }

    
    let counter = assets.length;
    while (counter > 0) {

        // Pick a random index
        let index = Math.floor(Math.random() * counter);
        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = assets[counter];
        assets[counter] = assets[index];
        assets[index] = temp;

         let temp1 = presentationImages[counter];
        presentationImages[counter] = presentationImages[index];
        presentationImages[index] = temp1;
    }
};

Reel.prototype = Object.create(Phaser.Group.prototype);
Reel.prototype.constructor = Reel;

Reel.prototype.spin = function(rand) {
    this.forEach(function(symbol) {
	        symbol.spin(rand);
    });
};
Reel.prototype.rigSlot = function(index,numberOfSpins) {
    _this = this;
   this.forEach(function(symbol){
       if(symbol.y==1260){
           var currentY = symbol.y;
           symbol.destroy();
           _this.add(new Symbol(game, index*horizontalSpacing, currentY, assets[numberOfSpins], index));
       }
   })
};

// Line Graphics class
var Line = function(game) {
    Phaser.Graphics.call(this, game);
    this.filters = [game.add.filter('Glow')];
    this.lines = [];
    this.drawing = false;
    this.perc = 0;
    this.all = false;
    this.index = 0;
    this.lastPos = [];
};

Line.prototype = Object.create(Phaser.Graphics.prototype);
Line.prototype.constructor = Line;

Line.prototype.update = function() {
    if (this.drawing && this.lines.length > 0) {
        if (this.all) {
            if (this.perc <= 1) {
                for (var i = 0; i < this.lines.length; i++) {
                    this.drawSingleLine(i);
                }
                this.perc += game.time.physicsElapsed*0.5;
            }
            else {
                this.all = false;
                this.perc = 0;
                this.clear();
            }
        }
        else {
            if (this.perc <= 1) {
                this.drawSingleLine(this.index % this.lines.length);
                this.perc += game.time.physicsElapsed*0.5;
            }
            else {
                this.index++;
                this.perc = 0;
                this.clear();
            }
        }
    }
};

Line.prototype.drawLines = function() {
    this.drawing = true;
    this.perc = 0;
    this.all = true;
    this.index = 0;
    this.lastPos = [];
    this.clear();
};

Line.prototype.stopDrawing = function() {
    this.drawing = false;
    this.clear();
};

Line.prototype.drawSingleLine = function(index) {
    if (this.perc == 0) this.lastPos[index] = {x: this.lines[index].x[0], y: this.lines[index].y[0]};
    
    this.moveTo(this.lastPos[index].x, this.lastPos[index].y);

    if (this.lines[index].included[Math.ceil(this.perc*6)]) this.lineStyle(6, 0xffffff);
    else this.lineStyle(2, 0xffffff);

    var x = Math.round(game.math.catmullRomInterpolation(this.lines[index].x, this.perc));
    var y = Math.round(game.math.catmullRomInterpolation(this.lines[index].y, this.perc));
    this.lineTo(x, y);
    
    this.lastPos[index].x = x;
    this.lastPos[index].y = y;
}

// Glow shader
Phaser.Filter.Glow = function (game) {
    Phaser.Filter.call(this, game);

    this.fragmentSrc = [
        "precision lowp float;",
        "varying vec2 vTextureCoord;",
        "varying vec4 vColor;",
        'uniform sampler2D uSampler;',

        'void main() {',
            'vec4 sum = vec4(0);',
            'vec2 texcoord = vTextureCoord;',
            'for(int xx = -4; xx <= 4; xx++) {',
                'for(int yy = -3; yy <= 3; yy++) {',
                    'float dist = sqrt(float(xx*xx) + float(yy*yy));',
                    'float factor = 0.0;',
                    'if (dist == 0.0) {',
                        'factor = 2.0;',
                    '} else {',
                        'factor = 2.0/abs(float(dist));',
                    '}',
                    'sum += texture2D(uSampler, texcoord + vec2(xx, yy) * 0.002) * factor;',
                '}',
            '}',
            'gl_FragColor = sum * 0.025 + texture2D(uSampler, texcoord);',
        '}'
    ];
};

Phaser.Filter.Glow.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Glow.prototype.constructor = Phaser.Filter.Glow;

// Main game functions
function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;


    for(var i = 0;i<presentationImages.length;i++){
    	game.load.image(String(i), 'assets/slikePrezentacije/'+String(i)+'.png');
	}

	for(var i=0;i<assets.length;i++)
		game.load.spritesheet(assets[i]+'_animation', 'assets/simboli/'+assets[i]+'_sprite.png', 250, 250, 36);

    for (var i = 0; i < assets.length; i++) {
        game.load.image(assets[i], 'assets/simboli/' + assets[i] + '.png');
    }

    game.load.image('logo', 'assets/img/logo.png');

    game.load.image('button', 'assets/img/button_up.png');
    game.load.image('walls_hide', 'assets/img/wall_hide.png');
    game.load.image('burad', 'assets/img/fg.png');
    game.load.image('zastavaDesno', 'assets/img/zastava_desna.png');
    game.load.image('zastavaLevo', 'assets/img/zastava_leva.png');
    game.load.image('frame', 'assets/img/frame_ornament.png');
    game.load.image('prelaz', 'assets/img/prelaz.png');
    game.load.image('slot_space', 'assets/img/slot_space.png');
    game.load.image('roletne', 'assets/img/roletna.png');
    game.load.image('btn_fullscreen', 'assets/img/btn_fullscreen.png');
    game.load.bitmapFont('kenfuture', 'assets/font/kenfuture.png', 'assets/font/kenfuture.fnt');
    game.load.audio('reelstop', 'assets/sound/reelstop.wav');
    game.load.audio('music', 'assets/sound/music.wav');
    game.load.audio('winning', 'assets/sound/winning.wav');
    game.load.video('serbia', 'assets/video/intro.mp4');

	btnStart = game.add.button(865, 870, 'button', clickSpinButton);
    btnStart.alpha=0;
}
function skipVideo(){
    	videoImage.destroy();
    	video1.destroy();

	    startSlot();

}

function startSlot(){

		slot_space = game.add.sprite(0, 0, 'slot_space');

		reels = game.add.group();
	    for (var i = 0; i < 5; i++) {
	        reels.add(new Reel(game, i));
	    }
	    reels.x = reels_position;

        for(var i=0;i<assets.length;i++){
	    	for(var j = 0; j<5;j++){
	    		picture_animations[i][j];
	        	game.world.bringToTop(picture_animations[i][j]);
	    	}
	    }


        prelaz1 = game.add.sprite(960, 540, 'prelaz');
		prelaz1.anchor.setTo(.5,.5);
        prelaz2 = game.add.sprite(960, 340, 'prelaz');
		prelaz2.anchor.setTo(.5,.5);
		prelaz2.scale.y *= -1;


	    reelStop = game.add.audio('reelstop');
	    music = game.add.audio('music');
	    winning = game.add.audio('winning');
	    
	    graphics = game.world.add(new Line(game));


		/*completionSprite = game.add.graphics( 0, 0 );
		completionSprite.beginFill(0x000000, 0.85);
		completionSprite.bounds = new PIXI.Rectangle(0, 0, 200, 200);
		completionSprite.drawRect(reels_position, 720, 1000, 200);


		completionSprite = game.add.graphics( 0, 0 );
		completionSprite.beginFill(0x000000, 0.85);
		completionSprite.bounds = new PIXI.Rectangle(0, 0, 200, 200);
		completionSprite.drawRect(reels_position, -20, 1000, 200);*/



	    for(var i = 0;i<presentationImages.length;i++){
		    slikePrezentacije[i] = game.add.sprite(0, 0, String(i));
		    slikePrezentacije[i].alpha=0;
		    slikePrezentacije.redniBroj = i;
		}
	    //music.play("",0,0.2,true);

	    roletne = game.add.sprite(32,32,'roletne');
	    roletne.scale.x = 1.017;
	    roletne.scale.y = 1.005;
	    roletne.x=-12;
	    roletne.y=-1000;
	    roletne.alpha=1;

	    walls_hide = game.add.sprite(32, 32, 'walls_hide');
	    walls_hide.x = 0;
	    walls_hide.y = 0;
	    walls_hide.height = game.height;
	    walls_hide.width = game.width;
	    walls_hide.smoothed = false;
	    game.camera.y = 380;

        frame = game.add.sprite(0, 0, 'frame');
        zastavaDesno = game.add.sprite(0, 0, 'zastavaDesno');
        zastavaLevo = game.add.sprite(0, 0, 'zastavaLevo');

        burad = game.add.sprite(0, 0, 'burad');

	    btnStart = game.add.button(865, 870, 'button', clickSpinButton);
	    btnStart.alpha = 0.7;
	    var btnStartText = game.add.bitmapText(907, 882, 'kenfuture', 'SPIN', 40);
	    btnStartText.alpha = 0.8;

}

function create() {


    game.load.onLoadComplete.add(startSlot, this);

    game.world.setBounds(0, 0, 1920, 1080);

    video1 = game.add.video('serbia');

    video1.play(true);

    video1.video.loop=false;

    videoImage = video1.addToWorld(0, 0, 0, 0, 2 , 2 );

    var btnSkip = game.add.button(865, 870, 'button', skipVideo);
    btnSkip.alpha = 1;
	var btnSkip = game.add.bitmapText(907, 882, 'kenfuture', 'SKIP', 40);
    btnSkip.alpha = 1;

    video1.onComplete.add(function(){

    	videoImage.destroy();
    	video1.destroy

    	startSlot();
	    
    })

    for(var i=0;i<assets.length;i++){
    	for(var j = 0; j<5;j++){
    	    picture_animations[i][j] = game.add.sprite(300, 200, assets[i]+'_animation');
    		picture_animations[i][j].scale.x=0.70;
    		picture_animations[i][j].scale.y=0.70;
    		picture_animations[i][j].position.x=reels_position+(j*180);
    		picture_animations[i][j].position.y=360;
    		var highlight = picture_animations[i][j].animations.add('highlight');
    		picture_animations[i][j].animations.play('highlight', 30, true);
    		picture_animations[i][j].alpha=0;
    	}
    }

}

function update() {
		if(lockSpinButton)
	        btnStart.alpha = 0.2;
	    else
	    	btnStart.alpha = 1;
    
}
    var numberOfSpins = 0;

var spinn = function(){

    numberOfSpins++;

    if(numberOfSpins>=9)
    	numberOfSpins=0;

    spinning = true;



    music.volume = 0.6;
    graphics.stopDrawing();

    
    rigWholeSlot(numberOfSpins);

    reels.forEach(function(reel) {
        var rand = game.rnd.integerInRange(0, 9);
        reel.spin(rand);
    });
}

function clickSpinButton() {


    if(!lockSpinButton){
        lockSpinButton = true;
        if(pocetak){
            pocetak=false;
            spinn();
        }
        else if(!pocetak){
    
            var startPosition = game.add.tween(roletne).to({y: -1000}, 500, Phaser.Easing.Linear.In);
            var down = game.add.tween(roletne).to({y: 0}, 500, Phaser.Easing.Linear.In);
            var hidePicturePresentation = game.add.tween(slikePrezentacije[parseInt(presentationImages[numberOfSpins])]).to({alpha:0},0,Phaser.Easing.Linear.In);
            for(var i=0;i<5;i++){
				var animacija = game.add.tween(picture_animations[parseInt(presentationImages[numberOfSpins])][i]).to({alpha:0},0,Phaser.Easing.Linear.Out);
        		animacija.start();
        	}
            var up = game.add.tween(roletne).to({y: -1000}, 500, Phaser.Easing.Linear.In);
    
            up.onComplete.add(function(){
                spinn();
            });
    
            startPosition.chain(down,hidePicturePresentation,up);
    
            startPosition.start();
        }
    
    }

}

function clickFullScreen() {
    if (game.scale.isFullScreen) {
        game.scale.stopFullScreen();
    }
    else {
        game.scale.startFullScreen(true);
    }
}

function checkResults  () {
    var results = [];
    for (var i = 0; i < 3; i++)
        results[i] = [];
    
    graphics.lines = [];
    
    music.volume = 0.2;
    var score = 0;
    
    reels.forEach(function(reel) {
        reel.forEach(function(symbol) {
            if (symbol.y == 540)
                results[0][symbol.index] = symbol;
            else if (symbol.y == 720)
                results[1][symbol.index] = symbol;
            else if (symbol.y == 900)
                results[2][symbol.index] = symbol;
        });
    });
    
    for (var i = 0; i < paylines.length; i++) {
        var symbol = results[paylines[i][0]][0].key;
        var j = 0;
        for (; j < paylines[i].length; j++) {
            var current = results[paylines[i][j]][0].key;
            
            if (symbol == joker) {
                symbol = current;
            }
            else {
                if (current != symbol && current != joker)
                    break;
            }
        }
        
    }
	var lineX= [];
	var lineY= [];
	var included=[];


	var lineX1= [];
	var lineY1= [];

    lineX.push(500);
    lineX.push(1430);
    lineY.push(500);
    lineY.push(500);


    lineX1.push(500);
    lineX1.push(1430);
    lineY1.push(400);
    lineY1.push(400);
    included.push(true);

    graphics.lines.push({x: lineX, y: lineY, included: included});

    graphics.lines.push({x: lineX1, y: lineY1, included: included});
    
    graphics.drawLines();

    spinning = false;
    included[0]=false;
}

function updateCredits(amount) {
    if (amount > 0) winning.play();
    
    credits += amount;
    creditsText.text = 'Credits: ' + credits;
    
    var updateText = game.add.bitmapText(40 + creditsText.width, creditsText.y, 'kenfuture', (amount<0?'':'+') + amount, 32);
    var updateTween = game.add.tween(updateText).to({alpha: 0, y: updateText.y - 10}, 1000, Phaser.Easing.Linear.InOut, true);
    updateTween.onComplete.add(function() {
        updateText.destroy();
    });
}