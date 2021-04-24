
new Vue({
    el: '#vue',
    mixins: [windowMixin],
    data(){
      return{
        stars: {},
        card_data:[]
      }
    },
    methods:{
      init(p){
        const alias = location.pathname.split('/')[3]
        console.log(alias);
        const action ={}
        action.loadItems = async () =>{
            const {data} = await LNbits.api
            .request(
            'GET',
            `/bookings/api/v1/public/items?alias=${alias}`
        )
        return data
        }
        return action[p.func](p)
    },
    tableItemsData(data){
      return data.map(x=>(
        Object.assign({...JSON.parse(x.data)},
        {id:x.id},
        {wallet:x.wallet},
        {display:x.display},
        {display_price: LNbits.utils.formatCurrency(JSON.parse(x.data).price, JSON.parse(x.data).currency || 'USD')}
        )))
      },
    },
    mounted(){
      document.querySelector('.q-toolbar a').innerHTML = "<strong>LNbits Booking System</strong>"
      // document.querySelector('.q-toolbar a').style.color = "#212121"
      // document.querySelector('.q-toolbar a').style.fontFamily = "Monserat"
      // document.querySelector('.q-header').style.background = "inherit"
      // document.querySelector('.q-header button').style.visibility = "hidden"
    },
    async created(){
      const items = await this.init({func:'loadItems'})
      this.card_data = this.tableItemsData(items)
      console.log(items)
    }
  })