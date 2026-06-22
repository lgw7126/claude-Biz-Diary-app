const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

async function fetchByCoords(lat, lon) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
  )
  if (!res.ok) throw new Error('Weather API error')
  return res.json()
}

async function fetchByCity(city = '서울') {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=kr`
  )
  if (!res.ok) throw new Error('Weather API error')
  return res.json()
}

function parseWeather(data) {
  return {
    condition: data.weather[0].main,
    description: data.weather[0].description,
    temp: Math.round(data.main.temp),
    humidity: data.main.humidity,
    city: data.name,
  }
}

export function getWeather() {
  if (!API_KEY) return Promise.resolve(null)

  return new Promise((resolve) => {
    const fallback = async () => {
      try {
        resolve(parseWeather(await fetchByCity()))
      } catch {
        resolve(null)
      }
    }

    if (!navigator.geolocation) {
      fallback()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          resolve(parseWeather(await fetchByCoords(pos.coords.latitude, pos.coords.longitude)))
        } catch {
          fallback()
        }
      },
      fallback,
      { timeout: 5000 }
    )
  })
}
