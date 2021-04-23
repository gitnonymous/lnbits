from quart import g, jsonify, request
from http import HTTPStatus
from lnbits.core.crud import get_user, get_wallet
from lnbits.core.services import create_invoice, check_invoice_status
from lnbits.decorators import api_check_wallet_key, api_validate_post_request
from . import bookings_ext
import json
from .crud import (
   getItems,
   createItem,
   deleteItem,
   getAlias,
   updateDisplay,
   updateItem
)

# add your endpoints here

# account authorized api calls
@bookings_ext.route("/api/v1/items", methods=["GET"])
@api_check_wallet_key('invoice')
async def items_get():
    alias = request.args.get('alias')
    usr = request.args.get('usr')
    if alias is not None:
        items = await getItems(alias)
        return items, HTTPStatus.OK
    elif usr is not None:
        aliasCheck = await getAlias(usr)
        return aliasCheck[1], HTTPStatus.OK

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


# public side api calls
@bookings_ext.route("/api/v1/public", methods=["GET"])
async def api_public():
    return HTTPStatus.OK