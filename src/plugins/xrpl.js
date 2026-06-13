import { XrplClient } from 'xrpl-client'

// Resolve the WS endpoint, allowing a runtime override via the URL:
//   /ws:HOST:PORT        -> connect to ws://HOST:PORT  (persisted, sticky)
//   /ws:wss://HOST:PORT  -> explicit scheme honoured
//   /ws:local            -> clear override, fall back to VUE_APP_WSS_ENDPOINT
// The override is stored in localStorage so it survives reloads/navigation,
// and the /ws: prefix is stripped from the URL so the router lands on Home.
const STORAGE_KEY = 'explorer:endpoint'

function resolveEndpoint () {
  const fallback = String(process?.env?.VUE_APP_WSS_ENDPOINT || '')
  if (typeof window === 'undefined') return fallback

  const match = (window.location.pathname || '').match(/^\/ws:(.+)$/)
  if (match) {
    const raw = decodeURIComponent(match[1]).trim()
    // strip the /ws:... prefix so VueRouter initialises on Home, not the 404 trap
    window.history.replaceState({}, '', '/')

    if (/^(local|default|reset)$/i.test(raw)) {
      window.localStorage.removeItem(STORAGE_KEY)
      return fallback
    }

    const endpoint = /^wss?:\/\//i.test(raw) ? raw : 'ws://' + raw
    window.localStorage.setItem(STORAGE_KEY, endpoint)
    return endpoint
  }

  return window.localStorage.getItem(STORAGE_KEY) || fallback
}

export default {
  async install (Vue, options) {
    const endpoint = resolveEndpoint()
    Vue.prototype.$ws = new XrplClient(endpoint)
    Vue.prototype.$endpoint = endpoint

    const net = {
      xrpl: endpoint === '' || endpoint.match(/xrplcluster|xrpl\.ws|xrpl\.link|s[12]\.ripple\.com/),
      xrpl_test: endpoint.match(/rippletest|\/testnet\.xrpl-labs/),
      xahau: endpoint.match(/xahau.network/),
      xahau_test: endpoint.match(/xahau-test.net/),
      local: endpoint.match(/localhost|127.0.0.1|custom-node|[A-Za-z0-9]+/)
    }

    Vue.prototype.$net = net

    Vue.prototype.$ws.on('ledger', ledger => Vue.prototype.$events.emit('ledger', ledger))
    console.info('Connecting @ `plugins/xrpl`', endpoint)
    await Vue.prototype.$ws.ready()
    const state = Vue.prototype.$ws.getState()
    console.info('Connected @ `plugins/xrpl`', state.server)
    Vue.prototype.$events.emit('connected', state.server.publicKey)
  }
}
