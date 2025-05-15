import numpy as np
import psycopg2
from sentence_transformers import SentenceTransformer
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

model = SentenceTransformer('jhgan/ko-sroberta-multitask')



cur = conn.cursor()

def main():
  category = "cultural"  # "restaurant", "cafe", "cultural", "hotspot"

  fk = open(f"../new_data/add_landmark.txt", "r", encoding="utf-8")

  for _ in range(0):
    fk.readline()

  cnt = 0
  while True:
    try:
      
      place_info = fk.readline().strip().split(",", maxsplit=9)

      if not place_info or place_info[0] == "":
          break

      k_id, place_name, address_name, road_address_name, x, y,  phone, place_url, score, review_text = map(str.strip, place_info)
    
      
      if score == " -1.0":
        score = None
      else:
        score = float(score)

      
      #cur.execute(f"INSERT INTO locations (id, name, address, coordinates, review_vector, review_vector, category_id) VALUES ('{k_id}', '{place_name}', '{road_address_name}', ST_GeomFromText('POINT({x} {y})', 4326), '{embeddings}', {category_dict[category]});")
      cur.execute(
      """
      INSERT INTO locations
        (id, name, address, review_score, coordinates, review_vector, category_id)
      VALUES
        (%s, %s, %s, %s,
        ST_GeomFromText(%s, 4326),
        %s,
        %s);
      """,
      (
        k_id,
        place_name,
        road_address_name,
        score,
        f"POINT({x} {y})",
        None,
        19,
      ))
      cnt += 1
      if cnt % 10 == 0:
        print(f"Inserted {cnt} records")
        conn.commit()
    except Exception as e:
      print(f"Error: {e}")
      print(f"Failed to insert record: {place_info}")
      break
  conn.commit()
  print(f"cnt: {cnt}")
  fk.close()
  cur.close()
  conn.close()

if __name__ == "__main__":
  main()