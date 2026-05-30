<template>
  <nav class="navbar navbar-expand-lg fixed-top navbar-dark" style="background: #0a0e1a; border-bottom: 1px solid #1e293b;" aria-label="Main navigation">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">
        <span class="brand-text">XRPL <small>Explorer</small></span>
      </router-link>

      <form class="d-flex ms-auto" @submit="search">
        <input v-model="query" class="form-control py-0 me-2" type="search" placeholder="Search ledger, tx, account..." aria-label="Search" style="min-width: 280px;">
        <button :disabled="!validQuery" type="submit" class="nes-btn py-0 px-3" :class="{'is-success': validQuery, 'is-disabled': !validQuery}">Search</button>
      </form>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Header',
  data () {
    return {
      query: ''
    }
  },
  computed: {
    validQuery () {
      const commands = this.$router.options.routes.filter(r => {
        return r?.meta?.isPublicCommand && r.name.slice(0, 1) !== '_'
      }).map(r => r.name.split('_').slice(1).join('_'))

      const query = this.query.trim()

      if (query.length < 2) {
        return false
      }

      if (query.match(/^[A-F0-9]{16}/i)) {
        return query
      }
      if (query.match(/^r[a-zA-Z0-9]{15,}/)) {
        return query
      }
      if (query.match(/^[a-fA-F0-9]{64}/)) {
        return query
      }
      if (query.match(/^[0-9]{1,}/) && Number(query) >= 1) {
        return query
      }
      const possibleCommands = commands.filter(c => c.match(query.toLowerCase()))
      if (possibleCommands.length > 0) {
        return possibleCommands
      }

      return false
    }
  },
  methods: {
    search (e) {
      e.preventDefault()
      let navTo
      const navQuery = {}

      if (this.validQuery && typeof this.validQuery === 'string') {
        navTo = '/' + this.validQuery
      }
      if (this.validQuery && Array.isArray(this.validQuery) && this.validQuery.length > 0) {
        if (this.validQuery.length === 1) {
          navTo = '/' + this.validQuery[0]
        }
        if (this.validQuery.length > 1) {
          navTo = '/command'
          Object.assign(navQuery, {
            c: this.validQuery
          })
        }
      }
      if (
        navTo &&
        (
          this.$route.path !== navTo ||
          JSON.stringify(navQuery) !== JSON.stringify(this?.$route?.query || {})
        ) &&
        !(
          JSON.stringify(navQuery) === JSON.stringify(this?.$route?.query || {}) &&
          this.$route.path === navTo
        )
      ) {
        this.$router[Object.keys(navQuery).length > 0 ? 'replace' : 'push']({
          path: navTo,
          query: navQuery
        })
      }
      return false
    }
  }
}
</script>

<style lang="scss" scoped>
  .navbar {
    padding: 0.5rem 1rem;
  }
  .brand-text {
    font-weight: 600;
    font-size: 1.1rem;
    color: #38bdf8;
    text-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
    letter-spacing: 0.05em;

    small {
      color: #64748b;
      font-weight: 400;
    }
  }
</style>
