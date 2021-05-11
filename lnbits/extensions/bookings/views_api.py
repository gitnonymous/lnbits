from quart import g, jsonify, request
from http import HTTPStatus
from lnbits.core.crud import get_user, get_wallet
from lnbits.core.services import create_invoice, check_invoice_status
from lnbits.decorators import api_check_wallet_key, api_validate_post_request
from . import bookings_ext
import json
from .helpers import accaDates, checkPayment, feedBack, lnbits_booking_bot
from .crud import (
   getItems,
   getItem,
   createItem,
   deleteItem,
   getAlias,
   updateDisplay,
   updateItem,
   processBooking,
   getEvents,
   deleteEvent,
   getBookingEvent,
   setSettings
   
)

# account authorized api calls
# Booking Items API
@bookings_ext.route("/api/v1/items", methods=["GET"])
@api_check_wallet_key('invoice')
async def items_get():
    alias = request.args.get('alias')
    usr = request.args.get('usr')
    if alias is not None:
        items = await getItems(alias,None)
        return items, HTTPStatus.OK
    elif usr is not None:
        aliasCheck = await getAlias(usr)
        return aliasCheck, HTTPStatus.OK

@bookings_ext.route("/api/v1/items", methods=["POST"])
@api_check_wallet_key('invoice')
async def items_post():
    data = await request.data
    data = json.loads(data)
    create = await createItem(
        usr_id= data['usr_id'],
        wallet= data['wallet'],
        alias= data['alias'],
        display= data['display'],
        data= data['data'],
    )
    return create, HTTPStatus.OK

@bookings_ext.route("/api/v1/items", methods=["PUT"])
@api_check_wallet_key('invoice')
async def items_put():
    data = await request.data
    data = json.loads(data)
    if data['func'] == 'display':
        update = await updateDisplay(id=data['id'], display=data['display'])
        return update, HTTPStatus.OK
    elif data['func'] == 'updateItem':
        update = await updateItem(
            usr_id= data['usr_id'],
            wallet= data['wallet'],
            id= data['id'],
            alias= data['alias'],
            display= data['display'],
            data= data['data'],
        )
        return update, HTTPStatus.OK

@bookings_ext.route("/api/v1/items/<id>", methods=["DELETE"])
@api_check_wallet_key('invoice')
async def items_delete(id):
    delete = await deleteItem(id)
    return delete, HTTPStatus.OK

# Booking Events API
@bookings_ext.route("/api/v1/events", methods=["GET"])
@api_check_wallet_key('invoice')
async def events_get():
    alias = request.args.get('alias')
    usr = request.args.get('usr')
    all = request.args.get('all')
    if all is not None:
        events = await getEvents(alias, True)
    else:
        events = await getEvents(alias, False)
    return events, HTTPStatus.OK

# Booking settings API
@bookings_ext.route("/api/v1/settings", methods=["POST"])
@bookings_ext.route("/api/v1/settings", methods=["GET"])
@api_check_wallet_key('invoice')
async def settings_post():
    method = str(request.method)
    if method == 'POST':
        data = await request.data
        data = json.loads(data)
        settings = await setSettings(data)
        return settings, HTTPStatus.OK
    else:
        usr = request.args.get('usr')
        settings = await setSettings({"GET": usr})
        return settings, HTTPStatus.OK


# public side api calls
# items
@bookings_ext.route("/api/v1/public/items", methods=["GET"])
async def api_public_get_items():
    alias = request.args.get('alias')
    items = await getItems(alias, True)
    return items, HTTPStatus.OK

@bookings_ext.route("/api/v1/public/item/<id>", methods=["GET"])
async def api_public_get_item(id):
    item = await getItem(id, True)
    return item, HTTPStatus.OK

# events
@bookings_ext.route("/api/v1/public/events/<id>", methods=["GET"])
async def api_public_get_event(id):
    event = await getBookingEvent(id)
    return event, HTTPStatus.OK

@bookings_ext.route("/api/v1/public/events", methods=["POST"])
async def api_public_post_event():
    data = await request.data
    data = json.loads(data)
    payment = await processBooking(data)
    return payment, HTTPStatus.OK

@bookings_ext.route("/api/v1/public/events/payment", methods=["POST"])
async def api_public_post_event_payment():
    data = await request.data
    data = json.loads(data)
    status = await checkPayment(data)
    return status, HTTPStatus.OK

@bookings_ext.route("/api/v1/public/events/<id>", methods=["DELETE"])
async def api_public_delete_event(id):
    cus_id = request.args.get('cus_id')
    id_select = request.args.get('select')
    delete = await deleteEvent(id, cus_id, id_select)
    return delete, HTTPStatus.OK

@bookings_ext.route("/api/v1/public/events/dates/<id>", methods=["GET"])
async def api_public_get_event_dates(id):
    dates = await accaDates(id)
    return dates, HTTPStatus.OK

@bookings_ext.route("/api/v1/public/events/feedback", methods=["POST"])
async def api_public_post_event_feedback():
    data = await request.data
    data = json.loads(data)
    feedback = await feedBack(data)
    return feedback, HTTPStatus.OK

@bookings_ext.route("/api/v1/public/settings", methods=["GET"])
async def api_public_settings():
    alias = request.args.get('alias')
    settings = await setSettings({"GET": True, "alias": alias})
    return settings, HTTPStatus.OK

@bookings_ext.route("/api/v1/public/", methods=["GET"])
async def api_public_post_test():
    feedback = await lnbits_booking_bot("13e08fc415f74d5cbb1fe9e0fe600eaa", "csDhVUfJyFkZsw4n33nEQM")
    return feedback, HTTPStatus.OK
