var app = new Vue({
  el: '#app',
  data() {
    return {
      info: null
    }
  },
  mounted() {
    axios
      .get('/legislatif/partai')
      .then(response => (this.info = response.data))
  }
})
