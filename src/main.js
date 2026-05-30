import Vue from 'vue'
import App from './App.vue'
import Xrpl from './plugins/xrpl'
import Ledger from './plugins/ledger'
import InnerChain from './plugins/innerChain'
import Mitt from 'mitt'
import router from './router'

Vue.config.productionTip = false

Vue.prototype.$events = Mitt()

Vue.use(Xrpl)
Vue.use(Ledger)
Vue.use(InnerChain)

router.$ws = Xrpl

new Vue({
  router,
  render: h => h(App),
  watch: {
    '$route.params.ledger' () {
      if (this.$route.params.ledger) {
        this.$events.emit('route:ledger', this.$route.params.ledger)
      }
    },
    '$route.params.seq' () {
      if (this.$route.params.seq) {
        this.$events.emit('route:inner_ledger', this.$route.params.seq)
      }
    }
  }
}).$mount('#app')
