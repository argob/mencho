//#####################################################################
//####################### PONCHO TABLE #################################
//#####################################################################
jQuery('#ponchoTable').addClass('state-loading');

function ponchoTable(opt) {
    var listado = [];
    var filteredTitle = [];
    var filteredTitleGsx = [];
    var filtro = [];
    var filtroColumna;
    var titulos = '';
    var th = [];
    var lista = '';
    var centeredContent = '';
    if (jQuery.fn.DataTable.isDataTable('#ponchoTable')) {
        jQuery('#ponchoTable').DataTable().destroy();
    }

    //UNIQUE
    function filtrarUnicos(array) {
        return array.filter(function(el, index, arr) {
            return index === arr.indexOf(el);
        });
    }

    function getSheetName(id) {
        jQuery.getJSON('https://sheets.googleapis.com/v4/spreadsheets/' + opt.idSpread + '/?alt=json&key=AIzaSyCq2wEEKL9-6RmX-TkW23qJsrmnFHFf5tY', function function_name(response) {
            var sheetName = response.sheets[id - 1].properties.title;
            var url = 'https://sheets.googleapis.com/v4/spreadsheets/' + opt.idSpread + '/values/' + sheetName + '?alt=json&key=AIzaSyCq2wEEKL9-6RmX-TkW23qJsrmnFHFf5tY';
            getSheetValues(url);
        });
    }

    if (opt.jsonUrl) {
        getSheetValues(opt.jsonUrl);
    } else {
        getSheetName(opt.hojaNumero);
    }

    function getSheetValues(url) {

        jQuery.getJSON(url,

            function(data) {
                listado = data['values'];

                //TITULOS
                jQuery.each(Object.keys(listado[0]), function(index, key) {
                    if (listado[0][key]) {
                        filteredTitle.push(listado[0][key]);
                        filteredTitleGsx.push(key);
                        titulos += '<th>' + listado[1][key] + '</th>';
                        th.push(listado[1][key]);
                    }
                });


                //Caption de la tabla
                jQuery("#ponchoTable caption").html(opt.tituloTabla);

                //Agregar titulos al thead de la tabla
                jQuery('#ponchoTable thead tr').empty();
                jQuery('#ponchoTable thead tr').append(titulos);

                //CONTENIDO FILAS
                jQuery.each(listado, function(row, value) {

                    if (row > 1) {
                        var concatenado = '';
                        var thisRow = '';
                        jQuery.each(filteredTitle, function(index, title) {

                            var tdEmpty = '';
                            var filas = listado[row][index];

                            //Detectar si es botón
                            if (filteredTitle[index].includes("btn-") && filas) {
                                var nameBtn = listado[0][index].replace('btn-', '').replace('-', ' ');
                                filas = '<a aria-label="' + nameBtn + '" class="btn btn-primary btn-sm margin-btn" target="_blank" href="' + filas + '">' + nameBtn + '</a>'
                            }

                            //Detectar si es filtro
                            if (filteredTitle[index].includes("filtro-") && filas) {
                                filtroColumna = index;
                                var nameFiltro = listado[1][index];
                                jQuery("#tituloFiltro").html(nameFiltro);
                                filtro.push(filas);
                            }

                            //Detectar si es fecha
                            if (filteredTitle[index].includes("fecha-") && filas) {
                                var dateSplit = filas.split("/");
                                var finalDate = new Date(dateSplit[2], dateSplit[1] - 1, dateSplit[0]),
                                filas = '<span style="display:none;">' + finalDate.toISOString().split('T')[0] + '</span>' + filas;
                            }

                            if (!filas) {
                                filas =  '';
                                //Ocultar filas vacias en mobile
                                tdEmpty = 'hidden-xs';
                            }

                            concatenado += filas;

                            //Aplicar markdown a todas las filas
                            var converter = new showdown.Converter();
                            filas = converter.makeHtml(filas);

                            thisRow += '<td class="' + tdEmpty + '" data-title="' + th[index] + '">' + filas + '</td>';


                        });
                        if (concatenado != '') {
                            lista += '<tr>';
                            lista += thisRow;
                            lista += '</tr>';
                        }
                    }
                });

                //Agregar filtro
                jQuery.each(filtrarUnicos(filtro), function(index, val) {
                    jQuery("#ponchoTableFiltro").append("<option>" + val + "</option>");
                });


                //Agregar contenido al body de la Tabla
                jQuery('#ponchoTable tbody').empty();
                jQuery('#ponchoTableSearchCont').show();
                jQuery('#ponchoTable tbody').append(lista);
                jQuery('#ponchoTable').removeClass('state-loading');

                initDataTable();
            }
        );
    }

    function initDataTable() {


        function removeAccents(data) {
            return data
                .replace(/έ/g, 'ε')
                .replace(/[ύϋΰ]/g, 'υ')
                .replace(/ό/g, 'ο')
                .replace(/ώ/g, 'ω')
                .replace(/ά/g, 'α')
                .replace(/[ίϊΐ]/g, 'ι')
                .replace(/ή/g, 'η')
                .replace(/\n/g, ' ')
                .replace(/[áÁ]/g, 'a')
                .replace(/[éÉ]/g, 'e')
                .replace(/[íÍ]/g, 'i')
                .replace(/[óÓ]/g, 'o')
                .replace(/[úÚ]/g, 'u')
                .replace(/ê/g, 'e')
                .replace(/î/g, 'i')
                .replace(/ô/g, 'o')
                .replace(/è/g, 'e')
                .replace(/ï/g, 'i')
                .replace(/ü/g, 'u')
                .replace(/ã/g, 'a')
                .replace(/õ/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/ì/g, 'i');
        }



        var searchType = jQuery.fn.DataTable.ext.type.search;
        searchType.string = function(data) {
            return !data ?
                '' :
                typeof data === 'string' ?
                removeAccents(data) :
                data;
        };

        searchType.html = function(data) {
            return !data ?
                '' :
                typeof data === 'string' ?
                removeAccents(data.replace(/<.*?>/g, '')) :
                data;
        };


        if (jQuery.isFunction(jQuery.fn.DataTable.ext.order.intl)) {
          jQuery.fn.DataTable.ext.order.intl('es');
          jQuery.fn.DataTable.ext.order.htmlIntl('es');
        }
      
        var tabla = jQuery("#ponchoTable").DataTable({
            "lengthChange": false,
            "autoWidth": false,
            "pageLength": opt.cantidadItems,
            "columnDefs": [
                { "type": "html-num", "targets": opt.tipoNumero },
                { "targets": opt.ocultarColumnas, "visible": false }
            ],
            "ordering": opt.orden,
            "order": [
                [opt.ordenColumna - 1, opt.ordenTipo]
            ],
            "dom": "<'row'<'col-sm-6'l><'col-sm-6'f>>" +
                "<'row'<'col-sm-12'i>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8'p>>",
            "language": {
                "sProcessing": "Procesando...",
                "sLengthMenu": "Mostrar _MENU_ registros",
                "sZeroRecords": "No se encontraron resultados",
                "sEmptyTable": "Ningún dato disponible en esta tabla",
                "sInfo": "_TOTAL_ resultados",
                "sInfoEmpty": "No hay resultados",
                //"sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sInfoFiltered": "",
                "sInfoPostFix": "",
                "sSearch": "Buscar:",
                "sUrl": "",
                "sInfoThousands": ".",
                "sLoadingRecords": "Cargando...",

                "oPaginate": {
                    "sFirst": "<<",
                    "sLast": ">>",
                    "sNext": ">",
                    "sPrevious": "<"
                },
                "oAria": {
                    "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
                    "sSortDescending": ": Activar para ordenar la columna de manera descendente",
                    "paginate": {
                        "first": 'Ir a la primera página',
                        "previous": 'Ir a la página anterior',
                        "next": 'Ir a la página siguiente',
                        "last": 'Ir a la última página'
                    }
                }
            }
        });


        jQuery(document).ready(function() {
            // Remove accented character from search input as well
            jQuery('#ponchoTableSearch').keyup(function() {
                tabla
                    .search(
                        jQuery.fn.DataTable.ext.type.search.string(this.value)
                    )
                    .draw();
            });
        });

        //BUSCADOR
        jQuery("#ponchoTable_filter").parent().parent().remove();

        //FILTRO PERSONALIZADO
        if (jQuery('#ponchoTableFiltro option').length > 1) {
            jQuery('#ponchoTableFiltroCont').show();
        }
        jQuery('#ponchoTableFiltro').on('change', function() {
            var filtro = jQuery.fn.DataTable.ext.type.search.string(jQuery(this).val());
            if (filtro != "") {
                tabla.column(filtroColumna).every(function() {
                    var that = this;
                    that
                    .search(filtro ? '^'+filtro+'$':'', true,false)
                  .draw();
                });
            } else {
                tabla.search('').columns().search('').draw();
            }

        });

    }
}


//#####################################################################
//####################### POPOVER #####################################
//#####################################################################

var content_popover = document.getElementById("content-popover");
function popshow(){
    content_popover.classList.toggle("hidden");
}
function pophidde(){
    content_popover.classList.add("hidden");
}


//#####################################################################
//####################### PONCHO UBICACION ############################
//#####################################################################

var ponchoUbicacion = function(options) {
  var urlProvincias = '/profiles/argentinagobar/themes/contrib/poncho/resources/jsons/geoprovincias.json';
  var urlLocalidades = '/profiles/argentinagobar/themes/contrib/poncho/resources/jsons/geolocalidades.json';
  var provincias;
  var localidades;
  var iProvincia = jQuery('input[name="submitted[' + options.provincia + ']"]');
  var iLocalidad = jQuery('input[name="submitted[' + options.localidad + ']"]');
  var sProvincia;
  var sLocalidades;

  function init() {
    urlProvincias = options.urlProvincias ? options.urlProvincias : urlProvincias;
    urlLocalidades = options.urlLocalidades ? options.urlLocalidades : urlLocalidades;

    jQuery.getJSON(urlProvincias, function(data) {
      provincias = parseJsonProvincias(data);
      sProvincia = getSelectProvincias(provincias);
      addProvEvent();
      iProvincia.after(sProvincia);
      jQuery(sProvincia).select2();
    });

    jQuery.getJSON(urlLocalidades, function(data) {
      localidades = parseJsonLocalidades(data);
      sLocalidades = getSelectLocalidades(localidades, sProvincia.val());
      addLocEvent();
      iLocalidad.after(sLocalidades);
      jQuery(sLocalidades).select2();
    });
    iProvincia.hide();
    iLocalidad.hide();
  }

  function parseJsonProvincias(data) {
    provincias = [];

    data.results.forEach(function(provincia, index) {
      provincias.push(provincia);
    });

    return provincias;
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function parseJsonLocalidades(data) {
    localidades = [];

    data.results.forEach(function(localidad, index) {
      localidades.push(localidad);
    });
    return localidades;
  }

  function addProvEvent() {
    sProvincia.on('change', function(e) {
      iProvincia.val('');
      iLocalidad.val('');
      sLocalidades.children('option:not(:first)').remove();
      if (sProvincia.val() != '') {
        iProvincia.val(sProvincia.find(":selected").text());
        var sAux = getSelectLocalidades(localidades, sProvincia.val());
        var sOpt = sAux.find('option');
        sLocalidades.append(sOpt);
        sLocalidades.val('');
      }
    });
  }

  function addLocEvent() {
    sLocalidades.on('change', function(e) {
      iLocalidad.val('');
      if (sLocalidades.val() != '') {
        iLocalidad.val(sLocalidades.find(":selected").text());
      }
    });
  }

  function getDropDownList(name, id, optionList, required = false,
    emptyOption = false, selected_item = false) {

    var combo = jQuery("<select></select>")
      .attr("id", id).attr("name", name)
      .addClass("form-control form-select")
      .prop('required', required);
    if (emptyOption) {
      combo.append("<option value=''>Seleccione una opción</option>");
    }

    jQuery.each(optionList, function(i, el) {
      let selected = '';
      if (selected_item == el.nombre) {
        selected = 'selected="selected"';
      }
      combo.append(
        "<option value='" + el.id + "' " + selected + ">" +
        el.nombre +
        "</option>"
      );
    });

    return combo;
  }

  function getSelectProvincias(provincias) {
    var provinciasOptions = [];

    provinciasOptions = provincias.sort(function(a, b) {
      var nameA = a.nombre.toUpperCase(); // ignore upper and lowercase
      var nameB = b.nombre.toUpperCase(); // ignore upper and lowercase
      return nameA.localeCompare(nameB);
    });
    var required = iProvincia.prop('required');
    var select = getDropDownList('sProvincias', 'sProvincias', provinciasOptions,
      required, true, iProvincia.val());
    return select;
  }

  function getSelectLocalidades(localidades, provincia) {
    var locaSelect = {};
    var required = iLocalidad.prop('required');
    var select = null;

    if (iProvincia.val()) {
      locaSelect = localidades
        .filter(function(localidad) {
          return String(localidad.provincia.id) == String(provincia);
        })
        .map(function(a) {
          if (a.departamento.nombre) {
            a.nombre = capitalizeFirstLetter(a.departamento.nombre.toLowerCase()) + ' - ' +
              capitalizeFirstLetter(a.nombre.toLowerCase());
          }
          return a;
        })
        .sort(function(a, b) {
          var nameA = a.nombre.toUpperCase(); // ignore upper and lowercase
          var nameB = b.nombre.toUpperCase(); // ignore upper and lowercase
          return nameA.localeCompare(nameB);
        });
      emptyOption = iLocalidad.val() ? true : false;

      select = getDropDownList('sLocalidades', 'sLocalidades',
        locaSelect, required, emptyOption, iLocalidad.val());
    } else {
      select = getDropDownList('sLocalidades', 'sLocalidades',
      [], required, true, false);
    }

    return select;
  }

  init();
};


//#####################################################################
//########################  PONCHO Chart  #############################
//#####################################################################
function ponchoChart(opt) {
  "use strict";

  if (chequeoOpcionesObligatorias(opt)) {
      if (opt.jsonInput) {
          console.log(opt.jsonInput);
          drawChart(jQuery.parseJSON(opt.jsonInput), opt);
      } else {
          var url = opt.jsonUrl ? opt.jsonUrl : 
              'https://sheets.googleapis.com/v4/spreadsheets/' + opt.idSpread + '/values/' + opt.hojaNombre + '?alt=json&key=AIzaSyCq2wEEKL9-6RmX-TkW23qJsrmnFHFf5tY';
          jQuery.getJSON(url, function(data) {
              drawChart(data, opt)
          });
      }

  } else {

      //informo por consola el faltante
      if (typeof opt.idSpread == 'undefined' || opt.idSpread == "") {
          console.log('Completar valor para la opción de Configuración idSpread');
      }

      if (typeof opt.hojaNombre == 'undefined' || opt.hojaNombre == "") {
          console.log('Completar valor para la opción de Configuración hojaNombre');
      }

      if (typeof opt.tipoGrafico == 'undefined' || opt.tipoGrafico == "") {
          console.log('Completar valor para la opción de Configuración tipoGrafico');
      }

      if (typeof opt.idComponenteGrafico == 'undefined' || opt.idComponenteGrafico == "") {
          console.log('Completar valor para la opción de Configuración idComponenteGrafico');
      }

      if (getTipoGrafico(opt.tipoGrafico) == "") {
          console.log('Ingrese un tipo de gafico válido');
      }
  }

  function getTipoGrafico(tipo) {
      var grafico = '';
      if (tipo == 'Line') grafico = 'line';
      if (tipo == 'Bar') grafico = 'bar';
      if (tipo == 'Pie') grafico = 'pie';
      if (tipo == 'Area') grafico = 'line';
      if (tipo == 'Horizontal Bar') grafico = 'horizontalBar';
      if (tipo == 'Stacked Bar') grafico = 'bar';
      if (tipo == 'Mixed') grafico = 'mixed';
      if (tipo == 'HeatMap') grafico = 'heatmap';

      return grafico;
  }

  function getColor(color) {
      var codigoColor = '';
      switch (color) {
          case 'celeste':
          case 'info':
              codigoColor = '#2897d4';
              break;
          case 'verde':
          case 'success':
              codigoColor = '#2e7d33';
              break;
          case 'rojo':
          case 'danger':
              codigoColor = '#c62828';
              break;
          case 'amarillo':
          case 'warning':
              codigoColor = '#f9a822';
              break;
          case 'azul':
          case 'primary':
              codigoColor = '#0072bb';
              break;
          case 'negro':
          case 'black':
              codigoColor = '#333';
              break;
          case 'uva':
              codigoColor = '#6a1b99';
              break;
          case 'gris':
          case 'muted':
              codigoColor = '#525252';
              break;
          case 'grisintermedio':
          case 'gris-area':
          case 'gray':
              codigoColor = '#f2f2f2';
              break;
          case 'celesteargentina':
          case 'celeste-argentina':
              codigoColor = '#37bbed';
              break;
          case 'fucsia':
              codigoColor = '#ec407a';
              break;
          case 'arandano':
              codigoColor = '#c2185b';
              break;
          case 'cielo':
              codigoColor = '#039be5';
              break;
          case 'verdin':
              codigoColor = '#6ea100';
              break;
          case 'lima':
              codigoColor = '#cddc39';
              break;
          case 'maiz':
          case 'maíz':
              codigoColor = '#ffce00';
              break;
          case 'tomate':
              codigoColor = '#ef5350';
              break;
          case 'naranjaoscuro':
          case 'naranja':
              codigoColor = '#EF6C00';
              break;
          case 'verdeazulado':
          case 'verde-azulado':
              codigoColor = '#008388';
              break;
          case 'escarapela':
              codigoColor = '#2cb9ee';
              break;
          case 'lavanda':
              codigoColor = '#9284be';
              break;
          case 'mandarina':
              codigoColor = '#f79525';
              break;
          case 'palta':
              codigoColor = '#50b7b2';
              break;
          case 'cereza':
              codigoColor = '#ed3d8f';
              break;
          case 'limon':
              codigoColor = '#d7df23';
              break;
          case 'verdejade':
          case 'verde-jade':
              codigoColor = '#066';
              break;
          case 'verdealoe':
          case "verde-aloe":
              codigoColor = '#4fbb73';
              break;
          case 'verdecemento':
          case 'verde-cemento':
              codigoColor = '#b4beba';
              break;
          default:
              console.log('No existe color ' + color);
      }

      return codigoColor;
  }

  function graficoTorta(etiquetas, datos, tipoGrafico, colores, idGrafico, posicionLeyendas, toltips, mostrarLeyendas) {
      const $grafica = document.getElementById(idGrafico);
      const dataset = {
          data: datos,
          borderColor: colores,
          backgroundColor: colores,
          borderWidth: 2,
      };
      new Chart($grafica, {
          type: tipoGrafico,
          data: {
              labels: etiquetas,
              datasets: [
                  dataset,
              ]
          },
          //options: options
          options: {
              legend: { display: mostrarLeyendas, position: posicionLeyendas },
              responsive: true,
              tooltips: toltips,
          }

      });
  }

  function graficoLineaSimple(etiquetas, datos, tipoGrafico, color, label, empiezaYenCero, idGrafico, posicionLeyendas, toltips, mostrarLeyendas) {
      const $grafica = document.getElementById(idGrafico);
      const dataset = {
          data: datos,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          lineTension: 0,
          fill: false,
          label: label,
      };
      new Chart($grafica, {
          type: tipoGrafico,
          data: {
              labels: etiquetas,
              datasets: [
                  dataset,
              ]
          },
          options: {
              legend: { display: mostrarLeyendas, position: posicionLeyendas },
              tooltips: toltips,
              responsive: true,
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: empiezaYenCero,
                      }
                  }]
              }
          }
      });
  }

  function graficoAreaBarraSimple(etiquetas, datos, tipoGrafico, color, label, empiezaYenCero, idGrafico, posicionLeyendas, toltips, mostrarLeyendas) {
      const $grafica = document.getElementById(idGrafico);
      const dataset = {
          data: datos,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          lineTension: 0,
          label: label,
      };
      new Chart($grafica, {
          type: tipoGrafico,
          data: {
              labels: etiquetas,
              datasets: [
                  dataset,
              ]
          },
          options: {
              legend: { display: mostrarLeyendas, position: posicionLeyendas },
              tooltips: toltips,
              responsive: true,
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: empiezaYenCero,
                      }
                  }]
              }
          }
      });
  }


  function graficoBarraHorizontalSimple(etiquetas, datos, tipoGrafico, color, label, empiezaYenCero, idGrafico, posicionLeyendas, toltips, mostrarLeyendas) {
      const $grafica = document.getElementById(idGrafico);
      const dataset = {
          data: datos,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          lineTension: 0,
          label: label,
      };
      new Chart($grafica, {
          type: tipoGrafico,
          data: {
              labels: etiquetas,
              datasets: [
                  dataset,
              ]
          },
          options: {
              legend: { display: mostrarLeyendas, position: posicionLeyendas },
              tooltips: toltips,
              responsive: true,
              scales: {
                  xAxes: [{
                      ticks: {
                          beginAtZero: empiezaYenCero,
                      }
                  }]
              }
          }
      });
  }

  function graficoComplejo(etiquetas, tipoGrafico, datos, idGrafico, empiezaYenCero, posicionLeyendas, toltips, mostrarLeyendas) {
      const $grafica = document.getElementById(idGrafico);
      new Chart($grafica, {
          type: tipoGrafico,
          data: {
              labels: etiquetas,
              datasets: datos
          },
          options: {
              legend: { display: mostrarLeyendas, position: posicionLeyendas, labels: { textAlign: 'center' } },
              tooltips: toltips,
              responsive: true,
              maintainAspectRatio: true,
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: empiezaYenCero,
                      }
                  }],
              },
          }
      });
  }

  function graficoComplejoHorizontal(etiquetas, tipoGrafico, datos, idGrafico, empiezaYenCero, posicionLeyendas, toltips, mostrarLeyendas) {
      const $grafica = document.getElementById(idGrafico);
      new Chart($grafica, {
          type: tipoGrafico,
          data: {
              labels: etiquetas,
              datasets: datos
          },
          options: {
              legend: { display: mostrarLeyendas, position: posicionLeyendas, labels: { textAlign: 'center' } },
              tooltips: toltips,
              responsive: true,
              maintainAspectRatio: true,
              scales: {
                  xAxes: [{
                      ticks: {
                          beginAtZero: empiezaYenCero,
                      }
                  }],
              },
          }
      });
  }


  function graficoComplejoStacked(etiquetas, tipoGrafico, datos, idGrafico, empiezaYenCero, posicionLeyendas, toltips, mostrarLeyendas) { //Stacked Bar
      const $grafica = document.getElementById(idGrafico);
      new Chart($grafica, {
          type: tipoGrafico,
          data: {
              labels: etiquetas,
              datasets: datos
          },
          options: {
              legend: { display: mostrarLeyendas, position: posicionLeyendas, labels: { textAlign: 'center' } },
              tooltips: toltips,
              responsive: true,
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: empiezaYenCero,
                      },
                      stacked: true,
                  }],
                  xAxes: [{ stacked: true }],
              },
          }
      });
  }

  function graficoComplejoMixed(etiquetas, tipoGrafico, datos, idGrafico, empiezaYenCero, posicionLeyendas, indice, label1, label2, mostrarLeyendas) {
      const $grafica = document.getElementById(idGrafico);
      new Chart($grafica, {
          type: tipoGrafico,
          data: {
              labels: etiquetas,
              datasets: datos
          },
          options: { 
            legend: { display: mostrarLeyendas, position: posicionLeyendas, labels: {textAlign: 'center'} },
            tooltips: {
              enabled: true,
              mode: 'single',
              callbacks: {
                 label: function(tooltipItems, data) {
                  var text = '';
                  if (indice == 2) text = '%';
                  else if (tooltipItems.datasetIndex == indice) text = '%'; 
                  var value = numeroFormateado(tooltipItems.yLabel);
                  return data.datasets[tooltipItems.datasetIndex].label + ': ' + value + ' ' + text;
                }
              }
            },
            responsive: true,
            scales: {
              yAxes: [
                {
                  id: 'left-y-axis',
                  type: 'linear',
                  position: 'left',
                  ticks: {
                      beginAtZero: empiezaYenCero,
                      callback: function(value) {
                        var text = '';
                        if (indice == 1 || indice == 2) text = '%'; 
                        return value + text;
                      }
                  },
                   scaleLabel: {
                      display: true,
                      labelString: label2,
                      fontColor: "black"
                    }
                }, {
                  id: 'right-y-axis',
                  type: 'linear',
                  position: 'right',
                  ticks: {
                      beginAtZero: empiezaYenCero,
                      callback: function(value) {
                        var text = '';
                        if (indice == 0 || indice == 2) text = '%';
                        return value + text;
                      }
                  },
                     scaleLabel: {
                      display: true,
                      labelString: label1,
                      fontColor: "black"
                    }
                }
              ],
            },
         }
      });
  }

  function graficoHeatMap(etiquetas, datos, idGrafico, labelsY, rango, labelX, labelY, labelValor, titulo, mostrarYaxis, posicionLeyendas, mostrarLeyendas) {

      const $grafica = document.getElementById(idGrafico);

      var options = {
          series: datos,
          chart: {
            height: 650,
            type: 'heatmap',
          },
          dataLabels: {
            enabled: false
          },
          title: {
            text: titulo
          },
          tooltip: {
             custom: function({series, seriesIndex, dataPointIndex, w}) {
              var value = series[seriesIndex][dataPointIndex];
              value = numeroFormateado(value);
              return '<div class="arrow_box">' +
                '<span>' + labelX + ": " + labelsY[seriesIndex] + '<br>' +
                labelY + ": " + w.globals.labels[dataPointIndex] + '<br>' +
                labelValor + ": " + value + '</span>' +
                '</div>'
            }
          },
          plotOptions: {
            heatmap: {
              shadeIntensity: 0.5,
              radius: 0,
              useFillColorAsStroke: false,
              colorScale: {
                ranges: rango
              }
            }
          },
          yaxis: {
              show: mostrarYaxis,
          },
          legend: {
            show: mostrarLeyendas,
            position: posicionLeyendas,
          },
          responsive: [{
              breakpoint: 1000,
              options: {
                  yaxis: {
                      show: false,
                  },
                  legend: {
                      show: mostrarLeyendas,
                      position: "top",
                  },
              },
          }]
      };

      var chart = new ApexCharts($grafica, options);
      chart.render(); 

      const collection = document.getElementsByClassName("apexcharts-toolbar");
      for (let i = 0; i < collection.length; i++) {
        collection[i].style.display = "none";
      } 

  }

  function graficaTitulo(idTag, titulo) {
      if (document.getElementById(idTag)) {
          document.getElementById(idTag).innerHTML = titulo;
      }
  }

  function chequeoOpcionesObligatorias(opt) {
      var chequeo = false;
      if ( ((opt.idSpread  && opt.hojaNombre) || opt.jsonUrl || opt.jsonInput) && (typeof opt.tipoGrafico != 'undefined' && opt.tipoGrafico != "") && (typeof opt.idComponenteGrafico != 'undefined' && opt.idComponenteGrafico != "") && (getTipoGrafico(opt.tipoGrafico) != ""))
          chequeo = true;
      return chequeo;
  }

  function numeroFormateado(numero) {
      var value = numero.toString().replace('.',',');
      var array = value.split(",");
      //var result1 = new Intl.NumberFormat('es').format(array[0]);
      var result1 = new Intl.NumberFormat('es-AR', {maximumFractionDigits:2 }).format(array[0]);
      if (array.length > 1) 
          value = result1.concat(",",array[1].substr(0,2));
      else 
          value = result1;

      return value;
  }

  function drawChart(data, opt) {

      var etiquetas = [];
      var filteredTitleName = [];
      var filteredTitlePos = [];
      var color = '';
      var colores = [];
      var codigosColores = [];
      var columnas = [];
      var valores = [];
      var datos = [];
      var cantDatos = 0;
      var urlOrigen = "";
      var toltips = "";
      var tipoGraficosMixed = [];
      var indicePorcentajeMixed = 0;
      var porcentajesMixed = [];
      var labelsYCortos = [];
      var indiceNombreCorto = 0;
      var posicionLeyendas = opt.posicionLeyendas ? opt.posicionLeyendas : 'top';

      var mostrarLeyendas = '';
      if (typeof opt.mostrarLeyendas == 'undefined'){
          mostrarLeyendas = true;
      } else {
          mostrarLeyendas = opt.mostrarLeyendas;
      }

      var mostrarTotal = '';
      if (typeof opt.mostrarTotalStacked == 'undefined'){
          mostrarTotal = true;
      } else {
          mostrarTotal = opt.mostrarTotalStacked;
      }

      var tipoGrafico = getTipoGrafico(opt.tipoGrafico);

      var listado = data['values'];

      //TITULOS
      jQuery.each(Object.keys(listado[0]), function(index, key) {
          if (listado[0][index].substr(0, 5) == 'eje-y') {
              var split = listado[0][index].split('-');
              var pos = split[0] + split[1];
              filteredTitleName.push(pos);
              filteredTitlePos.push(index);
          } else if (listado[0][index] == 'nombre-corto'){
              if (tipoGrafico == 'heatmap'){
                  indiceNombreCorto = index;
              }
          }
      });

      jQuery.each(listado, function(row, value) {
          if (row == 0) { //construyo arrays para los dataset, recupero colores y labels
              jQuery.each(filteredTitlePos, function(index, title) {
                  var split = listado[row][filteredTitlePos[index]].split('-');
                  var pos = split[0] + split[1];
                  valores[pos] = []; //construyo los array para los dataset
                  colores.push(split[2]); //recupero colores
                  if (tipoGrafico == 'mixed') {
                      if (split.length > 3){ //ingresaron un tipo de grafico
                        //verifico que sea un tipo de grafico valido
                        if (split[3] == 'barra' || split[3] == 'linea') {
                          tipoGraficosMixed.push(split[3]);//recupero tipo de grafico para cada dataset   
                        } else { //seteo graficos por defecto
                           if (index == 0) tipoGraficosMixed.push('barra');//por defecto seteo barra
                           if (index == 1) tipoGraficosMixed.push('linea');//por defecto seteo linea
                        }
                      } else { //seteo graficos por defecto
                        if (index == 0) tipoGraficosMixed.push('barra');//por defecto seteo barra
                        if (index == 1) tipoGraficosMixed.push('linea');//por defecto seteo linea
                      }
                  }
              });
          }

          if (row == 1) {
              jQuery.each(filteredTitlePos, function(index, title) {
                  if (tipoGrafico != 'pie') {
                      if (tipoGrafico == 'heatmap') {
                          etiquetas.push(listado[row][filteredTitlePos[index]]); //recupero etiquetas (eje x)
                      } else {
                          columnas.push(listado[row][filteredTitlePos[index]]); //recupero columnas para label
                          cantDatos = cantDatos + 1;
                      }
                  } else {
                      etiquetas.push(listado[row][filteredTitlePos[index]]); //recupero las etiquetas de la torta
                  }
              });
          }

          if (row > 1) { //recupero los datos para los dataset y los colores para torta
              var label = false;
              jQuery.each(filteredTitlePos, function(index, title) {
                  //Detectar si es etiqueta x
                  var split = listado[0][filteredTitlePos[index]].split('-');
                  var pos = split[0] + split[1];
                  if (tipoGrafico == 'pie') { //recupero datos para la torta
                      valores[pos].push(listado[row][filteredTitlePos[index]]);
                  } else {
                      if (tipoGrafico == 'heatmap') {
                          if (label == false) {
                              columnas.push(listado[row][0]); //recupero las columnas (eje y)
                              label = true;
                              cantDatos = cantDatos + 1;
                          }
                          if (index != indiceNombreCorto) valores[pos].push(listado[row][filteredTitlePos[index]]); //recupero datos
                          if (index + 2 == indiceNombreCorto) {
                              if (typeof listado[row][index + 2] == 'undefined') labelsYCortos.push("*"); //en caso que no completen nombre-corto
                              else labelsYCortos.push(listado[row][index + 2]); //recupero labels Y cortos
                          }
                      } else {
                          if (label == false) {
                              etiquetas.push(listado[row][0]); //recupero las etiquetas
                              label = true;
                          }
                          valores[pos].push(listado[row][filteredTitlePos[index]]); //recupero datos
                      }
                  }
              });
          }
      });

      if (tipoGrafico == 'pie') {
          var datosTorta = [];

          jQuery.each(Object.keys(filteredTitleName), function(index, key) {
              var pos = filteredTitleName[index];

              if (valores.hasOwnProperty(pos)) {
                  datosTorta.push(valores[pos]);
              }
          });
          datos = datosTorta;

      } else if (cantDatos == 1) { //es un solo juego de datos

          jQuery.each(Object.keys(filteredTitleName), function(index, key) {
              var pos = filteredTitleName[index];

              if (valores.hasOwnProperty(pos)) {
                  datos = valores[pos];
              }
          });
      }

      if (tipoGrafico == 'mixed') {
          var cadena = opt.porcentajesMixed ? opt.porcentajesMixed : '';
          if (cadena.length > 0) {
              porcentajesMixed = cadena.split(',');
          }
      }

      //seteo toltips para mostrar porcentaje o no
      if (opt.porcentajes == true) {
    
          if (tipoGrafico == 'line' && cantDatos > 1){
              //seteo tooltips
              toltips = {
                  enabled: true,
                  callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          value = numeroFormateado(value);
                          return data.datasets[tooltipItem.datasetIndex].label + ': ' + value + '%';
                      }
                  },
                  mode: 'index',
                  intersect: false,
              };
          } else if  (tipoGrafico == 'pie'){
              //seteo tooltips
              toltips = {
                  enabled: true,
                  callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          value = numeroFormateado(value);
                          return data["labels"][tooltipItem.index] + ': ' +  value + '%';
                      }
                  }
              };

          } else if  (opt.tipoGrafico == 'Stacked Bar'){
              //seteo tooltips
              if (mostrarTotal == true) {
                  toltips = {
                      enabled: true,
                      mode: 'index',
                      callbacks: {
                          label: function(tooltipItem, data) {
                              var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                              value = numeroFormateado(value);
                              return data.datasets[tooltipItem.datasetIndex].label + ': ' +  value + '%';
                          },
                          footer: (tooltipItems, data) => {
                            let total = tooltipItems.reduce((a, e) => a + parseFloat(e.yLabel), 0);
                            return 'Total: ' + new Intl.NumberFormat('es-AR', {maximumFractionDigits:2 }).format(total) + '%';
                          }
                      }
                  };
              } else {
                  toltips = {
                      enabled: true,
                      mode: 'index',
                      callbacks: {
                          label: function(tooltipItem, data) {
                              var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                              value = numeroFormateado(value);
                              return data.datasets[tooltipItem.datasetIndex].label + ': ' +  value + '%';
                          }
                      }
                  };
              }
          } else {
              //seteo tooltips
              toltips = {
                  enabled: true,
                  mode: 'index',
                  callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          value = numeroFormateado(value);
                          return data.datasets[tooltipItem.datasetIndex].label + ': ' +  value + '%';
                      }
                  }
              };
          }

      } else {

           if (tipoGrafico == 'line' && cantDatos > 1){
              //seteo tooltips
              toltips = {
                  enabled: true,
                  callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          value = numeroFormateado(value);
                          return data.datasets[tooltipItem.datasetIndex].label + ': ' + value;
                      }
                  },
                  mode: 'index',
                  intersect: false,
              };
           } else if  (tipoGrafico == 'pie'){
              //seteo tooltips
              toltips = {
                  enabled: true,
                  callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          value = numeroFormateado(value);
                          return data["labels"][tooltipItem.index] + ': ' +  value;
                      }
                  }
              };

          } else if (opt.tipoGrafico == 'Stacked Bar' && cantDatos > 1){
              //seteo tooltips
              if (mostrarTotal == true) {
                  toltips = {
                      enabled: true,
                      mode: 'index',
                      intersect: false,
                        callbacks: {
                          label: function(tooltipItem, data) {
                              var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                              value = numeroFormateado(value);
                              return data.datasets[tooltipItem.datasetIndex].label + ': ' + value;
                          },
                          footer: (tooltipItems, data) => {
                            let total = tooltipItems.reduce((a, e) => a + parseFloat(e.yLabel), 0);
                            return 'Total: ' + new Intl.NumberFormat('es-AR', {maximumFractionDigits:2 }).format(total);
                          }
                        }
                  };
              } else {
                  toltips = {
                  enabled: true,
                  mode: 'index',
                  intersect: false,
                    callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          value = numeroFormateado(value);
                          return data.datasets[tooltipItem.datasetIndex].label + ': ' + value;
                      }
                    }
                  };
              }
           } else {
              //seteo tooltips
              toltips = {
                  enabled: true,
                  mode: 'index',
                  callbacks: {
                      label: function(tooltipItem, data) {
                          var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                          value = numeroFormateado(value);
                          return data.datasets[tooltipItem.datasetIndex].label + ': ' +  value;
                      }
                  }
              };
           }
      }

      //llamo a los constructores para cada tipo de grafico
      if (tipoGrafico == 'pie') {

          colores.forEach(function(valor, indice, array) {
              codigosColores.push(getColor(valor));
          });

          console.log('etiquetas --> ' + etiquetas);
          console.log('datos --> ' + datos);
          console.log('colores --> ' + codigosColores);

          graficoTorta(etiquetas, datos, tipoGrafico, codigosColores, opt.idComponenteGrafico, posicionLeyendas, toltips, mostrarLeyendas);
      }

      if (cantDatos == 1) {

          console.log('etiquetas --> ' + etiquetas);
          console.log('datos --> ' + datos);

          color = getColor(colores[0]);
          console.log('color --> ' + color);

          if (opt.tipoGrafico == 'Line') {
              graficoLineaSimple(etiquetas, datos, tipoGrafico, color, columnas[0], opt.ejeYenCero, opt.idComponenteGrafico, posicionLeyendas, toltips, mostrarLeyendas);
          }

          if (tipoGrafico == 'bar' || opt.tipoGrafico == 'Area') {
              graficoAreaBarraSimple(etiquetas, datos, tipoGrafico, color, columnas[0], opt.ejeYenCero, opt.idComponenteGrafico, posicionLeyendas, toltips, mostrarLeyendas);
          }

          if (tipoGrafico == 'horizontalBar') {
              graficoBarraHorizontalSimple(etiquetas, datos, tipoGrafico, color, columnas[0], opt.ejeYenCero, opt.idComponenteGrafico, posicionLeyendas, toltips, mostrarLeyendas);
          }

      }

      if (cantDatos > 1) {

          if (tipoGrafico == 'heatmap') {

             if ((typeof opt.heatMapColors != 'undefined' && opt.heatMapColors != "") && (typeof opt.heatMapColorsRange != 'undefined' && opt.heatMapColorsRange != "")){

                  var datosFull = [];

                  var labelX = 'labelFila';
                  var labelY = 'labelColumna';
                  var labelValor = 'labelValor';

                  if ((typeof opt.datosTooltip != 'undefined') && (opt.datosTooltip.length > 0)){
                      if ((typeof opt.datosTooltip[0] != 'undefined') && (typeof opt.datosTooltip[0].labelFila != 'undefined')) labelX = opt.datosTooltip[0].labelFila;
                      if ((typeof opt.datosTooltip[1] != 'undefined') && (typeof opt.datosTooltip[1].labelColumna != 'undefined')) labelY = opt.datosTooltip[1].labelColumna;
                      if ((typeof opt.datosTooltip[2] != 'undefined') && (typeof opt.datosTooltip[2].labelValor != 'undefined')) labelValor = opt.datosTooltip[2].labelValor;
                  }                        

                  //getDatos
                  jQuery.each(Object.keys(filteredTitleName), function(index, key) {

                      var pos = filteredTitleName[index];

                      if (valores.hasOwnProperty(pos)) {

                          datos = valores[pos];

                          datosFull.push(datos);
                      };
                  });

                  var series = [];

                  for (var i=0;i<columnas.length;i++) {

                      var data = [];

                      for (var l=0;l<etiquetas.length;l++) {
                      
                          var datos = {
                              x: etiquetas[l],
                              y: parseInt(datosFull[l][i])
                          };

                          data.push(datos);
                      } 

                      var serie = {
                          name: labelsYCortos[i] != '*' ? labelsYCortos[i] : columnas[i],
                          data: data
                      } 

                      series.push(serie);
                  }   

                  var rango = [];

                  //construyo range object
                  for (var i=0; i<opt.heatMapColorsRange.length -1; i++){
                        var data = {
                          from: opt.heatMapColorsRange[i],
                          to: opt.heatMapColorsRange[i + 1],
                          color: getColor(opt.heatMapColors[i])
                        };
                     rango.push(data);
                  }

                  var mostrarYaxis = '';
                  if (typeof opt.mostrarEjeY == 'undefined'){
                      mostrarYaxis = true;
                  } else {
                      mostrarYaxis = opt.mostrarEjeY;
                  }

                 graficoHeatMap(etiquetas, series, opt.idComponenteGrafico, columnas, rango, labelX, labelY, labelValor, opt.tituloGrafico, mostrarYaxis, posicionLeyendas, mostrarLeyendas);

              } else {
                  //informo por consola el faltante
                  if (typeof opt.heatMapColors == 'undefined' || opt.heatMapColors == "") {
                      console.log('Completar vector con valores para los colores');
                  }

                  if (typeof opt.heatMapColorsRange == 'undefined' || opt.heatMapColorsRange == "") {
                      console.log('Completar vector con el rango de valores para los colores');
                  }
              }
          } else {

              var datasets = [];
              var indiceColor = 0;

              //getColores
              colores.forEach(function(valor, indice, array) {
                  codigosColores.push(getColor(valor));
              });

              console.log('colores --> ' + codigosColores);

              var indiceMixed = 0;

              //getDatos
              jQuery.each(Object.keys(filteredTitleName), function(index, key) {
                  var pos = filteredTitleName[index];
                  if (valores.hasOwnProperty(pos)) {

                      datos = valores[pos];

                      console.log('datos --> ' + datos);

                      if (opt.tipoGrafico == 'Line') {
                          //construyo datasets
                          var dataset = {
                              label: columnas[indiceColor],
                              data: datos,
                              borderColor: codigosColores[indiceColor],
                              fill: false,
                              borderWidth: 2,
                              lineTension: 0,
                              backgroundColor: codigosColores[indiceColor], 
                          };
                      } else if (opt.tipoGrafico == 'Bar' || opt.tipoGrafico == 'Area' || opt.tipoGrafico == 'Horizontal Bar' || opt.tipoGrafico == 'Stacked Bar') {
                          //construyo datasets
                          var dataset = {
                              label: columnas[indiceColor],
                              data: datos,
                              borderColor: codigosColores[indiceColor],
                              backgroundColor: codigosColores[indiceColor], //BARRAS y AREA
                              borderWidth: 2,
                              lineTension: 0, //linea  y area
                          };
                      } else if (opt.tipoGrafico == 'Mixed'){ 
                          var tipo = tipoGraficosMixed[indiceMixed];
                          //construyo datasets
                          if (tipo == 'barra') {
                            var dataset = {
                              label: columnas[indiceColor],
                              data: datos, 
                              backgroundColor: codigosColores[indiceColor],
                              // This binds the dataset to the left y axis
                              yAxisID: 'left-y-axis',
                              type: 'bar',
                            };
                          } else if (tipo == 'linea'){
                              var dataset = {
                                label: columnas[indiceColor],
                                data: datos, 
                                borderColor: codigosColores[indiceColor],
                                backgroundColor: codigosColores[indiceColor],
                                // Changes this dataset to become a line
                                type: 'line',
                                // This binds the dataset to the right y axis
                                yAxisID: 'right-y-axis',
                                fill: false,
                              };
                          }
                      }


                      datasets.push(dataset);

                      indiceColor = indiceColor + 1;

                      indiceMixed = indiceMixed + 1;

                  }
              });

              if (tipoGrafico == 'mixed') { 
                  if (porcentajesMixed.length == 2) {
                      indicePorcentajeMixed = 2; //los 2 dataset usan porcentaje
                  } else if (porcentajesMixed.length == 1){
                      if (porcentajesMixed[0] == 'eje-y1') {
                          indicePorcentajeMixed = 0; //solo el primer dataset usa porcentaje
                      } else if (porcentajesMixed[0] == 'eje-y2') {
                          indicePorcentajeMixed = 1; //solo el segundo dataset usa porcentaje
                      }
                  } else  indicePorcentajeMixed = 3; //ningun dataset usa escala de porcentaje
              }
              
              console.log('etiquetas --> ' + etiquetas);

              console.log('toltip -->' + JSON.stringify(toltips));

              if (opt.tipoGrafico == 'Stacked Bar') graficoComplejoStacked(etiquetas, tipoGrafico, datasets, opt.idComponenteGrafico, opt.ejeYenCero, posicionLeyendas, toltips, mostrarLeyendas);
              else if (opt.tipoGrafico == 'Mixed') graficoComplejoMixed(etiquetas, 'bar', datasets, opt.idComponenteGrafico, opt.ejeYenCero, posicionLeyendas, indicePorcentajeMixed, columnas[0], columnas[1], mostrarLeyendas);
              else if (opt.tipoGrafico == 'Horizontal Bar') graficoComplejoHorizontal(etiquetas, tipoGrafico, datasets, opt.idComponenteGrafico, opt.ejeYenCero, posicionLeyendas, toltips, mostrarLeyendas);
               else graficoComplejo(etiquetas, tipoGrafico, datasets, opt.idComponenteGrafico, opt.ejeYenCero, posicionLeyendas, toltips, mostrarLeyendas);
          }

      }

      //verifica si viene titulo del grafico, si no viene no dibuja nada
      if (opt.tituloGrafico != "" && typeof opt.tituloGrafico != 'undefined') {
          graficaTitulo(opt.idTagTituloGrafico, opt.tituloGrafico);
      }
  }
}


/**
 * GAPI LEGACY
 * Retorna la estructura de la versión 3 de la API GoogleSheets.
 * 
 * @author Agustín Bouillet bouilleta@jefatura.gob.ar, 2021.
 * @summary La estructura del objeto que retorna es de este modo:
 *  .
 *  \--feed
 *      \-- entry
 *          |-- gsx$[nombre columna]
 *          |   \-- $t
 *          |-- gsx$[nombre columna]
 *          |   \-- $t
 * 
 * @param  {object} response Response JSON.
 * @return {void}
 */
 const gapi_legacy = (response) => {

  const keys = response.values[0];
  const regex = / |\/|_/ig;
  let entry = [];

  response.values.forEach((v, k) => {
    if(k > 0){
        let zip = {};
        for(const i in keys){
            const d = (v.hasOwnProperty(i))? v[i].trim() : "";
            zip[`gsx$${keys[i].toLowerCase().replace(regex, "")}`] = {"$t": d};
        }
        entry.push(zip);
    }
  });

  return {"feed": {"entry": entry}};
};

/**
 * PONCHO MAP
 * 
 * @summary Generador de mapas utilizando OpenStreetMap / leafleft
 * 
 * @author Agustín Bouillet bouilleta@jefatura.gob.ar, august 2022
 * @requires leaflet.js,leaflet.markercluster.js,leaflet.css,
 * MarkerCluster.Default.css,MarkerCluster.css
 * @see https://github.com/argob/poncho/blob/master/src/demo/poncho-maps/readme-poncho-maps.md
 * 
 * 
 * MIT License
 *
 * Copyright (c) 2022 Argentina.gob.ar
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
class PonchoMap {
  constructor(data, options){
    this.data = data;
    // Confs
    const defaults = {
        "template": false,
        "template_structure": {},
        "template_container_class_list":["info-container"],
        "template_title_class_list":["h4","title","m-t-0"],
        "template_dl_class_list":["definition-list"],
        "template_innerhtml": false,
        "template_header": false,
        "scope": "",
        "slider": false,
        "scroll": false,
        "hash": false,
        "headers": {},
        "map_selector": "map",
        "anchor_delay":0,
        "slider_selector": ".slider",
        "map_view": [-40.44, -63.59],
        "map_anchor_zoom":16,
        "map_zoom":4,
        "id": "id",
        "reset_zoom":true,
        "latitud":"latitud",
        "longitud":"longitud",
        "marker": "cielo",
        "marker_cluster_options": {
            "spiderfyOnMaxZoom": false,
            "showCoverageOnHover": false,
            "zoomToBoundsOnClick": true,
            "maxClusterRadius": 45,
            "spiderfyDistanceMultiplier": 0.1,
            "spiderLegPolylineOptions": {
                "weight": 1,
                "color": "#666",
                "opacity": 0.5,
            }
        }
    };
    let opts = Object.assign({}, defaults, options);
    this.scope = opts.scope;
    this.template = opts.template;
    this.template_structure = opts.template_structure;
    this.template_title_class_list = opts.template_title_class_list;
    this.template_dl_class_list = opts.template_dl_class_list;
    this.template_container_class_list = opts.template_container_class_list;
    this.template_innerhtml = opts.template_innerhtml;
    this.template_header = opts.template_header;
    this.map_selector = opts.map_selector;
    this.headers = opts.headers;
    this.hash = opts.hash;
    this.scroll = opts.scroll;
    this.map_view = opts.map_view;
    this.anchor_delay = opts.anchor_delay;
    this.map_zoom = opts.map_zoom;
    this.map_anchor_zoom = opts.map_anchor_zoom;
    this.marker_cluster_options = opts.marker_cluster_options;
    this.marker_color = opts.marker;
    this.id = opts.id;
    this.latitud = opts.latitud;
    this.longitud = opts.longitud;
    this.slider = opts.slider;
    this.reset_zoom = opts.reset_zoom;
    this.slider_selector=this.selectorName(opts.slider_selector);
    this.selected_marker;
    this.scope_selector = `[data-scope="${this.scope}"]`;
    this.scope_sufix = `--${this.scope}`;

    // OSM
    this.map = new L.map(this.map_selector,{preferCanvas: false})
        .setView(this.map_view, this.map_zoom);
    new L.tileLayer(
        "https://gis.argentina.gob.ar/osm/{z}/{x}/{y}.png", 
        { 
          attribution: ("&copy; Contribuidores "
              + "<a href=\"https://www.openstreetmap.org/copyright\">" 
              + "OpenStreetMap</a>")
        }
    ).addTo(this.map);
    this.markers = new L.markerClusterGroup(this.marker_cluster_options);
  }

  /**
  * JSON input
  * @return {object}
  */
  get entries(){
    return this.data;
  }

  /**
   * Agrega el hash en la barra de url.
   * @param {string|integer} value 
   */
  addHash = (value) => {
      window.location.hash = `#${value}`;
  }

  /**
  * Obtiene una entrada por su id
  * @property {integer} id - Id de Punto Digital
  * @return {object}
  */
  entry = (id) => {
      return this.entries.find(v => v[this.id]==id);
  }

  /**
   * Busca un término en un listado de entradas.
   * @param {string} term - término a buscar.
   * @returns {object} - listado filtrado por los match
   */
  searchEntry = (term, dataset) => {
      dataset = (typeof dataset === "undefined" ? this.entries: dataset);
      if(!term){
          return dataset;
      }
      const entries = dataset.filter(e => {
        if(this.searchTerm(term, e)){
            return e;
        };
      })
      return entries;
  };

  /**
   * Busca un término en cada uno de los indices de una entrada.
   */
  searchTerm = (search_term, data) => {
      // [text] es solo por si se usa select2
      const search_for = [...["text"], ...this.search_fields].filter(e => e);
      for(const item of search_for){
        if(!data.hasOwnProperty(item)){
            continue;
        }
        const term = this.removeAccents(search_term).toUpperCase();
        const field = this.removeAccents(data[item]).toString().toUpperCase();
        try {
            if(field.includes(term)){
                return data;
            }
        } catch (error) {
            console.error(error);
        }
      }
      return null;
  };

  /**
   * Quita la definición a un selector.
   * 
   * @param {string} selector - Selector a quitarle la definición.
   * @return {string}
   * 
   * >>> selectorName(".foo")
   * "foo"
   * >>> selectorName("#foo")
   * "foo"
   */
  selectorName = (selector) => {
    return selector.replace(/^(\.|\#)/, "");
  };

  /**
   * Acomoda la pantalla ubicando el mapa en el borde superior del
   * navegador.
   */
  scrollCenter = () => {
    const pos = document.getElementById(this.map_selector);
    const rect = pos.getBoundingClientRect();
    const pos_center_horizontal = (pos.offsetLeft + pos.offsetWidth) / 2;
    const pos_center_vertical =  rect.top + window.scrollY;
    window.scrollTo({
        top: pos_center_vertical,
        left: pos_center_horizontal,
        behavior: "smooth"
    });
  };

  /**
   * Limpia el contenido.
   */
  clearContent = () => document
        .querySelector(`.js-content${this.scope_sufix}`).innerHTML = "";

  /**
   * Abre o cierra el slider.
   */
  toggleSlider = () => document
        .querySelector(`.js-slider${this.scope_sufix}`)
        .classList.toggle(`${this.slider_selector}--in`);

  /**
   * Ejecuta toggleSlider en el onclick
   */
  clickToggleSlider = () => document
        .querySelectorAll(`.js-close-slider${this.scope_sufix}`)
        .forEach(e => e.addEventListener("click", () => {
              this.clearContent();
              this.toggleSlider();
        }
  ));

  /**
   * Estado del slider.
   * 
   * @return {boolean} - ture si esta abierto, false si esta cerrado.
   */
  isOpen = () => document
        .querySelector(`.js-slider${this.scope_sufix}`)
        .classList.contains(`${this.slider_selector}--in`);

  /**
   * Imprime la información del Punto Digital en el slider.
   * 
   * @return {string} - HTML del contenido del slider.
   */
  setContent = (data) => {
    if(!this.isOpen()){
        this.toggleSlider();
    }

    const html = (typeof this.template == "function") ? 
          this.template(this, data) : this.defaultTemplate(this, data);
    document.querySelector(`.js-content${this.scope_sufix}`)
            .innerHTML = html;
    // document.querySelector('#js-anchor-slider'+this.scope_sufix).focus()
  };

  /**
   * Mapea los headers.
   * 
   * @return {string} key - key del item.
   */
  header = (key) => {
    return (this.headers.hasOwnProperty(key) ? this.headers[key] : key);
  };

  /**
   * Validador de latitud y longitud.
   * 
   * @param {float} latlng - Latitud o Longitud.
   * @return {boolean}
   */
  validateLatLng = (latlng) => {
    let latlngArray = latlng.toString().split(",");
    for(let i = 0; i < latlngArray.length; i++) {
      if(isNaN(latlngArray[i]) || latlngArray[i] < -127 || latlngArray[i] > 75){
        return false;
      }
      return true;
    }
  };

  /**
   * Remueve acentos y caracteres especiales.
   * @param {string} data - cadena de texto a limpiar. 
   * @returns {string}
   * 
   * >>> removeAccents("Acción Murciélago árbol")
   * Accion murcielago arbol
   */
  removeAccents = (data) => {
      if(!data){
          return "";
      }

      return data
          .replace(/έ/g, "ε")
          .replace(/[ύϋΰ]/g, "υ")
          .replace(/ό/g, "ο")
          .replace(/ώ/g, "ω")
          .replace(/ά/g, "α")
          .replace(/[ίϊΐ]/g, "ι")
          .replace(/ή/g, "η")
          .replace(/\n/g, " ")
          .replace(/[áÁ]/g, "a")
          .replace(/[éÉ]/g, "e")
          .replace(/[íÍ]/g, "i")
          .replace(/[óÓ]/g, "o")
          .replace(/[Öö]/g, "o")
          .replace(/[úÚ]/g, "u")
          .replace(/ê/g, "e")
          .replace(/î/g, "i")
          .replace(/ô/g, "o")
          .replace(/è/g, "e")
          .replace(/ï/g, "i")
          .replace(/ü/g, "u")
          .replace(/ã/g, "a")
          .replace(/õ/g, "o")
          .replace(/ç/g, "c")
          .replace(/ì/g, "i");
  };

  /**
   * Crea el bloque html para el slider.
   */
  renderSlider = () => {
    // Remuevo el slider
    document.querySelectorAll(`.js-slider${this.scope_sufix}`)
            .forEach(e => e.remove());

    // Creo el slider
    const close_button = document.createElement("button");
    close_button.classList.add("btn", "btn-xs", "btn-secondary", "btn-close", 
                               `js-close-slider${this.scope_sufix}`);
    close_button.setAttribute("title", "Cerrar panel");
    close_button.innerHTML = "<span class=\"sr-only\">Cerrar</span>✕";

    const anchor = document.createElement("a");
    anchor.href = "#";
    // anchor.textContent = "";
    anchor.id = `js-anchor-slider${this.scope_sufix}`;

    const content_container = document.createElement("div");
    content_container.classList.add("content-container");

    const content = document.createElement("div");
    content.classList.add("content", `js-content${this.scope_sufix}`);
    content_container.appendChild(content);

    const container = document.createElement("div");
    // container.id = `js-anchor-slider${this.scope_sufix}`;
    container.setAttribute("role", "region");
    container.setAttribute("aria-live", "polite");
    container.classList.add("slider",`js-slider${this.scope_sufix}`);
    container.appendChild(close_button);
    container.appendChild(anchor);
    container.appendChild(content_container);
    document.querySelector(`${this.scope_selector}.poncho-map`).appendChild(container);
  };

  /**
   * Proyecta el slider y hace zoom en el marker.
   */
  showSlider = (layer, item) => {
    this.map.setView(
        [item[this.latitud], item[this.longitud]], this.map_anchor_zoom
    );
    layer.fireEvent("click");
  };

  /**
   * Proyecta el popUp y hace zoom en el marker.
   */
  showPopup = (layer) => {
    this.markers.zoomToShowLayer(layer, () => {
      layer.__parent.spiderfy();
      layer.openPopup();
    });
  };

  /**
   * Borra el hash de la url
   * @returns {void}
   */
  removeHash = () => history.replaceState(null, null, ' ');

  /**
   * Si la URL tiene un valor por hash lo obtiene considerandolo su id.
   * @returns {void}
   */
  hasHash = () => {
    let id = window.location.hash.replace("#", "");
    return id || false;
  };

  /**
   * Obtiene un hash, hace zoom sobre el marker y abre su popUp o 
   * el slider.
   */
  gotoHashedEntry = () => {
    let id = this.hasHash();
    if(!id){
        return; 
    }
    
    this.gotoEntry(id);
  };

  /**
   * Muestra un marker pasándo por parámetro su id.
   * @param {string|integer} id - valor identificador del marker. 
   */
  gotoEntry = (id) => {
      const entry = this.entry(id);
      this.markers.eachLayer(layer => {
        if(layer.options.id == id){
          // seteo el marker activo porque se produzco sin un clic.
          this.setSelectedMarker(id, layer);

          if(this.hash){
              this.addHash(id);
          }

          if(this.slider && this.hash){
              this.showSlider(layer, entry);
          } else {
              this.showPopup(layer);
          }
        }
      });
  };

  /**
   * Setea los markers para ejecutarse en un evento onlick
   * @TODO Usar un método para escapar el error cuando no encuentra la
   * propiedad classList.
   */
  clickeableMarkers = () => {
    this.markers.eachLayer(layer => {
      layer.on("click", (e) => {

        document.querySelectorAll(".marker--active")
                .forEach(e => e.classList.remove("marker--active"))
        try {
          e.sourceTarget._icon.classList.add("marker--active");
        } catch (error) {
          // console.error(error);
        }
        const content = this.entries.find(e => e[this.id]==layer.options.id);
        this.setContent(content);
      });
    });
  };

  /**
   * Setea los markers para ejecutarse en un evento onlick
   */   
   urlHash = () => {
      this.markers.eachLayer(layer => {
          layer.on("click", (e) => {
            this.addHash(layer.options.id);
          });
      });
  };

  /**
   * Remueve un elemento de una lista.
   * @param {object} list Array de elementos
   * @param {string} key Elemento a remover 
   */
  removeListElement = (list, key) => {
    const index = list.indexOf(key);
    if(index > -1){
      list.splice(index,1);
    }
    return list;
  };

  /**
   * Titulo para el default template
   * @param {object} row Entrada 
   */
  templateTitle = (row) => {
    const structure = this.template_structure;
    if(!structure.hasOwnProperty("title")){
        return false;
    }
    let title;

    if(this.template_header){
      const wrapper = document.createElement("div");
      wrapper.innerHTML = this.template_header(this, row);
      title = wrapper;
    } else {
      title = document.createElement("h1");
      title.classList.add(... this.template_title_class_list);
      title.textContent = row[structure.title];
    }

    const header = document.createElement("header");
    header.className = "header";
    header.appendChild(title);
    return header;
  }

  /**
   * Listado de keys para mistrar en una entrada del default template.
   * @param {object} row — Entrada de datos 
   */
  templateList = (row) => {
    const estructura = this.template_structure;
    let lista = Object.keys(row);

    let list = lista;
    if(estructura.hasOwnProperty("values") && estructura.values.length > 0){
        list = estructura.values;
    } else if(estructura.hasOwnProperty("exclude") && estructura.exclude.length > 0){
      for(const key of estructura.exclude)
         list = this.removeListElement(lista, key);
    }

    return list;
  }

  /**
   * Template por defecto
   * 
   * Arma un listado de datos usando la clave y el valor del objeto
   * pasado cómo argumento. 
   * @param {object} row - Entrada para dibujar un marker.
   */  
  defaultTemplate = (self, row) => {
    const tpl_list = this.templateList(row);
    const tpl_title = this.templateTitle(row);

    const container = document.createElement("article");
    container.classList.add(... this.template_container_class_list);

    const dl = document.createElement("dl");
    dl.classList.add(...this.template_dl_class_list);
    dl.style.fontSize = "1rem";

    for(const key of tpl_list){
      // excluyo los items vacíos.
      if(row.hasOwnProperty(key) && !row[key]){
        continue;
      }

      const dt = document.createElement("dt");
      dt.textContent = this.header(key);
      if(this.template_innerhtml){
          dt.innerHTML = this.header(key);
      }
      const dd = document.createElement("dd");
      dd.textContent = row[key];
      if(this.template_innerhtml){
          dd.innerHTML = row[key];
      }
      dl.appendChild(dt);
      dl.appendChild(dd);
    };

    if(tpl_title){
      container.appendChild(tpl_title);
    }

    container.appendChild(dl);
    return container.outerHTML;
  };

  /**
   * Icono poncho
   * 
   * @summary Retorna el color según el parámetro que se le pase. 
   * @param {string} color - Nombre del color según poncho colores. 
   * @returns {object}
   */
   icon = (color="azul") => {
    return new L.icon({
      iconUrl: `https://www.argentina.gob.ar/sites/default/files/marcador-${color}.svg`,
      iconSize: [27, 38],
      iconAnchor: [13, 38],
      popupAnchor: [0, -37]
    });
  };

  /**
   * Resetea el mapa a su punto inicial por defecto.
   */
  resetView = () => this.map.setView(this.map_view, this.map_zoom);

  /**
   * Hace zoom hasta los límites de los markers
   */
  fitBounds = () => {
      try {
        this.map.fitBounds(this.markers.getBounds());
      } catch (error) {
        console.error(error);
      }
  };

  /**
   * Agrega un botón entre zoom-in y zoom-out para volver a la vista
   * original. 
   */
  resetViewButton = () => {
    if(!this.reset_zoom){
       return;
    }
    // función a evaluar. Busca y remueve un botón de reset si existiera.
    document.querySelectorAll(
          `.js-reset-view${this.scope_sufix}`).forEach(e => e.remove());
    document
          .querySelectorAll(`${this.scope_selector} .leaflet-control-zoom-in`)
          .forEach(ele => {

        const icon = document.createElement("i");
        icon.classList.add("fa", "fa-expand");
        icon.setAttribute("aria-hidden","true");

        const button = document.createElement("a");
        button.classList.add(`js-reset-view${this.scope_sufix}`, 
                            "leaflet-control-zoom-reset");
        button.href = "#";
        button.title = "Ver todo el mapa";
        button.appendChild(icon);

        button.onclick = (e) => {
          e.preventDefault();
          this.resetView();
        };
        ele.after(button);
    });

  };

  /**
   * Define el objeto icon.
   * @param {object} row - entrada de json 
   * @returns {object} Instancia L.icon
   */
  marker = (row) => {
    // Si marker_color no viene o es null usa el marker por defecto 
    // de Open Street Map
    if(!this.marker_color || typeof this.marker_color == "boolean")
      return null;

    if(typeof this.marker_color === "string"){
      return this.icon(this.marker_color);

    } else if (typeof this.marker_color(this, row) === "string"){
      const color = this.marker_color(this, row);
      return this.icon(color);

    } else if (typeof this.marker_color === "function"){
      return this.marker_color(this, row);
    }
  };

  /**
   * Prepara las características del mapa y de cada uno de los markers.
   */
   markersMap = (entries) => {
    this.markers.clearLayers();
    entries.forEach(row => {
      const icon = this.marker(row);
      const id = row[this.id];
      const latitud = row[this.latitud];
      const longitud = row[this.longitud];

      if(!this.validateLatLng(latitud) || !this.validateLatLng(longitud)){ 
        return;
      }
      let marker_attr = {};
      if(id){
        marker_attr.id = id;
      }
      if(icon){
        marker_attr.icon = icon;
      }
      const marker = new L.marker([latitud, longitud], marker_attr);
      this.markers.addLayer(marker);
      
      if(!this.slider){
        const html = (typeof this.template == "function") ? 
              this.template(this, row) : this.defaultTemplate(this, row);
        marker.bindPopup(html);
      }

    });
    this.map.options.minZoom = 2;
    this.map.addLayer(this.markers)

    // var endTime = performance.now()
    // console.log(`[markersMap] ${endTime - startTime} milliseconds`)
  };

  /**
   * Setea el marker activo.
   */
  setSelectedMarker = (id, instance) => {
      const val = {entry: this.entry(id), marker: instance};
      this.selected_marker = val;
      return val;
  };

  /**
   * 
   */
  selectedMarker = () => {
      this.markers.eachLayer(layer => {
          layer.on("click", (e) => {
              this.setSelectedMarker(layer.options.id, layer);
          });
      });
  };

  /**
   * Hace el render del mapa.
   */
  render = () => {
    this.resetViewButton();
    this.markersMap(this.entries);
    this.selectedMarker();

    if(this.slider){
        this.renderSlider();
        this.clickeableMarkers();
        this.clickToggleSlider();
    }

    if(this.hash){
      this.urlHash();
    }

    if(this.scroll && this.hasHash()){
      this.scrollCenter();
    }
    setTimeout(this.gotoHashedEntry, this.anchor_delay);
  };
};

/**
 * PONCHO MAP FILTER
 * 
 * @summary Generador de mapas con filtro utilizando 
 * OpenStreetMap / leafleft
 * 
 * @author Agustín Bouillet bouilleta@jefatura.gob.ar, august 2022
 * @requires leaflet.js,leaflet.markercluster.js,leaflet.css,
 * MarkerCluster.Default.css,MarkerCluster.css, PonchoMap
 * @see https://github.com/argob/poncho/blob/master/src/demo/poncho-maps/readme-poncho-maps.md
 * 
 * 
 * MIT License
 *
 * Copyright (c) 2022 Argentina.gob.ar
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
class PonchoMapFilter extends PonchoMap {
  constructor(data, options){
    super(data, options);

    const defaults = {
      "filters": [],
      "filters_visible": false, 
      "search_fields":[],
      "messages": {
          "reset": "<a href=\"#\" class=\"{{reset_search}}\">Reestablecer</a>",
          "initial": "Hay {{total_results}} puntos en el mapa.",
          "no_results_by_term": "No encontramos resultados para tu búsqueda. " 
                  + "<a href=\"#\" class=\"{{reset_search}}\">Reestablecer</a>",
          "no_results": "No se encontraron entradas. " 
                  + "<a href=\"#\" class=\"{{reset_search}}\">Reestablecer</a>",
          "results": "{{total_results}} resultados coinciden con tu búsqueda." 
                  + " <a href=\"#\" class=\"{{reset_search}}\">Reestablecer</a>",
          "one_result": "{{total_results}} resultado coincide con tu búsqueda." 
                  + " <a href=\"#\" class=\"{{reset_search}}\">Reestablecer</a>",
          "has_filters": "<i title=\"¡Advertencia!\" aria-hidden=\"true\" " 
                  + "class=\"fa fa-warning text-mandarina\"></i> " 
                  + "Se están usando " 
                  + "<a href=\"{{anchor}}\" " 
                  + "title=\"Abre o cierra el panel de filtros\""
                  + "class=\"{{filter_class}}\">" 
                  + "filtros</a>."
        }
    };
    let opts = Object.assign({}, defaults, options);
    this.filters = opts.filters;
    this.filters_visible = opts.filters_visible;
    this.valid_fields = ["checkbox", "radio"];
    this.search_fields = opts.search_fields;
    this.messages = opts.messages;
  };

  /**
   * Parser de template simple
   * @param {string} str - Cadena de texto a parsear 
   * @param {object} values  
   * @returns {string}
   * 
   * >>> tplParser("Mi hija se llama {{ nombre}}.", {nombre:"Olivia"})
   * Mi hija se llama Olivia.
   */
  tplParser = (value, kwargs) => {
      return Object.keys(kwargs).reduce((str, key) => {
          const regex = new RegExp(
                '\\{\\{\\s{0,2}' + key + '\\s{0,2}\\}\\}', 'gm');
          str = str.replace(regex, kwargs[key]);
          return str;
      }, value);
  };

  /**
   * Mensajes de ayuda
   * @param {string} term - Término buscado
   * @param {object} results - Resultados de la búsqueda.
   * @returns {void}
   */
  helpText = (results) => {
      const help_container = document.querySelectorAll(
          `${this.scope_selector} .js-poncho-map__help`);
      help_container.forEach(element => {
          element.innerHTML = "";
          //
          const values = {
              "total_results": results.length,
              "total_entries": this.entries.length,
              "total_filtered_entries": this.filtered_entries.length,
              "filter_class": `js-close-filter${this.scope_sufix}`,
              "anchor": "#",
              "term": this.inputSearchValue,
              "reset_search": `js-poncho-map-reset${this.scope_sufix}`
          };

          // Arma el listado de mensajes.
          const ul = document.createElement("ul");
          ul.classList.add("m-b-0", "list-unstyled");
          ul.setAttribute("role", "region");
          ul.setAttribute("aria-live", "polite");
          const li = content => { 
              const item = document.createElement("li"); 
              item.innerHTML = content; 
              return item;
          };

          // Estado inicial. Totalidad de registros.
          if(values.total_entries === values.total_results){
              ul.appendChild(
                  li(this.tplParser(this.messages.initial, values))
              );
          }
          // 0 entradas con criterio de búsqueda.
          else if(values.total_results < 1){
              ul.appendChild(
                  li(this.tplParser(this.messages.no_results_by_term, values))
              );
          }
          // 0 entradas, sin creterio de búsqueda.
          else if(this.inputSearchValue === "" && values.total_results < 1){
              ul.appendChild(
                  li(this.tplParser(this.messages.no_results, values))
              );
          } 
          // Si solo hay un resultado
          else if(values.total_results == 1){
              ul.appendChild(
                  li(this.tplParser(this.messages.one_result, values))
              );
          } 
          // Si hay más de un resultado
          else if(values.total_results > 1){
              ul.appendChild(
                  li(this.tplParser(this.messages.results, values))
              );
          }
          // Si los resultados están siendo filtrados.
          if(!this.usingFilters()){
              ul.appendChild(
                  li(this.tplParser(this.messages.has_filters, values))
              );
          }

          element.appendChild(ul);
      });
  };

  /**
   * Obtiene el índice del filtro
   * @param {string} str — Input name attribute. 
   * @returns {string}
   * 
   * >>> dilter_position("name__1")
   * 1
   */
  filterPosition = (str) => {
    const regex = /(?:__([0-9]+))(?:__([0-9]+))?$/gm;
    const rgx =  regex.exec(str) 
    return (rgx ? parseInt(rgx[1]) : null);
  };

  /**
   * Ejecuta los filtros.
   */
  toggleFilter = () => document
      .querySelector(`.js-poncho-map-filters${this.scope_sufix}`)
      .classList.toggle("filter--in");

  /**
   * Altura para el contenedor de filtros.
   *
   * @summary En función de la altura del mapa y del tamaño y posición
   * del botón de filtro y su contenedor, se calcula el tamaño que tiene
   * el popup que contiene los inputs para los filtros. La idea es que,
   * si se configuraran muchos filtros se active la función
   * `overflow:auto` en la hoja de estilos.
   */
  filterContainerHeight = () => {    
    const filter_container = document
          .querySelector(`.js-filter-container${this.scope_sufix}`);
    const filter_button = document
          .querySelector(`.js-close-filter${this.scope_sufix}`);

    const poncho_map_height = filter_container.offsetParent.offsetHeight;
    // Valor tomado de la hoja de estilos
    // @todo calcular el valor dinámicamente.
    const container_position_distance = 20;
    const filters_height = poncho_map_height
          - filter_container.offsetTop
          - filter_button.offsetHeight
          - container_position_distance;

    const pos = document
          .querySelector(`.js-poncho-map-filters${this.scope_sufix}`);
    pos.style.maxHeight = `${filters_height}px`;

    // Valor tomado de la hoja de estilos
    // @todo calcular el valor dinámicamente.
    const inner_padding = 45;
    const height = pos.offsetHeight - inner_padding;
    const filters = document.querySelector(`.js-filters${this.scope_sufix}`);
    filters.style.height = `${height}px`;
    filters.style.overflow = "auto";
  }
      
  /**
   * Ejecuta toggle en el onclick
   */
  clickToggleFilter = () => document
      .querySelectorAll(`.js-close-filter${this.scope_sufix}`)
      .forEach(element => element.onclick = (event) => {
            event.preventDefault();
            this.toggleFilter(); 
            this.filterContainerHeight();
      });

  /**
   * Arma un grupo de inputs
   *
   * @param {object} fields_items - Listado de opciones para los fields.
   */
  fields = (fields_items, group) => {

    const fields_container = document.createElement("div");
    fields_container.classList.add("field-list", "p-b-1");

    for(const key in fields_items.fields){
        const field = fields_items.fields[key];

        const input = document.createElement("input");
        input.type = (this.valid_fields.includes(fields_items.type) ?
              fields_items.type : "checkbox");
        input.id = `id__${field[0]}__${group}__${key}`;
        if(fields_items.type == "radio"){
          input.name = `${field[0]}__${group}`;
        } else {
          input.name = `${field[0]}__${group}__${key}`;
        }

        input.className = "form-check-input";
        input.value = key;
        if(typeof field[3] !== "undefined" && field[3]=="checked")
            input.setAttribute("checked", "checked");

        const label = document.createElement("label");
        label.style.marginLeft = ".33rem";
        label.textContent=field[1];
        label.className = "form-check-label";
        label.setAttribute("for", `id__${field[0]}__${group}__${key}`);

        const field_container = document.createElement("div");
        field_container.className = "form-check";
        field_container.appendChild(input);
        field_container.appendChild(label);

        fields_container.appendChild(field_container);
    }

    const fieldset = document.createElement("div");
    fieldset.appendChild(fields_container);
    return fieldset;
  };

  /**
   * Crea el botón para los filtros
   */
  filterButton = () => {
    const filter_icon = document.createElement("i");
    filter_icon.setAttribute("aria-hidden", "true");
    filter_icon.classList.add("fa", "fa-filter");

    const button_text = document.createElement("span");
    button_text.textContent = "Filtrar";
    button_text.classList.add("sr-only");

    const button = document.createElement("button");
    button.title = "Filtrar elementos en el mapa";
    button.classList.add("btn","btn-secondary","btn-filter",
                         `js-close-filter${this.scope_sufix}`);
    button.appendChild(filter_icon);
    button.appendChild(button_text);

    const button_container = document.createElement("div");
    button_container.classList.add(`js-filter-container${this.scope_sufix}`, 
                                   "filter-container");

    if(this.reset_zoom)
        button_container.classList.add("filter-container--zoom-expand");

    button_container.appendChild(button);

    const container = document
          .querySelector(`.poncho-map${this.scope_selector}`);
    container.appendChild(button_container);
  }

  /**
   * Crea el contenedor para los filtros.
   */
  filterContainer = () => {
      const fields_container = document.createElement("div");
      fields_container.className = `js-filters${this.scope_sufix}`;  

      const close_button = document.createElement("button");
      close_button.classList.add("btn", "btn-xs", "btn-secondary", "btn-close", 
                                 `js-close-filter${this.scope_sufix}`);
      close_button.setAttribute("title", "Cerrar panel");
      close_button.innerHTML = "<span class=\"sr-only\">Cerrar </span>✕";

      const search = document.createElement("input");
      search.type ="hidden";
      // search.className = "sr-only";
      search.name = `js-search-input${this.scope_sufix}`;
      search.id = `js-search-input${this.scope_sufix}`;
      
      const form = document.createElement("form");
      form.classList.add(`js-formulario${this.scope_sufix}`);
      form.appendChild(close_button); 
      form.appendChild(search); 
      form.appendChild(fields_container); 

      const container = document.createElement("div");
      container.classList.add(`js-poncho-map-filters${this.scope_sufix}`, 
                              "poncho-map-filters");
      container.setAttribute("role", "region");
      container.setAttribute("aria-live", "polite");

      if(this.filters_visible){
          container.classList.add("filter--in");
      }
      // const button = document.createElement("button");
      // button.title = "Filtrar elementos en el mapa";
      // button.classList.add("btn","btn-info", "btn-sm", "js-filter-form");
      // button.textContent = "Filtrar";
      // container.appendChild(button)

      container.appendChild(form); 
      document
            .querySelector(`.js-filter-container${this.scope_sufix}`)
            .appendChild(container);
  };

  /**
   * Crea los checkbox para los filtros.
   */ 
  createFilters = (data) => {
    const form_filters = document
          .querySelector(`.js-filters${this.scope_sufix}`);

    data.forEach((item, group) => {
      let legend = document.createElement("legend");
      legend.textContent = item.legend;
      legend.classList.add("m-b-1", "text-primary", "h6")

      let fieldset = document.createElement("fieldset");
      fieldset.appendChild(legend);
      fieldset.appendChild(this.fields(item, group));

      form_filters.appendChild(fieldset);
    });
  };

  /**
   * Obtengo los checkbox marcados.
   */ 
  formFilters = () => {
    const form_filters = document
          .querySelector(`.js-formulario${this.scope_sufix}`);
    const form_data = new FormData(form_filters);

    return Array.from(form_data).map(ele => {
        let val = [];
        if(typeof this.filterPosition(ele[0]) == "number"){
          val = [this.filterPosition(ele[0]), parseInt(ele[1])];   
        } else if (ele[0] == `js-search-input${this.scope_sufix}`) {
          val = ['input', form_data.get(`js-search-input${this.scope_sufix}`)];
        }
        return val;
    });
  };

  /**
   * Configuración de estado de los filtros seteados por el usuario.
   * @returns {object}
   */
  defaultFiltersConfiguration = () => {
      // Obtengo todos los filtros y los colecciono en un array.
      const filters = this.filters.map(
        (g, gk) => g.fields.map(
          (f, fk) => [
              gk, fk, f[0], 
              (typeof f[3] !== "undefinded" && f[3] == "checked" ? true : false)
          ]
        )
      ).flat();
      return filters;
  }

  /**
   * Verifica si se están filtrando los datos.
   * @return {boolean}
   */
  usingFilters = () => {
      const result = this.defaultFiltersConfiguration().every(
          (e) => {
            return document
                  .querySelector(`#id__${e[2]}__${e[0]}__${e[1]}`)
                  .checked;
      });
      return result;
  };

  /**
   * Reestablece los filtros a la configuración creada por el usuario.
   * @return {void}
   */
  resetFormFilters = () => {
    // Seteo los inputs de acuerdo a las opciones del usuario.
    this.defaultFiltersConfiguration().forEach(e => {
        const field = document.querySelector(`#id__${e[2]}__${e[0]}__${e[1]}`);
        field.checked = e[3];
    });
  };

  /**
   * Value del input hidden (search)
   */
  get inputSearchValue(){
      // const search_value = this.formFilters().find(e => e[0] == "input");
      const search_value = document
            .querySelector(`#js-search-input${this.scope_sufix}`);
      // const result = search_value[1].trim();
      const result = search_value.value.trim();
      if(result !== ""){
          return result;
      }
      return false;
  }

  /**
   * Total de ocurrencias por clave y valor sobre entradas dadas.
   * @param {object} arr Entradas
   * @param {array} val Array con los elementos a buscar.
   * @param {string} index Clave de la entrada de datos. 
   */
  countOccurrences = (arr, val, index) => {
    return arr.reduce(
          (a, v) => val.some(e => v[index].includes(e)) ? a + 1 : a, 0);
  };

  /**
   * Total de resultados por filtro marcado.
   * @returns {Array} — retorna un array estructurado del siguiente modo:
   *      [
   *        {nombre del filtro},
   *        {total coincidencias},
   *        {indice de grupo de filtros},
   *        {indice input dentro del grupo}
   *      ]
   */
  totals = () => {
    const results = this.formFilters().filter(e => e[0]!="input").map(e => {
        const item = this.filters[e[0]].fields[e[1]];
        return [
            item[1],
            this.countOccurrences(this.filtered_entries, item[2], item[0]),
            ...e
        ];
    });
    return results;
  };

  /**
   * Valida una entrada
   * 
   * 1. Obtengo la cantidad de grupos que tengo.
   * 2. Evaluo los fields de cada grupo y junto los resultados en un array.
   * para retornar true los grupos tienen que dar true
   */
  _validateEntry = (row, form_filters) => {
      const fields_group = (group) => form_filters.filter(e => e[0] == group);
      // Reviso cuantos grupos tengo que validar.
      const total_groups = this.filters.length;
      let validations = [];
      for(let i = 0; i < total_groups; i++){
          // por cada grupo de fields obtengo un resultado de grupo.
          validations.push(this._validateGroup(row, fields_group(i)));
      }
      return validations.every(e => e);
  };

  /**
   * Valida el campo de un grupo.
   * @param {object} row 
   * @param {integer} group 
   * @param {integer} index 
   * @returns {object}
   */
  _search = (row, group, index) => {
      const filter = this.filters[group].fields[index];
      const search_for = filter[2];
      const found = search_for.some(e => row[filter[0]].includes(e));
      return found;
  };

  /**
   * Valida los fields del grupo.
   * @return boolean
   */
  _validateGroup = (row, fields_group) => {
      const result = fields_group.map(
          e => this._search(row, e[0], e[1])
      );
      return result.some(e => e);
  };

  /**
   * Filtra los markers.
   */ 
  filterData = () => {
      const available_filters = this.formFilters();
      let feed = this.entries.filter(
            row => this._validateEntry(row, available_filters)
      );
      feed = this.searchEntry(this.inputSearchValue, feed);
      feed = (available_filters.length > 0 ? feed : []);
      this.filtered_entries = feed;
      return feed;
  };

  /**
   * Render de funciones 
   */ 
  filteredData = (feed) => {
      feed = (typeof feed !== "undefined" ? this.entries : this.filterData());
      this.markersMap(feed); 
      this.selectedMarker();
      this.helpText(feed);
      this.resetSearch();
      this.clickToggleFilter();
      
      if(this.slider){
          this.renderSlider();
          this.clickeableMarkers();
          this.clickToggleSlider();
      }

      if(this.hash){
        this.urlHash();
      }
  };

  /**
   * Borra los valores del search input en el campo de filtros.
   */
  clearSearchInput = () => document
      .querySelectorAll(`#js-search-input${this.scope_sufix}`)
      .forEach(element => element.value = "");

  /**
   * Filtra los markers en el onchange de los filtros
   * @returns {void}
   */
  resetSearch = () => document
      .querySelectorAll(`.js-poncho-map-reset${this.scope_sufix}`)
          .forEach(e => {
              e.onclick = (event => {
                  event.preventDefault();
                  this.resetFormFilters();
                  this.filteredData(this.entries);
                  this.clearSearchInput();
                  // this.resetView();
          });
   });

  /**
   * Cambia la lista de markers en función de la selección de 
   * los filtros en PonchoMapFilter.
   * @TODO Ver el modo de hacer focus sobre el scope
   * @returns {void}
   */
  filterChange = (callback) => document
      .querySelectorAll(`.js-filters${this.scope_sufix}`)
      .forEach(element => {
          element.onchange = (callback);
  });

  /**
   * imprime el mapa
   */ 
  render = () =>{
    console.log(
        "%cPonchoFilter",
        'padding:5px;border-radius:6px;background: #aaff00;color: #000');

    this.resetViewButton(); 
    if(this.filters.length > 0)
    this.filterButton();
    this.filterContainer();
    this.createFilters(this.filters);

    this.filteredData();

    if(this.scroll && this.hasHash()){
      this.scrollCenter();
    }

    this.filterChange((event) => {
        // console.log(">>> PonchoFilter (listener)");

        event.preventDefault();
        this.filteredData();
    })

    setTimeout(this.gotoHashedEntry, this.anchor_delay);
    if(this.filters_visible){
        this.filterContainerHeight();
    }
  };
};
// end of class

/**
 * PONCHO MAP SEARCH
 * 
 * @summary Busca marcadores usando el componente select2
 * 
 * @author Agustín Bouillet bouilleta@jefatura.gob.ar, septiembre 2022
 * @requires leaflet.js,leaflet.markercluster.js,leaflet.css,
 * MarkerCluster.Default.css,MarkerCluster.css, PonchoMap, 
 * PonchoMapFilter, select2.js
 * @see https://github.com/argob/poncho/blob/master/src/demo/poncho-maps/readme-poncho-maps.md
 * 
 * 
 * MIT License
 *
 * Copyright (c) 2022 Argentina.gob.ar
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
class PonchoMapSearch {
    constructor(instance, options){
        const defaults = {
            "scope": false,
            "text": "text",
            "id": "id",
            "template": false,
            "allow_clear": false,
            "placeholder": "Su búsqueda",
            "theme": "poncho",
            "minimum_input_length": 0,
            "search_fields": instance.search_fields,
            "sort": true,
            "sort_reverse": false,
            "sort_key": "text",
        };
        this.instance = instance;
        let opts = Object.assign({}, defaults, options);
        this.theme = opts.theme;
        this.template = (
              typeof(opts.template) === "function" ? opts.template: false);
        this.text = opts.text;
        this.id = opts.id;
        this.placeholder = opts.placeholder;
        this.allow_clear = opts.allow_clear;
        this.scope = opts.scope;
        this.sort_key = opts.sort_key;
        this.minimum_input_length = opts.minimum_input_length;
        this.sort = opts.sort;
        this.sort_reverse = opts.sort_reverse;
        this.search_scope_selector = (
          this.scope ? `[data-scope="${this.scope}"]`: "");

        this.instance.search_fields = opts.search_fields;
    };

    /**
     * Ordena un listado de objetos.
     * @param {object} entries - Array de objetos.
     * @param {string} key - Clave por la que se quiere ordenar. 
     * @returns {object} - Entradas ordenadas
     */
    sortData = (entries, key) => {
      let order = entries.sort((a, b) => {
        const clearString = e => this.instance.removeAccents(e).toUpperCase();
        if (clearString(a[key]) < clearString(b[key])){
          return -1;
        }

        if (clearString(a[key]) > clearString(b[key])){
          return 1;
        }

        return 0;
      });

      if(this.sort_reverse){
        return order.reverse();
      }
      
      return order;
    };

    /**
     * Busca el térmono en cada una de las entradas.
     * 
     * @param {object} params - Define los parametros de búsqueda del 
     * componente select2. 
     * @param {objecct} data - Entrada donde hacer la búsqueda.
     * @returns {objecct|null}
     */
    matchTerm = (params, data) => {
        if (typeof(params.term) === "undefined" || 
            params.term.toString().trim() === ""){
          return data;
        }
        return this.instance.searchTerm(params.term, data);
    };

    /**
     * Prepara las entradas para la búsqueda
     * @param {object} entries 
     */
    dataSelect = (entries) => {
        return entries.map( (e) => {
            let entry = {id: e[this.id], text: e[this.text]};
            entry.html = (this.template ? this.template(this, e) : e[this.text]);
            return ({...e, ...entry, ...{selected:false}});
        });
    };

    /**
     * Prepara el listado de entradas que se utilizará para la búsqueda.
     * @returns {object}
     */
    dataset = () => {
        const data = ((this.instance instanceof PonchoMapFilter) ? 
                      this.instance.filtered_entries : this.instance.entries);
        let data_select = this.dataSelect(this.sortData(data, this.sort_key));

        if(!this.sort){
            data_select = this.dataSelect(data);
        }
        return data_select;
    };

    /**
     * Configuración para el componenete select2.
     */
    selectTwo = () => {
        jQuery(`${this.search_scope_selector} .js-poncho-map-search__select2`).select2({
              data: this.dataset(),
              matcher: this.matchTerm,
              tags:true,
              language: {
                  inputTooShort: function () {
                      return `Debe introducir al menos 2 caracteres…`;
                  }
              },
              allowClear: this.allow_clear,
              theme: this.theme,
              minimumInputLength: this.minimum_input_length,
              placeholder: this.placeholder,
              escapeMarkup: function(markup) {
                  return markup;
              },
              templateResult: function(data) {
                  return data.html;
              },
              templateSelection: function(data) {
                  return data.text;
              },
          }).on("select2:select", e => {
              this.instance.gotoEntry(e.params.data.id);
          }).on("select2:open", () => {
              document
                  .querySelectorAll(".select2-search__field")
                  .forEach(e => e.focus());
          });
    };

    /**
     * Fix para solucionar el que quede seleccionado el primer option 
     * del select.
     */
    firstEmptyOption = () => document
          .querySelectorAll(
              `${this.search_scope_selector} .js-poncho-map-search__select2`)
          .forEach(element => {
      element.innerHTML = "";
      element.appendChild(document.createElement("option"));
    });

    /**
     * Ejecuta una búsqueda desde un input text
     * @returns 
     */
    triggerSearch = () => {
        const input = document.querySelector(
            `${this.search_scope_selector} .js-poncho-map-search__input`);
        const submit = document.querySelectorAll(
                `${this.search_scope_selector} .js-poncho-map-search__submit`);
        
        submit.forEach(e => {
            e.onclick = (event => {
                event.preventDefault();
                const element = document.querySelector(
                      `#js-search-input${this.instance.scope_sufix}`);
                element.value = input.value;
                const term = input.value;
                this.renderSearch(term);
            });
        });
        

    }

    /**
     * en el keyup copia el value al input hidden de filtros.
     */
    keyup = () => {
        const input = document.querySelectorAll(
              `${this.search_scope_selector} .js-poncho-map-search__input`);
        input.forEach(ele => {

            const filter_search_input = document.querySelector(
                `#js-search-input${this.instance.scope_sufix}`);
            ele.onkeyup = (() => {
              filter_search_input.value = ele.value;
            });
            ele.onkeydown = (() => {
              filter_search_input.value = ele.value;
            });
        });
    };

    /**
     * Límpia del input search el término de búsqueda. 
     * @returns {void}
     */
    cleanInput = () => document
        .querySelector(
            `${this.search_scope_selector} .js-poncho-map-search__input`)
        .value = "";

    /**
     * Vacía el contenido del elemento que contiene los textos de ayuda.
     * @returns {void}
     */
    cleanHelpText = () => document
        .querySelector(
            `${this.instance.scope_selector} .js-poncho-map__help`)
        .innerHTML = "";

    /**
     * Hace una búsqueda basado en el término escrito en el input de
     * búsqueda.
     */
    renderSearch = (term) => {
        const entries = this.instance.filterData();
        // Renderizo el mapa
        // @see PonchoMap
        this.instance.markersMap(entries); 
        if(this.instance.slider){
            this.instance.renderSlider();
            this.instance.clickeableMarkers();
            this.instance.clickToggleSlider();
          }

        if(this.instance.hash){
            this.instance.urlHash();
        }
        // Alejo el mapa a su posición por defecto.
        // @see PonchoMap resetView()
        this.instance.resetView();
        // Si la búsqueda encontró una sola entrada, voy a esa
        // entrada y muestro la info, ya sea un popUp o un slider.
        // Si hay más de una entrada muestro los markers y hago 
        // zoom abarcando el límite de todos ellos.
        if(entries.length == 1){
            this.instance.gotoEntry(entries[0][this.instance.id]);
        } else if(term.trim() != "") {
            this.instance.removeHash();
            setTimeout(this.instance.fitBounds, 350);
        }

        this.instance.helpText(entries);
        this.instance.resetSearch();
        this.instance.clickToggleFilter();
    };
  
    /**
     * Agrega options en el claslist del input de búsqueda.
     * <datalist>
     *     <option>Agregado 1</option>
     *     <option>Agregado 2</option>
     *     ...
     * </datalist>
     */
    addDataListOptions = () => document
        .querySelectorAll(
            `${this.search_scope_selector} #js-porcho-map-search__list`)
        .forEach(element => {
            element.innerHTML = new Date();
            const options = (content) => {
                const opt = document.createElement("option"); 
                opt.textContent = content; 
                return opt;
            };

            this.instance.filtered_entries.forEach(e => 
                element.appendChild(options(e[this.text]))
            );
    });

    /**
     * Ejecuta el componente select2 y activa el listener de los filtros.
     */
    render = () => {
        console.log(
            "%cPonchoFilterSearch",
            'padding:5px;border-radius:6px;background: #ff4400;color: #fff');

        this.firstEmptyOption();
        this.selectTwo();
        this.triggerSearch();
        
        this.addDataListOptions();
        this.instance.filterChange((event) => {
            // console.log("%cPonchoFilterSearch (listener)", 'color: #ff4400;');
            event.preventDefault();
            this.instance.filteredData();
            this.addDataListOptions();
        })
        this.keyup();
        /*
        jQuery(document).on('keyup keypress keydown', ".select2-search__field", 
            function (e) {
            if (e.which == 13) {
                search.renderSearch( 
                    document
                        .querySelector(`.select2-selection__rendered`)
                        .textContent
                )
            }
        });
        */
    }  
};

//#####################################################################
//######################### GAPI HELPERS ##############################
//#####################################################################

/**
 * Helpers para manejar los json provenientes de Google Sheets.
 */
class GapiSheetData {
  constructor(options){
    const defaults = {
      "gapi_key": "AIzaSyAll9EH1aTmZDewNSyM_CU_AIsGOiEDyZs",
    };
    let opts = Object.assign({}, defaults, options);
    this.gapi_key = opts.gapi_key;
  }

  /**
   * URI para obtener el json de google sheet.
   * 
   * @param {string} page Nombre de la página a obtener.
   * @param {string} spreadsheet Id del documento Google Sheet.
   * @returns {string} URL
   */
  url = (page, spreadsheet) => {
   return [
      "https://sheets.googleapis.com/v4/spreadsheets/",
      spreadsheet, "/values/", page,
      "?key=", this.gapi_key, "&alt=json"
    ].join("");
  };

  /**
   * Retorna los elemento del json
   */
  json_data = (json) => {
    const feed = this.feed(json);
    return {
        "feed": feed,
        "entries": this.entries(feed),
        "headers": this.headers(feed)
    };
  };

  /**
   * Retorna con una estructura más cómoda para usar
   * @param {object} data - Feed Json 
   * @returns {object}
   */
  feed = (response) => {
    const keys = response.values[0];
    const regex = / |\/|_/ig;
    let entry = [];

    response.values.forEach((v, k) => {
      if(k > 0){

        let zip = {};
        for(var i in keys){
          var d = (v.hasOwnProperty(i))? v[i].trim() : "";
          zip[`${ keys[i].toLowerCase().replace(regex, "") }`] = d;
        }
        entry.push(zip);
      }
    });
    return entry;
  }

  /**
  * Variables.
  */
  gapi_feed_row = (data, separator="-", filter_prefix=true) => {
    const prefix = filter_prefix ? "filtro-" : "";
    const feed_keys = Object.entries(data);
    const clean = k => k.replace("gsx$", "")
                        .replace(prefix, "").replace(/-/g, separator);
    let list = {};
    feed_keys.map(v => list[clean(v[0])] = v[1]["$t"]);
    return list;
  };

  /**
   * Retrona las entradas excluyendo el primer row, ya que pertenece a los headers.
   * @param {*} feed 
   * @returns 
   */
  entries = (feed) => {
    return  feed.filter((v,k) => k > 0);
  }

  /**
   * Obtiene el primer row que es igual a los headers.
   * @param {*} feed 
   * @returns 
   */
  headers = (feed) => {
    return feed.find((v,k) => k == 0);
  }
};

/**
 * Fetch data
 */
 async function fetch_json(url, method="GET"){
  const response = await fetch(
    url,{
      method: method, 
      headers: {
        "Accept": "application/json", "Content-Type": "application/json"
      }
    }
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};