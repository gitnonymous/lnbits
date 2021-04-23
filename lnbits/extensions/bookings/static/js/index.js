new Vue({
    el: '#vue',
    mixins: [windowMixin],
    data: function () {
      return {
        ST8: {},
        alias:'',
        form:{
            newItem:false,
            items:{
                booking_item:[{label:'table',icon:'restaurant'},{label:'room',icon:'hotel'}],
                table_days:[{label:'all', value: 'all'},{label:'M', value: '1'},{label:'T', value: '2'},{label:'W', value: '3'},{label:'T', value: '4'},{label:'F', value: '5'},{label:'S', value: '6'},{label:'S', value: '0'}]
            },
            booking_url:'/bookings/all/'+this.alias,
            show: false,
            booking:{
                table: false,
                room: false
            },
            data:{
                wallet: null,
                booking_item: '',
                date: '', //moment().format('YYYY/MM/DD'),
                table_days:[]
            }
        },
        table:{
            data:[],
            edit:{
                table:false,
                room:false,
                show:false,
               
            }
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
        async sendFormData(e,p){
            e.preventDefault()
            let itemdata = this.table.data.filter(x=> x.id == this.form.data.id)[0]
            let payload, res, data
            p == 'edit' && (
                data = Object.assign({...itemdata},{...this.form.data},{booking_item:itemdata.booking_item  }),
                payload = {
                    usr_id: this.g.user.wallets[0].user,
                    id: data.id,
                    wallet: data.wallet,
                    alias: this.alias,
                    display: data.display || false,
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
                res && (this.formReset())
                
                 )
            !p && (
                // send POST to create booking item && update table
                data = Object.assign({...this.form.data},{booking_item:this.form.data.booking_item.label}),
                payload = {
                    usr_id: this.g.user.wallets[0].user,
                    wallet: data.wallet,
                    alias: this.alias,
                    display: false,
                    data
                },
                delete payload.data.wallet,
                payload.data = JSON.stringify(payload.data),
                console.log(payload),
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
        formAction(val){
            const {data} = val
            data.booking_item && (this.form.booking[data.booking_item.label] = true)
            if(data.booking_item)for(x in this.form.booking){x !== data.booking_item.label && (this.form.booking[x] = false)}
            // console.log(val);
        },
        formReset(p){
            this.form.booking[this.form.data.booking_item.label] = false
            this.table.edit[this.form.data.booking_item.label] = false
            this.table.edit.show = false
            this.form.data = JSON.parse(this.ST8.formData)
            this.form.newItem = false
            p && (this.table.edit[p] = false)
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
            this.form.data = data
            this.table.edit.show = true
            this.table.edit[data.booking_item] = true
        },
        tableItemsData(data){
            return data.map(x=>(Object.assign({...JSON.parse(x.data)},{id:x.id},{wallet:x.wallet},{display:x.display})))
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
              // console.log('>>>> second OK catcher')
            }).onCancel(() => {
              // console.log('>>>> Cancel')
            }).onDismiss(() => {
              // console.log('I am triggered on both OK and Cancel')
            })
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
            return action[p.func](p)
        }
    },
    mounted(){
        this.ST8 = window.ST8
    },
    created: async function () {
        window.ST8 = {}
        ST8.formData = JSON.stringify(this.form.data)
        let items
        // any ajax calls
        const alias = await this.init({func: 'loadAlias'})
        this.alias = alias
        alias && (items = await this.init({func: 'loadItems'}),
        this.table.data = this.tableItemsData(items)
        )
    }
  })