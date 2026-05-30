export default {
  async install (Vue, options) {
    Vue.prototype.$innerChain = new Vue({
      data () {
        return {
          innerLedgers: [],
          lastKnownSeq: 0,
          polling: false,
          pollInterval: null
        }
      },
      computed: {
        list () {
          return this.innerLedgers.map(l => l.seq)
        }
      },
      created () {
        this.$events.on('connected', () => {
          this.startPolling()
        })

        this.$events.on('route:inner_ledger', seq => {
          this.hydrate(seq)
        })
      },
      beforeDestroy () {
        this.stopPolling()
      },
      methods: {
        startPolling () {
          if (this.pollInterval) return
          this.poll()
          this.pollInterval = setInterval(() => this.poll(), 1000)
        },
        stopPolling () {
          if (this.pollInterval) {
            clearInterval(this.pollInterval)
            this.pollInterval = null
          }
        },
        async poll () {
          if (this.polling) return
          this.polling = true
          try {
            const result = await this.$ws.send({ command: 'inner_ledger' })
            if (result && result.ledger && result.ledger.seq > this.lastKnownSeq) {
              this.lastKnownSeq = result.ledger.seq
              this.$events.emit('inner_ledger', {
                seq: result.ledger.seq,
                tx_count: result.tx_count || 0,
                chain_id: result.chain_id,
                chain_name: result.chain_name
              })
            }
          } catch (e) {
            // inner chain may not be enabled
          }
          this.polling = false
        },
        purge (seq) {
          const matched = this.innerLedgers.filter(l => l.seq === Number(seq))
          if (matched.length > 0) {
            const index = this.innerLedgers.indexOf(matched[0])
            if (index > -1) {
              this.innerLedgers.splice(index, 1)
            }
          }
        },
        getInnerLedger (seq) {
          const s = Number(seq)
          const matched = this.innerLedgers.filter(l => l.seq === s)
          if (matched.length > 0) {
            return matched[0].ledgerData
          } else {
            return this.hydrate(seq)
          }
        },
        async hydrate (seq) {
          const s = Number(seq)
          if (this.innerLedgers.filter(l => l.seq === s).length > 0) {
            return
          }

          this.innerLedgers.push({ seq: s, ledgerData: {} })

          const ledgerData = await this.$ws.send({
            command: 'inner_ledger',
            ledger_index: s
          })

          const idx = this.innerLedgers.map(l => l.seq).indexOf(s)
          if (idx > -1) {
            Object.assign(this.innerLedgers[idx], { ledgerData })
          }

          return ledgerData
        }
      }
    })
  }
}
