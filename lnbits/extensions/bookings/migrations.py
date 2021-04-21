async def m001_initial(db):

   await db.execute(
       """
       CREATE TABLE IF NOT EXISTS alias (
           usr_id TEXT PRIMARY KEY,
           alias TEXT NOT NULL,
           time TIMESTAMP NOT NULL DEFAULT (strftime('%s', 'now'))
       );
   """
   )
   await db.execute(
       """
       CREATE TABLE IF NOT EXISTS booking_items (
           usr_id TEXT PRIMARY KEY,
           wallet TEXT NOT NULL,
           id TEXT NOT NULL,
           alias TEXT NOT NULL,
           display BOOL NOT NULL,
           data TEXT NOT NULL,
           time TIMESTAMP NOT NULL DEFAULT (strftime('%s', 'now'))
       );
   """
   )
