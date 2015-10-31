// Adler - fideicomisos
// @package  : fideicomisos
// @location : /js/apps/data/views
// @file     : linemap.js
// @author   : Gobierno fácil <howdy@gobiernofacil.com>
// @url      : http://gobiernofacil.com

define(function(require){

  //
  // L O A D   T H E   A S S E T S   A N D   L I B R A R I E S
  // --------------------------------------------------------------------------------
  //
  //  [ libraries ]
  var Backbone = require('backbone'),
      d3       = require('d3'),

  //
  // D E F I N E   T H E   S E T U P   V A R I A B L E S
  // --------------------------------------------------------------------------------
  //

     Definitions = TRUSTS_DATA.definitions,
     Trusts      = TRUSTS_DATA.trust_array,
     Categories  = ["availability", "expenses", "income", "yield"],
     Category    = Categories[0],
     MAX         = d3.max(Trusts, function(trust){
                     return +trust[Category];
                   }),
     Blues       = ["#08306b", "#08519c","#2171b5","#4292c6","#6baed6","#9ecae1",],
     Colors      = d3.scale.linear()
            .domain([300,200,100,50,10,0])
            .range(Blues),

  //
  // D E F I N E   T H E   D 3   V A R I A B L E S
  // --------------------------------------------------------------------------------
  //
    SVG = {
      width  : 800,
      height : 500,
      margin : {
        top    : 30,
        right  : 30,
        bottom : 30,
        left   : 100
      },
    },
    SCALE = 1000000;

  //
  // C A C H E   T H E   C O M M O N   E L E M E N T S
  // --------------------------------------------------------------------------------
  //
 

  //
  // I N I T I A L I Z E   T H E   B A C K B O N E   " V I E W "
  // --------------------------------------------------------------------------------
  //
  var content = Backbone.View.extend({
    
    //
    // [ DEFINE THE EVENTS ]
    //
    events :{
      "change #line-category" : "update_render"
    },

    //
    // [ DEFINE THE ELEMENT ]
    //
    el : "#line-chart",

    //
    // [ DEFINE THE TEMPLATES ]
    //


    //
    // [ THE INITIALIZE FUNCTION ]
    //
    //
    initialize : function(settings){
      this.controller  = settings.controller;
      this.collection  = new Backbone.Collection(Trusts);
      this.definitions = new Backbone.Collection(Definitions);
      this.colors = Colors;

      this.svg    = null;
      this.scales = null;
      this.lines  = null;
      this.render();
    },

    //
    // C O  N T R O L   F U N C T I O N S
    // ------------------------------------------------------------------------------
    //
    set_category : function(e){
      /*
      var category = e.currentTarget.value,
          title    = this.$("option[value='" + category + "']").html();
          Category = Categories[category];
          this.update_treemap();
          this.render_table(title);
      */
    },
   

    //
    // R E N D E R   F U N C T I O N S
    // ------------------------------------------------------------------------------
    //
    
    // [ submit / ESC / call from controller ]
    //
    //
    render : function(){
      var div    = this.$(".g-container")[0],
          trusts = _.uniq(this.collection.pluck("registry")),
          data   = [],
          container;

      this.svg    = this.render_svg(div, SVG);
      this.scales = this.create_scales( this.collection.models, SVG);
      this.line   = this.make_line_generator(Category, this.scales[0], this.scales[1]);

      this.render_axis(this.svg, this.scales, SVG);
      container = this.svg.select(".main_container");

      // prepare data

      trusts.forEach(function(trust){
        data.push(this.collection.where({registry : trust}));
      }, this);
      
      this.lines = container.selectAll("path");
      this.lines.data(data).enter().append("path").attr("d", this.line)
              .attr("fill", "none")
              .attr("stroke", "grey")
              .attr("stroke-width", 1)
              .on("mouseover", function(d){
                 d3.select(this)
                 .attr("stroke-width", 2)
                 .attr("stroke", "black")
                 //.attr("fill", "blue");
                 //That.create_tooltip(d);
              })
              .on("mouseout", function(d){
               d3.select(this)
               .attr("stroke", "grey")
                 .attr("stroke-width", 1)
                 //.attr("fill", "black");
               //d3.select('div.tooltip-container').remove();
              });


      return this;
    },

    update_render : function(e){
      var trusts = _.uniq(this.collection.pluck("registry")),
          data   = [];

      Category = Categories[e.target.value];
      this.scales = this.create_scales(this.collection.models, SVG);
      this.line   = this.make_line_generator(Category, this.scales[0], this.scales[1]);
      this.update_axis(this.svg, this.scales, SVG);

      trusts.forEach(function(trust){
        data.push(this.collection.where({registry : trust}));
      }, this);

      this.lines = this.svg.select(".main_container").selectAll("path");
      this.lines.data(data).transition().duration(1500).ease("sin-in-out").attr("d", this.line);
    },

    render_svg : function(div, layout){
      var svg = d3.select(div).append("svg")
                .attr("width", layout.width)
                .attr("height", layout.height)
                .attr("class", "main_graph");

      svg.append('g').attr("class", "main_container");
      return svg;
    },

    render_axis : function(svg, scales, layout){
      var x_axis = d3.svg.axis().scale(scales[0]).orient("bottom"),
          y_axis = d3.svg.axis().scale(scales[1]).orient("left");

      
      svg.append("g")
         .attr("class", "x_axis")
         .attr("transform", "translate(0," + (layout.height - layout.margin.bottom)+")")
         .call(x_axis);
      svg.append("g")
         .attr("class", "y_axis")
         .attr("transform", "translate(" + layout.margin.left+", 0)")
         .call(y_axis);

      svg.selectAll("path.domain").style("fill", "none").style("stroke", "black");
      svg.selectAll("line").style("stroke", "black");
    },

    update_axis : function(svg, scales, layout){
      var x_axis = d3.svg.axis().scale(scales[0]).orient("bottom"),
          y_axis = d3.svg.axis().scale(scales[1]).orient("left");

      svg.select(".x_axis")
        .transition().duration(1500).ease("sin-in-out")
        .call(x_axis); 
      svg.select(".y_axis")
        .transition().duration(1500).ease("sin-in-out")
        .call(y_axis); 
    },

    render_dots : function(svg, data, xscale, yscale){
      svg.selectAll(".dot").data(data).enter()
         .append("circle")
           .attr("class", "dot")
           .attr("r", 3)
           .attr("cx", function(d){ return xscale(new Date(d.time)); })
           .attr("cy", function(d){ return yscale(d.users); })
           .attr("fill", "black")
           .on("mouseover", function(d){
             d3.select(this)
               .attr("stroke-width", 3)
               .attr("stroke", "black")
               .attr("fill", "blue");
             That.create_tooltip(d);
           })
           .on("mouseout", function(d){
             d3.select(this)
               .attr("stroke-width", 0)
               .attr("fill", "black");
             d3.select('div.tooltip-container').remove();
           })
    },


    //
    // C R E A T E   H E L P E R S
    // ------------------------------------------------------------------------------
    //
    create_scales : function(data, layout){
      var that     = this,
          x_extent = d3.extent(data, function(model){
            return model.get("year");
          }),
          y_extent = d3.extent(data, function(model){
            return that.money_accesor(model);
          }),
          x_scale = d3.scale.linear().domain(x_extent).range([layout.margin.left, layout.width - layout.margin.left - layout.margin.right]).nice(),
          y_scale = d3.scale.linear().domain(y_extent).range([layout.height - layout.margin.bottom, layout.margin.top ]).nice(12);

      return [x_scale, y_scale];
    },

    make_line_generator : function(field, xscale, yscale){
      var that = this,
          line = d3.svg.line()
                   .x(function(d){
                     return xscale(d.get("year"));
                   })
                   .y(function(d){
                     return yscale(that.money_accesor(d));
                   })
                   .interpolate("basis");
      return line;
    },

    money_accesor : function(model){
      var m = +model.get(Category);
      return m != NaN && m >= 0 ? m/SCALE : 0;
    }
  });
    

  //
  // R E T U R N   T H E   B A C K B O N E   " C O N T R O L L E R "
  // --------------------------------------------------------------------------------
  //
  return content;
});