var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");

var keys = [];
var arkeys = [0,0,0,0];
window.addEventListener("keydown", function(e){ //Sets the game up to track key presses. More heavy duty processing is done in the "input()" function. 
	keys[e.keyCode] = true;
}, false);

window.addEventListener("keyup", function(e){ //Same as above, just with key releases.
	keys[e.keyCode] = false;
}, false);
var x = 0; //Used in loops and stuff that have a "X" and "Y" element to them.
var y = 0;
var map = { //Basic map data. Just the tiles, no fancy stuff yet. Objects, NPCs, etc. go in other variables.
	w: 50,
	h: 50,
	data1: [[]]
};
var textbox = { //All textbox and related variables.
    color: "#000000", //what color is the textbox? (This may change at some dialog, like for description text boxes. (item get, etc.))
    main: true, //is someone saying something?
    maintext: ["This, uh, is debug text... d-do you like it? Yes?","I... worked really hard on it...","Press X to quit a box, and Z to skip scrolling."], //Text. 0 is highest line
    sub: false, //Is there an option? (Like yes or No)
    subopt: ["Yes","No"], //What choice does the player have?
    image: "", //Image being displayed in textbox. Not implemented.
	progress: [0,0], //[0] = line, [1] = character in line
	twait: 0, //time left until the next character is shown.
    speaker: "Debug" //Who's even saying these things? An NPC ID element might be added to this later.
};
var npc = { // NPC data. Not implemented! Will be soon.
    x: [],
    y: [],
    char: [],
    dir: [],
    frame: []
};
var obj = {
    x: [],
    y: [],
    spr: []
};
var workArray = [];
for (y = 0;y < map.h; y++) {
	workArray = [];
	for (x = 0; x < map.w; x++) {
		workArray.push(Math.round(Math.random()*3));
	};
	map.data1.push(workArray);
};

var player = {
	cx: 64,
	cy: 64,
	mapx: 0,
	mapy: 0,
	speed: 2,
	frame: 0,
	tframe: 0,
	dir: 0,
	fwait: 0,
	move: 0,
	collision: [false,false,false,false], //up,down,left,right
    menu: 0,
    selectedOpt: 0,
    maxOpt: 7,
    menuOpt: ["Test1","Test2","Test3","Test4","Test5","Test6","Test7","Test8"],
    freeze: false
};

function game(){
	update();
	render();
}

function update(){
    input();
	playerCol();
    statusCheck();
    if (player.freeze == false) {
        playerMove();
    };
	txtProgress();
}
var last = "?"

function statusCheck() {
    if (textbox.main || textbox.sub || player.menu > 0) {
        player.freeze = true;
    } else {
        player.freeze = false;
    };
    if(textbox.progress[1] == textbox.maintext[textbox.maintext.length -1].length && textbox.progress[0] == textbox.maintext.length - 1 && btn1 == 2) {
        textbox.main = 0;
    };
    if (btn3 == 2 && player.menu > 0 && textbox.main == false) {
        player.menu = 0;
    } else if (btn3 == 2 && textbox.main == false) {
        player.menu = 1;
    };
	if (player.menu > 0 && arkeys[0] == 2) {
		if (player.selectedOpt > 0) {
			player.selectedOpt--;
		} else {
			player.selectedOpt = player.maxOpt;
		};
	};
	if (player.menu > 0 && arkeys[1] == 2) {
		if (player.selectedOpt < player.maxOpt) {
			player.selectedOpt++;
		} else {
			player.selectedOpt = 0;
		};
	};
    if (btn2 == 2 && textbox.main) {
        textbox.progress[1] = textbox.maintext[textbox.maintext.length -1].length;
	textbox.progress[0] = textbox.maintext.length -1;
    };
    if (btn1 == 2 && player.menu > 0) {
        player.menu++;
        player.selectedOpt = 0;
    };
    if (btn2 == 2 && player.menu > 0) {
        player.menu--;
        player.selectedOpt = 0;
    };
    
};

function txtProgress(){
	if (textbox.main && textbox.progress[1] < textbox.maintext[textbox.progress[0]].length && textbox.twait > 0) {
		textbox.twait--;
	} else if (textbox.main && textbox.progress[1] < textbox.maintext[textbox.progress[0]].length && textbox.twait == 0) {
        textbox.progress[1]++;
        last = textbox.maintext[textbox.progress[0]].substring(0,textbox.progress[1]).slice(-1);
		if (last == " ") {
			textbox.twait = 0;
		} else if (last == "." || last == "," || last == ":" || last == "!" || last == "?" || last == "-") {
			textbox.twait = 15;
		} else {
			textbox.twait = 1;
		};
	};
    if (textbox.progress[1] == textbox.maintext[textbox.progress[0]].length && textbox.progress[0] < textbox.maintext.length - 1) {
        textbox.progress = [textbox.progress[0]+1,0];
    };
}

function txtDraw(x,y,w,h){
	context.strokeStyle = "white";
	context.fillStyle = textbox.color;
	context.fillRect(x,y,w,h);
	context.strokeRect(x+1.5,y+1.5,w-3,h-3);
}

function playerCol() {
    player.collision = [false,false,false,false];
    if (mget(player.cx+6,player.cy+31) == 0 || mget(player.cx+25,player.cy+31) == 0) {
        player.collision[0] = true;
    };
    if (mget(player.cx+6,player.cy+49) == 0 || mget(player.cx+25,player.cy+48) == 0) {
        player.collision[1] = true;  
    };
    if (mget(player.cx+4,player.cy+32) == 0 || mget(player.cx+4,player.cy+47) == 0) {
        player.collision[2] = true;  
    };
    if (mget(player.cx+27,player.cy+32) == 0 || mget(player.cx+27,player.cy+47) == 0) {
        player.collision[3] = true;  
    };
};

function mget(x,y) {
    var tx = Math.floor(x/32);
    var ty = Math.floor(y/32);
    if (tx < 0 || tx > map.w) {
        return 0;  
    };
    if (ty < 0 || ty > map.h) {
        return 0;  
    };
	return map.data1[Math.floor(x/32)][Math.floor(y/32)]
};
var btn1 = 0 //x "A"
var btn2 = 0 //z "B"
var btn3 = 0 //enter "Start"
var btn4 = 0 //tab "Select"
function input() {
    if(keys[88] && btn1 == 2) {
        btn1 = 1;
    } else if (keys[88] && btn1 == 0) {
        btn1 = 2;
    } else if (keys[88] == false) {
        btn1 = 0;
    };
    if(keys[90] && btn2 == 2) {
        btn2 = 1;
    } else if (keys[90] && btn2 == 0) {
        btn2 = 2;
    } else if (keys[90] == false) {
        btn2 = 0;
    };
    if(keys[13] && btn3 == 2) {
        btn3 = 1;
    } else if (keys[13] && btn3 == 0) {
        btn3 = 2;
    } else if (keys[13] == false) {
        btn3 = 0;
    };
    if(keys[9] && btn4 == 2) {
        btn4 = 1;
    } else if (keys[9] && btn4 == 0) {
        btn4 = 2;
    } else if (keys[9] == false) {
        btn4 = 0;
    };
    if(keys[38] && arkeys[0] == 2) {
        arkeys[0] = 1;
    } else if (keys[38] && arkeys[0] == 0) {
        arkeys[0] = 2;
    } else if (keys[38] == false) {
        arkeys[0] = 0;
    };
    if(keys[40] && arkeys[1] == 2) {
        arkeys[1] = 1;
    } else if (keys[40] && arkeys[1] == 0) {
        arkeys[1] = 2;
    } else if (keys[40] == false) {
        arkeys[1] = 0;
    };
    if(keys[37] && arkeys[2] == 2) {
        arkeys[2] = 1;
    } else if (keys[37] && arkeys[2] == 0) {
        arkeys[2] = 2;
    } else if (keys[37] == false) {
        arkeys[2] = 0;
    };
    if(keys[39] && arkeys[3] == 2) {
        arkeys[3] = 1;
    } else if (keys[39] && arkeys[3] == 0) {
        arkeys[3] = 2;
    } else if (keys[39] == false) {
        arkeys[3] = 0;
    };
};
function playerMove() {
    if(keys[38] && player.collision[0] == false) {
        player.cy-=player.speed;
        player.move = 2;
    }; //up
    if(keys[40] && player.collision[1] == false) {
        player.cy+=player.speed;
        player.move = 2;
    }; //down
    if(keys[37] && player.collision[2] == false) {
        player.cx-=player.speed;
        player.move = 2;
    }; //left
    if(keys[39] && player.collision[3] == false) {
        player.cx+=player.speed;
        player.move = 2;
    }; //right


    
    if(player.move == 2) {
      player.move = 1;
    } else {
      player.move = 0;
      player.tframe = 0;
    };
	if (keys[40] && keys[37]) {
		player.dir = 3;
	} else if (keys[40] && keys[39]) {
		player.dir = 6;
	} else if (keys[38] && keys[37]) {
		player.dir = 7;
	} else if (keys[38] && keys[39]) {
		player.dir = 4;
	} else if (keys[40]) {
		player.dir = 0;
	} else if (keys[38]) {
		player.dir = 1;
	} else if (keys[39]) {
		player.dir = 2;
	} else if (keys[37]) {
		player.dir = 5;
	} else {
		player.move = 0;
		player.tframe = 0;
	};
	if (player.move == 1) {
		player.fwait++;
	} else {
		player.fwait = 0;
	};
	if (player.tframe < 3 && player.move == 1 && player.fwait == 7) {
		player.tframe++;
		player.fwait = 0;
	} else if (player.tframe == 3 && player.move == 1 && player.fwait == 7) {
		player.tframe = 0;
		player.fwait = 0;
	};
	if (player.tframe == 0 || player.tframe == 2) {
		player.frame = 0;
	} else if (player.tframe == 1) {
		player.frame = 1;
	} else {
		player.frame = 2;
	};
}
var header = textbox.speaker.concat(": ")
var sprite = new Image();
var tileset = new Image();
var arrow = new Image();
var tile = 0;
function render(){
	context.clearRect(0,0,500,400);
	tileset.src = "TestTileset.png";
	for (y = 0;y < map.h; y++) {
		for (x = 0; x < map.w; x++) {
			tile = map.data1[x][y];
			context.drawImage(tileset,tile*32,0,32,32,(x*32)-player.cx+234,(y*32)-player.cy+160,32,32);
		};
	};
	//context.fillStyle = "#00FFFF";
	//context.fillRect(234, 160, 32, 48);
	sprite.src = "Debug.png";
	context.drawImage(sprite,player.frame*24,player.dir*48,24,48,238,160,24,48);
    if (player.menu > 0) { //This is the overworld menu, for doing various "overworld things".
       	context.fillStyle = 'rgba(0,0,0,0.5)';
	context.fillRect(0,0,500,400);
	txtDraw(1,1,497,50);
        for (m = 0; m < player.menu; m++) {
            txtDraw(1+(m*10),52,100,297);
        };
	arrow.src = "Arrow2.png"
	context.drawImage(arrow,5+((player.menu-1)*10),64+((player.selectedOpt)*25))
	   context.fillStyle = "#FFFFFF";
	   context.font = "16px times new roman";
	for (m = 0; m < player.menuOpt.length; m++) {
		context.fillText(player.menuOpt[m],16+(player.menu*10)-10,75+(m*25))
	};
    };
    if (textbox.main) { //This is the main textbox, which appears when talking to someone.
       txtDraw(1,1,497,97);
	   context.fillStyle = "#FFFFFF";
	   context.font = "16px times new roman";
        for (y=0; y <= textbox.progress[0]; y++) {
            if (y==0 && textbox.progress[0] == 0) {
            context.fillText(header.concat(textbox.maintext[y].substring(0,textbox.progress[1])),10,20)
            } else if (textbox.progress[0] > 0 && y==0){
            context.fillText(header.concat(textbox.maintext[y]),10,20+(y*20))
            } else if (textbox.progress[0] > y){
            context.fillText(textbox.maintext[y],10,20+(y*20))
            } else {
            context.fillText(textbox.maintext[y].substring(0,textbox.progress[1]),10,20+(y*20))
            };
        };

	if (textbox.progress[1] == textbox.maintext[textbox.maintext.length -1].length && textbox.progress[0] == textbox.maintext.length - 1) {
		arrow.src = "Arrow.png";
		context.drawImage(arrow,487,91);
	};
    };
}

setInterval(function(){
	game();
}, 1000/60)