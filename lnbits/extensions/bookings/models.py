# from sqlite3 import Row
from typing import NamedTuple, Optional


class Alias(NamedTuple):
   usr: str

class BookingItem(NamedTuple):
   usr_id: str
   wallet: str
   id: Optional[str]
   alias: str
   display: bool
   data: str

class BookingEvent(NamedTuple):
   id: Optional[str]
   cus_id: str
   item_id: str
   alias: str
   bk_type: str
   acca: int
   bk_exp: int
   paid: bool
   date: str
   feedback: bool
   data: str



#
#    @classmethod
#    def from_row(cls, row: Row) -> "Bookings":
#        return cls(**dict(row))
