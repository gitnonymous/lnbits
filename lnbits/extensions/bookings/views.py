from quart import g, render_template
from lnbits.decorators import check_user_exists, validate_uuids
from . import bookings_ext
from .crud import getAlias

@bookings_ext.route("/")
@validate_uuids(["usr"], required=True)
@check_user_exists()
async def index():
    alias = await getAlias(g.user.id)
    return await render_template("bookings/index.html", user=g.user, alias={"alias":alias[1]})

@bookings_ext.route("/single/<id>")
async def show_single_items(id):
    item={"id":"sdfhkhsdkfh","title":"Table"}
    return await render_template("bookings/single.html", item=item)
    
@bookings_ext.route("/all/<id>")
async def show_all_items(id):
    #search alias table and return user id 
    user = await getAlias(id)
    print(user)
    # grab all user booking items from items table as array of json
    items = [{"id": "dsfsdgsdgg", "title": "Lunch"}]
    return await render_template("bookings/display.html",items=items)
