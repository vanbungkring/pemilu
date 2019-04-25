new Vue({
  el: '#app',
  data() {
    return {
      kpu: [],
      kp: [],
      kpjs_total_suara_pas1: 0,
      cakupan: 0
    }
  },

  mounted() {
    var query = '?type=json'
    if (window.location.search) {
      query = window.location.search + '&type=json'
    }
    console.log(window.location.search)
    axios.get('/' + query, {

      })
      .then(function(response) {
        var vm = this
        drawChartKPU(response.data.data.KPU.chart['21'], response.data.data.KPU.chart['22']);
        //drawChartKPP(response.data.kpp1, response.data.kpp2)
        drawChartKPJS(response.data.kpjs1, response.data.kpjs2);
        var a = response;
        console.log(a);
        vm.kpu = response.data.data.KPU;
        vm.kp = response.data.data.KP
        vm.cakupan = response.data.total_cakupan
        vm.kpjs_total_suara_pas1 = response.data.kpjs1;
      })
      .catch(function(error) {
        console.log(error);
      })
      .then(function() {});
  }
})

function drawChartKPP(pas1, pas2) {
  Highcharts.chart('KPP', {
    chart: {
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Kawal Pilpres'
    },
    tooltip: {
      pointFormat: ' <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        colors: ['rgb(142,214,255)', 'rgb(255,227,176)'],
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        }
      }
    },
    series: [{
      colorByPoint: true,
      data: [{
        name: 'Prabowo Sandi',
        y: pas2 / (pas1 + pas2) * 100,
        sliced: false,
        selected: true
      }, {
        name: 'Jokowi - Amin',
        y: pas1 / (pas1 + pas2) * 100
      }]
    }]
  });

}

function drawChartKPJS(pas1, pas2) {
  Highcharts.chart('KPJS', {
    chart: {
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Kawal Pemilu'
    },
    tooltip: {
      pointFormat: ' <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        colors: ['rgb(142,214,255)', 'rgb(255,227,176)'],
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        }
      }
    },
    series: [{
      colorByPoint: true,
      data: [{
        name: 'Prabowo Sandi',
        y: pas2 / (pas1 + pas2) * 100,
        sliced: false,
        selected: true
      }, {
        name: 'Jokowi - Amin',
        y: pas1 / (pas1 + pas2) * 100
      }]
    }]
  });
}

function drawChartKPU(pas1, pas2) {
  Highcharts.chart('KPU', {
    chart: {
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie'
    },
    title: {
      text: 'Komisi Pemilihan Umum'
    },
    tooltip: {
      pointFormat: ' <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        colors: ['rgb(142,214,255)', 'rgb(255,227,176)'],
        allowPointSelect: true,
        cursor: 'true',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        }
      }
    },
    series: [{
      colorByPoint: true,
      data: [{
        name: 'Prabowo Sandi',
        backgroundColor: '#FCFFC5',
        y: pas2 / (pas1 + pas2) * 100,
        sliced: false,
        selected: true
      }, {
        name: 'Jokowi - Amin',
        y: pas1 / (pas1 + pas2) * 100
      }]
    }]
  });

}
