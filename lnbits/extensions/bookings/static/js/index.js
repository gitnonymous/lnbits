new Vue({
    el: '#vue',
    mixins: [windowMixin],
    data: function () {
      return {
        ST8: {},
        alias:'',
        form:{
            currRates: [{value:'USD', label: 'US Dollar - USD'},{value: 'GBP', label: 'British Pound - GBP'},{value:'EUR', label:'EURO - EUR'}],
            newItem:false,
            items:{
                booking_item:[{label:'table',icon:'restaurant'},{label:'room',icon:'hotel'}],
                table_days:[{label:'M', value: '1'},{label:'T', value: '2'},{label:'W', value: '3'},{label:'T', value: '4'},{label:'F', value: '5'},{label:'S', value: '6'},{label:'S', value: '0'}]
            },
            booking_url:'',
            show: false,
            booking:{
                table: false,
                room: false
            },
            data:{
                wallet: null,
                booking_item: '',
                date:[],
                exdate:[],
                proxyDate:[],
                exproxyDate:[],
                table_days:[]
            }
        },
        table:{
            data:[],
            sort: false,
            edit:{
                table:false,
                room:false,
                show:false,
               
            }
        },
        events:{
            table:{
                columns:[
                { name: 'b1', align: 'left', label: '', field: ''},
                { name: 'title', align: 'left', label: 'Title', field: 'title', sortable: true},
                { name: 'type', align: 'left', label: 'Type', field: 'type', sortable: true },
                { name: 'qty', align: 'left', label: 'Qty', field: 'qty', sortable: true},
                { name: 'date', align: 'left', label: 'Date', field: 'date', sortable: true },
                { name: 'paid', align: 'left', label: 'Paid', field: 'paid', sortable: true },
                { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
                ],
                data:[]
            },
            data:[],
            info:{
                show:false,
                data:{}
            }
        },
        settings:{
            show:false,
            form:{
                data:{}
            },
            data:[]
        }
      }
    },
    watch:{
        form:{
            deep:true,
            handler(val){
                this.formAction(val)
            } 
        }
    },
    methods:{
        async sendFormData(){
            let itemdata = this.table.data.filter(x=> x.id == this.form.data.id)[0]
            let payload, res, data
            this.form.data.id 
            ?   (
                data = {...this.form.data},
                payload = {
                    usr_id: this.g.user.wallets[0].user,
                    id: itemdata.id,
                    wallet: itemdata.wallet,
                    alias: this.alias,
                    display: itemdata.display || false,
                    func: 'updateItem',
                    data
                },
                delete payload.data.wallet,
                payload.data = JSON.stringify(payload.data),
                res = await LNbits.api
                .request('PUT',
                `/bookings/api/v1/items`, 
                this.g.user.wallets[0].inkey,
                payload
                ),
                res.data.success && (
                    this.table.data[this.table.data.findIndex(x=>x.id == itemdata.id)]= this.tableItemsData([payload])[0],
                    this.formReset())
                 )
            :   (
                data = Object.assign({...this.form.data},{booking_item:this.form.data.booking_item.label},{feedback:{stars:0, count:0}}),
                payload = {
                    usr_id: this.g.user.wallets[0].user,
                    wallet: data.wallet,
                    alias: this.alias,
                    display: false,
                    data
                },
                delete payload.data.wallet,
                payload.data = JSON.stringify(payload.data),
                res = await LNbits.api
                .request('POST',
                `/bookings/api/v1/items`, 
                this.g.user.wallets[0].inkey,
                payload
                ),
                res.data.success && (
                    this.table.data.push(this.tableItemsData(res.data.item)[0]),
                    this.formReset()
                    )
                )
        },
        async sendSettingsData(){
            const payload = {
                usr: this.g.user.wallets[0].user,
                data: JSON.stringify(this.settings.form.data)
            }
            const {data} = await LNbits.api
            .request('POST',
            `/bookings/api/v1/settings`, 
            this.g.user.wallets[0].inkey,
            payload
            )
            data.success && (Quasar.plugins.Notify.create({message: data.success, timeout: 3000 }),
            this.settings.show = false
            )
        },
        formAction(val){
            const {data} = val
            data.booking_item && (this.form.booking[data.booking_item.label] = true)
            if(data.booking_item)for(x in this.form.booking){x !== data.booking_item.label && (this.form.booking[x] = false)}
        },
        formReset(p){
            for(x in this.form.booking){this.form.booking[x] = false}
            for(x in this.table.edit){this.table.edit[x] = false}
            this.form.data = JSON.parse(this.ST8.formData)
            this.form.newItem = false
            this.form.show = false
            // p && (this.table.edit[p] = false)
        },
        async updateDisplay(id){
            this.table.data.filter(x=> x.id == id)[0].display = !this.table.data.filter(x=> x.id == id)[0].display
            let payload ={
                id,
                display : this.table.data.filter(x=> x.id == id)[0].display,
                func: 'display'
            }
            const {data} = await LNbits.api
                .request('PUT',
                `/bookings/api/v1/items`, 
                this.g.user.wallets[0].inkey,
                payload
                )
            this.tableRefresh()
        },
        tableRefresh(){
            let hacky = this.table.pagination.rowsPerPage
            this.table.pagination.rowsPerPage = hacky +1
            this.table.pagination.rowsPerPage = hacky
        },
        async deleteBookingItem(id){
            const res = await LNbits.api
            .request('DELETE',
            `/bookings/api/v1/items/${id}`, 
            this.g.user.wallets[0].inkey
            )
            res.data.success && (this.table.data = this.table.data.filter(x=> x.id !== id))
            // delete request to db && filter table data
            
        },
        editBookingItem(id){
            let data = this.table.data.filter(x=> x.id == id)[0]
            this.form.data = {...data}
            this.table.edit.show = true
            this.table.edit[data.booking_item] = true
        },
        tableItemsData(data){
            typeof data !== 'object' && (data = [])
            return data.map(x=>(Object.assign({...JSON.parse(x.data)},{id:x.id},{wallet:x.wallet},{display:x.display})))
        },
        eventsTableData(data){
            if(!data.length)return
            const evtsData = data.map(x=> ({
                id: x.id,
                cus_id: x.cus_id,
                item_id:x.data.item_id,
                name: x.data?.name,
                email:x.data?.email,
                phone: x.data?.phone || null,
                type: x.bk_type,
                title: x.data?.title || 'N/A',
                qty: x.acca,
                paid: x.paid ? 'Paid' : 'Pending',
                date: x.date,
            
            }))
            this.events.table.data = evtsData
        },
        showBookingEvent(id){
            this.events.info.data = this.events.table.data.find(x=> x.id == id)
            this.events.info.show =true
        },
        showSettings(){
            !this.settings.data.length ? '' : this.settings.form.data = {...this.settings.data[0]}
            this.settings.show = true
        },
        noNullEvt(){
            let obj = {...this.events.info.data}
            Object.keys(obj).forEach((k) => obj[k] == null && delete obj[k])
            return obj

        },
        confirm (p) {
            this.$q.dialog({
              title: p.title || 'Confirm',
              message: p.msg || 'Would you like to continue?',
              cancel: true,
              persistent: true
            }).onOk(() => {
              p?.ok == 'deleteBookingItem' && this.deleteBookingItem(p.id)
            }).onOk(() => {
            }).onCancel(() => {
            }).onDismiss(() => {
            })
        },
        tableSort(){
            this.table.sort = !this.table.sort
            this.table.sort 
            ? this.table.data.sort((a,b)=> (a.booking_item.localeCompare(b.booking_item)))
            : this.table.data.sort((a,b)=>  (b.booking_item.localeCompare(a.booking_item)))
        },
        async getCurrencyRates(){
            const data = await(await fetch('https://gist.githubusercontent.com/Fluidbyte/2973986/raw/8bb35718d0c90fdacb388961c98b8d56abc392c9/Common-Currency.json')).json()
            let rates = Object.keys(data), codes
            codes = rates.map(x=> ({value: x, label:`${x} - ${data[x].name}`}))
            this.form.currRates = codes
        },
        init(p){
            const action ={}
            action.loadItems = async () =>{
                const {data} = await LNbits.api
                .request(
                'GET',
                `/bookings/api/v1/items?alias=${this.alias}`,
                this.g.user.wallets[0].inkey
            )
                return data
            }
            action.loadAlias = async ()=>{
                const urlParams = new URLSearchParams(location.search);
                const {data} = await LNbits.api
                .request(
                'GET',
                `/bookings/api/v1/items?usr=${urlParams.get('usr')}`,
                this.g.user.wallets[0].inkey
            )
            return data
            }
            action.loadEvents = async () =>{
                let {data} = await LNbits.api
                .request(
                'GET',
                `/bookings/api/v1/events?alias=${this.alias}`,
                this.g.user.wallets[0].inkey
                )
                data = data.map(x=>(Object.assign({...x},{data:JSON.parse(x.data)})))
                this.events.data = data; this.eventsTableData(data)
                return data
            }
            action.loadSettings = async () =>{
                const urlParams = new URLSearchParams(location.search)
                const {data} = await LNbits.api
                .request(
                'GET',
                `/bookings/api/v1/settings?usr=${urlParams.get('usr')}`,
                this.g.user.wallets[0].inkey
            )
                return data.success
            }
            return action[p.func](p)
        },
        updateProxy (p) {
            p == 'date' &&(
            this.form.data.date?.length ? '' : this.form.data.date = [moment().format('yy/MM/DD')],
            this.form.data.proxyDate = this.form.data.date)
            p == 'exclude' && (
            this.form.data.exdate?.length ? '' : this.form.data.exdate = [moment().format('yy/MM/DD')],
            this.form.data.exproxyDate = this.form.data.exdate)
        },
        save (p) {
            p == 'date' &&(this.form.data.date = this.form.data.proxyDate)
            p == 'exclude' && (this.form.data.exdate = this.form.data.exproxyDate)
        },
        datePickerFormat(p){
            let date_val, choice = {date: 'date', exclude: 'exdate'} , cur_date = this.form.data[choice[p]]
            let len = this.form.data[choice[p]]?.length
            len === 1 && typeof cur_date[0] == 'string' && (date_val = cur_date[0])
            len === 1 && typeof cur_date[0] == 'object' && (date_val = `${cur_date[0].from} to ${cur_date[0].to}`)
            len > 1 && typeof cur_date[0] == 'string' && (date_val = cur_date.join(', '))
            return date_val
        },
        dateOptions(date) {
            let days = [], 
            beforeToday = date >= moment(new Date()).format('yy/MM/DD') 
            beforeToday && days.push(date)
            return +days.some(day=> day == date) === 1
        },
        evtAcca(id, date){
            const evts = this.events.data.filter(x=> x.data.item_id == id && x.date == date).reduce((ac,x)=> {ac += x.acca; return ac},0)
            return evts
        },
        genIframe(id){
            let link = `${location.origin}/bookings/single/${id}`
            const iframe = `
            <iframe 
            width="375" 
            height="550" 
            frameborder="0" 
            scrolling="no" 
            allowtransparency="true" 
            allow="clipboard-read; clipboard-write; top-navigation;" 
            src="${link}" 
            style="border-radius:5px;">
            </iframe>
            `
            
            return  this.copyText(iframe, 'iframe copied to clipboard!')
        },
        shortDate(date){
            return moment(date).format('ddd, Do MMM')
        }
    },
    computed:{
        dateDisplay(){
            return this.datePickerFormat('date')
        },
        exdateDisplay(){
            return this.datePickerFormat('exclude')   
        }
    },
    mounted(){
        this.ST8 = window.ST8
    },
    created: async function () {
        window.ST8 = {}
        ST8.formData = JSON.stringify(this.form.data)
        this.getCurrencyRates()
        let items, events
        // any ajax calls
        const alias = await this.init({func: 'loadAlias'})
        this.alias = alias
        this.form.booking_url = `/bookings/all/${this.alias}`
        alias && (items = await this.init({func: 'loadItems'}),
        this.table.data = this.tableItemsData(items), this.tableSort()
        )
        alias && (events = await this.init({func: 'loadEvents'}))
        this.settings.data = await this.init({func: 'loadSettings'})
    }
  })