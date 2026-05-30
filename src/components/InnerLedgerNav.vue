<template>
  <div class="fixed-top inner-nav-scroller shadow-sm" style="z-index: 9; background: #1a0a3e;">
    <nav class="nav nav-underline" aria-label="Inner chain navigation">
      <div class="chain-label ms-2 d-flex align-items-center">
        <span class="status-dot" :class="{ 'bg-success': connected && hasInnerChain, 'bg-warning pulse': connected && !hasInnerChain, 'bg-secondary pulse': !connected }"></span>
        <small class="chain-name text-white-50 fw-bold ms-1">L2</small>
      </div>
      <div class="pe-3" v-show="$innerChain.list.length > 0">
        <div class="btn-group ms-1 py-1">
          <span v-for="ledger in $innerChain.list" v-bind:key="ledger" class="pinned-ledger px-0 py-0 mt-1 btn" :class="{ 'btn-outline-purple': currentSeq !== ledger, 'btn-purple shadow-sm fw-bold active': currentSeq === ledger }">
            <router-link :to="'/inner/' + String(ledger)" class="text-decoration-none ps-2 pe-1" :class="{ 'text-purple-light': currentSeq !== ledger, 'text-white': currentSeq === ledger }">
              {{ ledger }}
              <span v-if="$innerChain.list.indexOf(Number(ledger)) > -1" style="top: -3px; left: -4px;" class="badge fw-bold ms-0 me-0 d-inline px-1 pt-0 pb-0 rounded-pill align-text-bottom" :class="{ 'bg-white text-dark': currentSeq === ledger, 'bg-white text-dark': currentSeq !== ledger }">{{ typeof getTxCount(ledger) === 'number' ? getTxCount(ledger) : '...' }}</span>
            </router-link>
            <button @click="purge(ledger)" class="me-2 border-0 bg-transparent px-0 py-0 text-white">&times;</button>
          </span>
        </div>
      </div>
      <span v-if="!connected" class="await-close ms-2 pt-2 text-white-50"><small>Connecting...</small></span>
      <span v-if="connected && !hasInnerChain" class="await-close ms-2 pt-2 text-white-50"><small>No inner chain detected</small></span>
      <span v-if="connected && hasInnerChain && ledgers.length === 0" class="await-close ms-2 pt-2 text-white-50"><small>Waiting for inner ledger...</small></span>
      <router-link :to="'/inner/' + String(l.seq)" v-for="l in ledgers" v-bind:key="l.seq" class="nav-link px-0">
        <div class="ps-2 pe-1" v-if="$innerChain.list.indexOf(l.seq) > -1">
          <span class="text-white-50"><small><i class="far fa-thumbtack"></i> {{ l.seq }}</small></span>
        </div>
        <div class="px-3" v-else>
          <span class="text-purple-light" :class="{'fw-bold': l.tx_count > 0}">{{ l.seq }}</span>
          <span v-if="l.tx_count > 0" class="badge bg-purple fw-bold ms-1 text-white rounded-pill align-text-bottom">{{ l.tx_count }}</span>
        </div>
      </router-link>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'InnerLedgerNav',
  data () {
    return {
      ledgers: [],
      connected: false,
      hasInnerChain: false
    }
  },
  methods: {
    addLedger (ledger) {
      this.hasInnerChain = true
      const exists = this.ledgers.find(l => l.seq === ledger.seq)
      if (!exists) {
        this.ledgers.unshift(ledger)
        this.ledgers.splice(30)
      }
    },
    purge (seq) {
      this.$innerChain.purge(seq)
      if (this.$route.params.seq === String(seq)) {
        this.$router.push('/')
      }
    },
    getTxCount (seq) {
      const local = this.ledgers.filter(l => l.seq === seq)
      if (Array.isArray(local) && local.length > 0) {
        return local[0].tx_count
      }
      const ledger = this.$innerChain.getInnerLedger(seq)
      if (ledger?.error) {
        return 0
      }
      return ledger?.tx_count
    }
  },
  computed: {
    currentSeq () {
      return Number(this.$route?.params?.seq || 0)
    }
  },
  mounted () {
    if (typeof this.$ws !== 'undefined') {
      if (this.$ws.getState().online) {
        this.connected = true
      }
    }

    this.$events.on('inner_ledger', this.addLedger)

    this.$events.on('connected', () => {
      this.connected = true
    })
  },
  destroyed () {
    this.$events.off('inner_ledger', this.addLedger)
  }
}
</script>

<style lang="scss" scoped>
  .inner-nav-scroller {
    position: fixed;
    top: calc(60px + 2.75rem);
    z-index: 9;
    height: 2.75rem;
    overflow-y: hidden;

    .nav {
      display: flex;
      flex-wrap: nowrap;
      padding-bottom: 1rem;
      margin-top: -1px;
      overflow-x: auto;
      text-align: center;
      white-space: nowrap;
      -webkit-overflow-scrolling: touch;
    }
  }
  .chain-label {
    white-space: nowrap;
    line-height: 2.75rem;
  }
  .chain-name {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
  }
  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .pulse {
    animation: pulse-anim 1.5s infinite;
  }
  @keyframes pulse-anim {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .pinned-ledger { height: 1.8em; top: 0.03em }
  .await-close { opacity: 0.7; line-height: 1.7em; }
  .text-purple-light { color: #b794f6; }
  .btn-outline-purple {
    border-color: #7c3aed;
    color: #b794f6;
    &:hover { background-color: rgba(124, 58, 237, 0.2); }
  }
  .btn-purple {
    background-color: #7c3aed;
    border-color: #7c3aed;
    color: white;
  }
</style>
