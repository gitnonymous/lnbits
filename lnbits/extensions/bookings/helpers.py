from datetime import date, datetime
import time

def preBookTimes() -> dict:
    timestamp = int(datetime.utcnow().timestamp() * 1000)
    lnurl_exp = timestamp + (1000*60*3)
    bk_exp = timestamp + (1000*60*4)
    return {"lnurl_exp":lnurl_exp, "bk_exp":bk_exp}
