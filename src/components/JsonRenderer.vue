<template>
  <div>
    <vue-json-pretty
      ref="json"
      :show-length="true"
      :collapsed-on-click-brackets="true"
      :show-line="true"
      :show-double-quotes="false"
      :data="formatted ? dataFormatted : data"
      :deep="2"
      @node-click="click"
    >
    <template #nodeValue="{ node, defaultValue }">
      <!-- Xahau Burn 2 Mint -->
      <template v-if="node.key === 'Blob' && data?.TransactionType === 'Import'">
        <div class="value d-inline-block">
          <small @click="toggle(node.path)" class="px-1 alert alert-warning text-dark py-0 mb-1 d-block">Click key to display &amp; toggle between HEX and JSON + Binary Decoded view</small>
          <span v-if="formatted !== null">{{ defaultValue }}</span>
        </div>
      </template>
      <template v-else>{{ defaultValue }}</template>
    </template>
    <template #nodeKey="{ node, defaultKey }">
      <template v-if="node.key === 'Blob' && data?.TransactionType === 'Import'">
        <span :ref="node.path.replace(/[^a-zA-Z0-9]+/g, '')" @click="toggle(node.path)"><u class="text-primary">{{ defaultKey }}</u></span>
      </template>
      <template v-else>{{ defaultKey }}</template>
    </template>
  </vue-json-pretty>
  </div>
</template>

<script>
// TODO: MEMO decoding, etc.

import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { hookHashToLedgerObjectHash } from '../plugins/helpers'
// import { decode, decodeLedgerData } from 'ripple-binary-codec'
import { decode } from 'ripple-binary-codec'

const RIPPLE_EPOCH_DIFF = 0x386d4380
function rippleTimeToUnixTime (rpepoch) {
  return (rpepoch + RIPPLE_EPOCH_DIFF) * 1000
}

export default {
  name: 'JsonRenderer',
  props: ['data'],
  components: {
    VueJsonPretty
  },
  data () {
    const modifiedData = {}
    console.log(this.data)
    if (this.data?.date) {
      Object.assign(modifiedData, {
        date: new Date(rippleTimeToUnixTime(this.data?.date)).toISOString()
      })
    }
    return Object.assign({}, {
      formatted: modifiedData
    })
  },
  computed: {
    dataFormatted () {
      const modifiedData = {}
      if (this.data?.TransactionType === 'Import') {
        if (this.data?.Blob) {
          Object.assign(modifiedData, {
            Blob: JSON.parse(
              Buffer.from(this.data.Blob, 'hex')
                .toString()
                /**
                 * Now going to replace embedded contents like binary encoded & JSON data
                 */
                .replace(/"[A-F0-9]{129,}"/g, r => { // Making sure it's > 128 (signature)
                  try {
                    const hex = r.slice(1, -1)
                    return JSON.stringify(decode(hex))
                  } catch (e) {
                    //
                  }
                  return r
                })
                .replace(/"ey[a-zA-Z0-9=/+]{30,}"/g, r => { // {"... (JSON Start) is always ^ey... in base64
                  try {
                    const base64 = r.slice(1, -1)
                    return Buffer.from(base64, 'base64').toString()
                  } catch (e) {
                    //
                  }
                  return r
                })
                .replace(/"JAAAAA[a-zA-Z0-9=/+]{30,}"/g, r => { // {"... (Manifest Start) is always ^JAAAAA... in base64
                  try {
                    const base64 = r.slice(1, -1)
                    // Manifests can be decoded from base64 and then decoded with Binary Codec
                    // return Buffer.from(base64, 'base64').toString('hex')
                    return JSON.stringify(decode(Buffer.from(base64, 'base64').toString('hex')))
                  } catch (e) {
                    //
                  }
                  return r
                })
            )
          })
        }
      }
      console.log(this.data)
      if (this.data?.TransactionType === 'Batch') {
        if (this.data?.meta?.BatchExecutions) {
          this.data.meta.BatchExecutions.forEach(execution => {
            if (execution.BatchExecution?.InnerResult) {
              execution.BatchExecution.InnerResult = Buffer.from(execution.BatchExecution.InnerResult, 'hex').toString()
            }
          })
        }
      }

      return Object.assign({}, {
        ...this.data,
        ...modifiedData
      })
    }
  },
  methods: {
    toggle (ref) {
      // const _ref = ref.replace(/[^a-zA-Z0-9]+/g, '')
      // this.$refs?.[_ref]
      this.formatted = !this.formatted
    },
    click (event) {
      const value = event.content
      const fieldName = event.path.split('.').reverse()[0].toLowerCase()
      // console.log('JSON click event', event, fieldName, value)

      let newRoute

      if (String(value).match(/^r[a-zA-Z0-9]{15,}/)) {
        // Account
        newRoute = '/' + value
      }

      if (String(value).match(/^[a-zA-Z0-9]{16}$/)) {
        // CTID
        newRoute = '/' + value
      }

      if (String(value).match(/^[a-fA-F0-9]{64}$/) && !fieldName.match(/signature|marker|account_hash|transaction_hash/i)) {
        // Hash
        if (fieldName === 'hookhash' || fieldName === 'emithookhash') {
          newRoute = '/' + hookHashToLedgerObjectHash(value)
        } else {
          newRoute = '/' + value
        }
      }
      if (String(value).match(/^[0-9]{1,}$/) && Number(value) >= 1 && Number(value) <= this.$ws.getState().ledger.last) {
        // Ledger Index
        if (!fieldName.match(/sequence/)) {
          newRoute = '/' + value
        }
      }

      if (fieldName.match(/namespace/) && this.data?.Account) {
        // Hook Namespace
        newRoute = '/account_namespace/' + this.data.Account + '/' + value
        console.log('Hook Namespace', { newRoute })
      }

      // if (fieldName.toLowerCase() === 'blob' && String(value).match(/^[a-fA-F0-9]{10,}$/) && this.data?.TransactionType === 'Import') {
      //   console.log('Proof of Burn', { newRoute })
      // }

      if (fieldName.match(/hookstate|nftokenid/)) {
        return
      }

      if (newRoute) {
        // Check if not there yet
        if (this.$router.currentRoute.path !== newRoute) {
          console.log('Navigate', this.$router.currentRoute.path, newRoute)
          this.$router.push(newRoute)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

<style lang="scss">
.vjs-tree {
  font-family: 'Source Code Pro', monospace;
  font-size: 13px;
  color: #e2e8f0;
  background-color: transparent;
}
.vjs-tree-node {
  &:hover { background-color: rgba(56, 189, 248, 0.04); }
  &.is-highlight { background-color: rgba(56, 189, 248, 0.08); }
}
.vjs-key { color: #38bdf8; }
.vjs-value__string, .vjs-value-string { color: #34d399; }
.vjs-value__number, .vjs-value-number { color: #fbbf24; }
.vjs-value__boolean, .vjs-value-boolean { color: #a78bfa; }
.vjs-value__null, .vjs-value-null { color: #f87171; }
.vjs-comment { color: #64748b; }
.vjs-tree-brackets { color: #64748b; &:hover { color: #38bdf8; } }
.vjs-tree-node .vjs-indent-unit.has-line { border-left-color: #1e293b; }
.vjs-carets { color: #64748b; &:hover { color: #38bdf8; } }
.vjs-colon { color: #64748b; }
.vjs-value { cursor: pointer; &:hover { text-decoration: underline; text-decoration-color: rgba(56, 189, 248, 0.3); } }
</style>
