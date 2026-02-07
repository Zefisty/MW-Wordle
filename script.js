let ships = [];
let dataLoaded = false;
let lang = "ru", secret, attempts = 6, guesses = [], hintCount = 0, streak = Number(localStorage.getItem("streak")||0), startTime = null, timerInt = null, firstGuessMade = false;

const $ = id => document.getElementById(id);

// Загрузка базы кораблей
fetch("ships.json")
  .then(res => res.json())
  .then(data => {
    ships = data;
    dataLoaded = true;
    start();
  })
  .catch(err => alert("Ошибка загрузки базы кораблей"));

// Отрисовка деталей корабля (название)
function renderDetails(shipName) {
  const detailsDiv = $("details");
  detailsDiv.innerHTML = "";
  const sq = document.createElement("div");
  sq.className = "square name";
  sq.textContent = shipName;
  detailsDiv.appendChild(sq);
}

// Функция угадывания
function guessShip(name) {
  const ship = ships.find(s => s.name.toLowerCase() === name.toLowerCase());
  if(!ship) return;

  if(!firstGuessMade) {
    firstGuessMade = true;
    $("surrender").style.display = "inline-block";
    startTimer();
  }

  attempts--;
  guesses.push(ship);
  $("guessInput").value = "";
  $("auto").style.display = "none";

  // Отрисовка квадрата с именем
  const detailsDiv = $("details");
  const sq = document.createElement("div");
  sq.className = "square name";
  if(ship.name === secret.name) {
    sq.classList.add("correct");
    sq.textContent = "✅ " + ship.name;
  } else {
    sq.classList.add("incorrect");
    sq.textContent = "❌ " + ship.name;
  }
  detailsDiv.appendChild(sq);

  // Дальше уже существующий render() и animateLastRow
  render(true);
  animateLastRow(() => {
    if(ship.name === secret.name) {
      stopTimer(); streak++; localStorage.setItem("streak", streak); attempts=0;
      $("surrender").style.display="none"; $("playAgain").style.display="inline-block";
      alert(`🎉 Ты угадал за ${fmt(Date.now()-startTime)}`);
    } else if(attempts===0) {
      stopTimer(); streak=0; localStorage.setItem("streak",0);
      $("surrender").style.display="none"; $("playAgain").style.display="inline-block";
      alert(`⛔ Корабль был ${secret.name}`);
    }
  });
}

// Старт игры
function start() {
  secret = ships[Math.floor(Math.random() * ships.length)];
  attempts = 6;
  guesses = [];
  hintCount = 0;
  firstGuessMade = false;
  startTime = null;
  stopTimer();
  $("timer").textContent = "00:00";
  $("playAgain").style.display = "none";
  $("surrender").style.display = "none";
  $("details").innerHTML = "";
  render();
}
