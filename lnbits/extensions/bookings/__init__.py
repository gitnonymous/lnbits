from quart import Blueprint
from lnbits.db import Database

db = Database("ext_bookings")

bookings_ext: Blueprint = Blueprint(
    "bookings", __name__, static_folder="static", template_folder="templates"
)


from .views_api import *  # noqa
from .views import *  # noqa
