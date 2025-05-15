import numpy as np
import psycopg2

import os
import dotenv

dotenv.load_dotenv(verbose=True)

conn = psycopg2.connect(
  dbname=os.getenv("DB_NAME"),
  user=os.getenv("DB_USER"),
  password=os.getenv("DB_PASSWORD"),
  host=os.getenv("DB_HOST"),
  port=os.getenv("DB_PORT")
)

cur = conn.cursor()


def main():
  category = "cafe"  # Change this to the desired category
  f = open(f"../new_data/time_kakao_{category}.txt", "r", encoding="utf-8")
  
  for _ in range(16501):
    f.readline()
  cnt = 0
  while True:
    try:
      id, *yoils = f.readline().strip().split(",", maxsplit=7)

      if not id or id[0] == "":
          break
      yoils = [yoil.strip() for yoil in yoils]
      for idx, yoil in enumerate(yoils):
        if yoil == "None":
          continue  
        open_time, close_time = yoil.split("~", maxsplit=1)
        cur.execute(
        """
        INSERT INTO location_hours (location_id, day, open_time, close_time)
        VALUES (%s, %s, %s, %s);
        """,
        (
          id.strip(),
          (idx + 1) % 7,
          open_time.strip(),
          close_time.strip()
        ))
      cnt += 1
      if cnt % 1000 == 0:
        print(f"Inserted {cnt} records")
        conn.commit()
    except Exception as e:
      print(f"Error: {e}")
      print(f"Failed to insert record: {id}")
      print(cnt)
      break
  
  print(f"Total records inserted: {cnt}")
  conn.commit()
  f.close()
  cur.close()
  conn.close()

if __name__ == "__main__":
  main()