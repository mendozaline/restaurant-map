const fetch = require('node-fetch')
const fs = require('fs')
const Fuse = require('fuse.js')

const cities = [
  'Aloha', 'Banks', 'Beaverton', 'Cornelius', 'Forest Grove', 'Gales Creek', 'Gaston', 'Hillsboro', 'King City',
  'Lake Oswego', 'Manning', 'North Plains', 'Portland',
  'Salem', 'Sherwood', 'Tigard', 'Tualatin',
  'Wilsonville']

const cityIndex = cities[3]
console.log('array city:', cityIndex)

let city = cityIndex

const spaceIndex = cityIndex.search(' ')
if(spaceIndex != -1) {
  city = cityIndex.replace(' ', '-')
  console.log('dashed city:', city, '\n')
}

const cityJSON = require(`./${city}-restaurants-inspections.json`)

//Create array of objs to query yelp api by address
let searchArray = cityJSON[cityIndex].map( rest => {
  let restaurantName = rest.name
  console.log(restaurantName)
  
  //remove hashtags, numbers, comma, Café from name
  const hashtag = restaurantName.lastIndexOf('#')
  //space in front
  const number = restaurantName.search(/\s\d/)
  const comma = restaurantName.lastIndexOf(',')
  const cafe = restaurantName.lastIndexOf('Café')
  const no = restaurantName.search(/no./)

  if(comma != -1){
    restaurantName = restaurantName.slice(0, comma)
    console.log('-comma:', restaurantName)
  } else if(hashtag != -1) {
    restaurantName = restaurantName.slice(0, hashtag)
    console.log('-hash:', restaurantName)
  } else if(no != -1){
    restaurantName = restaurantName.slice(0, no)
    console.log('-no:', restaurantName)
  } else if(number != -1){
    restaurantName = restaurantName.slice(0, number)
    console.log('-num:', restaurantName)
  }
    

  const restaurantInspections = rest.inspections
  const restaurantAddress = `${rest.address}, ${rest.city}, ${rest.stateAbrev}`
  //console.log('\naddress: ', restaurantAddress)

  const miles = 4 * 1609.34 //convert to meters
  const distance = miles.toFixed()
  
  let searchURL = `https://api.yelp.com/v3/businesses/search?location=${restaurantAddress}&radius=${distance}&sort_by=distance`

  return {  yelpURL: searchURL,
            restName: restaurantName,
            restAdd: restaurantAddress,
            restInspect: restaurantInspections
         }
}) //end map
//console.log('\nSEARCH array: ', searchArray)


let finalFeature = ''
let count = 0

//Create feature for each restaurant
function getFeature(restObjAll) {
  console.log('\n\n\n\nCOUNT:', count)

  const token = 'gOhLBP_T_MqqHZZsLNZIRBJLXJynrMkdO2JLwY8SUuysSh-xN06sErDJaRIY35Q_wV2E2w62ICtVThjzR7d7Bf9mK_FYoKl9nflT79l06VC8XoTmiWIcVJ2_RuyYWXYx'

  const restObj = restObjAll[count]
  const url = restObj.yelpURL
  console.log('\nSEARCH NAME:', restObj.restName)

  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    },
  }).then(resp => {
    //1. Return response as json
    console.log('1.STATUS:', resp.status + ' ' + resp.statusText)
    return resp.json()

  }).then(json => {
    //2. Check number of results, return array of objs
    //console.log('\nJSON:', json)
    const resultsFound = json.total
    console.log('2.NUMBER OF RESULTS:', resultsFound)

    if(resultsFound > 0) {
      return json.businesses
    } else {
      console.log('\nNO RESULTS')
      return
    } //end if/else

  }).then(results => {
    //3. Fuzzy search for restaurant name, return array of objs
    //console.log('3.RESULTS YELP:\n', results)

    if(results == undefined) {
      console.log('3.NO FUZZY IF')
      return
    }
    
    const searchRestName = restObj.restName
    //console.log('\nSEARCH REST NAME: ', searchRestName)

    const options = {
      shouldSort: true,
      threshold: 0.65, //0.0 perfect match, 1.0 match everything
      keys: [
        'name' //keys that are searched
      ],
      //id: 'restaurant.name', //result will be list of id
    }

    const fuse = new Fuse(results, options)

    //Array of matching objs
    const resultFuse = fuse.search(searchRestName)

    return resultFuse
  }).then(match => {
    //4. Create feature
    //console.log('\n4.MATCH:', match)

    if(match.length == 0) {
      console.log('4.NO MATCH IF')
      return
    }

    console.log('\nINP SEARCH NAME:', restObj.restName)
    console.log('YELP MATCH NAME:', match[0].name)
    console.log('SEARCH ADDRESS:', restObj.restAdd)
    console.log('YELP ADDRESS:', match[0].location.display_address)

    const exists = typeof(match[0]) //check if undefined

    if(exists != 'undefined') {
      const restaurantName = match[0].name
      const latitude = match[0].coordinates.latitude
      const longitude = match[0].coordinates.longitude
      const yelpLink = match[0].url
      const yelpPrice = match[0].price
      const yelpRating = match[0].rating
      const yelpReviews = match[0].review_count
      const yelpImage = match[0].image_url
      const inspections = JSON.stringify(restObj.restInspect)

      let cuisines = []
      for(let i = 0; i < match[0].categories.length; i++) {
        const category = match[0].categories[i].title.trim()
        cuisines.push('"' + category + '"')
      }
      //console.log('\n5: ', cuisines)

      let feature = `{"type": "Feature","geometry": {"type": "Point","coordinates": [${longitude},${latitude}]},"properties": {"inspections": ${inspections},"name": "${restaurantName}","yelpImage": "${yelpImage}","yelpReviews": "${yelpReviews}","yelpRating": "${yelpRating}","yelpPrice": "${yelpPrice}","yelpLink": "${yelpLink}","cuisines": [${cuisines}]}}`

      //console.log('\nFEATURE:', feature)

      return feature

    } // end if

  }).then(feat => {
    //5. Add feature string to finalFeature string
    count++

    if(feat != undefined) {
      
      if(count == searchArray.length) {
        finalFeature += feat
      } else {
        finalFeature += feat + ','
      }

    } else {
      //remove trailing comma
      if(count == searchArray.length) {
        const comma = finalFeature.lastIndexOf(',')
        finalFeature = finalFeature.slice(0, comma)
      }

    } //end if

    //console.log('Features:', finalFeature)

    return count < searchArray.length ?
            getFeature(searchArray) : 'done!'

  }) //final then

} //end getFeature


getFeature(searchArray).then(finalResult => {
  console.log('\n\nDone and', finalResult)
  //console.log('\nfinalFeature: ', finalFeature)

  let geoJSONString = `{"type": "FeatureCollection","features":[${finalFeature}]}`

//  const space = city.search(/\s/)
//  if(space != -1) {
//    city = city.replace(space, '-')
//  }
  console.log('Saved', city)
  
  //console.log('\ngeoJSON: ', geoJSONString)
  fs.writeFile(`${city}.geojson`, geoJSONString.trim())
})

