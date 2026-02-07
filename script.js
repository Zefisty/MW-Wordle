const $ = id => document.getElementById(id);

let ships = [];
let lang="ru", secret, attempts=6, guesses=[], hintCount=0, streak=Number(localStorage.getItem("streak")||0), startTime=null, timerInt=null, firstGuessMade=false;

// Многоязычные тексты
const T = {
  ru:{labels:["Страна","Тир","Редкость","Класс","Год","Водоизмещение","Длина","Ширина"],attempts:"Попыток осталось",win:"🎉 Ты угадал за",lose:"⛔ Корабль был",hints:["Тир","Редкость","Класс"],hintBtn:"Подсказка 💡",streak:"🔥 Серия",surrender:"Сдаться",again:"Играть снова"},
  en:{labels:["Country","Tier","Rarity","Class","Year","Displacement","Length","Width"],attempts:"Attempts left",win:"🎉 You guessed in",lose:"⛔ Ship was",hints:["Tier","Rarity","Class"],hintBtn:"Hint 💡",streak:"🔥 Streak",surrender:"Surrender",again:"Play again"}
};

// Загрузка базы кораблей
fetch("ships.json")
  .then(res => res.json())
  .then(data => {
    ships = data;
    start();
  })
  .catch(err => alert("Ошибка загрузки базы кораблей"));

// Формат времени
function fmt(ms){const s=Math.floor(ms/1000);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");}

// Таймер
function startTimer(){if(startTime)return;startTime=Date.now();timerInt=setInterval(()=>{$("timer").textContent=fmt(Date.now()-startTime)},1000);}
function stopTimer(){clearInterval(timerInt);}

// Отрисовка интерфейса
function render(skipAnim=false){
  $("labels").innerHTML="";
  T[lang].labels.forEach(l=>{
    const d=document.createElement("div");
    d.className="square label";
    d.textContent=l;
    $("labels").appendChild(d);
  });
  $("attempts").textContent=T[lang].attempts+": "+attempts;
  $("streak").textContent=T[lang].streak+": "+streak;

  $("history").innerHTML="";
  guesses.forEach(ship=>{
    const row=document.createElement("div");
    row.className="grid";
    const sq=document.createElement("div");
    sq.className="square name";
    if(ship.name === secret.name){
      sq.classList.add("correct"); sq.textContent="✅ "+ship.name;
    } else {
      sq.classList.add("incorrect"); sq.textContent="❌ "+ship.name;
    }
    row.appendChild(sq);
    $("history").appendChild(row);
  });
}

// Автодополнение
$("guessInput").oninput=()=>{
  const v=$("guessInput").value.toLowerCase(); $("auto").innerHTML="";
  if(!v){$("auto").style.display="none"; return;}
  ships.filter(s=>s.name.toLowerCase().startsWith(v)).forEach(s=>{
    const d=document.createElement("div"); d.textContent=s.name;
    d.onclick=()=>{guessShip(s.name);}
    $("auto").appendChild(d);
  });
  if($("auto").children.length){
    const r=$("guessInput").getBoundingClientRect();
    $("auto").style.display="block";
    $("auto").style.top=(r.bottom+6+window.scrollY)+"px";
    $("auto").style.left=(r.left+window.scrollX)+"px";
    $("auto").style.width=(r.width-4)+"px"; // убрали 4 пикселя справа
  } else $("auto").style.display="none";
};

// Угадывание
function guessShip(name){
  const ship=ships.find(s=>s.name.toLowerCase()===name.toLowerCase());
  if(!ship) return;
  if(!firstGuessMade){firstGuessMade=true;$("surrender").style.display="inline-block"; startTimer();}
  attempts--; guesses.push(ship); $("guessInput").value=""; $("auto").style.display="none";
  render();
  if(ship.name===secret.name){stopTimer();streak++;localStorage.setItem("streak",streak);attempts=0;$("surrender").style.display="none";$("playAgain").style.display="inline-block"; alert(T[lang].win+" "+fmt(Date.now()-startTime));}
  else if(attempts===0){stopTimer();streak=0;localStorage.setItem("streak",0);$("surrender").style.display="none";$("playAgain").style.display="inline-block"; alert(T[lang].lose+" "+secret.name);}
}

// Сдача
$("surrender").onclick=()=>{
  stopTimer(); streak=0; localStorage.setItem("streak",0); attempts=0;
  render();
  $("surrender").style.display="none"; $("playAgain").style.display="inline-block";
  alert(T[lang].lose+" "+secret.name);
}

// Смена языка
document.querySelectorAll(".lang button").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll(".lang button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active"); lang=b.dataset.lang;
    $("guessInput").placeholder = lang==="ru" ? "Напиши название корабля" : "Type ship name";
    $("hintBtn").textContent=T[lang].hintBtn;
    $("playAgain").textContent=T[lang].again;
    $("surrender").textContent=T[lang].surrender;
    render();
  };
});

// Играть снова
$("playAgain").onclick=start;

// Старт игры
function start(){
  secret = ships[Math.floor(Math.random()*ships.length)];
  attempts = 6; guesses = []; hintCount = 0; firstGuessMade = false;
  startTime = null; stopTimer();
  $("timer").textContent="00:00"; $("playAgain").style.display="none"; $("surrender").style.display="none";
  render();
}
