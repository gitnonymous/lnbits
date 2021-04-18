Vue.component('BookingItem',{
    name: 'BookingItem',
    data: function(){
        return{
        
        }
    },
    template: `
        <q-select
        filled
        dense
        emit-value
        ${window.innerWidth < 600 && 'behavior="dialog"'}
        v-model="form.data.booking_item"
        :options="form.items"
        label="Choose Booking Item"
        >`,
})
