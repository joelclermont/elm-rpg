var canvas = document.getElementById("mainCanvas");
var context = canvas.getContext("2d");

var keys = [];

window.addEventListener("keydown", function(e){
	keys[e.keyCode] = true;
}, false);

window.addEventListener("keyup", function(e){
	delete keys[e.keyCode];
}, false);
var x = 0;
var y = 0;
var map = {
	w: 100,
	h: 100,
	data1: [[]]
};
var workArray = [];
for (y = 0;y < map.h; y++) {
	workArray = [];
	for (x = 0; x < map.w; x++) {
		workArray.push(Math.round(Math.random()));
	};
	map.data1.push(workArray);
};

var player = {
	cx: 40,
	cy: 40,
	mapx: 0,
	mapy: 0,
	speed: 2
};

function game(){
	update();
	render();
}

function update(){
	if(keys[38]) player.cy-=player.speed;
 	if(keys[40]) player.cy+=player.speed;
  	if(keys[37]) player.cx-=player.speed;
 	if(keys[39]) player.cx+=player.speed;
}

function render(){
	context.clearRect(0,0,500,400);
	for (y = 0;y < map.h; y++) {
		for (x = 0; x < map.w; x++) {
			if (map.data1[x][y] == 0) {
				context.fillStyle = "#0000FF";
			} else {
				context.fillStyle = "#00FF00"
			};
			context.fillRect((x*32)-player.cx+234,(y*32)-player.cy+160,32,32)
		};
	};
	context.fillStyle = "#00FFFF";
	context.fillRect(234, 160, 32, 48);
}

setInterval(function(){
	game();
}, 1000/60)