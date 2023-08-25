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

  let obj = {}
  obj[type === "address" ? "name" : "suburb"] = ""
  obj.county = ""
  obj.state = ""
  obj.country = ""
  obj.lon = ""
  obj.lat = ""

  console.log(api_response.features.length);
  if (list.firstChild) {
    while (list.firstChild) {
      list.firstChild.remove();
    }
  }
  while (count < api_response.features.length) {
    let a = {};
    for (i = 0; i < Object.keys(obj).length; i++) {
      a[Object.keys(obj)[i]] =
        api_response.features[count].properties[Object.keys(obj)[i]];
    }
    if (type === "coordinates") {
      search_div.value = generate_search_string(a);
    } else {
      updateSearchList(a);
    }
    count++;
  }
}

function updateSearchList(obj) {
  let str = generate_search_string(obj);
  let list = document.getElementById("list");
  let element = document.createElement("span");
  element.classList.add("list_item");
  element.innerHTML = str;
  list.appendChild(element);
  listItemsClicked();
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

function listItemsClicked() {
  let location_list = document.getElementsByClassName("list_item");
  for (let i = 0; i < location_list.length; i++) {
    location_list[i].addEventListener("click", () => {
      document.getElementById("search").value = location_list[i].innerHTML;
      document.getElementById("list").style.display = "none";
    });
  }
}

function current_location() {
  navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  str = `${latitude}+,+${longitude}`;
  autocomplete(str, "coordinates");
}

function onError() {
  console.log(`Failed to get your location!`);
}
