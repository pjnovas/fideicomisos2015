// GRAPHS - fideicomisos
// @package  : fideicomisos
// @location : /js/apps/home/views
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
     Trusts      = TRUSTS_DATA.trusts,
     Categories  = ["availability", "expenses", "income", "yield"],
     Registries  = TRUSTS_DATA.registries,
     Category    = "availability",
     MAX         = d3.max(Trusts, function(trust){
                     return +trust[Category];
                   }),
     MAX_MONEY   = 0,
     Blues       = ["#08306b", "#08519c","#2171b5","#4292c6","#6baed6","#9ecae1",],
     Colors      = d3.scale.linear()
            .domain([300,200,100,50,10,0])
            .range(Blues),

  //
  // D E F I N E   T H E   D 3   V A R I A B L E S
  // --------------------------------------------------------------------------------
  //
    SVG = {
      width  : 900,
      height : 500,
      margin : {
        top    : 30,
        right  : 30,
        bottom : 30,
        left   : 80
      },
    },
    SCALE = 1000000,

  //
  // C A C H E   T H E   C O M M O N   E L E M E N T S
  // --------------------------------------------------------------------------------
  //
  Title      = document.getElementById("line-trust-name");
 

  //
  // I N I T I A L I Z E   T H E   B A C K B O N E   " V I E W "
  // --------------------------------------------------------------------------------
  //
  var content = Backbone.View.extend({
    
    //
    // [ DEFINE THE EVENTS ]
    //
    events :{
    },

    //
    // [ DEFINE THE ELEMENT ]
    //
    el : "body",

    //
    // [ DEFINE THE TEMPLATES ]
    //


    //
    // [ THE INITIALIZE FUNCTION ]
    //
    //
    initialize : function(){
      this.collection  = new Backbone.Collection(Trusts);
      this.definitions = new Backbone.Collection(Definitions);
      this.registries  = _.uniq(this.collection.pluck("registry"));
      this.titles      = new Backbone.Collection(Registries);
      this.colors      = Colors;

      this.svg    = null;
      this.scales = null;
      this.lines  = null;
      this.render();
    },

    //
    // R E N D E R   F U N C T I O N S
    // ------------------------------------------------------------------------------
    //
    
    // [ submit / ESC / call from controller ]
    //
    //
    render : function(){
      var that = this,
          div  = this.$(".g-container")[0],
          data = this.select_registries(),
          container;

      this.svg    = this.render_svg(div, SVG);
      this.scales = this.create_scales( _.flatten(data), SVG);
      this.line   = this.make_line_generator(Category, this.scales[0], this.scales[1]);

      this.render_axis(this.svg, this.scales, SVG);
      container = this.svg.select(".main_container");
      
      this.lines = container.selectAll("path");
      this.lines.data(data).enter().append("path").attr("d", this.line)
              .attr("fill", "none")
              .attr("stroke", "rgba(139,167,192,0.4)")
              .attr("stroke-width", 1)
              .attr("cursor", "pointer")
              .on("mouseover", function(d){
                 d3.select(this)
                 .attr("stroke-width", 3)
                 .attr("stroke", "#015383");
                 that.create_tooltips(d);
                 Title.innerHTML = that.titles.findWhere({registry : d[0].get("registry")}).get("designation");
              })
              .on("mouseout", function(d){
                d3.select(this)
                  .attr("stroke", "rgba(139,167,192,0.4)")
                  .attr("stroke-width", 1);
                that.svg.selectAll(".amount").remove();
                Title.innerHTML = "Mueve el mouse sobre una línea";
              });
      return this;
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
      var x_axis = d3.svg.axis().scale(scales[0]).orient("bottom").tickFormat(d3.format("")),
          y_axis = d3.svg.axis().scale(scales[1]).orient("left");

      
      svg.append("g")
         .attr("class", "x_axis")
         .attr("transform", "translate(0," + (layout.height - layout.margin.bottom)+")")
         .call(x_axis);
      svg.append("g")
         .attr("class", "y_axis")
         .attr("transform", "translate(" + layout.margin.left+", 0)")
         .call(y_axis);

      svg.selectAll("path.domain").style("fill", "none").style("stroke", "#ddd");
      svg.selectAll("line").style("stroke", "#999");
    },

    update_axis : function(svg, scales){
      var x_axis = d3.svg.axis().scale(scales[0]).orient("bottom").tickFormat(d3.format("")),
          y_axis = d3.svg.axis().scale(scales[1]).orient("left");

      svg.select(".x_axis")
        .transition().duration(1500).ease("sin-in-out")
        .call(x_axis); 
      svg.select(".y_axis")
        .transition().duration(1500).ease("sin-in-out")
        .call(y_axis); 
    },

    create_tooltips : function(data){
      var that   = this,
          format = d3.format("$,"),
          labels =this.svg.selectAll(".amount").data(data).enter()
        .append("g")
          .attr("class", "amount")
          .attr("transform", function(d){
            var x   = that.scales[0](d.get("year")),
                y   = that.scales[1](that.money_accesor(d)),
                res = "translate(" + x + ", " + y + ")";
            return res;
          });
          
          labels.append("rect")
            .attr("width", 5)
            .attr("height", 5)
            .attr("fill", "red");
          

          labels.append('text').text(function(d){
            return format(that.money_accesor(d).toFixed(2));
          });
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
                   .interpolate("monotone");
      return line;
    },

    money_accesor : function(model){
      var m = +model.get(Category);
      return m != NaN && m >= 0 ? m/SCALE : 0;
    },

    select_registries : function(){
      var data   = [],
          trusts = this.registries;
      trusts.forEach(function(trust){
        var models = this.collection.where({registry : trust}),
            max    = MAX_MONEY;
        if(!max || ! _.find(models, function(m){
            return max < this.money_accesor(m);
          }, this)){
          data.push(models);
        }
      }, this);
      return data;
    }
  });
    

  //
  // R E T U R N   T H E   B A C K B O N E   " C O N T R O L L E R "
  // --------------------------------------------------------------------------------
  //
  return content;
});