from quart import g, jsonify, request
from http import HTTPStatus
from lnbits.core.crud import get_user, get_wallet
from lnbits.core.services import create_invoice, check_invoice_status
from lnbits.decorators import api_check_wallet_key, api_validate_post_request
from . import bookings_ext
# from .crud import (
# #    getBookingItems
# )

# add your endpoints here

# account authorized api calls
@bookings_ext.route("/api/v1/items", methods=["GET"])
@api_check_wallet_key('invoice')
async def api_bookings():
    print(request.args.get('d'))
    tools = [
        {
            "name": "Quart",
            "url": "https://pgjones.gitlab.io/quart/",
            "language": "Python",
        },
        {
            "name": "Vue.js",
            "url": "https://vuejs.org/",
            "language": "JavaScript",
        },
        {
            "name": "Quasar Framework",
            "url": "https://quasar.dev/",
            "language": "JavaScript",
        },
    ]

    return jsonify(tools), HTTPStatus.OK


# public side api calls
@bookings_ext.route("/api/v1/public", methods=["GET"])
async def api_public():
    return HTTPStatus.OK