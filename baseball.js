var isHome = null; //主客場
var isWin = false;
var canvas = null, ctx = null;
var hitString = null;

function drawNav(){	
	drawNavBG();	
	showBase();
	showInning();
	showOut();
	showScore();
	if (hit!= null) showHit();
}

function drawNavBG(){
	drawLinerGradient(0, 'white', "black", 150);
	drawLinerGradient(150, 'white', "blue", 100);
	drawLinerGradient(300, 'white', "blue", 200);
	drawLinerGradient(550, 'white', "blue", 150);
	drawLinerGradient(700, 'white', "black", 324);
}

function drawLinerGradient(x, color0, color1, w){
	ctx = document.getElementById("broadcast").getContext("2d");
	var lingrad = ctx.createLinearGradient(x,0,x,50);
  	lingrad.addColorStop(0, color0);
	lingrad.addColorStop(1, color1);
	ctx.fillStyle = lingrad;
	ctx.fillRect(x, 0, w, 50);
}

//顯示壘包情況
function showBase(){
	var score = 0;
	switch(hit){
		case "HR": 
		case "3B":
			for (var i=0; i<3; i++) if (runner[i]) { score++; runner[i] = false; } //檢查一二三壘
			if (hit == "HR") score++; //自己得分
			else runner[2] = true;
		break;
		case "2B":
			for (var i=1; i<3; i++) if (runner[i]) score++; //檢查二三壘
			runner[2] = runner[0]; runner[1] = true; runner[0] = false;
		break;
		case "1B":
		case "SH":
			if (runner[2]) score++; //檢查三壘
			runner[2] = runner[1]; runner[1] = runner[0]; 
			if (hit=="1B") runner[0] = true;
			else { runner[0] = false; out++;}
		break;
		case "BB":
			if (runner[0]) {
				if ( runner[1] && runner[2]) score++; //滿壘
				else if ( !runner[1] && !runner[2]) runner[1] = true;
				else { runner[1] = true; runner[2] = true; }
				runner[0] = false;
			}
			runner[0] = true;
		break;
		case "DP":
			for (var i=0; i<3; i++) if (runner[i]) { runner[i] = false; out++; break; }
			out++;
		break;
		case "TP":
			for (var i=0; i<3; i++) runner[i] = false; 
			out = 3;
		break;
		case "SO":
		case "GO":
		case "FO":
			out++;
		break;			
	}

	if (out == 3) for (var i=0; i<3; i++) runner[i] = false; 
	else{
		if (inning%2 > 0) guestScore = guestScore + score;
		else homeScore = homeScore + score;
	}
		   	   		
	drawBase(110, 46, 145, 34, runner[0]);
	drawBase(75, 28, 110, 16, runner[1]);
	drawBase(40, 46, 75, 34, runner[2]);   	
}

function drawBase(x1, y1, x2, y2, hasRunner, mycolor){
	canvas = document.getElementById("broadcast");
	ctx = canvas.getContext("2d");
	
	if (hasRunner) ctx.fillStyle = 'red';
	else ctx.fillStyle = 'white';	
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineTo(x1, 2*y2-y1);
	ctx.lineTo(2*x1-x2, y2);
	ctx.closePath()
	ctx.fill();
}


//顯示局數
function showInning(){
	detectHit();
	if (out==3 ) { inning++; out = 0; }
	if (inning < 7){
		canvas = document.getElementById("broadcast");
		ctx = canvas.getContext("2d");
		ctx.fillStyle = 'yellow'; 
		ctx.textBaseline = 'Top';
		ctx.font = "45px Arial";
		ctx.fillText(Math.ceil(inning/2).toString(), 160, 40);
		ctx.beginPath();
		if (inning%2 > 0) {
			ctx.moveTo(190, 40);
			ctx.lineTo(240, 40);
			ctx.lineTo(215, 10);
			if (isHome) document.getElementById("game").style.background = "url('icon/bgPitcher.jpg')";
			else document.getElementById("game").style.background = "url('icon/bgHitter.jpg')";
		}
		else {
			ctx.moveTo(190, 10);
			ctx.lineTo(240, 10);
			ctx.lineTo(215, 40);
			if (isHome) document.getElementById("game").style.background = "url('icon/bgHitter.jpg')";
			else document.getElementById("game").style.background = "url('icon/bgPitcher.jpg')";
		}
		ctx.fill();    
	}
}

function showTeam(){
	canvas = document.getElementById("broadcast");
	ctx = canvas.getContext("2d");
	var Img1 = new Image();
	var Img2 = new Image();
	Img1.onload = function(){ctx.drawImage(Img1, 250, 0);}
	Img2.onload = function(){ctx.drawImage(Img2, 500, 0);}
	if (isHome) { Img1.src = "icon/pcTeam.png"; Img2.src = "icon/userTeam.png"; }
	else { Img1.src = "icon/userTeam.png"; Img2.src = "icon/pcTeam.png"; }
}


function showOut(){
	canvas = document.getElementById("broadcast");
	ctx = canvas.getContext("2d");
	ctx.fillStyle = 'yellow';	
   	ctx.font = "40px Arial";
   	if (out < 2) ctx.fillText(out.toString() + " out", 580, 40); 
   	else ctx.fillText(out.toString() + " outs", 575, 40);
}

function alertResult(resultStr){
	$.blockUI({ 
		message: '<h1>' + resultStr +'</h1>', 
       	timeout: 2500});
}

//顯示分數
function showScore(){			
	document.getElementById("cardZone").style.display = "block";
	document.getElementById("tableZone").style.display = "none";
		
	canvas = document.getElementById("broadcast");
	ctx = canvas.getContext("2d");
	
	var lastCheck = false; // 最後一局檢查
	if (inning > 6) { //比賽結束
		showHit();
		setTimeout( function(){
		if ((guestScore < homeScore && isHome) || (guestScore > homeScore && !isHome)) alertResult(guestScore.toString() + " V.S. " + homeScore.toString() + "<br/>YOU WIN");
		else if ((guestScore < homeScore && !isHome) || (guestScore > homeScore && isHome)) alertResult(guestScore.toString() + " V.S. " + homeScore.toString() + "<br/>YOU LOSE");  
		else alertResult(guestScore.toString() + " V.S. " + homeScore.toString() + "<br/>TIE");  
		newGame = true; init();}, 2500);
	}
	
	else{
		if (inning == 6 && guestScore < homeScore) {
			if (isHome) isWin = true;
			else isWin = false;				
			lastCheck = true;
		}
		var tmpS = guestScore.toString() + " － " + homeScore.toString();
		ctx.fillStyle = 'yellow';	
	   	ctx.font = "45px Arial";
	   	ctx.fillText(tmpS, 345-(tmpS.length-5)*15, 40);

		if (lastCheck) { 
			if (isWin) alertResult(guestScore.toString() + " V.S. " + homeScore.toString() + "<br/>YOU WIN");
			else alertResult(guestScore.toString() + " V.S. " + homeScore.toString() + "<br/>YOU LOSE");
			newGame = true; 
			init(); 
		}
    }     
}



//顯示打擊結果 W-T-L
/*
	4-0-0 / 3-1-0 / 2-2-0 / 1-3-0 = HR / 3B / 2B / 1B
	3-0-1 = BB ; 2-1-1 = SH(有人) or BB(無人) ; 1-2-1 = SH(有人) or FO(無人) ; 0-3-1 = FO
	2-0-2 = SH(有人) or GO((無人) ; 1-1-2 / 0-2-2 = GO
	1-0-3 = SO ; 0-1-3 = DP(有人且不到兩出局) or SO(其他) ; 
	0-0-4 TP(壘上至少兩人且零出局) / (DP)壘上只有一人且不到兩出局 / SO(其他)
*/

function determineHit(){

	if ((isHome && inning%2 > 0) || (!isHome && inning%2 == 0)) { var tmp = win; win = lose; lose = tmp; } //勝負交換
	var cnt = 0;
	for (var i=0; i<3; i++) if (runner[i]) cnt++;

	switch(lose){
		case 0:
			switch(win){
				case 4: 
					if (cnt == 3) hit = "GS";
					else hit = "HR"; 
				break;
				case 3: hit = "3B"; break;
				case 2: hit = "2B"; break;
				case 1: hit = "1B"; break;
			}
		break;
		case 1:
			switch(win){
				case 3: 
					if (cnt > 0 && out < 2) hit = "1B"; //壘上有人，1B
					else hit = "BB"; //壘上無人就保送
					break;
				case 2: 					
					if (cnt > 0 && out < 2) hit = "SH"; //壘上有人，犧牲觸擊
					else hit = "BB"; //壘上無人就保送
				break;
				case 1: 
					if (cnt > 0 && out < 2) hit = "SH"; //壘上有人，犧牲觸擊
					else hit = "FO"; //壘上無人就出局
				break;
				case 0: hit = "FO"; break;
			}
		break;
		case 2:
			switch(win){
				case 2:
					if (cnt > 0 && out < 2) hit = "SH"; 
					else hit = "GO"; 
				break;
				case 1: case 0: hit = "GO"; break;
			}
		break;
		case 3:
			switch(win){
				case 1: hit = "SO"; break;
				case 0: 
					if (cnt > 0 && out < 2) hit = "DP";
					else hit = "SO";
				break;
			}
		break;
		case 4: 
			if (cnt >= 1 && out <=1 ){  //壘上有人, 最多一人出局
				if (cnt >= 2 && out == 0) hit = "TP"; 
				else hit = "DP";
			}
			else hit = "SO";
		break;
	}	    	
}

function showHit(){
	ctx = document.getElementById("broadcast").getContext("2d");
	ctx.fillStyle = 'white';	
	ctx.font = "30px Arial";
	ctx.fillText(hitString, 710, 40); 
	alertResult(hitString);
}


function detectHit(){
	if (navigator.language == "zh-TW") {
		switch (hit){
			case "GS": hitString = "滿貫全壘打"; break;
			case "HR": hitString = "全壘打"; break;
			case "3B": hitString = "三壘安打"; break;
			case "2B": hitString = "二壘安打"; break;
			case "1B": hitString = "一壘安打"; break;	
			case "BB": hitString = "保送"; break;
			case "FO": hitString = "高飛球出局"; break;
			case "GO": hitString = "滾地球出局"; break;
			case "SH": hitString = "犧牲打"; break;
			case "DP": hitString = "雙殺"; break;
			case "TP": hitString = "三殺"; break;
			case "SO": hitString = "三振出局"; break;			
		}
		if (out == 3) hitString = hitString + ", 三人出局";
	}
	else {
		switch (hit){
			case "GS": hitString = "Grand Slam"; break;
			case "HR": hitString = "Home Run"; break;
			case "3B": hitString = "Triple"; break;
			case "2B": hitString = "Double"; break;
			case "1B": hitString = "Single"; break;	
			case "BB": hitString = "Walk"; break;
			case "FO": hitString = "Fly Out"; break;
			case "GO": hitString = "Ground Out"; break;
			case "SH": hitString = "Sacrifice Hit"; break;
			case "DP": hitString = "Double Play"; break;
			case "TP": hitString = "Triple Play"; break;
			case "SO": hitString = "Strike Out"; break;
		}
		if (out == 3) hitString = hitString + ", 3 outs";
	}
}

function drawRCRectangle(ctx, x, y, width, height, radius){
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath()
	ctx.fill();
}
