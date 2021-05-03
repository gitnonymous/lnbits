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
           usr_id TEXT NOT NULL,
           wallet TEXT NOT NULL,
           id TEXT PRIMARY KEY,
           alias TEXT NOT NULL,
           display BOOLEAN NOT NULL,
           data TEXT NOT NULL,
           time TIMESTAMP NOT NULL DEFAULT (strftime('%s', 'now'))
       );
    """
    )

    await db.execute(
       """
       CREATE TABLE IF NOT EXISTS pre_book (
           cus_id TEXT PRIMARY KEY,
           booking_item TEXT NOT NULL,
           time TIMESTAMP NOT NULL DEFAULT (strftime('%s', 'now'))
       );
    """
    )

    await db.execute(
       """
       CREATE TABLE IF NOT EXISTS booking_evts (
           id TEXT PRIMARY KEY,
           cus_id TEXT NOT NULL,
           item_id TEXT NOT NULL,
           alias TEXT NOT NULL,
           bk_type TEXT NOT NULL,
           acca INTEGER NOT NULL,
           bk_exp INTEGER NOT NULL,
           paid BOOLEAN NOT NULL,
           date TEXT NOT NULL,
           data TEXT NOT NULL,
           time TIMESTAMP NOT NULL DEFAULT (strftime('%s', 'now'))
       );
    """
    )

    await db.execute(
       """
       CREATE TABLE IF NOT EXISTS usr_settings (
           usr TEXT PRIMARY KEY,
           data TEXT NOT NULL,
           time TIMESTAMP NOT NULL DEFAULT (strftime('%s', 'now'))
       );
    """
    )
