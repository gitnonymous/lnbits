from datetime import date, datetime
import time
from lnbits.utils.exchange_rates import fiat_amount_as_satoshis
from . import db

def preBookTimes() -> dict:
    timestamp = int(datetime.utcnow().timestamp() * 1000)
    lnurl_exp = timestamp + (1000*60*3)
    bk_exp = timestamp + int(1000*60*60*24*21)
    return {"lnurl_exp":lnurl_exp, "bk_exp":bk_exp}

async def getWalletFromItem(item_id:str) -> str:
    try:
        row = await db.fetchone("SELECT * FROM booking_items WHERE id = ?", (item_id))
        if not row:
            raise 'error'
        else:
            return row[1]
    except:
        return {"error":"Database Error"}

async def sats(bkI) -> int:
    default = 100 # default booking fee
    if 'deposit' in bkI:
        deposit = bkI['deposit']
        if int(deposit) < default:
            deposit = default
        return int(await fiat_amount_as_satoshis(float(deposit), bkI['currency']))
    elif 'total' in bkI:
        total = bkI['total']
        if int(total) < default:
            total = default
        return int(await fiat_amount_as_satoshis(float(total), bkI['currency']))
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


def conCurrent(p) -> None:
    func, vals = p
    #Thread(target=clearBookings, args=([{"cus_id":cus_id, "error": False}])).start()
    Thread(target=func, args=([vals])).start()
