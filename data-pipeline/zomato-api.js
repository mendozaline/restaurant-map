const fetch = require('node-fetch')

const cityJSON = require('./Banks-restaurants-inspections.json')
//console.log('\n', cityJSON)
//console.log('\n', cityJSON.Banks[4].name)

const entityId = '10612' // Banks, OR
//const entityId = '10631' // Hillsboro, OR
const entityType = 'city'
const restaurantAddress = cityJSON.Banks[5].address
const url = `https://developers.zomato.com/api/v2.1/search?entity_id=${entityId}&entity_type=${entityType}&q=${restaurantAddress}&order=asc`
console.log('\n' + url)


fetch(url, {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'user-key': '38a345884982761b67d5a78e8618b707',
  },
})
.then(response => { return response.json() })
.then(json => {
  const resultsFound = json.results_found

  if (resultsFound > 0) {
    console.log('\nResults found: ' + resultsFound)
    //console.log('\n', json.restaurants[1])
    return json.restaurants
  } else {
    console.log('\nNo match found')
    return
  }

})
.then(results => {
  results.map(rest => {
    const zomatoName = rest.restaurant.name
    const countyName = cityJSON.Banks[5].name

    if (zomatoName == countyName) {
      console.log('\nMatch')
      const cuisines = rest.restaurant.cuisines.split(',')

      const geoJSON = `{
        "type": "Feature",
        "properties": {
          "name": "${rest.restaurant.name}",
          "cuisines": ["${cuisines[0]}", "${cuisines[1].trim()}"],
          "popupContent": "${rest.restaurant.location.address}"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [${rest.restaurant.location.longitude}, ${rest.restaurant.location.latitude}]
        }
      }`

      console.log('\ngeoJSON: ', geoJSON)
    } else {
      console.log('\nNope')
    }

  }) // end map

}) // end then










