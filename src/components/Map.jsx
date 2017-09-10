import React from 'react'
import { Map, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet'

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

    return (
      <CircleMarker
        key={'cm-' + index}
        className={'circle-markers'}
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

  return (
    <Map
      center={centerPosition}
      zoom={props.zoom} >

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
