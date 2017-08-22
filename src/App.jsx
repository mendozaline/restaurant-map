import React, { Component } from 'react'
import { Map, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import * as d3 from 'd3'

class App extends Component {
  constructor() {
    super()

    this.state = {
      lat: 45.4889,
      lng: -122.806377,
      zoom: 12,

      points: null,
    } //end of state

  } //end constructor

  componentDidMount() {
    let cmp = this
    const url = `https://cdn.glitch.com/1ffed53a-97b5-4e8d-9ce0-9a9b638459eb%2Fcombined.geojson`

    d3.queue()
      .defer(d3.json, url)
      .await((error, dataPts) => {
        //console.log('points-load:', dataPts)

        cmp.setState({
          points: dataPts,
        }) //end setState

      }) //end await

  } //end CDM


  render() {
    if(this.state.points == null) {
      return null
    }

    let pts = this.state.points
    //console.log('points-render', this.state.points)

    const position = [this.state.lat, this.state.lng]

    return (
      <Map center={position} zoom={this.state.zoom}>
        <TileLayer
          url="http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}"
          ext="png"
          subdomains="abcd"
          minZoom={7}
          maxZoom={17}
          attribution="Map tiles by <a href='http://stamen.com'>Stamen Design</a>, <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a> &mdash; Map data &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
        />
        {
          pts.features.map((pt, index) => {
            //console.log('feat', pt)
            //console.log(pt.geometry.coordinates) // -> [lng, lat]

            let lat = pt.geometry.coordinates[1]
            let lon = pt.geometry.coordinates[0]
            let coord = [lat,lon]
            return (
              <CircleMarker
                key={index}
                center={coord}
                radius={10}
                color={'magenta'}
                fillColor={'yellow'}
                >
                <Popup>
                  <div>
                    <h2>Name: {pt.properties.name}</h2>
                    <br/>
                    <h4>
                      Score: {pt.properties.inspections[0].inspectScore}
                    </h4>
                  </div>
                </Popup>

              </CircleMarker>

              )
          }) //end pts.map

        }


      </Map>
    ) // end return

  } // end render

} // end component

export default App;
