var app = new Vue({
  el: '#app',
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      info: null,
      hasil: null,
      dapil: null,
      series: [{
        name: 'Perolehan Suara',
        data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2]
      }],
      chartOptions: {
        chart: {
          height: 350,
          type: 'bar',
        },
        plotOptions: {
          bar: {
            dataLabels: {
              position: 'top', // top, center, bottom
            },
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            return val + "%";
          },
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ["#304758"]
          }
        },

        xaxis: {
          categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          position: 'bottom',
          labels: {
            offsetY: -18,

          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          },
          crosshairs: {
            fill: {
              type: 'gradient',
              gradient: {
                colorFrom: '#D8E3F0',
                colorTo: '#BED1E6',
                stops: [0, 100],
                opacityFrom: 0.4,
                opacityTo: 0.5,
              }
            }
          },
          tooltip: {
            enabled: true,
            offsetY: -35,

          }
        },
        fill: {
          gradient: {
            shade: 'light',
            type: "horizontal",
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [50, 0, 100, 100]
          },
        },
        yaxis: {
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: false,
            formatter: function(val) {
              return val + "%";
            }
          }

        },
        title: {
          text: 'Total Perolehan Suara Partai',
          floating: true,
          offsetY: 320,
          align: 'center',
          style: {
            color: '#444'
          }
        }
      }
    }
  },
  mounted() {
    var info;
    axios
      .get('/legislatif/partai')
      .then(response => {
        this.info = response.data
        for (var i = 0; i < response.data.length; i++) {
          console.log(response.data[i])
        }
        var partai = [];
        var warna = [];
      })
      .catch(error => {
        console.log(error)
        this.errored = true
      })
      .finally(() => this.loading = false)
    axios
      .get('/legislatif/hasil')
      .then(response => (this.hasil = response.data))

    axios
      .get('/legislatif/dapil')
      .then(response => (this.dapil = response.data))
  }
})