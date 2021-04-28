from typing import List, Optional, Union
from .models import Alias, BookingItem
from lnbits.helpers import urlsafe_short_hash
from . import db
import sys, json

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

async def getAlias(
    usr: str,
) -> List:
    try:
        row = await db.fetchone("SELECT * FROM alias WHERE usr_id = ?", (usr))
        if not row:
            return await createAlias(usr)
        else:
            return row
    except:
        return {"error":"Database Error"}

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
            return json.dumps(public_row) 
    else:
        try:
            row = await db.fetchall("SELECT * FROM booking_items WHERE alias = ?", (alias))
            if not row:
                return 'no items'
            else:
                return json.dumps( [dict(ix) for ix in row] )
        except:
            print(sys.exc_info()[0])
            return {"error":"Database Error"}

async def getItem(
    id: str,
    public: Optional[bool]
) -> List:
    row = await db.fetchone("SELECT * FROM booking_items WHERE id = ?", (id))
    if public:
        return [dict(row)]
    else:
        return [dict(row)]

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
    newItem = await getItem(id)
    return {"success":'Booking Item Successfully created', "item":newItem}

async def deleteItem(id: str) -> None:
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

