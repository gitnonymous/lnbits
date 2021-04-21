from typing import List, Optional, Union
from .models import Alias, BookingItem
from lnbits.helpers import urlsafe_short_hash

from . import db

async def createAlias(
    usr_id: str,
    
) -> Alias:
    alias = urlsafe_short_hash()
    await db.execute(
        """
        INSERT INTO alias (usr_id, alias)
        VALUES (?,?)
        """,
        (usr_id, alias),
    )

async def getAlias(
    usr: str,
) -> List:
    row = await db.fetchone("SELECT * FROM alias WHERE usr_id = ?", (usr,))
    if not row:
        return await createAlias(usr)
    else:
        print(row[0:])
        return row

async def getItems(
    alias: str,
) -> List:
    row = await db.fetchone("SELECT * FROM alias WHERE alias = ?", (alias,))
    return row

async def createItem(
    usr_id: str,
    wallet: str,
    id: str,
    alias: str,
    display: bool,
    data: str
) -> BookingItem:
    await db.execute(
        """
        INSERT INTO booking_items (usr_id, alias)
        VALUES (?,?,?,?,?,?)
        """,
        (usr_id, wallet, id, alias, display, data),
    )