/* global _, Vue, moment, LNbits, EventHub, decryptLnurlPayAES */

Vue.component('lnbits-fsat', {
  props: {
    amount: {
      type: Number,
      default: 0
    }
  },
  template: '<span>{{ fsat }}</span>',
  computed: {
    fsat: function () {
      return LNbits.utils.formatSat(this.amount)
    }
  }
})

Vue.component('lnbits-wallet-list', {
  data: function () {
    return {
      user: null,
      activeWallet: null,
      activeBalance: [],
      showForm: false,
      walletName: ''
    }
  },
  template: `
    <q-list v-if="user && user.wallets.length" dense class="lnbits-drawer__q-list">
      <q-item-label header>Wallets</q-item-label>
      <q-item v-for="wallet in wallets" :key="wallet.id"
        clickable
        :active="activeWallet && activeWallet.id === wallet.id"
        tag="a" :href="wallet.url">
        <q-item-section side>
          <q-avatar size="md"
            :color="(activeWallet && activeWallet.id === wallet.id)
              ? (($q.dark.isActive) ? 'deep-purple-5' : 'deep-purple')
              : 'grey-5'">
            <q-icon name="flash_on" :size="($q.dark.isActive) ? '21px' : '20px'"
              :color="($q.dark.isActive) ? 'blue-grey-10' : 'grey-3'"></q-icon>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label lines="1">{{ wallet.name }}</q-item-label>
          <q-item-label caption>{{ wallet.live_fsat }} sat</q-item-label>
        </q-item-section>
        <q-item-section side v-show="activeWallet && activeWallet.id === wallet.id">
          <q-icon name="chevron_right" color="grey-5" size="md"></q-icon>
        </q-item-section>
      </q-item>
      <q-item clickable @click="showForm = !showForm">
        <q-item-section side>
          <q-icon :name="(showForm) ? 'remove' : 'add'" color="grey-5" size="md"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label lines="1" class="text-caption">Add a wallet</q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="showForm">
        <q-item-section>
          <q-form @submit="createWallet">
            <q-input filled dense v-model="walletName" label="Name wallet *">
              <template v-slot:append>
                <q-btn round dense flat icon="send" size="sm" @click="createWallet" :disable="walletName === ''"></q-btn>
              </template>
            </q-input>
          </q-form>
        </q-item-section>
      </q-item>
    </q-list>
  `,
  computed: {
    wallets: function () {
      var bal = this.activeBalance
      return this.user.wallets.map(function (obj) {
        obj.live_fsat =
          bal.length && bal[0] === obj.id
            ? LNbits.utils.formatSat(bal[1])
            : obj.fsat
        return obj
      })
    }
  },
  methods: {
    createWallet: function () {
      LNbits.href.createWallet(this.walletName, this.user.id)
    },
    updateWalletBalance: function (payload) {
      this.activeBalance = payload
    }
  },
  created: function () {
    if (window.user) {
      this.user = LNbits.map.user(window.user)
    }
    if (window.wallet) {
      this.activeWallet = LNbits.map.wallet(window.wallet)
    }
    EventHub.$on('update-wallet-balance', this.updateWalletBalance)
  }
})

Vue.component('lnbits-extension-list', {
  data: function () {
    return {
      extensions: [],
      user: null
    }
  },
  template: `
    <q-list v-if="user && extensions.length" dense class="lnbits-drawer__q-list">
      <q-item-label header>Extensions</q-item-label>
      <q-item v-for="extension in userExtensions" :key="extension.code"
        clickable
        :active="extension.isActive"
        tag="a" :href="[extension.url, '?usr=', user.id].join('')">
        <q-item-section side>
          <q-avatar size="md"
            :color="(extension.isActive)
              ? (($q.dark.isActive) ? 'deep-purple-5' : 'deep-purple')
              : 'grey-5'">
            <q-icon :name="extension.icon" :size="($q.dark.isActive) ? '21px' : '20px'"
              :color="($q.dark.isActive) ? 'blue-grey-10' : 'grey-3'"></q-icon>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label lines="1">{{ extension.name }}</q-item-label>
        </q-item-section>
        <q-item-section side v-show="extension.isActive">
          <q-icon name="chevron_right" color="grey-5" size="md"></q-icon>
        </q-item-section>
      </q-item>
      <q-item clickable tag="a" :href="['/extensions?usr=', user.id].join('')">
        <q-item-section side>
          <q-icon name="clear_all" color="grey-5" size="md"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label lines="1" class="text-caption">Manage extensions</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  `,
  computed: {
    userExtensions: function () {
      if (!this.user) return []

      var path = window.location.pathname
      var userExtensions = this.user.extensions

      return this.extensions
        .filter(function (obj) {
          return userExtensions.indexOf(obj.code) !== -1
        })
        .map(function (obj) {
          obj.isActive = path.startsWith(obj.url)
          return obj
        })
    }
  },
  created: function () {
    if (window.extensions) {
      this.extensions = window.extensions
        .map(function (data) {
          return LNbits.map.extension(data)
        })
        .sort(function (a, b) {
          return a.name.localeCompare(b.name)
        })
    }

    if (window.user) {
      this.user = LNbits.map.user(window.user)
    }
  }
})
Vue.component('lnbits-settings-list', {
  data: function () {
    return {
      extensions: [],
      user: null,
      walletModeVal: localStorage.wallet_mode === 'true' || false,
      maximizedToggle: true,
      walletBalance: window.wallet[window.wallet.length -1]+' sat'
    }
  },
  template: `
      <q-list dense class="lnbits-drawer__q-list">
        <q-item-label header>Settings</q-item-label>
        <q-item>
          <div class="row items-center xs" style="margin-top: -20px;">
            <q-icon name="account_balance_wallet" class="text-grey-5" style="font-size:32px;"/>
            <div class="q-ml-sm q-item__label text-caption ellipsis">Wallet Mode</div>
            <div class="q-pa-md">
              <div class="q-gutter-sm">
                <q-checkbox v-model="walletModeVal"/>
              </div>
              <div class="q-px-sm">
              </div>
            </div>
            <q-icon name="settings" class="cursor-pointer"/>
          </div>
        </q-item>
        <q-dialog
          v-model="walletModeVal"
          persistent
          :maximized="maximizedToggle"
          transition-show="slide-up"
          transition-hide="slide-down"
        >
          <q-card class="text-white" 
          style="
            background: inherit;
            backdrop-filter: blur(20px);
          ">
            <q-bar class="fixed-bottom row justify-center q-mb-lg " style="background:inherit;">
              <q-btn dense flat icon="more_vert" @click="domClick('side')" style="font-size: 1.5rem;"></q-btn>
              <q-space></q-space>
              <q-btn dense flat icon="content_paste" @click="domClick('paste')" style="font-size: 1.5rem;"></q-btn>
              <q-space></q-space>
              <q-btn dense flat icon="create" @click="domClick('create')" style="font-size: 1.5rem;"></q-btn>
              <q-space></q-space>
              <q-btn dense flat icon="camera" @click="domClick('camera')" style="font-size: 1.5rem;"></q-btn>
            </q-bar>
            <q-card-section class="q-mt-lg">
              <div class="text-h3 text-center">{{walletBalance}}</div>
            </q-card-section>

            <q-card-section class="q-pt-none row justify-center">
              <div style="
              background-color: white;
              height: 10px;
              border-radius: 20px;
              width: 50px;
            "></div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-list>
  `,
  methods:{
    domClick: (el) =>{
      const getEl = (elem)=>{
        return document.querySelectorAll(elem)
      }
      el == 'side' && [...getEl('.q-btn__content i')].filter(el => el.textContent == 'menu')[0].click()
      el == 'paste' && [...getEl('.q-btn__content')].filter(el => el.textContent == 'Paste Request')[0].click()
      el == 'create' && [...getEl('.q-btn__content')].filter(el => el.textContent == 'Create Invoice')[0].click()
      el == 'camera' && [...getEl('.q-btn__content i')].filter(el => el.textContent == 'photo_camera')[0].click()
    }
  },
  watch:{
    walletModeVal:(val)=>{
      document.querySelector('.q-drawer__backdrop')?.click()
      localStorage.wallet_mode = val
      setTimeout(_=> document.querySelector('.q-dialog').style.zIndex = 2000,300)
    }
  },
  mounted(){
    this.walletBalance = window.wallet[window.wallet.length -1]+' sat' 
    document.querySelector('.q-dialog') && setTimeout(_=> document.querySelector('.q-dialog').style.zIndex = 2000,300)
  }
})

Vue.component('lnbits-payment-details', {
  props: ['payment'],
  template: `
    <div class="q-py-md" style="text-align: left">
      <div class="row justify-center q-mb-md">
        <q-badge v-if="hasTag" color="yellow" text-color="black">
          #{{ payment.tag }}
        </q-badge>
      </div>
      <div class="row">
        <div class="col-3"><b>Date</b>:</div>
        <div class="col-9">{{ payment.date }} ({{ payment.dateFrom }})</div>
      </div>
      <div class="row">
        <div class="col-3"><b>Description</b>:</div>
        <div class="col-9">{{ payment.memo }}</div>
      </div>
      <div class="row">
        <div class="col-3"><b>Amount</b>:</div>
        <div class="col-9">{{ (payment.amount / 1000).toFixed(3) }} sat</div>
      </div>
      <div class="row">
        <div class="col-3"><b>Fee</b>:</div>
        <div class="col-9">{{ (payment.fee / 1000).toFixed(3) }} sat</div>
      </div>
      <div class="row">
        <div class="col-3"><b>Payment hash</b>:</div>
        <div class="col-9 text-wrap mono">{{ payment.payment_hash }}</div>
      </div>
      <div class="row" v-if="payment.webhook">
        <div class="col-3"><b>Webhook</b>:</div>
        <div class="col-9 text-wrap mono">
          {{ payment.webhook }}
          <q-badge :color="webhookStatusColor" text-color="white">
            {{ webhookStatusText }}
          </q-badge>
        </div>
      </div>
      <div class="row" v-if="hasPreimage">
        <div class="col-3"><b>Payment proof</b>:</div>
        <div class="col-9 text-wrap mono">{{ payment.preimage }}</div>
      </div>
      <div class="row" v-for="entry in extras">
        <div class="col-3">
          <q-badge v-if="hasTag" color="purple" text-color="white">
            extra
          </q-badge>
          <b>{{ entry.key }}</b>:
        </div>
        <div class="col-9 text-wrap mono">{{ entry.value }}</div>
      </div>
      <div class="row" v-if="hasSuccessAction">
        <div class="col-3"><b>Success action</b>:</div>
        <div class="col-9">
          <lnbits-lnurlpay-success-action
            :payment="payment"
            :success_action="payment.extra.success_action"
          ></lnbits-lnurlpay-success-action>
        </div>
      </div>
    </div>
  `,
  computed: {
    hasPreimage() {
      return (
        this.payment.preimage &&
        this.payment.preimage !==
          '0000000000000000000000000000000000000000000000000000000000000000'
      )
    },
    hasSuccessAction() {
      return (
        this.hasPreimage &&
        this.payment.extra &&
        this.payment.extra.success_action
      )
    },
    webhookStatusColor() {
      return this.payment.webhook_status >= 300 ||
        this.payment.webhook_status < 0
        ? 'red-10'
        : !this.payment.webhook_status
        ? 'cyan-7'
        : 'green-10'
    },
    webhookStatusText() {
      return this.payment.webhook_status
        ? this.payment.webhook_status
        : 'not sent yet'
    },
    hasTag() {
      return this.payment.extra && !!this.payment.extra.tag
    },
    extras() {
      if (!this.payment.extra) return []
      let extras = _.omit(this.payment.extra, ['tag', 'success_action'])
      return Object.keys(extras).map(key => ({key, value: extras[key]}))
    }
  }
})

Vue.component('lnbits-lnurlpay-success-action', {
  props: ['payment', 'success_action'],
  data() {
    return {
      decryptedValue: this.success_action.ciphertext
    }
  },
  template: `
    <div>
      <p class="q-mb-sm">{{ success_action.message || success_action.description }}</p>
      <code v-if="decryptedValue" class="text-h6 q-mt-sm q-mb-none">
        {{ decryptedValue }}
      </code>
      <p v-else-if="success_action.url" class="text-h6 q-mt-sm q-mb-none">
        <a target="_blank" style="color: inherit;" :href="success_action.url">{{ success_action.url }}</a>
      </p>
    </div>
  `,
  mounted: function () {
    if (this.success_action.tag !== 'aes') return null

    decryptLnurlPayAES(this.success_action, this.payment.preimage).then(
      value => {
        this.decryptedValue = value
      }
    )
  }
})
