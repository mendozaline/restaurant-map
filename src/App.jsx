import React, { Component } from 'react'
import MapComp from './components/Map.jsx'
import ChartWide from './components/ChartWide.jsx'
import * as d3 from 'd3'

class App extends Component {
  constructor() {
    super()

    this.onResize = this.onResize.bind(this)
    this.dropdownSelect = this.dropdownSelect.bind(this)
//    this.onClick = this.onClick.bind(this)

    this.state = {
      lat: 45.5589,
      lng: -123.0064,
      zoom: 10,
      allRestData: null,
      allCountyData: null,
      cuisine: 'All',
      width: null,
      height: null
    } //end of state

  } //end constructor

  dropdownSelect(event) {
    event.preventDefault()

    //console.log('evt', event.target)
    let name = event.target.name  //'cuisine'
    let value = event.target.value
    //console.log(name, ':', value)

    this.setState({
      [name]: value
    })

}

  onResize() {
    this.setState({
      width: window.innerWidth, // * 0.966
      height: 600 //same as leaflet container
    })
  }

//  onClick(event) {
//    //console.log('e.t', event.target)
//    //console.log('lat:', event.target.dataset.lat)
//    this.setState({
//      lng: event.target.dataset.lon,
//      lat: event.target.dataset.lat,
//      zoom: 17
//    })
//  }

//  front(event) {
//    event.target.bringToBack()
//  }


  componentDidMount() {
    console.log('CDM')

    let cmp = this
    const url1 = `https://cdn.glitch.com/1ffed53a-97b5-4e8d-9ce0-9a9b638459eb%2Fcombined.geojson`
    const url2 = `https://opendata.arcgis.com/datasets/4577bb8a8b5147fc86026c3c692ec8fa_9.geojson`

    d3.queue()
      .defer(d3.json, url1)
      .defer(d3.json, url2)
      .await((error, points, polygons) => {
        //console.log('cdm-rest:', points)
        //console.log('cdm-county:', polygon)

        cmp.setState({
          allRestData: points,
          filterRestData: points,
          allCountyData: polygons,
        }) // end setState

      }) //end await

    window.addEventListener('resize', this.onResize, false)
    this.onResize()

  } // end CDM


  render() {
    console.log('render')

    if(this.state.allRestData === null) {
      return null
    }

    /* Filter restaurants */
    let filterCuisine = (cuisineSelected) => {
      //console.log('cs', cuisineSelected)

      let restFts = this.state.allRestData.features // -> fts array
      if(cuisineSelected === 'All') {
        return restFts // -> fts array
      }

      let features = [] // -> fts array

      for(let k = 0; k < restFts.length; k++){
        for(let l = 0; l < restFts[k].properties.cuisines.length; l++){
          if(cuisineSelected === restFts[k].properties.cuisines[l]){
            features.push(restFts[k])
          }
        }
      }
      //console.log('FC-features:', features)
      return features
    } //end filter
    let newData = filterCuisine(this.state.cuisine)
    //console.log('cuisine:', newData)

    /* Filter county */
    const countyFts = this.state.allCountyData.features
    const filterCounty = countyFts.filter(county => {
      return county.properties.COUNTY === 'Washington'
    })
    //console.log('render-filter county:', filterCounty)

    const filteredData = {
      filteredCounty: filterCounty,
      filteredCuisine: newData
    }


    let getColor = d3.scaleThreshold()
      .domain([70, 80, 90, 100])
      .range(['dimgray', 'magenta', 'orangeRed', 'gold', 'limeGreen'])

    let getRadius = d3.scaleThreshold()
      .domain([70])
      .range([5, 10])

    const scales = {
      color: getColor,
      radius: getRadius
    }

    const restFts = this.state.allRestData.features
    //console.log('restFts:', restFts)

    /* Array of all cuisines */
    let allCuisines = []
    for(let i = 0; i < restFts.length; i++){
      for(let j = 0; j < restFts[i].properties.cuisines.length; j++){
        allCuisines.push(restFts[i].properties.cuisines[j])
      }
    }
//    console.log('render-all cuisines:', allCuisines)


    /* Filter out duplicates */
    const cuisinesArray = allCuisines.filter((uniq, indx, arr) => {
      return arr.indexOf(uniq) === indx
    }).sort()
//    console.log('render-unique cuisines:', cuisinesArray)

    /* dropdown menu options */
    const cuisineOptions = cuisinesArray.map((cuisine, indx) => {
      return (
        <option key={'cuisine-' + indx} value={cuisine}>
          {cuisine}
        </option>
      )
    })

    let widthSize;
    if(this.state.width < 1000) {
      widthSize = this.state.width
    } else {
      widthSize = 1000
    }

    const resultsNum = newData.length.toLocaleString()

    return (
      <div>
        <div className='header'>
          <h1>Tidy Noms Map</h1>
          <h2>Ditch dirty dining</h2>
        </div>

        {/*<Dropdown {...this.state} filterData={this.filterCuisine}/> */}
        <h3>There are <strong>{resultsNum}</strong> results for:
          <select
            name={'cuisine'}
            value={this.state.cuisine}
            onChange={this.dropdownSelect}>
            <option key={'option'} value={'All'}>
              Filter by a cuisine
            </option>
            {cuisineOptions}
          </select>
        </h3>

        <div className='content'>
          <ChartWide
            {...this.state}
            {...scales}
            width2={widthSize}
            {...filteredData} />

          <MapComp
            {...this.state}
            {...filteredData}
            {...scales} />
        </div>

      </div>

    ) // end return

  } // end render

} // end component

export default App
