const fetch = require('node-fetch')
var fs = require('fs')

const cityJSON = require('./Banks-restaurants-inspections.json')
//console.log('\n', cityJSON)
//console.log('\n', cityJSON.Banks[4].name)

const entityId = '10612' // Banks, OR
//const entityId = '10631' // Hillsboro, OR
//const entityId = '10614' // Beaverton, OR
const entityType = 'city'
const restaurantAddress = cityJSON.Banks[5].address 
// 'Main Street Pizza'

//console.log('restaurantAddress:', restaurantAddress)
//const restaurantName = cityJSON.Beaverton[33].name // 'Main Street Pizza'
//console.log('restaurantName:', restaurantName)

const url = `https://developers.zomato.com/api/v2.1/search?entity_id=${entityId}&entity_type=${entityType}&q=${restaurantAddress}&order=asc`

//console.log('\n' + url)


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
    console.log('\nresults found: ' + resultsFound)
    //console.log('\n', json)
    //console.log('\n', json.restaurants[1])
    return json.restaurants
  }

})
.then(results => {
  //console.log('\nresults: ', results)
  let jsonArray = []

  let final = results.forEach(rest => {
    //console.log('\n\nREST:', rest)
    const zomatoName = rest.restaurant.name
    //console.log('zomatoName: ', zomatoName)
    const countyName = cityJSON.Banks[5].name
    //console.log('countyName: ', countyName)

    if (zomatoName == countyName) {
      //console.log('\nMatch')
      const cuisines = rest.restaurant.cuisines.split(',')

      geoJSON = `{
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

      console.log('\nGEOJSON: ', geoJSON)
      jsonArray.push(geoJSON)
    } // end if

  }) // end map

  return jsonArray
})
.then( jsonArray => {
  console.log('\njsonARRAY: ', jsonArray[0])
  console.log('\n'+ typeof(jsonArray[0]))
  //console.log('\nPARSE: ', JSON.parse(jsonArray))
  //console.log('\n'+ typeof(JSON.parse(jsonArray)))

  fs.writeFile('test.geojson', jsonArray)
//  return 
}) // end then










