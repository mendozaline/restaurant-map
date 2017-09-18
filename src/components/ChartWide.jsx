import React, { Component } from 'react'
import * as d3 from 'd3'

const padding = {top: 65, right: 40, bottom: 40, left: 50}
const min = 70,
      max = 100

export default class ChartWide extends Component {
  constructor(props) {
    super(props)

    this.renderAxis = this.renderAxis.bind(this)

//    this.onChartHover = this.onChartHover.bind(this)
//    this.onChartHoverOut = this.onChartHoverOut.bind(this)

    this.state = { }
  }


  renderAxis() {
    const xScale = d3.scaleLinear()
      .domain([1, 5]) //yelp
      .range([(padding.left * 1.1),
              (this.props.width2) - padding.right]) //ratio

    const xAxis = d3.axisBottom(xScale).ticks(9)

    d3.select(this.refs.gX)
      .call(xAxis)

    const yScale = d3.scaleLinear()
      .domain([min - 2, max])
      .range([this.props.height / 1.75 - (padding.bottom * 2),
              padding.top ]) //top


    const yAxis = d3.axisLeft(yScale).ticks(5)

    d3.select(this.refs.gY)
      .call(yAxis)
  } //end renderAxis


  componentDidMount() {
    this.renderAxis()
  } // end CDM


  componentDidUpdate() {
    this.renderAxis()
  } // end CDU


  render() {

    if(this.props.filteredCuisine == null) {
      return null
    }

    //console.log('CHART props:', this.props)

    const cuisineData = this.props.filteredCuisine

    /* mean */
    let meanInspectArray = []
    for(let m = 0; m < cuisineData.length; m++){
      for(let n = 0; n < cuisineData[m].properties.inspections.length; n++){
        if(typeof(cuisineData[m].properties.inspections[n].inspectScore) === 'number'){
          meanInspectArray.push(cuisineData[m].properties.inspections[n].inspectScore)
        }
      }
    }
    //console.log('meanA', meanInspectArray)

    const yelpArray = cuisineData.map(score => {
      return parseFloat(score.properties.yelpRating)
    })
    //console.log('yA:', yelpArray)

    /* d3 functions */
    const inspectMean = d3.mean(meanInspectArray)
    //console.log('cMean:', inspectMean)

    const yelpMean = d3.mean(yelpArray)
    //console.log('yMean:', yelpMean)

    //console.log('min:', min, '\nmax:', max)


    const xScale = d3.scaleLinear()
      .domain([1, 5]) //yelp
      .range([(padding.left * 1.1),
              (this.props.width2) - padding.right]) //ratio

    const yScale = d3.scaleLinear()
      .domain([min - 2, max])
      .range([this.props.height / 1.75 - (padding.bottom * 2),
              padding.top ]) //top

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

      const restName = feat.properties.name
      const yelpRating = parseFloat(feat.properties.yelpRating)

      const jitterX = (Math.random() * 0.2) - .1
      const jitterY = (Math.random() * 1.0) - 0.5
      //console.log(parseFloat(jitter.toFixed(2)))

      let opacity
      if(this.props.cuisine !== 'All') {
        opacity = 0.5
      } else {
        opacity = 0.1
      }

      const chartRadius = 9

      const onChartHover = (event) => {
        //console.log('e:', event)
        //console.log('e.t:', event.target)
        //console.log('e.t.ds.i:', event.target.dataset.index)

        const selectedClass = '.sameClass-' + event.target.dataset.index

        //CHART
        d3.selectAll('circle' + selectedClass)
          .attr('r', 12)
          .attr('stroke', 'black')
          .attr('opacity', 1.0)

        d3.selectAll('text' + selectedClass)
          .style('fill', 'black')

        //'d'
        let currentD = d3.selectAll('path.sameClass-' + index).attr('d')
//        console.log('H:currentPath\n|'+ currentD)

        let splitD = currentD.split(',')
//        console.log('H:splitPath\n', splitD)

        let x = splitD[0].split('M')
//        console.log('H:x\n', x)

        let x1 = parseFloat(x[1])
//        console.log('H:x1\n', x1)

        let y1 = splitD[1].split('a')[0]
//        console.log(H:'y1\n', y1)

        let radius25 = 'a25,25 0 1,0 50,0 ' +
                       'a25,25 0 1,0 -50,0'

        let newD = `M${inspectScore < 70 ? x1 - 20 : x1 - 15},${y1}${radius25}`
//        console.log('H:newD\n|'+ newD)

        //MAP
        d3.select('path' + selectedClass)
          .attr('d', newD)
          .style('fill', 'crimson')
          .style('stroke', 'crimson')


      } //end ChartHover


      const onChartHoverOut = (event) => {
        const selectedClass = '.sameClass-' + event.target.dataset.index

        //console.log(d3.selectAll(selectedClass))

        //CHART
        d3.selectAll('circle' + selectedClass)
          .attr('r', chartRadius)
          .attr('stroke', this.props.color(inspectScore))
          .attr('opacity', opacity)

        d3.selectAll('text' + selectedClass)
          .style('fill', 'none')

        //'d'
        let currentD = d3.selectAll('path.sameClass-' + index).attr('d')
//        console.log('HO:currentPath\n|'+ currentD)

        let splitD = currentD.split(',')
//        console.log('HO:splitPath\n', splitD)

        let x = splitD[0].split('M')
//        console.log('HO:x\n', x)

        let x1 = parseFloat(x[1])
//        console.log('HO:x1\n', x1)

        let y1 = splitD[1].split('a')[0]
//        console.log('HO:y1\n', y1)

        let radius5 = 'a5,5 0 1,0 10,0' +
                      ' a5,5 0 1,0 -10,0 '
        let radius10 = 'a10,10 0 1,0 20,0' +
                       ' a10,10 0 1,0 -20,0 '

        let newD = `M${inspectScore < 70 ? x1 + 20 : x1 + 15},${y1}${inspectScore < 70 ? radius5 : radius10 }`
//        console.log('HO:newD\n'+ newD)


        //MAP
        d3.select('path' + selectedClass)
          .attr('d', newD)
          .style('fill', this.props.color(inspectScore))
          .style('stroke', this.props.color(inspectScore))
          .attr('transform', 'translate(0,0)scale(1.0)')


      } //end ChartHoverOut


      return (
        <g key={index}>
          <text
            className={'sameClass-' + index}
            x={true ? this.props.width2 / 6 : this.props.width2 / 3}
            y={padding.top / 2}
            textAnchor={'start'}
            fill={'none'}
            fontSize={22}
            fontWeight={'bold'} >
            {restName}
          </text>

          <circle
            key={'sc-' + index}
            className={"sameClass-" + index}
            id={'chartCircle-' + index}
            data-index={index}
            onMouseOver={onChartHover}
            onMouseOut={onChartHoverOut}
            stroke={this.props.color(inspectScore)}

            fill={this.props.color(inspectScore)}
            cx={xScale(yelpRating + jitterX)}
            cy={yScale(inspectScore + jitterY)}
            r={chartRadius}
            opacity={opacity}
            onClick={this.onClick} >
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
        strokeDasharray='5, 5' strokeWidth='2' stroke='dimGray'
        />
    )

    const inspectAvgLine = (
      <line
        x1={xScale(1)} y1={yScale(inspectMean)}
        x2={xScale(5)} y2={yScale(inspectMean)}
        strokeDasharray='5, 5' strokeWidth='2' stroke='dimGray'
        />
    )




    return (
      <svg
        width='100%'
        height={this.props.height / 1.75}
        >
        <text
          x={this.props.width2 / 10}
          y={padding.top / 2}
          textAnchor={'start'}
          fill={'black'}
          fontSize={22}
          >
          Name:
        </text>

        { yelpAvgLine }
        { inspectAvgLine }

        { scatterDots }

        <g
          transform={'translate(' + (0) + ',' + (this.props.height / 1.75 - padding.bottom) + ')'}
          ref='gX'
          />

        <g
          transform={'translate(' + (padding.left * 0.9) + ',' + (0) + ')'}
          ref='gY'
          />

        <text
          x={xScale(3)}
          y={this.props.height / 1.75 - 5}
          textAnchor={'middle'}
          fill={'black'}
          fontWeight={'bolder'}
          >
          Yelp Score
        </text>

        <text
          x={-yScale(85)}
          y={padding.left / 3}
          transform={'rotate(' + (-90) + ',' + (0) + ',' + (0) + ')'}
          textAnchor={'middle'}
          fill={'black'}
          fontWeight={'bolder'}
          >
          Health Inspection Score
        </text>


      </svg>

    ) // end return

  }// render

}
