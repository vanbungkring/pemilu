var app = new Vue({
  el: '#app',
  data() {
    return {
      info: null,
      hasil: null,
      dapil: null
    }
  },
  mounted() {
    axios
      .get('/legislatif/partai')
      .then(response => (this.info = response.data))

    axios
      .get('/legislatif/hasil')
      .then(response => (this.hasil = response.data))
      
    axios
      .get('/legislatif/dapil')
      .then(response => (this.dapil = response.data))
  }
})
