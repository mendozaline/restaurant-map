(function () {
  const city = 'Beaverton'
  const city1 = city.split(' ')
  const city2 = city1[0] + '_' + city1[1]
  console.log(city2)
  const cityLength = city.length

  const searchResults = document.querySelector('#accordion') // -> selected div w/ results
  const allRestaurants = searchResults.querySelectorAll('div') // -> NodeList of all divs in searcgResults

  console.clear()


  const restaurantHeader = allRestaurants[0].querySelectorAll('h3') // -> NodeList of all restaurant names and addresses from first div
  let restaurantArray = [] //change this

  const getRestaurantInfo = restaurantHeader.forEach((h3, index) => {
    const info = h3.textContent.trim() // -> string w/o white spaces

    const reEx5 = /\s\d{5}\s/ // -> 5 digit number w/ spaces on sides
    const found5 = info.search(reEx5) // -> index if found, -1 if not

    const reEx4 = /\s\d{4}\s/ // -> 4 digit number w/ spaces on sides
    const found4 = info.search(reEx4) // -> index if found, -1 if not

    const reEx3 = /\s\d{3}\s/ // -> 3 digit number w/ spaces on sides
    const found3 = info.search(reEx3) // -> index if found, -1 if not

    const cityIndex = info.lastIndexOf(city) // -> index of city in string searching backwards

    if (found5 != -1) {
      console.log('5 digit address')
      const restaurantName = info.slice(0, found5)
      const streetAddress = info.slice(found5, cityIndex).trim()
      const state = 'OR'
      const zipCode = info.slice(cityIndex + cityLength).trim() // -> string
      //console.log(zipCode)
      //console.log(typeof(zipCode))
      const restaurantObj = `{
        "name": "${restaurantName}", 
        "address": "${streetAddress}", 
        "city": "${city}", 
        "stateAbrev": "${state}", 
        "zipCode": ${zipCode},`
      //console.log(restaurantObj, '\n')
      //console.log('parsed\n', JSON.parse(restaurantObj))
      //const parsedRestaurantObj = JSON.parse(restaurantObj)
      restaurantArray.push(restaurantObj)

    } else if (found4 != -1) {
      console.log('4 digit address')
      const restaurantName = info.slice(0, found4)
      const streetAddress = info.slice(found4, cityIndex).trim()
      const state = 'OR'
      const zipCode = info.slice(cityIndex + cityLength).trim() // -> string

      const restaurantObj = `{
        "name": "${restaurantName}", 
        "address": "${streetAddress}", 
        "city": "${city}", 
        "stateAbrev": "${state}", 
        "zipCode": ${zipCode},`
      //console.log(restaurantObj, '\n')
      //console.log('parsed\n', JSON.parse(restaurantObj))
      //const parsedRestaurantObj = JSON.parse(restaurantObj)
      restaurantArray.push(restaurantObj)

    }
    else { 
      console.log('3 digit address')
      const restaurantName = info.slice(0, found3)
      const streetAddress = info.slice(found3, cityIndex).trim()
      const state = 'OR'
      const zipCode = info.slice(cityIndex + cityLength).trim() // -> string

      const restaurantObj = `{
        "name": "${restaurantName}", 
        "address": "${streetAddress}", 
        "city": "${city}", 
        "stateAbrev": "${state}", 
        "zipCode": ${zipCode},`
      //console.log(restaurantObj, '\n')
      //console.log('parsed\n', JSON.parse(restaurantObj))
      //const parsedRestaurantObj = JSON.parse(restaurantObj)
      restaurantArray.push(restaurantObj)
    }

  }) // end forEach

//  console.log('1: restaurantArray - ', restaurantArray)




  const restaurantInspect = allRestaurants[0].querySelectorAll('div') // -> NodeList of all restaurant inspections from first div

  const getRestaurantScores = restaurantInspect.forEach((score, index) => {
    const stringTable = score.innerHTML // -> string html table 
    //console.log(index, innerTable)
    const tableData = stringTable.split('result">') // -> array of strings 
    //console.log(tableData)
    //console.log('score1', score)
    //console.log('index1:', index)

    // Add inspections array bracket
    restaurantArray[index] = restaurantArray[index] + `"inspections": [`


    const getScores = tableData.forEach((score2, index2) => {
      //console.log('index2: ', index2)
      //console.log('tD: ', tableData.length - 1)

      const row = score2.split(',')

      if (row[1] == undefined) { return } // skip first string

      const restId = row[0].slice(0,8)
      const inspectId = row[0].slice(9,18)
      const inspectType = row[1].split('</a>')[0].trim()

      let inspectScore
      const score = row[2].split(':')[1]
      //console.log('|' + score + '|')
      if(score != undefined) {
        let inspectScore1 = score.slice(1)
        inspectScore = inspectScore1
      } else {
        inspectScore = '"' + row[2].trim() + '"' 
        //null works
      }

      const inspectDate = row[3].split('</td>')[0].trim()
      
      let scoreString
      if (index2 != tableData.length - 1) {
        //console.log('comma')
        scoreString = `{
          "restId": "${restId}",
          "inspectId": "${inspectId}",
          "inspectType": "${inspectType}",
          "inspectScore": ${inspectScore},
          "inspectDate": "${inspectDate}"
        },`
      } else {
        //console.log('no comma')
        scoreString = `{
          "restId": "${restId}",
          "inspectId": "${inspectId}",
          "inspectType": "${inspectType}",
          "inspectScore": ${inspectScore},
          "inspectDate": "${inspectDate}"
        }`
      }
      
      restaurantArray[index] = restaurantArray[index] + scoreString

    }) // end 2nd forEach
    
    // Add inspections array closing bracket
    restaurantArray[index] = restaurantArray[index] + `]}`

  }) // end 1st forEach

  console.log('\n')
  console.log('2:restaurantArray - ', restaurantArray)
  console.log('\n')
  console.log('Did you change the city?')

  const finalArray = restaurantArray.map(restString => {
//    console.log(restString)
//    console.log(JSON.parse(restString))
    return JSON.parse(restString)
  }) // end map

  console.log('3: finalArray - ', finalArray)

  let array11 = []
  const createJSON = finalArray.forEach(restObj => {
//    console.log('restObj: ', restObj)
    array11.push(restObj)
  }) // end forEach
  console.log('4: array11 - ', array11)

  let json11 = {}
  json11[city] = array11
  console.log('5: json11 - ', json11)

  const final = JSON.stringify(json11)
  console.log('6: stringify - ', final)

  const a = document.createElement('a')
  a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(final)
  a.download = `${city}-restaurants-inspections.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

}).call(this)

