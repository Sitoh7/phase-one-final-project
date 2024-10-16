
let form = document.getElementById('weatherForm')
let cityLat;
let cityLon;
let weather_code
let currentTemp = document.getElementById("temperature")
let currentCondition = document.getElementById("weathercondition")
let currentIcon = document.getElementById("weathericon")
let currentTime = new Date().getTime()
let time = document.getElementById("time")
let dailyforecastobj;
let cityobj;
let namesList = document.getElementById("history")
let cityName = document.getElementById("cityName")

document.addEventListener('DOMContentLoaded',(e)=>{
    e.preventDefault()
    
    //fetchNames()
    
    
})

form.addEventListener('submit',e=>{
    e.preventDefault()
    removecurrentcontent(e.target.cityName.value)
    
    // getcitycoordiates(e.target.cityName.value)    
   history(e.target.cityName.value)
   form.reset()
})

function  removecurrentcontent(x){
    let container = document.getElementById("forecast")
    while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    let container2 = document.getElementById("week")
    while (container2.firstChild) {
        container2.removeChild(container2.firstChild);
      }
      getcitycoordiates(x)   
}

function getcitycoordiates(city){    
    fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json`)
    .then(resp=>resp.json())
    .then(data=>{
    const cityResult = data.find(result => {
        return  (result.addresstype === 'city' || result.type === 'town' || result.type === 'village');
      });    
      if (cityResult) {
        cityLat = cityResult.lat
        cityLon = cityResult.lon
        getWeather(cityLat,cityLon)
      } else {
        console.error('City not found or the result is not a city.');
        return null;
      }
})
}

function getWeather(latitude,longitude){
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,precipitation_probability_max&timeformat=unixtime&timezone=auto&past_days=7`)
    .then(resp=>resp.json())
    .then(data=>{
        currentTemp.textContent = `Current Temperature: ${data.current.temperature_2m}°C`
        time.textContent = unixtimetotime(new Date().getTime(),data.timezone) + " " + data.timezone_abbreviation
       
        weather_code = data.current.weather_code
        getforecast(data.current.time,data)
        getweekly(data)

        //covert weather code to text and image
      weathercodeText(weather_code,currentCondition)
        weathercodeImage(weather_code,currentIcon)
  
})
}
function weathercodeText(code,textId) {
    return weathercode().then(condition => {
        return condition[code].day.description;  
    }).then(description => {
        textId.textContent = description;;})
}

function weathercodeImage(code,imageid){
    return weathercode().then(data => {
        return data[code].day.image;  
    }).then(description => {
        imageid.src = description;;})
}

async function weathercode() {
    const resp = await fetch('http://localhost:3000/weather');
    const data = await resp.json();
    return data;
}


function getforecast(time,data){
    
     const totalforecst =data.hourly.time
     const dailyforecast = totalforecst.map((num,index)=>({ number: num, index: index })).filter(item => item.number > time && item.number<= time+43200);
    //console.log(dailyforecast)
    let dailyforecastobj= []
    for(i=0;i<dailyforecast.length;i++){

        let dailyforecastobj2 = {time: dailyforecast[i].number, temperature:data.hourly.temperature_2m[dailyforecast[i].index],
                  precipitation_probability: data.hourly.precipitation_probability[dailyforecast[i].index],
                 weather_code:  data.hourly.weather_code[dailyforecast[i].index], }
                 dailyforecastobj.push(dailyforecastobj2)          
    }

    
    
   
    for(i=0;i<dailyforecastobj.length;i++){
        let dailyforecast = document.getElementById('forecast') 
        let li = document.createElement('div')
        dailyforecastobj[i].time = unixtimetotime(dailyforecastobj[i].time,data.timezone)
        dailyforecastobj[i].weather_code
        let img = document.createElement(`img`)
        weathercodeImage(dailyforecastobj[i].weather_code,img)
        li.innerHTML = dailyforecastobj[i].time
        li.classList.add('forecastItems')
        li2 = document.createElement('p')
        li2.innerHTML = `${dailyforecastobj[i].temperature}°C <br>${dailyforecastobj[i].precipitation_probability}%	&#x1F327;`
        li.appendChild(li2)
        dailyforecast.appendChild(li)
        li.appendChild(img)
        
    }
    
}


function getweekly(data){
        for(i=0;i<14;i++){
            let week = document.getElementById("week")
            let li1 = document.createElement("p")
            let li2 = document.createElement("p")
            let li3 = document.createElement("p")
            let li4 = document.createElement("img")
            let li5 = document.createElement("p")
            li1.classList.add("div")
            li1.textContent = unixtimetoday(data.daily.time[i],data.timezone)
            li2.textContent = `${data.daily.temperature_2m_max[i]}°C`
             weathercodeText(data.daily.weather_code[i],li3)
             weathercodeImage(data.daily.weather_code[i],li4)
             li5.innerHTML = `${data.daily.precipitation_probability_max[i]}% &#x1F327;`
            week.appendChild(li1)
            li1.appendChild(li2)
            li1.appendChild(li5)
            li1.appendChild(li3)
            li1.appendChild(li4)
            
            
        }
}




function unixtimetotime(unixtime,timeZone) {
    //const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get user's current time zone

    // Ensure the Unix time is in seconds by checking if it's too large
    let timestamp = unixtime > 10000000000 ? unixtime : unixtime * 1000; // If already in milliseconds, use as is; otherwise multiply by 1000

    // Create a Date object
    let date = new Date(timestamp);

    // Get formatted time in user's local time zone
     const day = date.toLocaleString('en-US',{weekday:"long",timeZone:timeZone});;
     const time = date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:timeZone})
    return `${time}`;
}
function unixtimetoday(unixtime,timeZone) {
     let timestamp = unixtime > 10000000000 ? unixtime : unixtime * 1000; 
    let date = new Date(timestamp);
    const day = date.toLocaleString('en-US',{weekday:"long",timeZone:timeZone});;
     const time = date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:timeZone})
    return `${day}`;
}


///TEST


const fetchNames = async () => {
    const response = await fetch('http://localhost:3000/history');
    const names = await response.json();

namesList.innerHTML = ''; // Clear existing list

// Display names on the page
names.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name.name;

    // Create a delete button for each name
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.onclick = () => deleteName(name.id);

    li.appendChild(deleteButton);
    namesList.appendChild(li);
    li.onclick = () => populateFormAndSubmit(name.name)
});
};

const nameExists = async (newName) => {
    const response = await fetch('http://localhost:3000/history');
    const names = await response.json();

    // Check if the new name is already in the list (case-insensitive)
    return names.some(name => name.name.toLowerCase() === newName.toLowerCase());
};


// Function to handle form submission
async function history(x){
const newName = x.trim();
console.log(newName)

if (newName) {
    // Check if the name already exists
    const exists = await nameExists(newName);
    if (exists) {
        return null
    } else {
        // Post the new name to db.json if it doesn't exist
        await fetch('http://localhost:3000/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });

   // nameInput.value = ''; // Clear input field
    fetchNames(); // Refresh the names list
}
}}

// Function to delete a name
const deleteName = async (id) => {
await fetch(`http://localhost:3000/history/${id}`, {
    method: 'DELETE'
});
fetchNames(); // Refresh the names list
};

// Initial fetch of names when the page loads
fetchNames()
const populateFormAndSubmit = async (name) => {
    cityName.value = name; // Set the input value to the clicked name

    // Automatically submit the form
    form.requestSubmit(); // Use requestSubmit to submit the form programmatically
};