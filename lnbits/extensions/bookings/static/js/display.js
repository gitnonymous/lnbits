
new Vue({
    el: '#vue',
    mixins: [windowMixin],
    data(){
      return{
        stars: {},
        card_data:[],
        sort: true,
        gallery: {
          show: false,
          slide:1,
          images:[],
          business_name:''
        },
        map:{
          url: `https://www.openstreetmap.org/export/embed.html?bbox=-2.493209838867188%2C53.50540525319918%2C-2.246360778808594%2C53.61980121473449&amp;layer=mapnik&amp;marker=53.56274386269267%2C-2.3699569702148438`,
          mapIsLoading:true,
          show: false,
        }
      }
    },
    methods:{
      init(p){
        const alias = location.pathname.split('/')[3]
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
      displaySort(){
        this.sort 
        ? this.card_data.sort((a,b)=> (a.booking_item.localeCompare(b.booking_item)))
        : this.card_data.sort((a,b)=>  (b.booking_item.localeCompare(a.booking_item)))
      },
      images(images){
        return images.split(',')
      },
      showGallery(id){
        const card_item =this.card_data.find(x=>x.id == id)
        this.gallery.images = this.images(card_item.img_url)
        this.gallery.business_name = card_item.business_name
        this.gallery.show = true
      },
      async showLocation(id){
        let card = this.card_data.find(x=> x.id == id), bb = 0.006
        this.map.business_name = card.business_name
        this.map.location = card.location
        this.map.show = true
        this.$q.loading.show({message: 'Loading location map...'})
        const lonlat = await(await fetch(`https://geocode.xyz/${card.location.replace(/, /g,'+')}&auth=913139462328678588578x56349?json=1`)).json()
        const omurl = `https://www.openstreetmap.org/export/embed.html?bbox=${(+lonlat.longt-bb).toFixed(5)}%2C${(+lonlat.latt-bb).toFixed(5)}%2C${(+lonlat.longt+bb).toFixed(5)}%2C${(+lonlat.latt+bb).toFixed(5)}&amp;layer=mapnik&amp;marker=${(+lonlat.longt).toFixed(3)}%2C${(+lonlat.latt).toFixed(3)}`
        this.map.url = omurl
        lonlat && (this.$q.loading.hide(),this.map.mapIsLoading = false)
      }
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
      this.displaySort()
      
    }
  })