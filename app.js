const API_KEY = '9d79693899f8644d8bbe5892836b57ef'
const API_URL = 'https://api.openweathermap.org/data/2.5/weather'

// Sélection des éléments du DOM
const cityInput = document.getElementById('cityInput')
const searchBtn = document.getElementById('searchBtn')
const loadingBox = document.getElementById('loadingBox')
const errorBox = document.getElementById('errorBox')
const weatherCard = document.getElementById('weatherCard')
const saveBtn = document.getElementById('saveBtn')
const savedList = document.getElementById('savedList')
const savedCount = document.getElementById('savedCount')

// Données météo actuelles
let currentWeather = null

// Icônes météo selon le code
function getWeatherIcon(code) {
  if (code >= 200 && code < 300) return '⛈'
  if (code >= 300 && code < 400) return '🌧'
  if (code >= 500 && code < 600) return '🌧'
  if (code >= 600 && code < 700) return '❄️'
  if (code >= 700 && code < 800) return '🌫'
  if (code === 800) return '☀️'
  if (code > 800) return '⛅'
  return '🌤'
}

// Afficher ou cacher les sections
function showLoading() {
  loadingBox.classList.remove('hidden')
  errorBox.classList.add('hidden')
  weatherCard.classList.add('hidden')
}

function showError(message) {
  loadingBox.classList.add('hidden')
  errorBox.classList.remove('hidden')
  errorBox.textContent = `❌ ${message}`
  weatherCard.classList.add('hidden')
}

function showWeather() {
  loadingBox.classList.add('hidden')
  errorBox.classList.add('hidden')
  weatherCard.classList.remove('hidden')
}

// Récupérer la météo via fetch() + async/await
async function fetchWeather(city) {
  showLoading()

  try {
    // fetch() vers l'API OpenWeatherMap
    const response = await fetch(
      `${API_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=fr`
    )

    // Vérifier si la ville existe
    if (!response.ok) {
      throw new Error('Ville introuvable. Vérifie le nom !')
    }

    // Convertir la réponse en JSON
    const data = await response.json()

    // Stocker les données actuelles
    currentWeather = data

    // Mettre à jour le DOM avec les données reçues
    document.getElementById('cityName').textContent = data.name
    document.getElementById('countryName').textContent = data.sys.country
    document.getElementById('weatherIcon').textContent = getWeatherIcon(data.weather[0].id)
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`
    document.getElementById('feelsLike').textContent = `Ressenti ${Math.round(data.main.feels_like)}°C`
    document.getElementById('description').textContent = data.weather[0].description
    document.getElementById('humidity').textContent = `${data.main.humidity}%`
    document.getElementById('wind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`
    document.getElementById('lastUpdate').textContent = `Mis à jour : ${new Date().toLocaleTimeString('fr-FR')}`

    showWeather()

  } catch (error) {
    showError(error.message)
  }
}

// Sauvegarder une ville dans le LocalStorage
function getSavedCities() {
  return JSON.parse(localStorage.getItem('savedCities') || '[]')
}

function saveCities(cities) {
  localStorage.setItem('savedCities', JSON.stringify(cities))
}

function renderSavedCities() {
  const cities = getSavedCities()
  savedList.innerHTML = ''
  savedCount.textContent = `(${cities.length})`

  if (cities.length === 0) {
    savedList.innerHTML = '<p class="saved-empty">Aucune ville sauvegardée...</p>'
    return
  }

  cities.forEach((city, index) => {
    const item = document.createElement('div')
    item.classList.add('saved-item')
    item.innerHTML = `
      <div class="saved-item-info">
        <span class="saved-city">${city.icon} ${city.name}</span>
        <span class="saved-temp">${city.temp}°C · ${city.description}</span>
      </div>
      <button class="saved-delete" data-index="${index}">✕</button>
    `

    // Cliquer sur la ville pour recharger sa météo
    item.querySelector('.saved-item-info').addEventListener('click', () => {
      fetchWeather(city.name)
    })

    // Supprimer une ville sauvegardée
    item.querySelector('.saved-delete').addEventListener('click', (e) => {
      e.stopPropagation()
      const cities = getSavedCities()
      cities.splice(index, 1)
      saveCities(cities)
      renderSavedCities()
    })

    savedList.appendChild(item)
  })
}

// Événement : sauvegarder la météo actuelle
saveBtn.addEventListener('click', () => {
  if (!currentWeather) return

  const cities = getSavedCities()
  const alreadySaved = cities.find(c => c.name === currentWeather.name)

  if (alreadySaved) {
    saveBtn.textContent = '✅ Déjà sauvegardée !'
    setTimeout(() => { saveBtn.textContent = '💾 Sauvegarder' }, 2000)
    return
  }

  cities.unshift({
    name: currentWeather.name,
    temp: Math.round(currentWeather.main.temp),
    description: currentWeather.weather[0].description,
    icon: getWeatherIcon(currentWeather.weather[0].id)
  })

  saveCities(cities)
  renderSavedCities()
  saveBtn.textContent = '✅ Sauvegardée !'
  setTimeout(() => { saveBtn.textContent = '💾 Sauvegarder' }, 2000)
})

// Événement : rechercher une ville
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim()
  if (!city) return
  fetchWeather(city)
})

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchBtn.click()
})

// Boutons des villes rapides
document.querySelectorAll('.city-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    fetchWeather(btn.dataset.city)
  })
})

// Initialisation
renderSavedCities()
fetchWeather('Dakar')