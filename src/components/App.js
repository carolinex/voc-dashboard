/* Author: Caroline Rozendo
 * 'App' is the main class for the application
 * 'AirViz' builds the visualization
 */
import React, { useRef, useEffect, Component } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';

const API_URL = "https://esdr.cmucreatelab.org/api/v1";
const CHANNELS =  [ "eCO2", "temp", "tVOC", "humidity" ];
const CH_NAMES =  [ "Equivalent CO2", "Temperature", "Volatile Compounds", "Humidity" ];
const CH_THRESHOLDS =  [
  [5000, 2500, 1000, 750, 600, 400, 200, 0],//[0, 200, 400, 600, 750, 1000, 2500, 5000]
  [-10, -5, 0, 5, 10, 18, 25, 35],
  [2000, 1000, 700, 500, 300, 180, 90, 0],//[0, 40, 120, 160, 300, 500, 750, 1000]
  [70, 60, 50, 40, 30, 20, 10, 0]
];
const FEEDS = [ { name: "Braddock", id: "26443" },
                { name: "Clairton North", id: "26445" },
                { name: "Mckeesport", id: "26452" } ];

/* Visualization Component */
export const AirViz = (props: IProps) => {
  const d3Container = useRef(null);

  useEffect(() => {
    if(props.feedID && d3Container.current) {
      let channelData = [];
      let w = parseInt(d3.select('#main').style('width'));
      let h = parseInt(d3.select('#main').style('height')) - 230;
      const svg = d3.select(d3Container.current);

      let loadData = (ch) => {
        let selectedFeedID = props.feedID;
        let selectedChannel = CHANNELS[ch];
        let selectedLevel = 12;
        let selectedOffset = Math.floor(props.period.min / (Math.pow(2,selectedLevel)*512));
        let tileURL = API_URL + "/feeds/" + selectedFeedID +
            "/channels/" + selectedChannel + "/tiles/" +
            selectedLevel + "." + selectedOffset;

        channelData[ch] = null;

        d3.json(tileURL).then(function(resp){
          //console.log(resp)
          switch (resp.code) {

              case 200:
                channelData[ch] = resp.data;
                console.log(new Date(resp.data.data[resp.data.data.length-1][0]*1000));
                buildChannelViz(ch);
                return; // console.log(resp.data);
              case 401:
                return console.log("Not authorized");
              case 403:
                return console.log("Forbidden");
              default:
                return console.log("Error: " + resp);
           }
        })
      }

      // builds one column of visualization
      // for each loaded channel
      let buildChannelViz = (ch) => {
        const svg = d3.select(d3Container.current);
        let data = channelData[ch].data, filteredData = [];
        let vizWidth, colWidth;
        let vizGroup, yAxis, xAxis;
        let margin = {
          left: 115, right: 115, top:0, bottom: 0, gap: 25
        }
        let scaleColors = d3.scaleLinear()
          .domain(CH_THRESHOLDS[ch])
          .range(['#530018', '#b0262b', '#dd6f55', '#f6b295', '#8dc2d9', '#5e9ec3', '#3a6593', '#183869'])
          .interpolate(d3.interpolateRgb);

        filteredData = data.filter((d) => {
          return (Number(d[0]) >= Number(props.period.min) && Number(d[0]) <= Number(props.period.max));
        });

        w = parseInt(d3.select('#main').style('width'));
        h = parseInt(d3.select('#main').style('height')) - 230;
        vizWidth = w - margin.left - margin.right + margin.gap;
        colWidth = vizWidth/4;

        d3.select("#ch-"+ch).remove();

        let scaleDay1 = new Date(props.period.min*1000);
        let scaleDay2 = new Date(props.period.max*1000);

        let lastDay = new Date(scaleDay2);//filteredData[filteredData.length-1][0]*1000);
        let firstDay = new Date(lastDay.getFullYear(),lastDay.getMonth(),lastDay.getDate()-7,0,0,0);
        let day = new Date(lastDay.getFullYear(),lastDay.getMonth(),lastDay.getDate()-7,0,0,0);

        let scaleTime = d3.scaleTime().range([40, h]);
        scaleTime.domain([
          Math.floor(scaleDay1.getTime()/1000),
          Math.floor(scaleDay2.getTime()/1000)
        ]);

        let axisY1, axisY2;
        // Axis 1
        d3.selectAll('.axisY1').remove();
        axisY1 = svg.append('g').attr('class', 'axisY1');
        for(var i=0; i<7; i++){
          //console.log(day.toString());
          day = new Date(day.getFullYear(),day.getMonth(),day.getDate()+1,0,0,0)

          axisY1.append("rect")
          .attr("y", function(d,i){
            return scaleTime(day.getTime()/1000);
          })
          .attr("width", 75)
          .attr("height", (h-40)/7);

          axisY1.append("text")
            .attr("y", function(d,i){
              return scaleTime(day.getTime()/1000) + h/14;
            })
            .attr("x",37)
            .attr("text-anchor","middle")
            .text(day.toString().substr(0,3).toUpperCase());

          axisY1.append("text")
            .attr("y", function(d,i){
              return scaleTime(day.getTime()/1000) + (h-40)/14 + 16;
            })
            .attr("x",37)
            .attr("text-anchor","middle")
            .text(day.toLocaleDateString());
        }

        // Axis 2
        day = new Date(lastDay.getFullYear(),lastDay.getMonth(),lastDay.getDate()-7,12,0,0);
        d3.selectAll('.axisY2').remove();

        axisY2 = svg.append('g').attr('class', 'axisY2');
        for(var i=0; i<14; i++){
          axisY2.append("line")
          .attr("y1", function(d,i){
            return scaleTime(day.getTime()/1000);
          })
          .attr("y2", function(d,i){
            return scaleTime(day.getTime()/1000);
          })
          .attr("x1", function(d,i){
            return w - 75;
          })
          .attr("x2", function(d,i){
            return w - 60;
          });

          axisY2.append("text")
            .attr("y", function(d,i){
              return scaleTime(day.getTime()/1000) + 3;
            })
            .attr("x", w - 52)
            .attr("text-anchor","start")
            .text(function(){
              let txt;
              if((i/2).toString().indexOf(".") > -1){
                txt = "00:00";
              }else{
                txt = "12:00";
              }
              return txt;
            });

          day = new Date(day.getFullYear(),day.getMonth(),day.getDate(),day.getHours()+12,0,0)
        }

        vizGroup = svg.append('g')
          .attr('class', 'ch')
          .attr('id', 'ch-'+ch);

        vizGroup.selectAll('rect')
          .data(filteredData)
          .enter()
          .append('rect')
          .attr('width', colWidth - margin.gap)
          .attr('height', (h-40)/filteredData.length)
          .attr('fill', function(d){
            let fill = scaleColors(d[1]);
            return fill;
          })
          .attr('x', margin.left + (ch*colWidth))
          .attr('y', function(d,i){
            return scaleTime(d[0]);
            //return i*(h/filteredData.length);
          });

        vizGroup.append('text')
        .attr('x', margin.left + (ch*colWidth) + (colWidth - margin.gap)/2)
        .attr('y', 15)
        .attr("text-anchor","middle")
        .style('font-size', '12px')
        .style('text-transform', 'uppercase')
        .text(CH_NAMES[ch]);
      }

      // rebuild channels on window resize
      let onResize = () => {
        w = parseInt(d3.select('#main').style('width'));
        h = parseInt(d3.select('#main').style('height')) - 230;

        svg.attr("viewBox", "0 0 " + w + " " + h);

        CHANNELS.forEach((ch, i) => {
          buildChannelViz(i);
        });
      }
      window.addEventListener('resize', onResize);

      w = parseInt(d3.select('#main').style('width'));
      h = parseInt(d3.select('#main').style('height')) - 230;
      svg.attr("viewBox", "0 0 " + w + " " + h)

      // build channels once  on start
      CHANNELS.forEach((ch, i) => {
        loadData(i);
      });

    }
  },[ props.feedID, d3Container.current ])

  return (
    <svg
      id="chart-stage"
      ref={d3Container}
      preserveAspectRatio="xMinYMid"
    />
  );
}

/* components */
class App extends Component {

  constructor(props) {
    super(props);

    this.period = { min: Math.floor(Date.now()/1000) - (7*24*60*60),
                    max: Math.floor(Date.now()/1000) - (0*24*60*60)};


    this.state = {
      feed: 0
    }
  }

  componentDidMount(){
  }

  componentDidUpdate(){
  }

  render(){
    //console.log("feed: "+this.state.feed);
    //console.log(new Date(this.period.max*1000));

    /* This is the overall structure of the page */
    return (
      <div id="main">
        <h1>Air Quality</h1>
        <section id="chart">
          <AirViz
            feedID={ FEEDS[this.state.feed].id }
            period={ this.period }
          />
        </section>
      </div>
		)
	}
}

export default App;
