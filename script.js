let search_text;
let list_count_track;

let search_div = document.getElementById("search");
let searchbar = document.getElementsByClassName("searchbar")[0];

document.addEventListener("click", (event) => {
  if (!searchbar.contains(event.target)) {
    document.getElementById("list").style.display = "none";
  }
});

search_div.addEventListener("focus", () => {
  if (search_div.value.length > 2) {
    search_text = document.getElementById("search").value;
    document.getElementById("list").style.display = "unset";
    autocomplete(search_div.value, "address");
    search_div.removeEventListener("focus", search_div);
  }
});

function input_changed() {
  if (search_div.value.length < 3) {
    document.getElementById("list").style.display = "none";
  } else {
    search_text = document.getElementById("search").value;
    document.getElementById("list").style.display = "unset";
    autocomplete(search_div.value, "address");
  }
}

async function autocomplete(location, type) {
  let count = 0;
  list_count_track = 0;
  let api_response;
  await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?text=${location}&apiKey=6d962d3d6f0f4dc4ab8149a67362be81`
  )
    .then((response) => response.json())
    .then((result) => (api_response = result));

  let obj = {};
  obj[type === "address" ? "name" : "suburb"] = "";
  obj.county = "";
  obj.state = "";
  obj.country = "";
  obj.lon = "";
  obj.lat = "";

  if (list.firstChild) {
    while (list.firstChild) {
      list.firstChild.remove();
    }
  }

  obj_search_list = [];

  while (count < api_response.features.length) {
    let a = {};
    for (i = 0; i < Object.keys(obj).length; i++) {
      a[Object.keys(obj)[i]] =
        api_response.features[count].properties[Object.keys(obj)[i]];
    }
    obj_search_list.push(a);
    if (type === "coordinates") {
      search_div.value = generate_search_string(a);
    } else {
      updateSearchList(a);
    }
    count++;
  }

  listItemsClicked(obj_search_list);
}

function updateSearchList(obj) {
  let str = generate_search_string(obj);
  let list = document.getElementById("list");
  let element = document.createElement("span");
  element.classList.add("list_item");
  element.innerHTML = str;
  list.appendChild(element);
  listItemsClicked(obj);
}

function generate_search_string(obj) {
  let str = "";
  for (let i in obj) {
    if (obj[i] !== undefined && i !== "country" && i !== "lat" && i !== "lon") {
      str = str + obj[i] + " , ";
    } else if (i === "country") {
      str = str + obj[i];
    }
  }

  return str;
}

function listItemsClicked(obj_search_list) {
  let location_list = document.getElementsByClassName("list_item");
  for (let i = 0; i < location_list.length; i++) {
    location_list[i].addEventListener("click", () => {
      document.getElementById("search").value = location_list[i].innerHTML;
      document.getElementById("list").style.display = "none";
      let temp = obj_search_list[i];
      if (temp && temp.lat !== undefined && temp.lon !== undefined) {
        object_received(temp);
      }
    });
  }
}

function current_location() {
  navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  str = `${latitude},${longitude}`;
  autocomplete(str, "coordinates");
}

function onError() {
  console.log(`Failed to get your location!`);
}

async function fetchWeatherData(link) {
  let api_response = await fetch(link).then((response) => response.json());
  let currentWeather = {};
  currentWeather.current_temp = api_response.current.temp_c;
  currentWeather.text = api_response.current.condition.text;
  currentWeather.icon = api_response.current.condition.icon;
  let time = api_response.current.last_updated.slice(11,13);
  if(time.slice(0,1) == "0"){
    currentHour = time.slice(1,2)
  }else{
    currentHour = time
  }
  let hourlyWeather = [];
  let dailyWeather = [];

  for (let i = currentHour; i < 24; i++) {
    if (hourlyWeather.length != 10) {
      let response = api_response.forecast.forecastday[0].hour[i];
      let obj = {};
      obj.current_temp = parseInt(response.temp_c);
      obj.current_time = response.time.slice(11);
      obj.text = response.condition.text;
      obj.icon = response.condition.icon;
      hourlyWeather.push(obj);
    } else {
      break;
    }
  }
  let i = 0
  while (hourlyWeather.length < 10) {
    let response =
      api_response.forecast.forecastday[1].hour[i++];
    let obj = {};
    obj.current_temp = parseInt(response.temp_c);
    obj.current_time = response.time.slice(11);
    obj.text = response.condition.text;
    obj.icon = response.condition.icon;
    hourlyWeather.push(obj);
  }
  let response = api_response.forecast.forecastday;
  for (let i = 0; i < response.length; i++) {
    let obj = {};
    obj.date = response[i].date;
    obj.text = response[i].day.condition.text;
    obj.icon = response[i].day.condition.icon;
    obj.max_temp = parseInt(response[i].day.maxtemp_c);
    obj.min_temp = parseInt(response[i].day.mintemp_c);
    dailyWeather.push(obj);
  }
  return [currentWeather, hourlyWeather, dailyWeather];
}

async function object_received(obj) {
  let a = document.getElementById("box1");
  let b = document.getElementById("box2");
  let link = `http://api.weatherapi.com/v1/forecast.json?key=3605460f65b34df89f3144948231608&q=${obj.lat},${obj.lon}&days=10&aqi=no&alerts=no`;
  let result = await fetchWeatherData(link);
  let currentWeather = result[0]
  b.getElementsByTagName("img")[0].src = currentWeather.icon
  let hourlyWeather = result[1]
  let dailyWeather = result[2]
  a.innerHTML = parseInt(currentWeather.current_temp)+"&deg;C"
  b.getElementsByClassName("text")[0].innerHTML = currentWeather.text

  let c = document.getElementsByClassName("hourly_weather")
  for(let i = 0 ; i < hourlyWeather.length ; i++){
    c[i].getElementsByTagName("img")[0].src = hourlyWeather[i].icon
    c[i].getElementsByClassName("time")[0].innerHTML = hourlyWeather[i].current_time
    c[i].getElementsByClassName("text")[0].innerHTML = hourlyWeather[i].text
    c[i].getElementsByClassName("temperature")[0].innerHTML = hourlyWeather[i].current_temp+"&deg;C"
  }

  let d = document.getElementsByClassName("day")
  for(let i = 0 ; i < dailyWeather.length ; i++){
    d[i].getElementsByClassName("date")[0].innerHTML = dailyWeather[i].date
    d[i].getElementsByClassName("status")[0].innerHTML = dailyWeather[i].text
    d[i].getElementsByTagName("img")[0].src = dailyWeather[i].icon
    d[i].getElementsByClassName("max_temp")[0].innerHTML = dailyWeather[i].max_temp+"&deg;C"
    d[i].getElementsByClassName("min_temp")[0].innerHTML = dailyWeather[i].min_temp+"&deg;C"
  }
}