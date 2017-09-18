import React from 'react'
import { Map, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet'
import * as d3 from 'd3'

export default (props) => {
  if(props.filteredCuisine == null) {
    return null
  }

//  console.log('MAP props:', props)
//  console.log('MAP filterRestData:', props.filterRestData)


  const mapDots = props.filteredCuisine.map((feat, index) => {
    //console.log(feat.geometry.coordinates) // -> [lng, lat]

    const lat = feat.geometry.coordinates[1]
    const lon = feat.geometry.coordinates[0]
    const coord = [lat, lon]

    const score = feat.properties.inspections[0].inspectScore
    let inspectScore;
    if(score !== "Not scored") {
      inspectScore = score
    } else {
      inspectScore = 69 //less than min score possible
    }

    const circleOpacity = 0.25
    const fillColor = props.color(inspectScore)
    const strokeColor = props.color(inspectScore)
    const radius = props.radius(inspectScore)
    const restName = feat.properties.name
    const yelpRating = feat.properties.yelpRating
    const yelpLink = feat.properties.yelpLink
    const formatScore = score !== 'Not scored' ? score + ' / 100': 'Not scored'
    const inspectId = feat.properties.inspections[0].inspectId
    const restId = feat.properties.inspections[0].restId
    const inspectLink = `http://www.co.washington.or.us/customcf/restinsp/report.cfm?id=${inspectId}&_=${restId}`

    const onMapHover = (event) => {
      //console.log('e:', event)
      //console.log('e.t:', event.target)

      //MAP
      event.target.setStyle({
        fillOpacity: 0.75,
        fillColor: 'crimson',
        color: 'crimson'
      })

      event.target.setRadius(25)
      event.target.bringToFront()

      //CHART
      const selectedClass = event.target.options.className
      //console.log('class', selectedClass)

      d3.selectAll('circle.' + selectedClass)
        .style('fill', 'magenta')
        .style('stroke', 'black')
        .attr('r', 20)
        .attr('opacity', 1.0)

      //text
      d3.selectAll('text.' + selectedClass)
        .style('fill', 'black')


    } //onHover

    const onMapHoverOut = (event) => {
      //MAP
      event.target.setStyle({
        fillOpacity: circleOpacity,
        fillColor: fillColor,
        color: strokeColor
      })

      event.target.setRadius(radius)
      event.target.bringToBack()

      //CHART
      const selectedClass = event.target.options.className

      d3.selectAll('circle.' + selectedClass)
        .style('fill', fillColor)
        .style('stroke', strokeColor)
        .attr('r', 9)
        .attr('opacity', 0.5)

      //text
      d3.selectAll('text.' + selectedClass)
        .style('fill', 'none')


    } //onHoverOut

    return (
      <CircleMarker
        key={'cm-' + index}
        className={"sameClass-" + index}
        id={"circleMarker-" + index}
        data-index={index}
        onMouseOver={onMapHover}
        onMouseOut={onMapHoverOut}
        fillOpacity={circleOpacity}
        center={coord}
        fillColor={fillColor}
        color={strokeColor}
        radius={radius}
        onContextMenu={this.front} >
        <Popup>
          <div className='popups'>
            Name: <b>{restName}</b>
            <br/>
            Inspection score: <a href={inspectLink}>{formatScore}</a>
            <br/>
            Yelp score: <a href={yelpLink}>{yelpRating} / 5</a>
          </div>
        </Popup>
      </CircleMarker>
    )
  })

  const centerPosition = [props.lat, props.lng]
  const panningBounds = [
    [45.2632885315,-123.5440063477],
    [45.799126964, -122.6527404785]
  ]

  return (
    <Map
      center={centerPosition}
      zoom={props.zoom}
      maxBounds={panningBounds}
      >
      <TileLayer 
        url='https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}'
        subdomains='abcd'
        ext='png'
        minZoom={9}
        maxZoom={19}
        attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

      <GeoJSON
        data={props.filteredCounty}
        fill={false}
        color={'crimson'} //stroke
        weight={4} //stroke
        opacity={1.0} //stroke
        />

      { mapDots }

    </Map>

  ) // end return

} //export
