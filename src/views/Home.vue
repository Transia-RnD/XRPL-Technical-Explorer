<template>
  <main class="container px-3">
    <h4 class="blue">Consensus in Consensus</h4>
    <code>XRPL Technical Explorer</code>

    <div class="mt-4" style="color: #94a3b8;">
      Dual-chain explorer for the embedded rollup PoC. L1 (outer chain) closes every ~3-4s, L2 (inner chain) closes every ~1s.
    </div>

    <div class="mt-4">
      <div class="info-card p-3 rounded">
        <b style="color: #38bdf8;">Click a ledger</b> from either chain above to view the full JSON response.
        Use <b style="color: #38bdf8;">search</b> to look up ledger indices, transaction hashes, or accounts.
      </div>
    </div>

    <div class="mt-4" style="color: #475569;">
      Waiting for ledgers to stream in...
    </div>
  </main>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style lang="scss" scoped>
  .info-card {
    background: #0C1637;
    border: 1px solid #1e293b;
    border-left: 3px solid #34d399;
    color: #94a3b8;
  }
</style>
