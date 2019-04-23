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
        data: []
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
          categories:  ["PKB", "Gerindra", "PDIP", "Golkar", "NasDem", "Garuda", "Berkarya", "PKS", "Perindo", "PPP", "PSI", "PAN", "Hanura", "Demokrat", "PA", "Partai SIRA", "PD Aceh", "PNA", "PBB", "PKPI"],
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

        var partai = [];
        var warna = [];
        for (var i = 0; i < Object.values(response.data).length; i++) {
          partai.push( Object.values(response.data)[i]['nama']);
          warna.push(i);
        }
        this.chartOptions['xaxis']['categories'] = partai;
        this.info = response.data
        this.series[0]['data'] = warna;
        console.log(partai);
      })
      .catch(error => {
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
