const T={
  ru:{labels:["Страна","Тир","Редкость","Класс","Год","Водоизмещение","Длина","Ширина"],attempts:"Попыток осталось",win:"🎉 Ты угадал за",lose:"⛔ Корабль был",hintBtn:"Подсказка 💡",streak:"🔥 Серия",surrender:"Сдаться",again:"Играть снова"},
  en:{labels:["Country","Tier","Rarity","Class","Year","Displacement","Length","Width"],attempts:"Attempts left",win:"🎉 You guessed in",lose:"⛔ Ship was",hintBtn:"Hint 💡",streak:"🔥 Streak",surrender:"Surrender",again:"Play again"}
};

let ships=[];
let lang="ru",secret,attempts,guesses=[],hintCount=0;
let streak=Number(localStorage.getItem("streak")||0);
let startTime=null,timerInt=null,firstGuess=false;

const $=id=>document.getElementById(id);

fetch("ships.json")
  .then(r=>r.json())
  .then(data=>{ships=data; start();});

function fmt(ms){
  const s=Math.floor(ms/1000);
  return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}

function startTimer(){
  if(startTime) return;
  startTime=Date.now();
  timerInt=setInterval(()=>{$("timer").textContent=fmt(Date.now()-startTime)},1000);
}

function stopTimer(){clearInterval(timerInt);}

function guessShip(name){
  const ship=ships.find(s=>s.name.toLowerCase()===name.toLowerCase());
  if(!ship) return;

  if(!firstGuess){
    firstGuess=true;
    $("surrender").style.display="inline-block";
    startTimer();
  }

  attempts--;
  guesses.push(ship);
  render(true);

  if(ship.name===secret.name){
    stopTimer();
    streak++;
    localStorage.setItem("streak",streak);
    $("surrender").style.display="none";
    $("playAgain").style.display="inline-block";
    alert(T[lang].win+" "+fmt(Date.now()-startTime));
  } else if(attempts===0){
    stopTimer();
    streak=0;
    localStorage.setItem("streak",0);
    $("surrender").style.display="none";
    $("playAgain").style.display="inline-block";
    alert(T[lang].lose+" "+secret.name);
  }
}

function render(){
  $("attempts").textContent=T[lang].attempts+": "+attempts;
  $("streak").textContent=T[lang].streak+": "+streak;
}

function start(){
  secret=ships[Math.floor(Math.random()*ships.length)];
  attempts=6;
  guesses=[];
  hintCount=0;
  firstGuess=false;
  startTime=null;
  stopTimer();
  $("timer").textContent="00:00";
  $("surrender").style.display="none";
  $("playAgain").style.display="none";
  render();
}

$("playAgain").onclick=start;
