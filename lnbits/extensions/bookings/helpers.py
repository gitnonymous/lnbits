from datetime import date, datetime
from typing import Optional
import time, json, httpx
from quart import jsonify
from lnbits.utils.exchange_rates import fiat_amount_as_satoshis
from lnbits.core.services import check_invoice_status
from threading import Thread
from . import db

async def checkPayment(data)-> dict:
    [item_id, payment_hash, cus_id] = data.values()
    w = await getWalletFromItem(item_id) 
    usr, wallet = w.values()
    status = await check_invoice_status(wallet, payment_hash)
    payload = {"paid":1} if str(status) == 'settled' else {"paid":0}
    if payload['paid'] == 1:
        await clearPrebook(cus_id)
        await bookPayUpdate(cus_id)
        await lnbits_booking_bot(usr, cus_id)
    return payload

async def bookPayUpdate(cus_id:str)-> bool:
        await db.execute(f"UPDATE booking_evts SET paid = True WHERE cus_id = '{cus_id}'")
        return True

def preBookTimes() -> dict:
    timestamp = int(datetime.utcnow().timestamp() * 1000)
    lnurl_exp = timestamp + (1000*60*3)
    bk_exp = timestamp + int(1000*60*60*24*21)
    return {"lnurl_exp":lnurl_exp, "bk_exp":bk_exp}

async def getWalletFromItem(item_id:str) -> dict:
    try:
        row = await db.fetchone("SELECT * FROM booking_items WHERE id = ?", (item_id))
        if not row:
            raise 'error'
        else:
            return {"usr":row[0],"wallet":row[1]}
    except:
        return {"error":"Database Error"}

async def sats(bkI) -> int:
    default = 100 # default booking fee
    if 'deposit' in bkI:
        deposit = bkI['deposit']
        print(float(deposit))
        print(bkI['currency'])
        if float(deposit) < default:
            deposit = default
        return await fiat_amount_as_satoshis(float(deposit), bkI['currency'])
    elif 'total' in bkI:
        total = bkI['total']
        if float(total) < default:
            total = default
        return await fiat_amount_as_satoshis(float(total), bkI['currency'])
    else:
        return int(default) 

async def checkPrebook(cus_id:str, data:str) -> bool:
    row = await db.fetchone("SELECT * FROM pre_book WHERE cus_id = ?", (cus_id))
    if not row:
        await db.execute(
        """
        INSERT INTO pre_book (cus_id, booking_item)
        VALUES (?,?)
        """,
        (cus_id, data)
        )
        return False
    else:
        return True   

async def clearPrebook(cus_id:str) -> None:
    try:
        await db.execute(f"DELETE FROM pre_book WHERE cus_id = '{cus_id}'")
        return
    except:
        return

def conCurrent(p) -> None:
    [func, vals] = p.values()
    #Thread(target=clearBookings, args=([{"cus_id":cus_id, "error": False}])).start()
    Thread(target=str(func), args=([vals])).start()

async def clearBookings(p) -> None: 
    cus = p['cus_id']
    if p["error"]: # get all rows from booking_evts table which have cus_id and DELETE
        for i, item in enumerate(Book):
            if item['cus_id'] == cus:
                Book.pop(i) #DELETE from table
        preBook.remove(cus)
        print(Book)

    else:   # remove any expired bookings from booking_evts table
        time.sleep(5)
        for i, item in enumerate(Book):
            if item['cus_id'] == cus:
                Book.pop(i) #DELETE from table
        preBook.remove(cus)
        print(preBook)

async def accaDates(id:str)-> dict:
    dates={}
    row = await db.fetchall("SELECT * FROM booking_evts WHERE item_id = ? AND paid = TRUE", (id))
    if row:
        for item in [dict(ix) for ix in row]:
            if item['date'] in dates:
                dates[item['date']] = int(dates[item['date']]) + int(item['acca'])
            else:
                dates[item['date']] = int(item['acca'])
    bkI = await db.fetchone("SELECT * FROM booking_items WHERE id = ?", (id))
    exdate = json.loads(dict(bkI)['data'])['exdate']
    return {"success": [dates, exdate]}

async def feedBack(p) -> dict:
    item_id, bk_id = p['item_id'], p['bk_id']
    row = dict(await db.fetchone(f"SELECT * FROM booking_items WHERE id = '{item_id}'"))
    data = json.loads(row['data']) 
    feedback = data['feedback'] if 'feedback' in data else {}
    if not feedback:
        feedback['stars'] = p['stars']
        feedback['count'] = 1
        data['feedback'] = feedback
    else:
        stars, count = data['feedback']['stars'], data['feedback']['count']
        data['feedback']['stars'] = p['stars'] + stars 
        data['feedback']['count'] = count +1
    data = json.dumps(data)
    await db.execute(f"UPDATE booking_items SET data = '{data}' WHERE id = '{item_id}'")
    await db.execute(f"UPDATE booking_evts SET feedback = True WHERE id = '{bk_id}'")
    return jsonify({"success": True})

async def checkSettings(id:str) -> Optional[dict]:
    row = await db.fetchone("SELECT data FROM usr_settings WHERE usr = ?",(id))
    return json.loads(row[0])

async def lnbits_booking_bot(usr:str, cus_id:str)-> dict:
    try:
        chid = await checkSettings(usr) #check settings
        if 'tg_chatId' in chid and chid['tg_chatId'] is not None:
            bk_data = await db.fetchone("SELECT data FROM booking_evts WHERE cus_id = ? ORDER BY time DESC LIMIT 1",(cus_id))
            bd = json.loads(bk_data[0])
            for chatID in chid['tg_chatId'].split(','):
                payload = {
                    "token": "3d99a933-f919-43a0-ae6c-003496eb1037",
                    "msg": f"*{bd['bk_type'].title()}:* _{bd['title']}_ *@* _{bd['business_name']}_ booked on *{', '.join(bd['date'])}* by *{bd['name']}*({bd['acca']})",
                    "ch_id": int(chatID.strip())
                }
                headers = {"Content-Type":"application/json"}
                url = 'https://lnbooking.duckdns.org:12567/lnbookings'
                r = httpx.request('POST', url, headers=headers, json=payload, verify=False )
            return jsonify(success=True)
        else:
            return {}
    except:
        return {"msg":'No settings'}