import React, { Component } from 'react'
import { Map, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet'
import * as d3 from 'd3'

class App extends Component {

  constructor() {
    super()
    this.front = this.front.bind(this)
    this.dropdownSelect = this.dropdownSelect.bind(this)
    this.onResize = this.onResize.bind(this)
    this.onClick = this.onClick.bind(this)

    this.state = {
      lat: 45.4889,
      lng: -122.806377,
      points: null,
      zoom: 10,
      height: 450,
      width: 900,
      cuisine: 'All',
    } //end of state

  } //end constructor

  dropdownSelect(event) {
    event.preventDefault()
    //console.log('evt', event.target)
    let name = event.target.name  //'cuisine'
    let value = event.target.value
    //console.log(name,value)

    this.setState({
      [name]: value
    })
  }

  onResize() {
    this.setState({
      width: window.innerWidth * 0.96,
      height: window.innerWidth / 6
    })
  }

  onClick(event) {
    event.preventDefault()
    //console.log('e.t', event.target)
    //console.log('lat:', event.target.dataset.lat)

    this.setState({
      lng: event.target.dataset.lon,
      lat: event.target.dataset.lat,
      zoom: 17
    })
  }

  front(event) {
//    event.preventDefault()
    event.target.bringToBack()
  }

  componentDidMount() {
    console.log('cDM')
    let cmp = this
    const url = `https://cdn.glitch.com/1ffed53a-97b5-4e8d-9ce0-9a9b638459eb%2Fcombined.geojson`
    //const url2 = `https://opendata.arcgis.com/datasets/470aa3de09244de4a3a94150b86a648b_10.geojson` //city
    const url2 = `https://opendata.arcgis.com/datasets/4577bb8a8b5147fc86026c3c692ec8fa_9.geojson` //county

    d3.queue()
      .defer(d3.json, url)
      .defer(d3.json, url2)
      .await((error, geoPoints, countyBounds) => {
        //console.log('d3-points:', geoPoints)
        //console.log('d3-county:', countyBounds)
        const county = countyBounds.features.filter(county => {
          return county.properties.COUNTY === 'Washington'
        })
        console.log('d3-cFilter:', county)

        cmp.setState({
          points: geoPoints,
          bounds: county
        })

      }) //end await

    window.addEventListener('resize', this.onResize, false)
    this.onResize()

  }

  render() {
    console.log('render')

    if(this.state.points == null) {
      console.log('points: null')
      return null
    }

    const pts = this.state.points
    //console.log('points:', this.state.points)
    //console.log('state.cuisine:', this.state.cuisine)
    console.log('w', this.state.width, 'h', this.state.height)

    /* create array of cuisines to filter */
    const cuisinesArray = pts.features.map(cuisine => {
      const firstCuisine = cuisine.properties.cuisines[0]
      return firstCuisine
    }).filter((unique, index, array) => {
      return array.indexOf(unique) === index
    }).sort()
    //console.log('cuisinesArray:', cuisinesArray)

    /* dropdown menu options */
    const cuisinesOptions = cuisinesArray.map((cuisine, index) => {
      return (
        <option key={index} value={cuisine}>
          {cuisine}
        </option>
      )
    })

    /* filter data */
    const filterData = (cuisineSelected) => {
      if(cuisineSelected === 'All') {
        return this.state.points.features
      }

      const data = pts.features.filter(type => {
        return type.properties.cuisines[0] === cuisineSelected
      })
      return data
    }

    //console.log(this.state.cuisine, 'data:', filterData(this.state.cuisine))

    const cuisineData = filterData(this.state.cuisine)
    console.log('cuisine data:', cuisineData)


    /* d3 functions */
    const findMinMax = (data) => {
      return d3.extent(data, (d) => {
        return d.properties.inspections[0].inspectScore
      })
    }
    const max = findMinMax(this.state.points.features)[1]
    //console.log('max', max)

    const padding = {left: 75, right: 75, bottom: 2.5, top: 15}

    const xScale = d3.scaleLinear()
        .domain([69, max])
        .range([0 + padding.left,
                this.state.width - padding.right])

    const yScale = d3.scaleLinear()
      .domain([0, 5])
      .range([this.state.height - padding.bottom, //bottom
              0 + padding.top]) //top

    let getColor = d3.scaleThreshold()
      .domain([70, 80, 90, 100])
      .range(['dimGray', 'crimson', 'darkOrange', 'gold', 'limeGreen'])

    let getRadius = d3.scaleThreshold()
      .domain([70, 80, 90, 100])
      .range([6, 9, 12, 15, 18])


    /* map circle markers */
    const mapDots = cuisineData.map((feat, index) => {
      //console.log(pt.geometry.coordinates) // -> [lng, lat]
      let lat = feat.geometry.coordinates[1]
      let lon = feat.geometry.coordinates[0]
      let coord = [lat,lon]

      const score = feat.properties.inspections[0].inspectScore
      let inspectScore
      if(score !== "Not scored") {
        inspectScore = score
      } else {
        inspectScore = 69 //lower than min score possible
      }

      const fillColor = getColor(inspectScore) //fill
      const strokeColor = getColor(inspectScore) //stroke
      const radius = getRadius(inspectScore)
      const cuisine = feat.properties.cuisines[0]

      const restName = feat.properties.name
      const yelpLink = feat.properties.yelpLink
      const yelpRating = feat.properties.yelpRating
      const formatScore = inspectScore !== 69 ? inspectScore + ' / 100': 'Not scored'

      return (
        <CircleMarker
          key={index}
          center={coord}
          fillColor={fillColor}
          color={strokeColor}
          radius={radius}
          onContextMenu={this.front}
          >
          <Popup>
            <div className='popups'>
              Name: <b><a href={yelpLink}>{restName}</a></b>
              <br/>
              Type: <b>{cuisine}</b>
              <br/>
              Health score: <b>{formatScore}</b>
              <br/>
              Yelp score: <b>{yelpRating} / 5</b>
            </div>
          </Popup>
        </CircleMarker>
      )
    }) //end circlem-akers


    /* chart circles */
    const scatterDots = cuisineData.map((feat, index) => {
      const score = feat.properties.inspections[0].inspectScore
      let inspectScore
      if(score !== "Not scored") {
        inspectScore = score
      }
      else {
        inspectScore = 69  //lower than min score possible
      }

      const lat = feat.geometry.coordinates[1]
      const lon = feat.geometry.coordinates[0]

      const restName = feat.properties.name
      const yelpRating = feat.properties.yelpRating

      //const jitter = (Math.random() * 0.5) - 1
      //console.log(parseFloat(jitter.toFixed(2)))

      return (
        <circle
          key={"sc-" + index}
          fill={getColor(inspectScore)}
          cx={xScale(inspectScore)} //+ jitter)
          cy={yScale(yelpRating)}
          r={9.5}
          opacity={0.25}
          onClick={this.onClick}
          data-lat={lat}
          data-lon={lon}
          >
          <title>
            Name: {restName},
            Health score: {inspectScore !== 69 ? inspectScore : 'Not scored'},
            Yelp Score: {yelpRating}
          </title>
        </circle>
      )
    }) //end chart

    const position = [this.state.lat, this.state.lng]

    return (
      <div>
        <h1>Tidy Noms Map</h1>
        <h2>Ditch dirty dining</h2>
        <select
          name={'cuisine'}
          value={this.state.cuisine}
          onChange={this.dropdownSelect}>
          <option key={'search'} value={'All'}>
            Select a cuisine
          </option>
          {cuisinesOptions}
        </select>

        <Map center={position} zoom={this.state.zoom}>
          <TileLayer
            url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}"
            ext="png"
            subdomains="abcd"
            minZoom={9}
            maxZoom={20}
            attribution="Map tiles by <a href='http://stamen.com'>Stamen Design</a>, <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a> &mdash; Map data &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
            />

          <GeoJSON
            data={this.state.bounds}
            color='dodgerBlue' //stroke
            fill={false}
            weight={5}
            opacity={1.0}
            >
            <Popup>
              <div className='popups'>
                Name: <b>{this.state.bounds[0].properties.COUNTY}</b>
                <br/>
              </div>
            </Popup>
          </GeoJSON>

          { mapDots }

        </Map>

        <svg width={this.state.width} height={this.state.height}>
          { scatterDots }
        </svg>

      </div>

    ) // end return

  } // end render

} // end component

export default App
