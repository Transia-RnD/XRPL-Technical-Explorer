import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Ledger from '../views/Ledger.vue'
import ResolveHash from '../components/ResolveHash.vue'
import Transaction from '../views/Transaction.vue'
import LedgerEntry from '../views/LedgerEntry.vue'
import Account from '../views/Account.vue'
import NotFound from '../views/NotFound.vue'
import CustomCommand from '../views/CustomCommand.vue'
import B2M from '../views/B2M.vue'
import HookNamespace from '../views/HookNamespace.vue'
import XummPayload from '../views/XummPayload.vue'
import LedgerPayload from '../views/LedgerPayload.vue'
// import Dashboard from '../views/Dashboard.vue'
import MyHook from '../views/MyHook.vue'
import IpfsPayload from '../views/IpfsPayload.vue'
import IpfsViewer from '../views/IpfsViewer.vue'
import IpnsViewer from '../views/IpnsViewer.vue'
import GenericData from '../components/GenericData.vue'
import { groupedCommands } from '../plugins/commands'

const gcom = groupedCommands.flatMap(group => group.items).reduce((acc, item) => {
  acc[item.name] = item.json
  return acc
}, {})

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  // {
  //   path: '/dashboard',
  //   name: 'dashboard',
  //   component: Dashboard
  // },
  {
    path: '/ipfs/payload',
    name: 'ipfs_payload',
    component: IpfsPayload
  },
  {
    path: '/ipfs/viewer/:entry([a-fA-F0-9]{64})',
    name: 'ipfs_viewer',
    component: IpfsViewer
  },
  {
    path: '/ipns/viewer/:entry([a-fA-F0-9]{64})',
    name: 'ipns_viewer',
    component: IpnsViewer
  },
  {
    path: '/wallets/xumm',
    name: 'wallets_xumm',
    component: XummPayload
  },
  {
    path: '/wallets/ledger',
    name: 'wallets_ledger',
    component: LedgerPayload
  },
  {
    path: '/:ledger([0-9]{1,20})',
    name: 'ledger',
    component: Ledger
  },
  {
    path: '/tx/:hash([a-fA-F0-9]{64})',
    name: 'transaction',
    component: Transaction
  },
  {
    path: '/:hash([a-fA-F0-9]{16})', // CTID
    name: 'ctid',
    component: Transaction
  },
  {
    path: '/entry/:hash([a-fA-F0-9]{64})',
    name: 'ledgerentry',
    component: LedgerEntry
  },
  {
    path: '/myhook/:hash([a-fA-F0-9]{64})',
    name: 'myhook',
    component: MyHook
  },
  {
    path: '/:account(r[a-zA-Z0-9]{15,})',
    name: 'account',
    component: Account,
    children: [
      {
        name: 'account_tx',
        path: 'tx',
        component: GenericData,
        meta: {
          title: 'Transactions',
          element: 'transactions',
          map: 'tx'
        }
      },
      {
        name: 'account_lines',
        path: 'lines',
        component: GenericData,
        meta: {
          title: 'Account (Trust) Lines',
          element: 'lines',
          map: ''
        }
      },
      {
        name: 'account_nfts',
        path: 'nfts',
        component: GenericData,
        meta: {
          title: 'Account NFTs',
          element: 'account_nfts',
          map: ''
        }
      },
      {
        name: 'account_objects',
        path: 'objects',
        component: GenericData,
        meta: {
          title: 'Account (Ledger) Objects',
          element: 'account_objects',
          map: ''
        }
      },
      {
        name: 'account_offers',
        path: 'offers',
        component: GenericData,
        meta: {
          title: 'Account (DEX) Offers',
          element: 'offers',
          map: ''
        }
      },
      {
        path: '/account_namespace/:account(r[a-zA-Z0-9]{15,})/:namespace_id([a-fA-F0-9]{64})',
        name: 'account_namespace',
        component: HookNamespace
      }
    ]
  },
  {
    path: '/:hash([a-fA-F0-9]{64})',
    name: 'hash',
    component: ResolveHash
  },
  {
    path: '/command',
    name: 'custom_command',
    component: CustomCommand
  },
  ...groupedCommands.flatMap((group) => group.items.map(command => {
    return {
      path: '/' + command.name,
      name: 'command_' + command.name,
      component: CustomCommand,
      meta: {
        isPublicCommand: true,
        template: gcom[command.name]
      }
    }
  })),
  {
    path: '/b2m',
    name: 'b2m',
    component: B2M
  },
  {
    path: '/404',
    alias: '*',
    name: 'notfound',
    component: NotFound
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
