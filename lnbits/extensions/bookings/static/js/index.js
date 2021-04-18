new Vue({
    el: '#vue',
    mixins: [windowMixin],
    data: function () {
      return {
        ST8: {},
        form:{
            items:{
                booking_item:[{label:'table',icon:'restaurant'},{label:'room',icon:'hotel'}],
                table_days:[{label:'all', value: 'all'},{label:'M', value: '1'},{label:'T', value: '2'},{label:'W', value: '3'},{label:'T', value: '4'},{label:'F', value: '5'},{label:'S', value: '6'},{label:'S', value: '7'}]
            },
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
        sendFormData(e){
            e.preventDefault()
            const payload = Object.assign({...this.form.data},{booking_item:this.form.data.booking_item.label})
            console.log(payload)
        },
        formAction(val){
            const {data} = val
            data.booking_item && (this.form.booking[data.booking_item.label] = true)
            if(data.booking_item)for(x in this.form.booking){x !== data.booking_item.label && (this.form.booking[x] = false)}
            // console.log(val);
        },
        formReset(){
            this.form.booking[this.form.data.booking_item.label] = false
            this.form.data = JSON.parse(this.ST8.formData)
        }
    },
    mounted(){
        this.ST8 = window.ST8
    },
    created: function () {
      window.ST8 = {}
      ST8.formData = JSON.stringify(this.form.data)
    

      // any ajax calls
    }
  })