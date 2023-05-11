//імпортуємо модулі, встановлюємо стартове відображення контенту
import {
  searchInput,
  searchBtn,
  mainContainer,
  detailContainer,
  city,
  curDate,
  weatherStatus,
  mainWeatherIcon,
  mainTemp,
  shortTable,
  modal,
  todayNav,
  day5Nav,
  errorDiv,
  todayDiv,
  nearbyDiv,
  daysDiv,
  smallDaysDiv,
  bigDaysDiv,
} from "./htmlElements.js";

import {
  timeConvert,
  getDay,
  getDayFull,
  getDate,
  getMonth,
  getTime,
  temp,
  scrollToTop,
  scrollDown
} from "./functions.js";

searchInput.value = "";
errorDiv.hidden = true;
mainContainer.hidden = true;
detailContainer.hidden = true;
nearbyDiv.hidden = true;
daysDiv.hidden = true;
todayNav.classList.add("active");

//переключаємо відображення погоди по клікам по меню
day5Nav.addEventListener("click", () => {
  if (errorDiv.hidden) {
    todayDiv.hidden = true;
    daysDiv.hidden = false;
    todayNav.classList.remove("active");
    day5Nav.classList.add("active");
  }
});

todayNav.addEventListener("click", () => {
  if (errorDiv.hidden) {
    todayDiv.hidden = false;
    daysDiv.hidden = true;
    todayNav.classList.add("active");
    day5Nav.classList.remove("active");
  }
});

//створюємо функцію запиту даних:
function getApi(api) {
  fetch(api).then((data) => {
    if (data.ok && !/cnt=/.test(api)) {
      data.json().then((data) => getWeather(data));
    }

    if (data.ok && /cnt=/.test(api) && !/find/.test(api)) {
      data.json().then((data) => getDetail(data.list));
    }

    if (data.ok && /find/.test(api)) {
      data.json().then((data) => getNearby(data.list));
    }

    if (!data.ok) {
      modal.hidden = true;
      daysDiv.hidden = true;
      nearbyDiv.hidden = true;
      errorDiv.hidden = false;
    }
  });
}

//встановлюємо поточну геолокацію.
document.addEventListener("DOMContentLoaded", () => {
  navigator.geolocation.getCurrentPosition(success, error);
  function success(pos) {
    let crd = pos.coords;
    getApi(
      `https://api.openweathermap.org/data/2.5/weather?lat=${crd.latitude}&lon=${crd.longitude}&units=metric&appid=b998541107a89d374df4d04c07df017d`
    );
  }
  function error() {
    alert(
      "Give permission to get your geolocation or input in search box your place!"
    );
    getApi(
      `https://api.openweathermap.org/data/2.5/weather?q=Lutsk&units=metric&appid=b998541107a89d374df4d04c07df017d`
    );
  }
});

//працюємо з інпутом
function searchLocation() {
  if (searchInput.value != "") {
    mainContainer.hidden = true;
    detailContainer.hidden = true;
    modal.hidden = false;
    getApi(
      `https://api.openweathermap.org/data/2.5/weather?q=${searchInput.value}&units=metric&appid=b998541107a89d374df4d04c07df017d`
    );
    searchInput.value = "";
  }
}

searchBtn.addEventListener("click", () => {
  searchLocation();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    e.preventDefault();
    searchLocation();
  }
});

//Відображаємо погоду:
function getWeather(data) {
  getApi(
    `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&units=metric&cnt=40&appid=b998541107a89d374df4d04c07df017d`
  );
  getApi(
    `https://api.openweathermap.org/data/2.5/find?lat=${data.coord.lat}&lon=${data.coord.lon}&cnt=5&units=metric&appid=b998541107a89d374df4d04c07df017d`
  );
  curDate.innerHTML = `${getDate(new Date())} ${getMonth(
    new Date()
  )} ${new Date().getFullYear()}`;
  let durationHour = Math.floor((data.sys.sunset - data.sys.sunrise) / 3600);
  let durationMin = ((data.sys.sunset - data.sys.sunrise) % 3600) / 60;
  if (durationMin % 10 != 0) {
    durationMin = +durationMin.toFixed(0) + 1;
  }
  if (durationMin < 10) {
    durationMin = `0${durationMin}`;
  }
  if (durationHour < 10) {
    durationHour = `0${durationHour}`;
  }
  let duration = `${durationHour}:${durationMin}`;
  city.innerHTML = `${data.name}, ${data.sys.country}`;
  searchInput.placeholder = city.innerHTML;
  weatherStatus.innerHTML = `${data.weather[0].description.replace(
    /\b\w/,
    (match) => match.toUpperCase()
  )}`;
  mainWeatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  mainTemp.innerHTML = `<h1>${temp(data.main.temp)}<sup>o</sup> C</h1>`;
  mainTemp.innerHTML += `<p>Real Feel ${temp(
    data.main.feels_like
  )}<sup>o</sup> C</p>`;
  shortTable.innerHTML = `<tr><td>Sunrise:</td><td>${timeConvert(
    data.sys.sunrise
  )}</td></tr><tr><td>Sunset:</td><td>${timeConvert(
    data.sys.sunset
  )}</td></tr><tr><td>Duration:</td><td>${duration}</td></tr>`;
  mainContainer.hidden = false;
  modal.hidden = true;
  errorDiv.hidden = true;
}

function getDetail(data) {
  let nextWeather = data.slice(0, 6);
  detailContainer.hidden = false;
  modal.hidden = true;
  getNextDay(data);
  getBigDay(nextWeather, detailContainer, "detail");
}

function getNearby(data) {
  data.shift();
  nearbyDiv.innerHTML = "";
  let p = document.createElement("p");
  p.innerHTML = "NEARBY PLACES";
  p.classList.add("nearbyTitle");
  nearbyDiv.append(p);
  let div = document.createElement("div");
  div.classList.add("nearbyPlaces");
  data.forEach((element) => {
    let divPlace = document.createElement("div");
    divPlace.classList.add("placeDiv");
    let h3 = document.createElement("h3");
    h3.innerHTML = element.name;
    divPlace.append(h3);
    h3.addEventListener("click", () => {
      getApi(
        `https://api.openweathermap.org/data/2.5/weather?q=${element.name}&units=metric&appid=b998541107a89d374df4d04c07df017d`
      );
      scrollToTop();
    });
    let img = document.createElement("img");
    img.src = `http://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png`;
    divPlace.append(img);
    let p = document.createElement("p");
    p.innerHTML = `${temp(element.main.temp)}<sup>o</sup> C`;
    divPlace.append(p);
    div.append(divPlace);
  });
  nearbyDiv.append(div);
  nearbyDiv.hidden = false;
}

function getNextDay(data) {
  smallDaysDiv.innerHTML = "";
  let smallDay = [];
  for (let i = 0; i < data.length; i += 8) {
    smallDay.push(data[i]);
  }

  smallDay.forEach((element) => {
    const date = new Date(element.dt * 1000);
    let div = document.createElement("div");
    div.classList.add("smallDay");
    smallDaysDiv.append(div);
    let h2 = document.createElement("h2");
    h2.innerHTML = getDay(date);
    div.append(h2);
    let h3 = document.createElement("h3");
    h3.innerHTML = `${getMonth(date)} ${getDate(date)}`;
    div.append(h3);
    let img = document.createElement("img");
    img.src = `http://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png`;
    div.append(img);
    let h1 = document.createElement("h1");
    h1.innerHTML = `${temp(element.main.temp)}<sup>o</sup> C`;
    div.append(h1);
    let p = document.createElement("p");
    p.innerHTML = `${element.weather[0].description.replace(/\b\w/, (match) =>
      match.toUpperCase()
    )}`;
    div.append(p);

    div.addEventListener("click", () => {
      document.querySelectorAll(".smallDay").forEach((element) => {
        element.classList.remove("daysActive");
      });
      div.classList.add("daysActive");
      let chooseDay = [];
      data.forEach((element) => {
        if (getDate(date) === getDate(new Date(element.dt * 1000))) {
          chooseDay.push(element);
        }
      });
      if (chooseDay.length > 6) {
        chooseDay.length = 6;
      }
      getBigDay(chooseDay, bigDaysDiv, "bigDays");
      scrollDown();
    });

    document.querySelector(".smallDay").classList.add("daysActive");
  });
  
  let todayMas = [];
  data.forEach((element) => {
    if (getDate(new Date()) === getDate(new Date(element.dt * 1000))) {
      todayMas.push(element);
    }
  });

  if (!!!todayMas.length) {
    todayMas = todayMas.concat(data);
  }
  if (todayMas.length > 6) {
    todayMas.length = 6;
  }
  getBigDay(todayMas, bigDaysDiv, "bigDays");
}

function getBigDay(data, parentEl, selector) {
  parentEl.innerHTML = "";
  parentEl.innerHTML = `<p class="dtTitle">HOURLY</p>`;
  let div = document.createElement("div");
  div.classList.add("hoursDetails");
  parentEl.append(div);
  const titleMas = [
    "",
    ``,
    "Forecast",
    "Temp (<sup>o</sup>C)",
    "Real Feel",
    "Wind (km/h)",
  ];
  let table = document.createElement("table");
  table.classList.add("hoursTable");
  div.append(table);
  for (let i = 0; i < titleMas.length; i++) {
    let tr = document.createElement("tr");
    tr.classList.add(`tr${i + 1 + selector}`);
    tr.classList.add("hoursTr");
    tr.innerHTML = `<td>${titleMas[i]}</td>`;
    table.append(tr);
  }

  data.forEach((element) => {
    const date = new Date(element.dt * 1000);
    document.querySelector(`.tr1${selector}`).innerHTML += `<td>${getDayFull(
      date
    )}<br>${getTime(date)}</td>`;
    document.querySelector(
      `.tr2${selector}`
    ).innerHTML += `<td><img class="imgImg" src="http://openweathermap.org/img/wn/${element.weather[0].icon}@2x.png"></td>`;
    document.querySelector(
      `.tr3${selector}`
    ).innerHTML += `<td>${element.weather[0].description.replace(
      /\b\w/,
      (match) => match.toUpperCase()
    )}</td>`;
    document.querySelector(`.tr4${selector}`).innerHTML += `<td>${temp(
      element.main.temp
    )}<sup>o</sup> C</td>`;
    document.querySelector(`.tr5${selector}`).innerHTML += `<td>${temp(
      element.main.feels_like
    )}<sup>o</sup> C</td>`;
    document.querySelector(`.tr6${selector}`).innerHTML += `<td>${(
      element.wind.speed * 3.6
    ).toFixed(1)}</td>`;
  });
  if (data.length <= 3) {
    document.querySelector(".imgImg").classList.add("imgBig");
  }
  if (day5Nav.classList.contains("active")) {
    daysDiv.hidden = false;
  }
}
