Vue.component(VueQrcode.name, VueQrcode)
new Vue({
    el: '#vue',
    mixins: [windowMixin],
    data(){
      return{
        stars: {},
        card_data:[],
        cus_id: '',
        sort: true,
        img_default: 'https://picsum.photos/400',
        location_default:'London',
        isSubmitting: false,
        showQr: false,
        form:{
          data:{

          }
        },
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
          gps:{
            lat:'',
            lon:''
          }
        },
        booking:{
          datePicked: false,
          show:false,
          proxyDate: '',
          date: [], //[moment().format('yy/MM/DD')]
          payment_request: '',
          sats:0
        },
        info:{
          show: false,
          item:''
        }
      }
    },
    methods:{
      async submitForm(e){
        e.preventDefault()
        !this.form.data.acca ? this.form.data.acca = 1 : this.form.data.acca = + this.form.data.acca
        const payload = Object.assign(
          {...this.form.data},
          {
            item_id: this.booking.item.id,
            title:this.booking.item.title,
            alias: location.pathname.split('/')[3],
            cus_id: this.cus_id,
            bk_type: this.booking.item.booking_item,
            currency: this.booking.item.currency
          }
        );
        console.log(payload);
        /[to]|[from]/.test(payload.date.toString()) && (payload.date = inBetweenDates({startDate: payload.date[0].from, endDate: payload.date[0].to}))
        this.isSubmitting =true
        let res = await LNbits.api.request('POST',`/bookings/api/v1/public/items`,null,payload)
        res.data.success && (
          this.booking.payment_request = res.data.success.payment_request, 
          this.booking.sats = res.data.success.sats,
          this.isSubmitting = false, 
          this.showQr = true)
        res.data.error && (
          Quasar.plugins.Notify.create({message: 'Processing Booking',color:'warning', timeout: 3000 })
          , this.isSubmitting = false)

      },
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
        return images?.split(',') || [this.img_default]
      },
      showGallery(id){
        const card_item =this.card_data.find(x=>x.id == id)
        this.gallery.images = this.images(card_item.img_url)
        this.gallery.business_name = card_item.business_name
        this.gallery.show = true
      },
      async showLocation(id){
        let card = this.card_data.find(x=> x.id == id), bb = 0.008
        if(!card.location)return
        this.map.business_name = card.business_name
        this.map.location = card.location
        this.map.show = true
        this.$q.loading.show({message: 'Loading location map...'})
        const lonlat = await(await fetch(`https://geocode.xyz/${card?.location.replace(/[,\s+] /g,'+')}&auth=913139462328678588578x56349?json=1`)).json()
        const omurl = `https://www.openstreetmap.org/export/embed.html?bbox=${this.gps(+lonlat.longt-bb)},${this.gps(+lonlat.latt-bb)},${this.gps(+lonlat.longt+bb)},${this.gps(+lonlat.latt+bb)}&layer=mapnik&marker=${lonlat.latt},${lonlat.longt}`
        this.map.url = omurl
        this.map.gps.lon = lonlat.longt
        this.map.gps.lat = lonlat.latt
        lonlat && (this.$q.loading.hide(),this.map.mapIsLoading = false)
      },
      showBooking(id){
        let item = this.card_data.find(x=> x.id == id)
        this.booking.item = this.card_data.find(x=> x.id == id)
        console.log(this.booking.item);
        this.booking.title = item.title; this.booking.business_name = item.business_name
        this.booking.booking_item = item.booking_item
        this.booking.multi_days = item?.multi_days?.value
        this.booking.id = id; item.charge_type && (this.booking.charge_type = item.charge_type)
        this.booking.img = item.img_url ? item.img_url.split(',')[0] : this.img_default
        this.booking.show = true
      },
      showInfo(id){
        this.info.item = this.card_data.find(x=> x.id == id)
        let item = this.info.item
        item?.info_iframe ? this.info.info_iframe =item.info_iframe.split(',') : this.info.info_iframe = []
        this.info.show = true
        setTimeout(_=> document.querySelector('.q-dialog__inner').classList.add('my-info'),10 )
      },
      gps(value){
        return value.toFixed(5)
      },
      copyToClip(p){
        let text
        p == 'gps' && (text = `${this.map.gps.lat},${this.map.gps.lon}`, this.copyText(text, 'GPS copied to clipboard!'))
        p == 'lnurl' && (text = this.booking.payment_request, this.copyText(text, 'LNURL copied to clipboard!'))
      },
      loadStars(){
        let stars = {}
        this.card_data.map(x=> {
          let rating = 4+ +(Math.random()).toFixed(1), total = 100 + Math.floor(Math.random() * 1000)
          x.stars ? stars[x] = x.stars : stars[x.id] = {total, rating, selected: rating}
        })
        this.stars = stars
      },
      updateProxy () {
        this.booking.date = []
        this.booking.proxyDate = this.booking.date
      },
      async save () {
        let item = this.card_data.find(x=> x.id == this.booking.id)
        this.booking.date = this.booking.proxyDate
        this.form.data.date = this.booking.date
        const validDates = this.checkDates(this.booking.date)
        validDates 
          ? (item.price && (this.booking.total = this.calcPrice()),

            this.booking.datePicked = true
            )
          : (
            this.booking.date = [], this.booking.datePicked = false, this.booking.total = '',
            Quasar.plugins.Notify.create({message: 'Selected dates invalid!',color:'warning', timeout: 3000 })
            )
        
      },
      formReset(){
        this.booking = {
          datePicked: false,
          show:false,
          proxyDate: '',
          date: [],
          payment_request: '',
          sats: 0
        }
        // this.booking.datePicked = false
        // this.booking.date = []; this.booking.total = ""
        this.form.data = {}
        this.isSubmitting = false
      },
      datePickerFormat(){
        let date_val, cur_date = this.booking.date
        let len = this.booking.date?.length
        len === 1 && typeof cur_date[0] == 'string' && (date_val = cur_date[0])
        len === 1 && typeof cur_date[0] == 'object' && (date_val = `${cur_date[0].from} to ${cur_date[0].to}`)
        len > 1 && typeof cur_date[0] == 'string' && (date_val = cur_date.join(', '))
        return date_val
      },
      dateOptions(date) {
        let days = [], item = this.card_data.find(x=> x.id == this.booking.id), tdays = item?.table_days || [],
        sdays = item?.date ? item.date : [], beforeToday = date >= moment(new Date()).format('yy/MM/DD') 
        tdays.some(x=> +x == moment(new Date(date)).days()) && ( beforeToday && days.push(date))
        sdays.some(day=> day == date) && days.push(date)
        !tdays.length && !sdays.length && ( beforeToday && days.push(date))
        return +days.some(day=> day == date) === 1
        // return date >= '2021/04/03' && date <= '2021/06/15'
      },
      checkDates(date){
        let check, dates, multi = this.booking?.multi_days
        typeof date[0] == 'string' && 
          (check = date.every(x=> this.dateOptions(x)), 
          !multi && date.length > 1 && (check = false),
          /[to]|[from]/.test(date.toString()) && (check = false)
          ), 
        date.length == 1 && typeof date[0] == 'object' && (
          dates = inBetweenDates({startDate: date[0].from, endDate: date[0].to}),
          check = dates.every(x=> this.dateOptions(x)),
          !multi && dates.length > 1 && (check = false)
          )
  
        return check
      },
      calcPrice(){
        let price, qty, date = this.form.data.date
        const item = this.card_data.find(x=> x.id == this.booking.id)
        typeof date[0] == 'string' 
          ? qty = date.length
          : qty = (inBetweenDates({startDate: date[0].from, endDate: date[0].to})).length
        price = +item.price * qty
        item.charge_type && (item.charge_type == 'person' && this.form.data.people) && 
          (price = +item.price * (+this.form.data.people <= 0 ? 1 : +this.form.data.people) * qty)
        this.form.data.total = price
        return LNbits.utils.formatCurrency(price, item.currency)
      },
      showAlert(v){
        alert(v)
      }
      
    },
    watch:{
      showQr(v){
        let qrslide = document.querySelector('.qr-code-card')
        v ?  setTimeout(_=> qrslide.style.top = 0,1) : qrslide.style.top = '800px'
      }
    },
    computed:{
      dateDisplay(){
        return this.datePickerFormat()
      },
      formatSats(){
       return LNbits.utils.formatSat(this.booking.sats)
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
      this.card_data = this.tableItemsData(items[1])
      this.cus_id = items[0]
      this.displaySort()
      this.loadStars()
      
    }
  })