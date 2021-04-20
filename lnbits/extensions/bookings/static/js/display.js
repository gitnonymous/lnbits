
new Vue({
    el: '#vue',
    mixins: [windowMixin],
    data(){
      return{
        stars: {},
        card_data:[
          {
            id: '123456',
            booking_item: "table",
            covers: "30",
            date: "",
            description: "Lunch Time from 11am - 1pm",
            img_url: "https://www.thesun.co.uk/wp-content/uploads/2021/04/NINTCHDBPICT000645845472.jpg?w=1005",
            location: "Covent Garden, London",
            business_name:'Alfie\'s',
            table_days: ["4", "5", "6"],
            title: "Lunch Service",
            display:true
        },
        {
          id: '868843hhjh',
          booking_item: "table",
          covers: "30",
          date: "",
          description: "Early Evening Service",
          img_url: "https://img.static-bookatable.com/8689efc4-a40b-467e-bd7b-73745ae2b5e7.jpg?404=bat2%2F404-restaurant.jpg&height=466&width=700&quality=75&mode=crop&scale=both&id=8a30698a-f622-45bd-a6df-f1a072de1e38.jpg",
          location: "Covent Garden, London",
          business_name:"Alfie's",
          table_days: ["4", "5", "6"],
          title: "Evening Service 5pm",
          display:true
      },
        {
            id: 'axgkhjdgs65585',
            booking_item: "room",
            persons: "2",
            description: "Queen Size bed, ensuite. Mini bar and full wifi in room.",
            img_url: "https://cf.bstatic.com/images/hotel/max1024x768/265/265366051.jpg",
            location: "La Rambla, Barcelona",
            business_name:'The BoomBastic',
            title: "Deluxe Superior",
            price:'$55.00',
            display: true
        },
        {
            id: 'axgkhjdgs34d585',
            booking_item: "room",
            persons: "2",
            description: "Double bed, ensuite. Full wifi in room.",
            img_url: "https://cf.bstatic.com/images/hotel/max1024x768/811/81184106.jpg",
            location: "La Rambla, Barcelona",
            business_name:'The BoomBastic',
            title: "Standard Superior",
            price:'$25.00',
            display:true
        },
        
        ]
      }
    },
    mounted(){
      document.querySelector('.q-toolbar a').innerHTML = "LNbits Booking System"
    }
  })