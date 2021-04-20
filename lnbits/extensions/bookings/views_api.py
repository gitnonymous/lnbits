# views_api.py is for you API endpoints that could be hit by another service

# add your dependencies here

# import json
# import httpx
# (use httpx just like requests, except instead of response.ok there's only the
#  response.is_error that is its inverse)

from quart import jsonify
from http import HTTPStatus

from . import bookings_ext


# add your endpoints here


@bookings_ext.route("/api/v1/bookings", methods=["GET"])
async def api_bookings():
    """Try to add descriptions for others."""
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
