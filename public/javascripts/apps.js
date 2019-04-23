new Vue({
  el: '#app',
  data () {
    return {
      kpu: [],
      kp: [],
      kpjs_total_suara_pas1:0,
      cakupan:0
    }
  },

  mounted() {
    axios.get('/', {
        params: {
          type: 'json'
        }
      })
      .then(function(response) {
        var vm = this
        drawChartKPU(response.data.data.KPU.chart['21'], response.data.data.KPU.chart['22']);
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

function drawChartKPJS(pas1, pas2) {


  var canvas = document.getElementById('KPJS');
  var data = {

    labels: ["JOKOWI-AMIN", "PRABOWO SANDI"],
    datasets: [{
      label: "Kawal Pemilu",
      backgroundColor: ['#d4edda', '#f8d7da'],
      borderColor: "rgba(255,99,132,1)",
      borderWidth: 0,
      data: [parseFloat(pas1 / (pas2 + pas1)).toFixed(2) * 100, parseFloat(pas2 / (pas2 + pas1)).toFixed(2) * 100],
    }]
  };
  var option = {
    type: 'pie',
    scales: {
      yAxes: [{
        stacked: true,
        gridLines: {
          display: false,
          color: "rgba(255,99,132,0.2)"
        }
      }],

    }
  };

  var myBarChart = new Chart(canvas, {
    type: 'pie',
    data: data,
  });
}

function drawChartKPU(pas1, pas2) {
  var canvas = document.getElementById('KPU');
  var dataKPU = {
    labels: ["JOKOWI-AMIN", "PRABOWO SANDI"],
    datasets: [{
      label: "Komisi Pemilihan Umum",
      backgroundColor: ['#d4edda', '#f8d7da'],
      borderColor: "rgba(255,99,132,1)",
      borderWidth: 0,
      data: [parseFloat((pas1 / (pas1 + pas2)) * 100).toFixed(2), parseFloat((pas2 / (pas2 + pas1)) * 100).toFixed(2)],
    }]
  };
  var option = {
    type: 'pie',
    scales: {
      yAxes: [{
        stacked: true,
        gridLines: {
          display: false,
          color: "rgba(255,99,132,0.2)"
        }
      }],

    }
  };

  var myBarChartKPU = new Chart(canvas, {
    type: 'pie',
    data: dataKPU,
  });

}
