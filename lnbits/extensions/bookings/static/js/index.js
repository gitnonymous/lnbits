new Vue({
    el: '#vue',
    mixins: [windowMixin],
    data: function () {
      return {
        ST8: {},
        form:{
            newItem:false,
            items:{
                booking_item:[{label:'table',icon:'restaurant'},{label:'room',icon:'hotel'}],
                table_days:[{label:'all', value: 'all'},{label:'M', value: '1'},{label:'T', value: '2'},{label:'W', value: '3'},{label:'T', value: '4'},{label:'F', value: '5'},{label:'S', value: '6'},{label:'S', value: '0'}]
            },
            booking_url:'/bookings/all/'+wallet.alias,
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
            data:[
                {
                    id: '123456',
                    booking_item: "table",
                    covers: "30",
                    date: "",
                    description: "Lunch Time",
                    img_url: "https://london.ac.uk/sites/default/files/styles/max_1300x1300/public/2018-10/london-aerial-cityscape-river-thames_1.jpg?itok=6LenFxuz",
                    location: "London, UK",
                    table_days: ["4", "5", "6"],
                    title: "Lunch Service",
                    wallet: "8e4df53da0484fc6aa41821eb89882f9"
                },
                {
                    id: 'axgkhjdgs65585',
                    booking_item: "room",
                    persons: "2",
                    description: "Queen Size bed, ensuite..",
                    img_url: "https://london.ac.uk/sites/default/files/styles/max_1300x1300/public/2018-10/london-aerial-cityscape-river-thames_1.jpg?itok=6LenFxuz",
                    location: "London, UK",
                    title: "Deluxe Superior",
                    wallet: "8e4df53da0484fc6aa41821eb89882f9"
                }
            ],
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
            let payload
            p == 'edit' && (
                // send updated data to db and update table data
                console.log({...this.form.data})
                 )
            !p && (
                // send POST to create booking item && update table
                payload = Object.assign({...this.form.data},{booking_item:this.form.data.booking_item.label}),
                console.log(payload)
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
            this.form.data = JSON.parse(this.ST8.formData)
            this.form.newItem = false
            p && (this.table.edit[p] = false)
        },
        async updateDisplay(id){
            // put request to db to change booking item display
            this.table.data.filter(x=> x.id == id)[0].display = !this.table.data.filter(x=> x.id == id)[0].display
            this.tableRefresh()
        },
        tableRefresh(){
            let hacky = this.table.pagination.rowsPerPage
            this.table.pagination.rowsPerPage = hacky +1
            this.table.pagination.rowsPerPage = hacky
        },
        async deleteBookingItem(id){
            // delete request to db && filter table data
            this.table.data = this.table.data.filter(x=> x.id !== id)
        },
        editBookingItem(id){
            let data = this.table.data.filter(x=> x.id == id)[0]
            this.form.data = data
            this.table.edit.show = true
            this.table.edit[data.booking_item] = true
        }   
    },
    mounted(){
        this.ST8 = window.ST8
    },
    created: async function () {
      window.ST8 = {}
      ST8.formData = JSON.stringify(this.form.data)
      // any ajax calls
      console.log(wallet.alias);
      const {data} = await LNbits.api
            .request(
            'GET',
            `/bookings/api/v1/items?d='bob'`,
            this.g.user.wallets[0].inkey
        )
         console.log(data);   
    }
  })