
let form = document.getElementById('weatherForm')
let cityLat;
let cityLon;
let weather_code
let currentTemp = document.getElementById("temperature")
let currentCondition = document.getElementById("weathercondition")
let currentIcon = document.getElementById("weathericon")
let currentTime = new Date().getTime()
//let dailyforecast = document.getElementById('forecast')
let dailyforecastobj;
let cityobj;
let diiv = document.getElementsByClassName('forecastItems')

document.addEventListener('DOMContentLoaded',(e)=>{
    e.preventDefault()
    diiv.remove()
})

form.addEventListener('submit',e=>{
    e.preventDefault()
    getcitycoordiates(e.target.cityName.value)    
})

function getcitycoordiates(city){    
    fetch(`https://nominatim.openstreetmap.org/search?q=${city}&format=json`)
    .then(resp=>resp.json())
    .then(data=>{
    const cityResult = data.find(result => {
        return result.class === 'place' && (result.type === 'city' || result.type === 'town' || result.type === 'village');
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
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&timeformat=unixtime&timezone=auto&past_days=7`)
    .then(resp=>resp.json())
    .then(data=>{//console.log(data.current)
        currentTemp.textContent = `Current Temperature: ${data.current.temperature_2m}°C`
        //getdailyforecst
        weather_code = data.current.weather_code
        getforecast(data.current.time,data)
        //console.log(latitude,longitude)

        //covert weather code to text and image
    fetch(`http://localhost:3000/weather`)
    .then(resp=>resp.json())
    .then(data=>{//console.log(data[weather_code])
    currentCondition.textContent = `Condition: ${data[weather_code].day.description}`
    currentIcon.src = data[weather_code].day.image
    //console.log(data[weather_code].day.description)
})
})
}

function getforecast(time,data){
    console.log(time)
     const totalforecst =data.hourly.time
     const dailyforecast = totalforecst.map((num,index)=>({ number: num, index: index })).filter(item => item.number > time && item.number<= time+43200);
    //console.log(dailyforecast)
    dailyforecastobj = [
        {time: dailyforecast[0].number, temperature:data.hourly.temperature_2m[dailyforecast[0].index],
         precipitation_probability: data.hourly.precipitation_probability[dailyforecast[0].index],
         weather_code:  data.hourly.weather_code[dailyforecast[0].index], 
         },
        {time: dailyforecast[1].number, temperature:data.hourly.temperature_2m[dailyforecast[1].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[1].index],
            weather_code:  data.hourly.weather_code[dailyforecast[1].index], 
        },
        {time: dailyforecast[2].number, temperature:data.hourly.temperature_2m[dailyforecast[2].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[2].index],
            weather_code:  data.hourly.weather_code[dailyforecast[2].index], 
        },
        {time: dailyforecast[3].number, temperature:data.hourly.temperature_2m[dailyforecast[3].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[3].index],
            weather_code:  data.hourly.weather_code[dailyforecast[3].index], 
        },
        {time: dailyforecast[4].number, temperature:data.hourly.temperature_2m[dailyforecast[4].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[4].index],
            weather_code:  data.hourly.weather_code[dailyforecast[4].index], 
        },
        {time: dailyforecast[5].number, temperature:data.hourly.temperature_2m[dailyforecast[5].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[5].index],
            weather_code:  data.hourly.weather_code[dailyforecast[5].index], 
        },
        {time: dailyforecast[6].number, temperature:data.hourly.temperature_2m[dailyforecast[6].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[6].index],
            weather_code:  data.hourly.weather_code[dailyforecast[7].index], 
        },
        {time: dailyforecast[7].number, temperature:data.hourly.temperature_2m[dailyforecast[7].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[7].index],
            weather_code:  data.hourly.weather_code[dailyforecast[7].index], 
        },
        {time: dailyforecast[8].number, temperature:data.hourly.temperature_2m[dailyforecast[8].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[8].index],
            weather_code:  data.hourly.weather_code[dailyforecast[8].index], 
        },
        {time: dailyforecast[0].number, temperature:data.hourly.temperature_2m[dailyforecast[9].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[9].index],
            weather_code:  data.hourly.weather_code[dailyforecast[9].index], 
        },
        {time: dailyforecast[10].number, temperature:data.hourly.temperature_2m[dailyforecast[10].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[10].index],
            weather_code:  data.hourly.weather_code[dailyforecast[10].index], 
        },
        {time: dailyforecast[11].number, temperature:data.hourly.temperature_2m[dailyforecast[11].index],
            precipitation_probability: data.hourly.precipitation_probability[dailyforecast[11].index],
            weather_code:  data.hourly.weather_code[dailyforecast[11].index], 
        },
       
    ]
       
    console.log(dailyforecastobj)
    for(i=0;i<dailyforecastobj.length;i++){
        let dailyforecast = document.getElementById('forecast')
        let li = document.createElement('div')
        dailyforecastobj[i].time = unixtimetodate(dailyforecastobj[i].time)
        li.innerHTML = dailyforecastobj[i].time
        li.classList.add('forecastItems')
        li2 = document.createElement('p')
        li2.innerHTML = `${dailyforecastobj[i].temperature}°C <br>${dailyforecastobj[i].precipitation_probability}%	&#x1F327;<br> `
        li.appendChild(li2)
        dailyforecast.appendChild(li)
    }
    
}

function unixtimetodate(unixtime){
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    let date = new Date(unixtime * 1000)
    const day = date.toLocaleString('en-US',{weekday:"long",timeZone:userTimeZone});
    const time = date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:userTimeZone})

    return ` ${time}`
}