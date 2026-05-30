<template>
  <div id="app" class="pb-4">
    <Header />
    <LedgerNav />
    <InnerLedgerNav />
    <router-view/>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import LedgerNav from './components/LedgerNav.vue'
import InnerLedgerNav from './components/InnerLedgerNav.vue'

export default {
  name: 'App',
  components: {
    Header,
    LedgerNav,
    InnerLedgerNav
    // Sample
  },
  mounted () {
  }
}
</script>

<style lang="scss">
  html, body {
    overflow-x: hidden;
    font-family: 'Source Code Pro', monospace;
    background-color: #0a0e1a;
    color: #e2e8f0;

    .nes {
      font-family: 'Source Code Pro', monospace;
    }

    pre, .pre {
      font-family: 'Source Code Pro', monospace;
      font-weight: 600;
      color: #e2e8f0;
    }
  }

  body {
    padding-top: calc(56px + 5.5rem + 1em);
    color: #e2e8f0;

    // Color utilities
    .blue { color: #38bdf8; text-shadow: 0 0 10px rgba(56, 189, 248, 0.3); }
    .blue-border { border-color: #38bdf8; }
    .blue-highlight { color: #7dd3fc; }
    .bg-blue { background-color: #38bdf8; color: #0a0e1a; }
    .bg-purple { background-color: #a78bfa; color: #0a0e1a; }
    .bg-navy { background-color: #0a0e1a; color: #e2e8f0; }
    .bg-orange { background-color: #fb923c; color: #0a0e1a; }
    .bg-yellow { background-color: #fbbf24; color: #0a0e1a; }

    .bg-card { background-color: #0C1637; }
    .bg-card-header { background-color: #111d3a; }
    .bg-light-card { background-color: #0C1637; }
    .bg-light-card-header { background-color: #111d3a; }

    // Bootstrap dark overrides
    .text-primary { color: #38bdf8 !important; }
    .text-muted { color: #64748b !important; }
    .text-dark { color: #e2e8f0 !important; }
    a { color: #38bdf8; &:hover { color: #7dd3fc; } }

    .card { background-color: #0C1637; border: 1px solid #1e293b; color: #e2e8f0; }
    .card-header { background-color: #111d3a; border-bottom: 1px solid #1e293b; color: #e2e8f0; }
    .card-body { background-color: #0C1637; color: #e2e8f0; }

    .alert-success { background-color: rgba(52, 211, 153, 0.1); border-color: rgba(52, 211, 153, 0.3); color: #34d399; }
    .alert-warning { background-color: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.3); color: #fbbf24; }

    .dropdown-menu { background-color: #111d3a; border: 1px solid #1e293b; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); }
    .dropdown-item { color: #e2e8f0; &:hover, &:focus { background-color: rgba(56, 189, 248, 0.1); color: #38bdf8; } }

    .form-control {
      background-color: #111d3a; border-color: #1e293b; color: #e2e8f0;
      &::placeholder { color: #64748b; }
      &:focus { background-color: #111d3a; border-color: #38bdf8; box-shadow: 0 0 0 0.15rem rgba(56, 189, 248, 0.25); color: #e2e8f0; }
    }

    .bg-light { background-color: #0C1637 !important; }
    .bg-body { background-color: #0a0e1a !important; }
    .bg-white { background-color: #111d3a !important; }
    .shadow { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4) !important; }
    .shadow-sm { box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3) !important; }
    .border-dark { border-color: #1e293b !important; }

    .badge { font-family: 'Source Code Pro', monospace; }
    .badge.bg-info { background-color: #38bdf8 !important; }
    .badge.bg-purple { background-color: #a78bfa !important; color: #0a0e1a !important; }

    // NES button replacements
    .nes-btn, [class*="nes-btn"] {
      font-family: 'Source Code Pro', monospace;
      font-size: 0.85rem;
      background: transparent;
      border: 1px solid #38bdf8;
      color: #38bdf8;
      border-radius: 4px;
      padding: 0.25rem 0.75rem;
      cursor: pointer;
      transition: all 0.15s ease;
      &:hover { background: rgba(56, 189, 248, 0.1); }
      &.is-success { border-color: #34d399; color: #34d399; &:hover { background: rgba(52, 211, 153, 0.1); } }
      &.is-warning { border-color: #fbbf24; color: #fbbf24; &:hover { background: rgba(251, 191, 36, 0.1); } }
      &.is-primary { border-color: #38bdf8; color: #38bdf8; }
      &.is-disabled { border-color: #64748b; color: #64748b; cursor: not-allowed; opacity: 0.5; }
    }

    h1, h2, h3, h4, h5 { font-family: 'Source Code Pro', monospace; font-weight: 600; }

    code {
      color: #38bdf8;
      background-color: rgba(56, 189, 248, 0.08);
      padding: 0.1em 0.4em;
      border-radius: 3px;
    }

    // Nav bars
    .nav-v-scroller {
      position: fixed; top: 56px; z-index: 2; height: 2.75rem; overflow-y: hidden;
      .nav { display: flex; flex-wrap: nowrap; padding-bottom: 1rem; margin-top: -1px; overflow-x: auto; color: rgba(255,255,255,.75); text-align: center; white-space: nowrap; -webkit-overflow-scrolling: touch; }
    }
    .nav-scroller {
      position: fixed; top: 60px; z-index: 2; height: 2.75rem; overflow-y: hidden;
      .nav { display: flex; flex-wrap: nowrap; padding-bottom: 1rem; margin-top: -1px; overflow-x: auto; color: rgba(255,255,255,.75); text-align: center; white-space: nowrap; -webkit-overflow-scrolling: touch; }
    }
    .nav-underline .nav-link {
      padding-top: .75rem; padding-bottom: .75rem; font-size: .875rem; color: #64748b;
      &:hover { color: #38bdf8; }
      .active { font-weight: 500; color: #e2e8f0; }
    }

    .text-white-50 { color: rgba(255, 255, 255, .5); }

    // Scrollbar
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: #0a0e1a; }
    ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; &:hover { background: #334155; } }
  }

  @media (max-width: 991.98px) {
    .offcanvas-collapse {
      position: fixed; top: 56px; bottom: 0; left: 100%; width: 100%;
      padding-right: 1rem; padding-left: 1rem; overflow-y: auto; visibility: hidden;
      background-color: #0C1637; transition: transform .3s ease-in-out, visibility .3s ease-in-out;
      &.open { visibility: visible; transform: translateX(-100%); }
    }
  }
</style>
