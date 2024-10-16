
let form = document.getElementById('weatherForm')
let cityLat;
let cityLon;
let weather_code
let currentTemp = document.getElementById("temperature")
let currentCondition = document.getElementById("weathercondition")
let currentIcon = document.getElementById("weathericon")
let currentTime = new Date().getTime()
let time = document.getElementById("time")
let namesList = document.getElementById("history")
let cityName = document.getElementById("cityName")

document.addEventListener('DOMContentLoaded',(e)=>{
    e.preventDefault()
     fetchList()  //To display history 
})

form.addEventListener('submit',e=>{
    e.preventDefault()
    removecurrentcontent(e.target.cityName.value)  // To prevent stacking
   history(e.target.cityName.value)// Adds input value to the history tab
 
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
        alert('City not found or the result is not a city.');
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
        getweekly(data.current.time,data)

        //covert weather code to text and image
      weathercodeText(weather_code,currentCondition)
        weathercodeImage(weather_code,currentIcon)
  
})
}
async function weathercodeText(code,textId) {
    const data = await weathercode();
    const description = data[code].day.description;
    textId.textContent = description;
    ;
}

async function weathercodeImage(code,imageid){
    const data = await weathercode();
    const description = data[code].day.image;
    imageid.src = description;
    ;
}

async function weathercode() {
    const resp = await fetch('http://localhost:3000/weather');
    const data = await resp.json();
    return data;
}


function getforecast(time,data){
    
     const totalforecst =data.hourly.time
     const dailyforecast = totalforecst.map((num,index)=>({ number: num, index: index })).filter(item => item.number > time && item.number<= time+43200);// filters the array to make sure that the time is from now till the next 12 hours and takes not of the index number
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

function getweekly(time,data){
    const totalforecst =data.daily.time
    const weeklyforecast = totalforecst.map((num,index)=>({ number: num, index: index })).filter(item => item.number > time );
   
    let weeklyforecastobj= []
    for(i=0;i<weeklyforecast.length;i++){

        let weeklyforecastobj2 = {day: weeklyforecast[i].number, temperature:data.daily.temperature_2m_max[weeklyforecast[i].index],
                  precipitation_probability: data.daily.precipitation_probability_max[weeklyforecast[i].index],
                 weather_code:  data.daily.weather_code[weeklyforecast[i].index], }
                 weeklyforecastobj.push(weeklyforecastobj2)          
    }
    for(i=0;i<weeklyforecastobj.length;i++){
        let week = document.getElementById("week")
        let day = document.createElement("p")
        let temperature = document.createElement("p")
        let precipitation = document.createElement("p")
        let description = document.createElement("p")
        let img = document.createElement("img")
        day.classList.add("weekitems")
        day.textContent = unixtimetoday(data.daily.time[i],data.timezone)
        temperature.textContent = `${data.daily.temperature_2m_max[i]}°C`
        precipitation.innerHTML = `${data.daily.precipitation_probability_max[i]}% &#x1F327;`
        weathercodeText(data.daily.weather_code[i],description)
        weathercodeImage(data.daily.weather_code[i],img)
        week.appendChild(day)
        day.appendChild(temperature)
        day.appendChild(precipitation)
        day.appendChild(description)
        day.appendChild(img)
    }



}


function unixtimetotime(unixtime,timeZone) {

    // Ensure the Unix time is in seconds by checking if it's too large because js uses unix time in miliseconds but the api uses  seconds
    let timestamp = unixtime > 10000000000 ? unixtime : unixtime * 1000; 
    
    let date = new Date(timestamp);

    const time = date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:timeZone})
    return `${time}`;
}
function unixtimetoday(unixtime,timeZone) {
     let timestamp = unixtime > 10000000000 ? unixtime : unixtime * 1000; 
    let date = new Date(timestamp);
    const day = date.toLocaleString('en-US',{weekday:"long",timeZone:timeZone});;    
    return `${day}`;
}



//History tab

const fetchList = async () => {
    const response = await fetch('http://localhost:3000/history');
    const names = await response.json();

namesList.innerHTML = ''; // Clear existing list so they dont stack

// Display names on the page
p = document.createElement("p")
p.textContent = `History:`
namesList.appendChild(p)
names.forEach(name => {
    const li = document.createElement('li');
    li.textContent = `${name.name} `;
    li.classList.add(`historylist`)

    // Create a delete button 
    const deleteButton = document.createElement('button');
    deleteButton.textContent = ` X`;
    deleteButton.classList.add(`historydel`)
    li.appendChild(deleteButton);
    namesList.appendChild(li);
   // deleteButton.onclick = () => deleteName(name.id);
      deleteButton.addEventListener("click",(e)=>{
        e.stopPropagation()//This fixed an error where if i clicked on the button it would also click on its parent element and perform that function
          deleteName(name.id)
        const parentElement = deleteButton.parentElement
        parentElement.remove()
        })  

   
    li.onclick = () => {populateFormAndSubmit(name.name)
        
    }
});
};

const nameExists = async (newName) => {
    const response = await fetch('http://localhost:3000/history');
    const names = await response.json();

    // Check if the new city exists in the db.json file to stop it from repeating itself in the list
    return names.some(name => name.name.toLowerCase() === newName.toLowerCase());
};


//Posts city name to db.json
async function history(x){
const newName = x.trim();
    if (newName) {
    // Check if the city already exists
    const exists = await nameExists(newName);
    if (exists) {
        return null
    } else {
        // Post the new city to db.json if it doesnt exist
        await fetch('http://localhost:3000/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });
    fetchList(); // Refresh the list
}
}}

// Function to delete a name
const deleteName = async (id) => {
await fetch(`http://localhost:3000/history/${id}`, {
    method: 'DELETE'
});

};


//When a name on the list is cliked we want to populate the form with its value and then submit the form
const populateFormAndSubmit = async (name) => {
    cityName.value = name; 

    form.requestSubmit(); 
};



//Dark Mode Toggle
const toggle = document.getElementById('darkModeToggle');

toggle.addEventListener('change', function() {
    document.body.classList.toggle('dark-mode', this.checked);
    if (this.checked) {
        // Apply dark mode styles 
        document.body.style.backgroundColor = "#121212";
        document.body.style.color = "black";

        
        document.querySelectorAll('button').forEach(button => {
            button.style.backgroundColor = "#333";
            button.style.color = "white";
        });

        
        document.querySelectorAll('.forecastItems').forEach(container => {
            container.style.backgroundColor = "#282828";
           
        });
        document.querySelectorAll('.weekitems').forEach(p=> {
            p.style.borderColor = " black";
        })
        document.querySelectorAll('.forecastItems').forEach(p=> {
            p.style.borderColor = " black";
        })

        document.querySelectorAll('#history').forEach(p=>{
            p.style.borderColor = "black";
        }) 


    } else {
        // Revert back to light mode styles
        document.body.style.backgroundColor = "white";
        document.body.style.color = "white";

      
        document.querySelectorAll('button').forEach(button => {
            button.style.backgroundColor = "blue";
            button.style.color = "white";
        });

    

        document.querySelectorAll('.weekitems').forEach(p=> {
            p.style.borderColor = "white";
        })
        document.querySelectorAll('#history').forEach(p=>{
            p.style.borderColor = "white";
        }) 
        document.querySelectorAll('.forecastItems').forEach(p=> {
            p.style.borderColor = " white";
        })
    }
});