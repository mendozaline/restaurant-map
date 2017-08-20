const fetch = require('node-fetch')
const fs = require('fs')
const Fuse = require('fuse.js')

const cityJSON = require('./Banks-restaurants-inspections.json')

//Create array of objs to query zomato api by address
const searchArray = cityJSON['Banks'].map( rest => {
  const entityId = '10612' // Banks, OR
  const entityType = 'city'
  const restaurantAddress = rest.address
  //console.log('\nREST ADDRESS: ', restaurantAddress)

  const restaurantName = rest.name
  const restaurantInspections = rest.inspections

  const restURL = `https://developers.zomato.com/api/v2.1/search?entity_id=${entityId}&entity_type=${entityType}&q=${restaurantAddress}&order=asc`
  //console.log('\nURL: ', url)

  return {  restURL: restURL,
            restName: restaurantName,
            restAdd: restaurantAddress,
            restInspect: restaurantInspections
         }
}) //end map
//console.log('\nSEARCH array: ', searchArray)


let finalFeature = ''
let count = 0

//Create feature for each restaurant
function getFeature(cityObj) {
  console.log('COUNT:', count)

  let searched = cityObj[count]

  return fetch(searched.restURL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Key': '38a345884982761b67d5a78e8618b707',
    },
  }).then(response => {
    //1. Return response as json
    return response.json() 
  }).then(json => {
    //2. Check number of results found, return array of objs
    const resultsFound = json.results_found
    console.log('\n\nNUMBER OF RESULTS:', resultsFound)

    if(resultsFound > 0) {
      return json.restaurants
    } else {
      console.log('\n\nno results')
      return
    }

  }).then(results => {
    //3. Fuzzy search array for restaurant name, return obj

    //console.log('\nRESULTS ARRAY: ', results)

    const inspectRestName = searched.restName
    console.log('SEARCH REST NAME: ', inspectRestName)

    const options = {
      shouldSort: true,
      threshold: 0.65, //0.0 perfect match, 1.0 match everything
      keys: [
        'restaurant.name' //keys that are searched
      ],
      //id: 'restaurant.name', //result will be list of id
    }

    const fuse = new Fuse(results, options)

    //resultFuse is array of matching objs
    const resultFuse = fuse.search(inspectRestName)

    //console.log('FUSE results: ', resultFuse)
    return resultFuse
  }).then(match => {
    //4. Create feature

    const type = typeof(match[0]) //check if undefined
    //console.log('\nTYPE: ', type)

    if(type != 'undefined') {
      const latitude = match[0].restaurant.location.latitude
      //console.log('\n1: ', latitude)
      const longitude = match[0].restaurant.location.longitude
      //console.log('\n2: ', longitude)
      const inspections = JSON.stringify(searched.restInspect)
      //console.log('\n3: ', inspections)
      //console.log(typeof(inspections))
      const restaurantName = match[0].restaurant.name
      //console.log('\n4: ', restaurantName)

      let cuisineSplit = match[0].restaurant.cuisines.split(',')
      let cuisines = []
      for(let i = 0; i < cuisineSplit.length; i++) {
        cuisines.push('"' + cuisineSplit[i].trim() + '"')
      }
      //console.log('\n5: ', cuisines)

      let feature = `{"type": "Feature","geometry": {"type": "Point","coordinates": [${longitude},${latitude}]},"properties": {"inspections": ${inspections},"name": "${restaurantName}","cuisines": [${cuisines}]}}`

      //console.log('\nFT: ', feature) -> string

      return feature
    } else {
      return
    } // end if/else

  }).then(ft => {
    //5. Add feature string to finalFeature string
    count++

    if(ft != undefined) {
      if(count == searchArray.length) {
        finalFeature += ft
      } else {
        finalFeature += ft + ','        
      }
    }
    //console.log('FF:', finalFeature)

    return count < searchArray.length ?
            getFeature(searchArray) : 'done!'

  }) //final then

} //end getFeature


getFeature(searchArray).then(finalResult => {
  console.log('\nDone and', finalResult)

  //console.log('\nfinalFeature: ', finalFeature)

  let geoJSONString = `{"type": "FeatureCollection","features":[${finalFeature}]}`

  //console.log('\ngeoJSON: ', geoJSONString)
  fs.writeFile('banks.geojson', geoJSONString.trim())
})
