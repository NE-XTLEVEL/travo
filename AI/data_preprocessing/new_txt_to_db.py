import numpy as np
import psycopg2
from sentence_transformers import SentenceTransformer
import os
import dotenv

model = SentenceTransformer('jhgan/ko-sroberta-multitask')

dotenv.load_dotenv(verbose=True)

conn = psycopg2.connect(
  dbname=os.getenv("DB_NAME"),
  user=os.getenv("DB_USER"),
  password=os.getenv("DB_PASSWORD"),
  host=os.getenv("DB_HOST"),
  port=os.getenv("DB_PORT")
)

cur = conn.cursor()

category_dict = {
    "accommodation": 3,
    "restaurant": 1,
    "cafe": 2,
    "cultural": 5,
    "hotspot": 4,
}

def main():
  category = "cultural"  # "restaurant", "cafe", "cultural", "hotspot"

  fk = open(f"../new_data/kakao_{category}.txt", "r", encoding="utf-8")

  if category_dict[category] >= 4:
    fa = open(f"../new_data/ai_kakao_{category}.txt", "r", encoding="utf-8")

  for _ in range(0):
    fk.readline()
    if category_dict[category] >= 4:
      fa.readline()
  cnt = 0
  while True:
    try:
      if category_dict[category] >= 4:
        ai_info = fa.readline().strip()

        if not ai_info or ai_info[0] == "":
          conn.commit()
          break

        a_id, ai_text = map(str.strip, ai_info.split(",", maxsplit=1))

 
      if category_dict[category] < 4:
        place_info = fk.readline().strip().split(",", maxsplit=9)

        if not place_info or place_info[0] == "":
            break

        k_id, place_name, address_name, road_address_name, x, y,  phone, place_url, score, review_text = map(str.strip, place_info)
      else:
        while True:
          place_info = fk.readline().strip().split(",", maxsplit=9)

          if not place_info or place_info[0] == "":
            break

          k_id, place_name, address_name, road_address_name, x, y,  phone, place_url, score, review_text = map(str.strip, place_info)
        
        
          if k_id != a_id:
            print(f"ID mismatch: {k_id} != {a_id}")
          else:
            break

      if not place_info or place_info[0] == "":
        conn.commit()
        break
      
      if score == " -1.0":
        score = None
      else:
        score = float(score)

      if category_dict[category] < 4:
        embedding = model.encode(review_text)
      else:
        embedding = model.encode(ai_text + review_text)
      
      embedding_str = '['+','.join(map(str, embedding))+']'
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
        embedding_str,
        category_dict[category],
      ))
      cnt += 1
      if cnt % 100 == 0:
        print(f"Inserted {cnt} records")
        conn.commit()
    except Exception as e:
      print(f"Error: {e}")
      print(f"Failed to insert record: {place_info}")
      break
  conn.commit()
  print(f"cnt: {cnt}")
  fk.close()
  if category_dict[category] >= 4:
    fa.close()
  cur.close()
  conn.close()

if __name__ == "__main__":
  main()