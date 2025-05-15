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
  f = open(f"../new_data/landmark.txt", "r", encoding="utf-8")
  
  cnt = 0
  while True:
    try:
      id, name = f.readline().strip().split(",", maxsplit=1)
      cur.execute(
        """
        SELECT id FROM locations WHERE id = %s
        """,
        (
          id.strip(),
        ))
      if cur.fetchone() is None:
        print(f"{id},{name}")
        continue
      cur.execute(
      """
      UPDATE locations
      SET is_hotspot = True
      WHERE id = %s
      """,
      (
        id.strip(),
      ))
      cnt += 1
      if cnt % 10 == 0:
        print(f"Inserted {cnt} records")
        conn.commit()
    except Exception as e:
      print(f"Error: {e}")
      print(f"Failed to insert record: {id}")
      print(cnt)
      break

  conn.commit()
  f.close()
  cur.close()
  conn.close()

if __name__ == "__main__":
  main()