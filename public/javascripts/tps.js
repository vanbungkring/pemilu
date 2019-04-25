var app = new Vue({
  el: '#app',
  data() {
    return {
      info: null,
      message: 'Hell',
      loading: true,
      errored: false,
      ts: 'getting data'
    }
  },
  mounted() {
    axios
      .get('/?child=[' + child + ']&type=json', {})
      .then(response => {
        this.info = response.data
      })
      .catch(error => {
        console.log(error)
        this.errored = true
      })
      .finally(() => this.loading = false)
  }
})
