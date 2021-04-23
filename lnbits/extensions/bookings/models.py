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




#
#    @classmethod
#    def from_row(cls, row: Row) -> "Bookings":
#        return cls(**dict(row))
