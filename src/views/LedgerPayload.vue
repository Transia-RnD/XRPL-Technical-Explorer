<template>
  <main class="container-fluid pb-5">
    <div class="row">
      <div class="col-9">
        <div v-if="possibleCommands.length > 0">
          <h4 class="nes blue">Ledger Payload</h4>
          <code class="text-primary nes">Pick one</code>
          <p class="pt-3">
            Which one are you looking for?
          </p>
          <ul class="list-unstyled">
            <li v-for="entry in possibleCommands" v-bind:key="entry">
              <router-link :to="'/' + entry" class="nes-btn py-0 mb-3 nes is-warning">{{ entry }}</router-link>
            </li>
          </ul>
        </div>
        <div v-else>
          <h4 class="nes blue">
            <a class="nes-btn is-warning float-end btn-sm py-1" :href="'https://docs.xumm.dev/'" target="_blank"><i style="position: relative; top: -2px;" class="fas fa-external-link-alt me-2"></i><code class="d-none text-primary pe-2">Ledger Payload</code>Docs</a>
          </h4>
          <code class="text-primary nes">Ledger Payload</code>
          <div class="mt-3">
            <div class="rounded" style="overflow: hidden;">
              <codemirror v-model="command" :options="cmOptions"></codemirror>
            </div>
            <div class="d-block text-end">
              <button @click="prepare()" :disabled="loading" :class="{ 'is-success': !loading, 'is-disabled': loading }" class="m-3 nes-btn nes"><i class="fas fa-rocket-launch me-2" style="position: relative; top: -3px"></i>Refresh</button>
              <button @click="get()" :disabled="loading" :class="{ 'is-success': !loading, 'is-disabled': loading }" class="m-3 nes-btn nes"><i class="fas fa-rocket-launch me-2" style="position: relative; top: -3px"></i>Execute</button>
              <button @click="toggleSubmit()" :class="{ 'is-success': submit, 'is-disabled': loading }" class="m-3 nes-btn nes">{{ submit ? 'Submit: ON' : 'Submit: OFF' }}</button>
            </div>
            <div class="mt-2">
              <Loading v-if="loading" />
              <div :class="{ 'border-danger': errorResponse }" class="card mt-4 shadow-sm" v-if="!loading && Object.keys(data).length > 0">
                <h5 :class="{ 'bg-danger text-white': errorResponse }" class="card-header nes h6">{{ errorResponse ? 'Error' : 'Results' }}</h5>
                <div class="card-body" style="overflow-x: auto;">
                  <JsonRenderer :data="data" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-3 scrollable-section">
        <div class="list-group">
          <div v-if="accounts.length > 0">
            <h5 class="nes blue">Select an Account</h5>
            <ul class="list-unstyled">
              <li v-for="(account, index) in accounts" :key="account">
                <button
                  @click="selectAccount(index)"
                  class="nes-btn py-0 mb-2"
                  :class="{ 'is-success': deriveIndex === index }"
                >
                  {{ index }}: {{ account.substring(0, 10) }}...
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import Xrp from '@ledgerhq/hw-app-xrp'
import { codemirror } from 'vue-codemirror'
import Loading from '../components/Loading.vue'
import JsonRenderer from '../components/JsonRenderer.vue'

import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/addon/lint/lint.css'
import jsonlint from 'jsonlint-mod'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/json-lint.js'
import 'codemirror/keymap/sublime.js'
import { encode } from 'ripple-binary-codec'

window.jsonlint = jsonlint

export default {
  name: 'CustomCommand',
  components: {
    codemirror,
    JsonRenderer,
    Loading
  },
  data () {
    return {
      command: '',
      cmOptions: {
        tabSize: 2,
        mode: 'application/json',
        theme: 'monokai',
        lineNumbers: true,
        line: true,
        keymap: 'sublime',
        lineWrapping: false,
        lint: true
      },
      loading: false,
      publicKey: null,
      selectedAccount: null,
      deriveIndex: 0,
      accounts: [],
      data: {},
      errorResponse: false,
      submit: true
    }
  },
  computed: {
    paramToTemplate () {
      return this.$route.meta?.replaceProp && this.$route.meta?.replaceParam && this.$route.params?.[this.$route.meta.replaceParam]
    },
    possibleCommands () {
      if (this.$route?.query?.c) {
        return this.$router.options.routes.filter(r => {
          return r?.meta?.isPublicCommand
        }).map(r => r.name.split('_').slice(1).join('_')).filter(r => this.$route.query.c.indexOf(r) > -1).sort()
      }

      return []
    },
    commandName () {
      return this.$route.name.split('_').slice(1).join('_')
    }
  },
  methods: {
    async prepare () {
      try {
        this.loading = true
        await this.listAccounts()
        this.data = {}
        this.loading = false
        this.errorResponse = false
      } catch (error) {
        this.data = { error: error.message }
        this.loading = false
        this.marker = null
        this.errorResponse = true
      }
    },
    async selectAccount (index) {
      this.selectedAccount = this.accounts[index]
      this.deriveIndex = index
      const transport = await TransportWebUSB.create()
      const xrp = new Xrp(transport)
      const { publicKey, address } = await xrp.getAddress(`44'/144'/${this.deriveIndex}'/0/0`, false)
      this.publicKey = publicKey
      this.selectedAccount = address
      this.command = JSON.stringify({
        TransactionType: 'Payment',
        Account: this.selectedAccount,
        Amount: '1000000',
        Destination: 'r223rsyz1cfqPbjmiX6oYu1hFgNwCkWZH'
      }, null, 2)
    },
    async listAccounts () {
      try {
        const transport = await TransportWebUSB.create()
        const xrp = new Xrp(transport)
        const accounts = []
        for (let i = 0; i < 5; i++) {
          const { address } = await xrp.getAddress(`44'/144'/${i}'/0/0`, false)
          accounts.push(address)
        }
        this.accounts = accounts
        this.selectAccount(0)
      } catch (error) {
        console.log(error)
        this.data = { error: error.message }
        this.loading = false
        this.marker = null
        this.errorResponse = true
      }
    },
    async get (marker) {
      this.loading = true
      this.errorResponse = false

      const customCommand = {}
      try {
        Object.assign(customCommand, JSON.parse(this.command))
      } catch (e) {
        this.data = { error: e.message }
        this.loading = false
        this.marker = null
        this.errorResponse = true
        return
      }

      try {
        const transport = await TransportWebUSB.create()
        const xrp = new Xrp(transport)
        const cloneTx = customCommand

        // For Ledger Deprecated Flags
        cloneTx.Flags = 2147483648
        const accountResponse = await this.$ws.send({ command: 'account_info', account: cloneTx.Account })
        if (accountResponse.error) {
          this.data = { error: accountResponse.error }
          this.loading = false
          this.marker = null
          this.errorResponse = true
          return
        }
        cloneTx.Sequence = accountResponse.account_data.Sequence
        cloneTx.NetworkID = this.$ws.serverInfo.result.info.network_id
        cloneTx.LastLedgerSequence = this.$ws.serverInfo.result.info.validated_ledger.seq + 20
        cloneTx.Fee = '0'
        cloneTx.SigningPubKey = ''
        const feeResponse = await this.$ws.send({ command: 'fee', tx_blob: encode(cloneTx) })
        const fTx = { ...cloneTx }
        const { publicKey } = await xrp.getAddress(`44'/144'/${this.deriveIndex}'/0/0`, false)
        fTx.SigningPubKey = publicKey.toUpperCase()
        fTx.Fee = feeResponse.fee_hooks_feeunits
        const signature = await xrp.signTransaction(
          `44'/144'/${this.deriveIndex}'/0/0`,
          encode(fTx)
        )
        fTx.TxnSignature = signature
        if (this.submit) {
          const response = await this.$ws.send({ command: 'submit', tx_blob: encode(fTx) })
          this.loading = false
          this.data = response
        } else {
          this.data = fTx
          this.loading = false
        }
      } catch (error) {
        this.data = { error: error.message }
        this.loading = false
        this.marker = null
        this.errorResponse = true
      }
    },
    toggleSubmit () {
      this.submit = !this.submit
    }
  },
  async mounted () {
    this.prepare()
  }
}
</script>

<style lang="scss" scoped>
</style>
