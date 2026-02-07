const T = {
  ru: {
    labels:["Страна","Тир","Редкость","Класс","Год","Водоизмещение","Длина","Ширина"],
    attempts:"Попыток осталось",
    win:"🎉 Ты угадал за",
    lose:"⛔ Корабль был",
    hints:["Тир","Редкость","Класс"],
    hintBtn:"Подсказка 💡",
    streak:"🔥 Серия",
    surrender:"Сдаться",
    again:"Играть снова"
  },
  en: {
    labels:["Country","Tier","Rarity","Class","Year","Displacement","Length","Width"],
    attempts:"Attempts left",
    win:"🎉 You guessed in",
    lose:"⛔ Ship was",
    hints:["Tier","Rarity","Class"],
    hintBtn:"Hint 💡",
    streak:"🔥 Streak",
    surrender:"Surrender",
    again:"Play again"
  }
};

let ships = [];
let dataLoaded = false;

fetch("ships.json")
  .then(res => { if(!res.ok) throw new Error("ships.json not found"); return res.json(); })
  .then(data => { ships = data; dataLoaded = true; start(); })
  .catch(err => { alert("Ошибка загрузки базы кораблей"); console.error(err); });

let lang="ru", secret, attempts=6, guesses=[], hintCount=0, streak=Number(localStorage.getItem("streak")||0), startTime=null, timerInt=null, firstGuessMade=false;
const $ = id => document.getElementById(id);

function fmt(ms){ const s=Math.floor(ms/1000); return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0"); }
function cmp(v,c,num=false){let col="red",i="❌"; if(v===c){col="green";i="✅";} else if(num){col="orange";i=v>c?"⬇️":"⬆️";} return {v,col,i}; }

function render(skipAnimation=false){
  $("labels").innerHTML="";
  T[lang].labels.forEach(l=>{ const d=document.createElement("div"); d.className="square label"; d.textContent=l; $("labels").appendChild(d); });
  $("attempts").textContent = T[lang].attempts+": "+attempts;
  $("streak").textContent = T[lang].streak+": "+streak;
  $("history").innerHTML="";
  guesses.forEach((ship,idx)=>{
    const row=document.createElement("div"); row.className="grid";
    [
      cmp(ship.country[lang],secret.country[lang]),
      cmp(ship.tier,secret.tier,true),
      cmp(ship.rarity[lang],secret.rarity[lang]),
      cmp(ship.class[lang],secret.class[lang]),
      cmp(ship.year,secret.year,true),
      cmp(ship.displacement,secret.displacement,true),
      cmp(ship.length,secret.length,true),
      cmp(ship.width,secret.width,true)
    ].forEach(c=>{
      const col=document.createElement("div"); col.className="col";
      const sq=document.createElement("div"); sq.className="square "+c.col; sq.innerHTML=c.v+" "+c.i;
      if(idx===guesses.length-1 && !skipAnimation) sq.classList.add("reveal");
      col.appendChild(sq); row.appendChild(col);
    });
    $("history").appendChild(row);
  });
  const keys=["tier","rarity","class"];
  document.querySelectorAll(".hint-square").forEach((sq,i)=>{
    if(i<hintCount){ let value = keys[i]==="tier"?secret.tier:secret[keys[i]][lang]; sq.textContent=T[lang].hints[i]+": "+value; sq.classList.add("used"); }
    else{ sq.textContent="💡"; sq.classList.remove("used"); }
  });
}

function animateLastRow(callback){
  const lastRow=$("history").lastElementChild;
  if(!lastRow){callback(); return;}
  const squares=Array.from(lastRow.querySelectorAll(".square"));
  squares.forEach((sq,i)=>{ sq.style.opacity=0; sq.style.transform="scale(0.85)"; setTimeout(()=>{ sq.classList.add("reveal"); if(i===squares.length-1) setTimeout(callback,350); }, i*150); });
}

function startTimer(){ if(startTime) return; startTime=Date.now(); timerInt=setInterval(()=>{$("timer").textContent=fmt(Date.now()-startTime)},1000); }
function stopTimer(){ clearInterval(timerInt); }

function guessShip(name){
  const ship=ships.find(s=>s.name.toLowerCase()===name.toLowerCase()); if(!ship) return;
  if(!firstGuessMade){firstGuessMade=true; $("surrender").style.display="inline-block"; startTimer();}
  attempts--; guesses.push(ship); $("guessInput").value=""; $("auto").style.display="none";
  render(true); animateLastRow(()=>{
    if(ship.name===secret.name){ stopTimer(); streak++; localStorage.setItem("streak",streak); attempts=0; $("surrender").style.display="none"; $("playAgain").style.display="inline-block"; alert(T[lang].win+" "+fmt(Date.now()-startTime)); }
    else if(attempts===0){ stopTimer(); streak=0; localStorage.setItem("streak",0); $("surrender").style.display="none"; $("playAgain").style.display="inline-block"; alert(T[lang].lose+" "+secret.name); }
  });
}

$("guessInput").oninput=()=>{
  const v=$("guessInput").value.toLowerCase(); $("auto").innerHTML="";
  if(!v){$("auto").style.display="none"; return;}
  ships.filter(s=>s.name.toLowerCase().startsWith(v)).forEach(s=>{ const d=document.createElement("div"); d.textContent=s.name; d.onclick=()=>guessShip(s.name); $("auto").appendChild(d); });
  if($("auto").children.length){ const r=$("guessInput").getBoundingClientRect(); $("auto").style.top=(r.bottom+6+window.scrollY)+"px"; $("auto").style.left=(r.left+window.scrollX)+"px"; $("auto").style.width=r.width+"px"; $("auto").style.display="block"; } else $("auto").style.display="none";
};

$("hintBtn").onclick=()=>{if(hintCount>=3)return; hintCount++; render(true);}
$("surrender").onclick=()=>{ stopTimer(); streak=0; localStorage.setItem("streak",0); attempts=0; render(true); $("surrender").style.display="none"; $("playAgain").style.display="inline-block"; alert(T[lang].lose+" "+secret.name); }

document.querySelectorAll(".lang button").forEach(b=>{ b.onclick=()=>{
  document.querySelectorAll(".lang button").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  lang=b.dataset.lang;
  $("guessInput").placeholder=lang==="ru"?"Напиши название корабля":"Type ship name";
  $("hintBtn").textContent=T[lang].hintBtn;
  $("playAgain").textContent=T[lang].again;
  $("surrender").textContent=T[lang].surrender;
  render(true);
};});

$("playAgain").onclick=start;

function start(){ if(!dataLoaded) return; secret=ships[Math.floor(Math.random()*ships.length)]; attempts=6; guesses=[]; hintCount=0; firstGuessMade=false; startTime=null; stopTimer(); $("timer").textContent="00:00"; $("playAgain").style.display="none"; $("surrender").style.display="none"; render(); }
