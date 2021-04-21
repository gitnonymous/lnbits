# from sqlite3 import Row
from typing import NamedTuple


class Alias(NamedTuple):
   usr: str
   alias: str

class BookingItem(NamedTuple):
   usr_id: str
   wallet: str
   id: str
   alias: str
   display: bool
   data: str




#
#    @classmethod
#    def from_row(cls, row: Row) -> "Bookings":
#        return cls(**dict(row))
