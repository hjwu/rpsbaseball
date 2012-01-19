var result = 0, preIndex = null;
var win = 0, lose = 0, tie = 0;
var card = new Array(9);
var usrCard = new Array();
var pcCard = new Array();
var pickIndex = new Array();
var remainIndex = new Array();
var homeScore = null, guestScore = null, inning = null, out = null;
var runner = new Array(3);
var delayTime = 500;
var hit = null, newGame = true;

function init(){	
	for (var i=0; i<9; i++) card[i] = i%3;
	if (newGame) { 
		var randHome = Math.ceil(2*Math.random());
		if (randHome == 1) { isHome = true; $("#game").css("background-image", "url('icon/bgPitcher.jpg')"); }
		else { isHome = false; $("#game").css("background-image", "url('icon/bgHitter.jpg')"); }
		inning = 1; 
		out = 0;
		for (var i=0; i<3; i++) runner[i] = false; 
		hit = null;
		homeScore = 0;
		guestScore = 0;
		showTeam();
		newGame = false; 
		$("#user").attr("src", "icon/user.png");
		$("#pc").attr("src", "icon/pc.png");
	}

	deal();	
	generateZone();
	drawNav();
}

//亂數產生牌
function deal(){
	var randnb = Math.ceil(9*Math.random());
	for (var i=0; i<randnb; i++) {
		var rand1 = Math.floor(9*Math.random());
		var rand2 = Math.floor(9*Math.random());
		var tmp = null;
		tmp = card[rand1]; card[rand1] = card[rand2]; card[rand2] = tmp;
	}
	pickIndex = [0,1,2,3];
	remainIndex = [0,1,2,3,4,5,6,7,8];
}

//發牌區
function generateZone(){
	tie = 0; win = 0; lose = 0;
	for (var i=0; i<9; i++){
		document.getElementById("card[" + i.toString() + "]").setAttribute("onmouseover", "document.body.style.cursor='pointer'");
		document.getElementById("card[" + i.toString() + "]").setAttribute("onmouseout", "document.body.style.cursor='default'");
		document.getElementById("card[" + i.toString() + "]").setAttribute("src", "icon/back.png");
		document.getElementById("card[" + i.toString() + "]").setAttribute("onclick", "pickup("+ i.toString() + ")");

		
		if (i<4){
			document.getElementById("pc[" + i.toString() + "]").setAttribute("src", "icon/blank.png");
			document.getElementById("usr[" + i.toString() + "]").setAttribute("src", "icon/blank.png");			
		}}
}

//選牌
function pickup(index){
	//人選牌	
	document.getElementById("card[" + index.toString() + "]").setAttribute("src", "icon/blank.png");
	document.getElementById("usr[" + usrCard.length.toString() + "]").setAttribute("src", getCard(card[index]));	
	usrCard.push(card[index]);
	for (var i=0; i<remainIndex.length; i++) {
		document.getElementById("card[" + remainIndex[i].toString() + "]").removeAttribute("onclick"); //鎖定所有可選牌
		document.getElementById("card[" + remainIndex[i].toString() + "]").removeAttribute("onmouseover");
		if (remainIndex[i] == index) { remainIndex.splice(i, 1); i--; }
	}

	//電腦選牌
	setTimeout(function(){
		var rindex = remainIndex[Math.floor(remainIndex.length*Math.random())];			
		document.getElementById("card[" + rindex.toString() + "]").setAttribute("src", "icon/blank.png");
		if ((isHome && inning%2 > 0) || (!isHome && inning%2 == 0)) document.getElementById("pc[" + pcCard.length.toString() + "]").setAttribute("src", "icon/hitter.png");
		else document.getElementById("pc[" + pcCard.length.toString() + "]").setAttribute("src", "icon/pitcher.png");
		
		for (var i=0;i<remainIndex.length; i++)	{ 
			if (remainIndex[i] == rindex) { remainIndex.splice(i, 1); i--; }
			else {
				document.getElementById("card[" + remainIndex[i].toString() + "]").setAttribute("onclick", "pickup("+ remainIndex[i].toString() + ")"); //解除鎖定所有可選牌
				document.getElementById("card[" + remainIndex[i].toString() + "]").setAttribute("onmouseover", "document.body.style.cursor='pointer'"); 
			}
		}

		pcCard.push(card[rindex]);

		if (remainIndex.length == 1) {
			setTimeout(function(){
				drawLinerGradient(700, 'white', "black", 324);
				document.getElementById("cardZone").style.display = "none"; //最後隱藏
				document.getElementById("tableZone").style.display = "block"; //顯示出比賽區
				for (var i=0; i<4; i++) {
					document.getElementById("usr[" + i.toString() + "]").setAttribute("onclick", "compare(" + i.toString() + ")");
					document.getElementById("usr[" + i.toString() + "]").setAttribute("onmouseover", "document.body.style.cursor='pointer'");
					document.getElementById("usr[" + i.toString() + "]").setAttribute("onmouseout", "document.body.style.cursor='default'");
				}
			}, delayTime);
		}												
	}, delayTime);
}

function getCard(objCard){
	switch(result){
		case 0: //tie
		case 3:
			if (objCard == 0) return ("icon/cardSt.png");
			else if (objCard == 1) return ("icon/cardRt.png");
			else return ("icon/cardPt.png");
		break;
		case 1: //you lose
			if (objCard == 0) return ("icon/cardSl.png");
			else if (objCard == 1) return ("icon/cardRl.png");
			else return ("icon/cardPl.png");	
		break;
		case 2://you win
			if (objCard == 0) return ("icon/cardSw.png");
			else if (objCard == 1) return ("icon/cardRw.png");
			else return ("icon/cardPw.png");
		break;
	}
}

function compare(userIndex){
	var gameOrder = (4-pickIndex.length).toString();
	var tmpIndex = Math.floor(pickIndex.length*Math.random()); 
	var PCIndex = pickIndex[tmpIndex]; //可選的 index
	result = (pcCard[PCIndex]-usrCard[userIndex]+3)%3;
	
	document.getElementById("user_result" + gameOrder).setAttribute("src", getCard(usrCard[userIndex]));
	document.getElementById("user_result" + gameOrder).style.display = "inline";
	if (result == 0) tie++;
	else if (result == 1) lose++;
	else win++;
	result = 3-result;
	document.getElementById("PC_result" + gameOrder).setAttribute("src", getCard(pcCard[PCIndex]));	
	document.getElementById("PC_result" + gameOrder).style.display = "inline";
	document.getElementById("usr[" + userIndex.toString() + "]").removeAttribute("onclick");
	document.getElementById("usr[" + userIndex.toString() + "]").removeAttribute("onmouseover");
	document.getElementById("usr[" + userIndex.toString() + "]").removeAttribute("onmouseout");
	if (gameOrder > 0) document.getElementById("usr[" + preIndex.toString() + "]").setAttribute("src", "icon/blank.png");	
	preIndex = userIndex;
	for (var i=0; i<4; i++) {
		document.getElementById("usr[" + i.toString() + "]").style.border = "3px rgba(0,0,0,0) solid";
		document.getElementById("pc[" + i.toString() + "]").style.border = "3px rgba(0,0,0,0) solid";
	}
	document.getElementById("usr[" + userIndex.toString() + "]").style.border = "3px solid yellow";
	result = 0;
	document.getElementById("pc[" + PCIndex.toString() + "]").setAttribute("src", getCard(pcCard[PCIndex]));
	document.getElementById("pc[" + PCIndex.toString() + "]").style.border = "3px solid yellow";
	pickIndex.splice(tmpIndex,1);
	if (gameOrder == 3) { //投打對決結束
		document.getElementById("usr[" + preIndex.toString() + "]").setAttribute("src", "icon/blank.png");
		setTimeout(function(){
			determineHit();		
			init();
			for (var i=0; i<4; i++) {
				document.getElementById("usr[" + i.toString() + "]").style.border = "0";
				document.getElementById("pc[" + i.toString() + "]").style.border = "0";
				document.getElementById("user_result" + i.toString()).style.display = "none";
				document.getElementById("PC_result" + i.toString()).style.display = "none";
			}
			usrCard.length = 0;
			pcCard.length = 0;}, delayTime)
	}
}

