from quart import g, render_template

from lnbits.decorators import check_user_exists, validate_uuids

from . import bookings_ext


@bookings_ext.route("/")
@validate_uuids(["usr"], required=True)
@check_user_exists()
async def index():
    return await render_template("bookings/index.html", user=g.user)

@bookings_ext.route("/<id>")
async def show_all_items(id):
    if  "all_" not in id :
        item={"id":"sdfhkhsdkfh","title":"Table"}
        return await render_template("bookings/single.html", item=item)
    else:
        # search alias table and return user id 
        user = 'user_uuid'
        # grab all user booking items from items table as array of json
        items = [{"id": "dsfsdgsdgg", "title": "Lunch"}]
        return await render_template("bookings/display.html",items=items)

    
