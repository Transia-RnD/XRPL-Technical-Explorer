<template>
  <main class="container-fluid">
    <h4 style="color: #a78bfa; text-shadow: 0 0 10px rgba(167, 139, 250, 0.3);">Inner Chain Ledger</h4>
    <code>{{ $route.params.seq }}</code>

    <div v-if="selectedLedgerFetched">
      <div v-if="selectedLedger.error">
        <JsonRenderer :data="selectedLedger" />
      </div>
      <div v-else>
        <div class="mb-3">
          <span class="badge bg-purple me-2">chain_id: {{ selectedLedger.chain_id }}</span>
          <span class="badge bg-purple">{{ selectedLedger.chain_name }}</span>
        </div>

        <JsonRenderer :data="ledgerHeader" />

        <div v-if="selectedLedger.ledger && selectedLedger.ledger.outer_checkpoint_seq" class="mt-3">
          <small class="text-muted">Outer chain checkpoint:</small>
          <router-link :to="'/' + String(selectedLedger.ledger.outer_checkpoint_seq)" class="ms-2 fw-bold">
            Ledger {{ selectedLedger.ledger.outer_checkpoint_seq }}
          </router-link>
        </div>

        <h3 class="fw-bold h4 mt-4">Transactions <span class="badge bg-purple">{{ selectedLedger.tx_count || 0 }}</span></h3>
        <div v-if="transactionList && transactionList.length > 0">
          <JsonRenderer :data="transactionList" />
        </div>
        <div v-else>
          <p class="text-muted">No transactions in this ledger.</p>
        </div>
      </div>
    </div>
    <div v-else>
      <Loading />
    </div>
  </main>
</template>

<script>
import JsonRenderer from '../components/JsonRenderer.vue'
import Loading from '../components/Loading.vue'

export default {
  name: 'InnerLedger',
  components: {
    JsonRenderer,
    Loading
  },
  computed: {
    selectedLedger () {
      return this.$innerChain.getInnerLedger(this.$route.params.seq)
    },
    selectedLedgerFetched () {
      const keys = Object.keys(this.selectedLedger || {})
      return keys.indexOf('ledger') > -1 || keys.indexOf('error') > -1
    },
    ledgerHeader () {
      if (!this.selectedLedger || !this.selectedLedger.ledger) return {}
      const l = this.selectedLedger.ledger
      const header = {
        seq: l.seq,
        hash: l.hash,
        parent_hash: l.parent_hash,
        state_hash: l.state_hash,
        tx_hash: l.tx_hash,
        close_time_agree: l.close_time_agree
      }
      if (l.outer_checkpoint_seq) {
        header.outer_checkpoint_seq = l.outer_checkpoint_seq
        header.outer_checkpoint_hash = l.outer_checkpoint_hash
      }
      return header
    },
    transactionList () {
      if (!this.selectedLedger || !this.selectedLedger.transactions) return []
      return this.selectedLedger.transactions.map(tx => ({
        hash: tx.hash,
        type: tx.type,
        source: tx.source,
        destination: tx.destination,
        amount: tx.amount,
        sequence: tx.sequence
      }))
    }
  },
  watch: {
    '$route.params.seq' () {
      this.$innerChain.hydrate(this.$route.params.seq)
    }
  },
  mounted () {
    this.$innerChain.hydrate(this.$route.params.seq)
  }
}
</script>

<style lang="scss" scoped>
</style>
