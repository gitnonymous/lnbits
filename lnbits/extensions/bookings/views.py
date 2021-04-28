from quart import g, render_template
from lnbits.decorators import check_user_exists, validate_uuids
from . import bookings_ext
from .crud import getAlias

@bookings_ext.route("/")
@validate_uuids(["usr"], required=True)
@check_user_exists()
async def index():
    return await render_template("bookings/index.html", user=g.user)

@bookings_ext.route("/single/<id>")
async def show_single_items(id):
    return await render_template("bookings/single.html")
    
@bookings_ext.route("/all/<id>")
async def show_all_items(id):   
    return await render_template("bookings/display.html")
