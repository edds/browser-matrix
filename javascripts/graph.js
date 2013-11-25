(function(){
  "use strict"
  var root = this,
      $ = root.jQuery;
  if(typeof root.matrix === 'undefined'){ root.matrix = {} }

  var graph = {
    svg: false,
    x: false,
    y: false,
    width: 600,
    height: 300,
    maxPercent: 20,

    init: function(){
      var padding = 40,
          axis, axisCords;

      graph.svg = d3.select('#graph')
        .append('svg:svg')
          .attr('width', (graph.width + 190 + padding * 2))
          .attr('height', (graph.height + 60 + padding * 2))
          .attr('class', 'multiLine')
        .append('g')
          .attr('transform', 'translate('+padding+','+padding+')'),
      graph.axis = graph.svg.append('g').attr('class', 'axis'),
      axisCords = [
        // [ y1, y2, x1, x2 ]
        [ 0.5, graph.width+.5, graph.height+.5, graph.height+.5 ],
        [ 0.5, 0.5, 0.5, graph.height+.5 ],
        [ graph.width+.5, graph.width+.5, 0.5, graph.height+.5 ]
      ];

      graph.browsers = graph.svg.append('g').attr('class', 'browsers')
      graph.colours = d3.scale.category10();

      axisCords.map(function(d){
        graph.axis.append('svg:line')
          .attr('x1', d[0]).attr('x2', d[1]).attr('y1', d[2]).attr('y2', d[3]);
      });

      graph.line = d3.svg.line()
        .interpolate('monotone')
        .x(function(d, i) { return graph.x(i); })
        .y(function(d, i) { return graph.y(d); });
    },
    reset: function(){
      graph.maxPercent = 20;
    },
    addData: function(days, data){
      var browser, browsers, tick, ticks;
      data.forEach(function(line, i){
        line.days.forEach(function(day, i){
          if(graph.maxPercent < day){
            graph.maxPercent = day;
          }
        });
      });
      graph.x = d3.scale.linear().domain([days.length-1, 0]).range([graph.width, 0]);
      graph.y = d3.scale.linear().domain([0, graph.maxPercent]).range([graph.height, 0]).nice();

      // add new data to the browsers
      browsers = graph.browsers.selectAll('.browser')
        .data(data, function(d){ return d.os+'-'+d.browser+'-'+d.version; })

      // add new elemnts not matched by previous data
      browser = browsers.enter()
        .append('g').attr('class', 'browser')

      // add new text nodes
      browser.append("text")
        .datum(function(d) { return {name: d.os+' -  '+d.browser+' - '+d.version }; })
        .attr("x", 3)
        .attr("dy", ".35em")
        .attr('class', 'text')
        .text(function(d) { return d.name; });

      // add new lines
      browser.append('path')
        .attr('class', 'line')
        .attr('stroke', function(d,i){ return graph.colours(i); });

      browsers.select('.text').transition()
        .attr("transform", function(d){ return "translate("+graph.width+","+graph.y(d.days[d.days.length-1])+")"; })

      // update all the lines to have the new data
      browsers.select('.line').transition()
        .attr('d', function(d){ return graph.line(d.days); });

      browsers.on('click', function(){
        var browser = d3.select(this);
        if(browser.attr('class').indexOf('active') < -1){
          browser.attr('class', 'browser')
        } else {
          browser.attr('class', 'browser active');
        }
      });

      ticks = graph.axis.selectAll('.x-tick')
        .data(days, function(d){ return d; })

      tick = ticks.enter()
        .append('g').attr('class', 'x-tick')
      tick.append('svg:line')
        .attr('class', 'line')
        .attr('y1', 0)
        .attr('y2', graph.height);
      tick.append('text')
        .attr('class', 'text')
        .attr('text-anchor', 'start')
        .attr("dy", '15px')
        .attr('transform', function(d, i) { return 'translate(0,'+graph.height+') rotate(45)'; });

      ticks.select('.line').transition()
        .attr('x1', function(d, i){ return graph.x(i)+.5 })
        .attr('x2', function(d, i){ return graph.x(i)+.5 });
      ticks.select('.text').transition()
        .attr('transform', function(d, i) { return 'translate('+graph.x(i)+','+graph.height+') rotate(45)'; })
        .text(function(d){ return d; });

      ticks = graph.axis.selectAll('.y-tick')
        .data(graph.y.ticks(5))

      tick = ticks.enter()
        .append('g').attr('class', 'y-tick')
      tick.append('svg:line')
        .attr('class', 'line')
        .attr('x1', 0)
        .attr('x2', graph.width);
      tick.append('text')
        .attr('class', 'text')
        .attr('text-anchor', 'end')
        .attr('dy', '.4em')
        .attr('transform', function(d, i) { return 'translate(-2,0)'; })
        .text(function(d){ return d +'%'; });

      ticks.select('.line').transition()
        .attr('y1', function(d, i){ return graph.y(d)+.5 })
        .attr('y2', function(d, i){ return graph.y(d)+.5 });
      ticks.select('.text').transition()
        .attr('transform', function(d, i) { return 'translate(-2, '+graph.y(d)+')'; });
    }
  };
  root.matrix.graph = graph;
}).call(this);
