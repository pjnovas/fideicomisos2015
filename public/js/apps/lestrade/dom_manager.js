// Lestrade - fideicomisos
// @package  : fideicomisos
// @location : /js/apps/lestrade
// @file     : dom_manager.js
// @author  : Gobierno fácil <howdy@gobiernofacil.com>
// @url     : http://gobiernofacil.com

define(function(require){
  //
  // L O A D   T H E   A S S E T S   A N D   L I B R A R I E S
  // --------------------------------------------------------------------------------
  //
  var Backbone      = require('backbone'),
      d3            = require('d3'),
      Velocity      = require('velocity'),
      Container     = require('views/container_view'),
      D3_manager    = require('d3_manager'),
      d3_data_cache = null,
      svg_settings  = {
        top    : 20,
        right  : 30,
        bottom : 100,
        left   : 150,
        width  : 800,
        height : 800
      },

  //
  // C A C H E   T H E   C O M M O N   E L E M E N T S
  // --------------------------------------------------------------------------------
  //
      the_stuff         = document.getElementById('the-stuff'),
      the_svg_container = document.getElementById('the-basic-graphics');


  var dom_manager = {
    //
    // R E F E R E N C E S
    // ------------------------------------------------------------------------------
    //
    d3_manager : D3_manager,

    //
    // T E M P L A T E S
    // ------------------------------------------------------------------------------
    //

    //
    // R E N D E R   F U N C T I O N S
    // ------------------------------------------------------------------------------
    //

    //
    // [ RENDER CONTAINER ]
    //
    // Esta función agrega una categoría al contenedor de resultados.
    // El Modelo de Backbone que recibe contiene: 
    // - category : el identificador de la categoría
    // - title    : el nombre de la categoría
    // - trusts   : array(Backbone Models)
    //     - branch, branch_id, designation, fiduciary, initial_amount, 
    //       registry, scope, settlor, theme, type, unit, year
    render_container : function(model){
      var _container = new Container({model : model});
      $(the_stuff).append(_container.render().el);
    },

    //
    // [ RENDER D3 BARS ]
    //
    // Recibe los datos ya listos para graficar del controller.js,
    // y agrega el contenedor y las características gráficas.
    // Se supone que el d3_manager no contenga ningún tipo de configuración,
    // solo que reciba la información lista para usarse
    render_d3_bars : function(data, extent, distinct){
      d3_data_cache = data;
     console.log(data, extent, distinct.length);
      // this.d3_manager.bars(data);
    },

    //
    // R E N D E R   H E L P E R S
    // ------------------------------------------------------------------------------
    //
    render_svg : function(){

    },
   

    //
    // D I R E C T   I N T E R A C T I O N   ( H T M L )
    // ------------------------------------------------------------------------------
    //
  };

  return dom_manager;
});