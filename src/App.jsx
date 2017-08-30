import React, { Component } from 'react'
import { Map, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet'
import * as d3 from 'd3'

const padding = {left: 50, right: 20, bottom: 50, top: 50}

class App extends Component {
  constructor() {
    super()
    this.front = this.front.bind(this)
    this.dropdownSelect = this.dropdownSelect.bind(this)
    this.onResize = this.onResize.bind(this)
    this.onClick = this.onClick.bind(this)

    this.state = {
      lat: 45.5589,
      lng: -123.0064,
      points: null,
      zoom: 10,
      height: null,
      width: null,
      cuisine: 'All',
    } //end of state

  } //end constructor

  dropdownSelect(event) {
    //console.log('evt', event.target)
    let name = event.target.name  //'cuisine'
    let value = event.target.value
    //console.log(name, value)

    this.setState({
      [name]: value
    })
  }

  onResize() {
    this.setState({
      width: window.innerWidth * 0.232,
      height: 600 //same as leaflet container
    })
  }

  onClick(event) {
    //console.log('e.t', event.target)
    //console.log('lat:', event.target.dataset.lat)
    this.setState({
      lng: event.target.dataset.lon,
      lat: event.target.dataset.lat,
      zoom: 17
    })
  }

  front(event) {
    event.target.bringToBack()
  }

  renderAxis() {
    const xScale = d3.scaleLinear()
      .domain([1, 5]) //yelp
      .range([25 + padding.left,
              this.state.width - padding.right])

    const xAxis = d3.axisBottom(xScale).ticks(5)

    d3.select(this.refs.gX)
      .call(xAxis)

    const yScale = d3.scaleLinear()
      .domain([70 - 2, 100])
      .range([this.state.height - padding.bottom, //bottom
              0 + padding.top]) //top

    const yAxis = d3.axisLeft(yScale).ticks(5)

    d3.select(this.refs.gY)
      .call(yAxis)
  }

  componentDidMount() {
    let cmp = this
    const url1 = `https://cdn.glitch.com/1ffed53a-97b5-4e8d-9ce0-9a9b638459eb%2Fcombined.geojson`
    //const url2 = `https://opendata.arcgis.com/datasets/470aa3de09244de4a3a94150b86a648b_10.geojson` //city
    const url2 = `https://opendata.arcgis.com/datasets/4577bb8a8b5147fc86026c3c692ec8fa_9.geojson` //county

    d3.queue()
      .defer(d3.json, url1)
      .defer(d3.json, url2)
      .await((error, geoPoints, countyBounds) => {
        //console.log('d3-points:', geoPoints)
        //console.log('d3-county:', countyBounds)
        const county = countyBounds.features.filter(county => {
          return county.properties.COUNTY === 'Washington'
        })
        //console.log('d3-cFilter:', county)

        cmp.setState({
          points: geoPoints,
          bounds: county
        })

      }) //end await

    window.addEventListener('resize', this.onResize, false)
    this.onResize()

    this.renderAxis()

  }

  componentDidUpdate() {
    this.renderAxis()
  }

  render() {
    if(this.state.points == null) {
      return null
    }

    const pts = this.state.points
    //console.log('points:', this.state.points)
    //console.log('state.cuisine:', this.state.cuisine)
    //console.log('w', this.state.width, 'h', this.state.height)

    /* create array of cuisines to filter */
    let cuisinesArray1 = []
    for(let i = 0; i < pts.features.length; i++){
      for(let j = 0; j < pts.features[i].properties.cuisines.length; j++){
        cuisinesArray1.push(pts.features[i].properties.cuisines[j])
      }
    }
    //console.log('cA:', cuisinesArray1)

    let cuisinesArray = cuisinesArray1.filter((unique, index, array) => {
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

      let data = []
      for(let k = 0; k < pts.features.length; k++){
        for(let l = 0; l < pts.features[k].properties.cuisines.length; l++){
          if(cuisineSelected === pts.features[k].properties.cuisines[l]){
          data.push(pts.features[k])
        }
        }
      }

      return data
    }

    //console.log(this.state.cuisine, 'data:', filterData(this.state.cuisine))

    const cuisineData = filterData(this.state.cuisine)
    //console.log('cuisine data:', cuisineData)


    /* mean */
    let meanInspectArray = []
    for(let m = 0; m < cuisineData.length; m++){
      for(let n = 0; n < cuisineData[m].properties.inspections.length; n++){
        if(typeof(cuisineData[m].properties.inspections[n].inspectScore) === 'number'){
          meanInspectArray.push(cuisineData[m].properties.inspections[n].inspectScore)
        }
      }
    }
    //console.log('mA', meanInspectArray)

    const yelpArray = cuisineData.map(score => {
      return parseFloat(score.properties.yelpRating)
    })
    //console.log('yA:', yelpArray)

    /* d3 functions */
    const inspectMean = d3.mean(meanInspectArray)
    //console.log('cMean:', inspectMean)

    const yelpMean = d3.mean(yelpArray)
    //console.log('yMean:', yelpMean)

    const findMinMax = (data) => {
      return d3.extent(data, (d) => {
        return d.properties.inspections[0].inspectScore
      })
    }
    const min = 70
    //const min = findMinMax(this.state.points.features)[0]
    const max = findMinMax(this.state.points.features)[1]
    //console.log('min:', min, '\nmax:', max)

    //const padding = {left: 10, right: 10, bottom: 0, top: 50}

    const xScale = d3.scaleLinear()
      .domain([1, 5]) //yelp
      .range([25 + padding.left,
                this.state.width - padding.right])

      //.domain([69, max])
      //.range([0 + padding.left,
                //this.state.width - padding.right])

    const yScale = d3.scaleLinear()
      .domain([min - 2, max])
      .range([this.state.height - (padding.bottom * 2), //bottom
              0 + padding.top ]) //top

    let getColor = d3.scaleThreshold()
      .domain([min, 80, 90, 100])
      .range(['dimgray', 'magenta', 'orangeRed', 'gold', 'limeGreen'])

    let getRadius = d3.scaleThreshold()
      .domain([70])
      .range([5, 10])

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
      //const cuisine = feat.properties.cuisines[0]

      const restName = feat.properties.name
      const yelpLink = feat.properties.yelpLink
      const yelpRating = feat.properties.yelpRating
      const formatScore = inspectScore !== 69 ? inspectScore + ' / 100': 'Not scored'

      return (
        <CircleMarker
          key={index}
          className={''}
          center={coord}
          fillColor={fillColor}
          color={strokeColor}
          radius={radius}
          onContextMenu={this.front}
          >
          <Popup>
            <div className='popups'>
              Name: <b>{restName}</b>
              <br/>
              Latest inspection score: <a href={`http://www.co.washington.or.us/customcf/restinsp/report.cfm?id=${feat.properties.inspections[0].inspectId}&_=${feat.properties.inspections[0].restId}`}>{formatScore}</a>
              <br/>
              Yelp score: <a href={yelpLink}>{yelpRating} / 5</a>
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
        inspectScore = min - 2  //lower than min score possible
      }

      const lat = feat.geometry.coordinates[1]
      const lon = feat.geometry.coordinates[0]

      const restName = feat.properties.name
      const yelpRating = feat.properties.yelpRating

      const jitter = (Math.random() * 1.0) - 0.5
      //console.log(parseFloat(jitter.toFixed(2)))

      let opacity
      if(this.state.cuisine !== 'All') {
        opacity = 0.70
      } else {
        opacity = 0.125
      }

      return (
        <g key={index}>
          <text
            x={xScale(3)}
            y={16}
            textAnchor={'middle'}
            fill={'none'}>
            {restName}
          </text>

          <circle
            key={'sc-' + index}
            className={''}
            id={'d3-' + index}
            fill={getColor(inspectScore)}
            cx={xScale(yelpRating)}
            cy={yScale(inspectScore + jitter)}
            r={9}
            opacity={opacity}
            data-lat={lat}
            data-lon={lon}
            onClick={this.onClick}>
            <title>
              Name: {restName},
              Health score: {inspectScore !== min-2 ? inspectScore : 'Not scored'},
              Yelp Score: {yelpRating}
            </title>
          </circle>


        </g>
      )
    }) //end chart

    const yelpAvgLine =  (
      <line
        x1={xScale(yelpMean)} y1={yScale(100)}
        x2={xScale(yelpMean)} y2={yScale(65)}
        strokeDasharray='5, 5' strokeWidth='2' stroke='dodgerBlue'
        />
    )

    const inspectAvgLine = (
      <line
        x1={xScale(1)} y1={yScale(inspectMean)}
        x2={xScale(5)} y2={yScale(inspectMean)}
        strokeDasharray='5, 5' strokeWidth='2' stroke='dodgerBlue'
        />
    )

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

        <Map
          center={position}
          zoom={this.state.zoom}
          scrollWheelZoom={false}>
          <TileLayer url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}"
            subdomains='abcd'
            ext='png'
            minZoom={9}
            maxZoom={19}
            attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'/>

          <GeoJSON
            data={this.state.bounds}
            color='crimson' //stroke
            fill={false}
            weight={5}
            opacity={1.0}>
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

          <g
            transform={'translate(' + 0 + ',' + (this.state.height - padding.bottom) + ')'}
            ref='gX'
            />

          <g
            transform={'translate(' + padding.left + ',' + 0 + ')'}
            ref='gY'
            />

          <text
            x={xScale(1) - 5}
            y={this.state.height - 55}
            textAnchor={'start'}
            fill={'crimson'}
            >
            {cuisineData.length.toLocaleString()} restaurants found
          </text>

          <text
            x={xScale(3)}
            y={this.state.height - 5}
            textAnchor={'middle'}
            fill={'black'}
            fontWeight={'bolder'}
            >
            Yelp Score
          </text>

          <text
            x={-200}
            y={xScale(1) - 60}
            textAnchor={'end'}
            fill={'black'}
            fontWeight={'bolder'}
            transform={'rotate(-90,' + (0) + ',' + (0) + ')'}
            >
            Health Inspection Score
          </text>

          { yelpAvgLine }
          { inspectAvgLine }

        </svg>

      </div>

    ) // end return

  } // end render

} // end component

export default App
