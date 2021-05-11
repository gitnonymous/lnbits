#!/usr/bin/python
from typing import List, Optional, Union
from quart import jsonify
from .models import Alias, BookingItem, BookingEvent
from lnbits.helpers import urlsafe_short_hash
from .helpers import preBookTimes, getWalletFromItem, sats, checkPrebook, clearPrebook
from lnbits.core.services import create_invoice, check_invoice_status
from . import db
import json
from datetime import date, datetime 



async def createAlias(
    usr_id: str,
    
) -> Alias:
    alias = urlsafe_short_hash()
    await db.execute(
        """
        INSERT INTO alias (usr_id, alias)
        VALUES (?,?)
        """,
        (usr_id, alias)
    )
    return alias

async def getAlias(
    usr: str,
) -> List:
    try:
        row = await db.fetchone("SELECT * FROM alias WHERE usr_id = ?", (usr))
        if not row:
            return await createAlias(usr)
        else:
            return row[1]
    except:
        return {"error":"Database Error"}

async def getUsr(alias:str)-> str:
    row = await db.fetchone("SELECT usr_id FROM alias WHERE alias = ?", (alias))
    return row[0]

async def getItems(
    alias: str,
    public: Optional[bool]
) -> List:
    if public:
        row = await db.fetchall(f"SELECT * FROM booking_items WHERE alias = ? AND display = {public}", (alias))
        if not row:
            return 'no items'
        else:
            public_row = [dict(ix) for ix in row]
            for r in public_row:
                del r['usr_id']
                del r['wallet']
            return json.dumps([urlsafe_short_hash() , public_row]) 
    else:
        try:
            row = await db.fetchall("SELECT * FROM booking_items WHERE alias = ?", (alias))
            if not row:
                return 'no items'
            else:
                return json.dumps( [dict(ix) for ix in row] )
        except:
            return {"error":"Database Error"}

async def getItem(
    id: str,
    public: Optional[bool]
) -> List:
    row = await db.fetchone("SELECT * FROM booking_items WHERE id = ?", (id))
    row = dict(row)
    if public:
        del row['usr_id']
        del row['wallet']
        return json.dumps([urlsafe_short_hash(),[row]])
    else:
        return json.dumps([urlsafe_short_hash(),[row]])

async def createItem(
    usr_id: str,
    wallet: str,
    alias: str,
    display: bool,
    data: str,
) -> BookingItem:
    id = urlsafe_short_hash()
    await db.execute(
        """
        INSERT INTO booking_items (usr_id, wallet,id,alias,display,data)
        VALUES (?,?,?,?,?,?)
    """,
        (usr_id, wallet, id, alias, display, data)
    )
    newItem = await getItem(id, None)
    return {"success":'Booking Item Successfully created', "item":newItem}

async def deleteItem(id: str) -> dict:
    await db.execute("DELETE FROM booking_items WHERE id = ?", (id))
    return {"success":"Item Deleted"}

async def updateItem(
    usr_id: str,
    wallet: str,
    id: str,
    alias: str,
    display: bool,
    data: str,
) -> BookingItem:
    await db.execute(
        """
        REPLACE INTO booking_items (usr_id, wallet,id,alias,display,data)
        VALUES (?,?,?,?,?,?)
        """,
        (usr_id, wallet, id, alias, display, data)
    )
    return {"success":"item updated"}

async def updateDisplay(id: str, display: bool) -> None:
    await db.execute(f"UPDATE booking_items SET display = {display} WHERE id = ?",(id))
    return {"success":"item display updated"}

async def processBooking(bkI) -> dict:
    cus_id = bkI['cus_id']
    preBook = await checkPrebook(cus_id, json.dumps(bkI)) # add preBook to db
    if preBook:  # check prebook table for booking instance
        return {"error": "Booking received"}
    exp = preBookTimes() #set expiry times for payment and booking
    booked = await addBookingEvents(cus_id, exp, bkI) # add booking to db 
    if not booked:# remove any entries from booking_evts table
        await deleteEvent('none', cus_id, 'cus_id')
        return {"error": "Booking error, try booking again."}
    w = await getWalletFromItem(bkI['item_id']) # retrieve wallet id of booking item
    usr, wallet = w.values()
    fee = await sats(bkI)
    [payment_hash, payment_request]= await create_invoice( # create invoice
        wallet_id=wallet, amount=fee, memo=cus_id)
    return {"success":{"payment_hash":payment_hash, "payment_request": payment_request, "sats":fee, "evt_url": '/bookings/evt/'+cus_id}}

async def addBookingEvents(
    cus_id: str,
    exp: dict,
    bkI: dict
) -> bool:
    try:
        for date in bkI['date']: # add booking events to booking_evts table. multi if multi dates
            await createBookingEvent(
                cus_id,
                bkI['item_id'],
                bkI['alias'],
                bkI['bk_type'],
                int(bkI['acca']),
                int(exp['bk_exp']),
                False,
                date,
                False,
                json.dumps(bkI)
            )
        return True
    except:
        return False

async def createBookingEvent(
    cus_id: str,
    item_id: str,
    alias: str,
    bk_type: str,
    acca: int,
    bk_exp: int,
    paid: bool,
    date: str,
    feedback: bool,
    data: str,
) -> BookingEvent:
    id = urlsafe_short_hash()
    await db.execute(
        """
        INSERT INTO booking_evts (id,cus_id, item_id,alias,bk_type,acca, bk_exp,paid, date, feedback, data)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """,
        (id,cus_id, item_id,alias,bk_type,acca, bk_exp, paid, date, feedback, data)
    )
     
async def getEvents(
    alias: str,
    all:bool
) -> List:
        dt = datetime.today().strftime('%Y/%m/%d')
        if all:
            row = await db.fetchall("SELECT id, cus_id, acca, bk_type, paid, date, data FROM booking_evts WHERE alias = ? ", (alias))
        else:
            row = await db.fetchall(f"SELECT id, cus_id, acca, bk_type, paid, date, data FROM booking_evts WHERE alias = '{alias}' AND date >= '{dt}'")
        if not row:
            return {[]}
        else:
            return json.dumps( [dict(ix) for ix in row] )

async def getBookingEvent(
    cus_id: str,
) -> List:
        row = await db.fetchall("SELECT id, cus_id, acca, bk_type, paid, date, data FROM booking_evts WHERE cus_id = ? AND feedback = FALSE", (cus_id))
        if not row:
            return []
        else:
            return json.dumps( [dict(ix) for ix in row] )

async def deleteEvent(id:str, cus_id:str, select:str)-> dict:
    db_id = id if select == 'id' else cus_id
    await db.execute(f"DELETE FROM booking_evts WHERE {select} = '{db_id}'")
    if select == 'cus_id':
        await clearPrebook(cus_id)
    return {"success":"Booking Deleted"}

async def setSettings(p) -> dict:
    if 'GET' in p:
        usr = ''
        if 'alias' in p:
            usr = await getUsr(p['alias'])
        else:
            usr = p['GET']
        row = await db.fetchone("SELECT data FROM usr_settings WHERE usr = ?", (usr))
        if row is None:
            return jsonify(success=[])
        else:
            js_on = json.loads(row[0])
            print(js_on)
            if 'alias' in p:
                if 'tg_chatId' in js_on:
                    del js_on['tg_chatId']
                return jsonify(success=js_on)
            else:
                return jsonify(success=[js_on])
    else:
        usr, data = p.values()
        await db.execute("INSERT OR REPLACE INTO usr_settings (usr,data) VALUES(?,?)",(usr,data))
        return {"success":"settings updated"}   