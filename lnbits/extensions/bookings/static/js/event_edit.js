new Vue({
el: '#vue',
mixins: [windowMixin],
data(){
    return{
        event:{
            data:[]
        },
        book:false,
        position: 'top'
    }
},
methods:{
    init(p){
        const alias = location.pathname.split('/')[3]
        const action ={}
        action.loadEvents = async () =>{
        const cus_id = location.pathname.split('/')[3]
        let {data} = await LNbits.api
        .request(
        'GET',
        `/bookings/api/v1/public/events/${cus_id}`,null
        )
        if(!data.length) {this.event.data = data; return data}
        data = data.map(x=>(Object.assign({...x},{data:JSON.parse(x.data)})))
        this.event.data = data
        return data
        }
        return action[p.func](p)
    },
    confirm (p) {
        this.$q.dialog({
          title: p.title || 'Confirm',
          message: p.msg || 'Would you like to continue?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          p?.ok == 'deleteEvent' && this.deleteEvent(p.id)
        }).onOk(() => {
          // console.log('>>>> second OK catcher')
        }).onCancel(() => {
          // console.log('>>>> Cancel')
        }).onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        })
    },
    async deleteEvent(id){
        const {data} = await LNbits.api.request('DELETE',`/bookings/api/v1/public/events/${id}?cus_id=${id}&select=id`,null)
        data.success && Quasar.plugins.Notify.create({message: 'Booking deleted', color:'positive', timeout: 3000 })
        data.success && (this.event.data = this.event.data.filter(x=> x.id !== id))
    },
    dateFormat(date){
        return moment(date).format('ddd, Do MMMM, YYYY')
    },
    bookmark(pos){
        this.position = pos
        this.book = true
    }
},
mounted(){
    document.querySelector('.q-toolbar a').innerHTML = `<strong>LN</strong>bits Booking Event`
},
async created(){
console.log(await this.init({func: 'loadEvents'}))
}
})