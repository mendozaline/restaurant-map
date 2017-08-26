import React, { Component } from 'react'
import { Map, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import * as d3 from 'd3'

class App extends Component {

  constructor() {
    super()

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

  componentDidMount() {
    console.log('cDM')
    let cmp = this
    const url = `https://cdn.glitch.com/1ffed53a-97b5-4e8d-9ce0-9a9b638459eb%2Fcombined.geojson`

    d3.queue()
      .defer(d3.json, url)
      .await((error, geoPoints) => {
        //console.log('d3-points:', geoPoints)

        cmp.setState({
          points: geoPoints
        })

      }) //end await

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
    let getColor = d3.scaleThreshold()
      .domain([70, 80, 90, 100])
      .range(['dimGray', 'crimson', 'darkOrange', 'gold', 'limeGreen'])

    let getRadius = d3.scaleThreshold()
      .domain([70, 80, 90, 100])
      .range([1, 5, 10, 15, 20])


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
    })

    const position = [this.state.lat, this.state.lng]

    return (
      <div>
        <Map center={position} zoom={this.state.zoom}>
          <TileLayer
            url="http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}"
            ext="png"
            subdomains="abcd"
            minZoom={9}
            maxZoom={20}
            attribution="Map tiles by <a href='http://stamen.com'>Stamen Design</a>, <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a> &mdash; Map data &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
            />

          { mapDots }
        </Map>
      </div>

    ) // end return

  } // end render

} // end component

export default App
