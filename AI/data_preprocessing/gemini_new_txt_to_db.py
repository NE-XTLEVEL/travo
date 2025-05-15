import numpy as np
import psycopg2
from sentence_transformers import SentenceTransformer
from google import genai
import os
import dotenv
import time

dotenv.load_dotenv(verbose=True)

client = genai.Client(api_key=os.getenv("GEMINI_KEY"))

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
    "landmark": 6,
    "cafe": 2,
    "cultural": 5,
    "hotspot": 4,
}

def main():
  category = "cultural"

  fk = open(f"../new_data/kakao_{category}.txt", "r", encoding="utf-8")
  fa = open(f"../new_data/ai_kakao_{category}.txt", "r", encoding="utf-8")

  for _ in range(0):
    fk.readline()
    fa.readline()
  cnt = 0
  li = []
  txt = []
  
  while True:
    try:
      place_info = fk.readline().strip().split(",", maxsplit=9)

      if not place_info or place_info[0] == "":
        break

      k_id, place_name, address_name, road_address_name, x, y,  phone, place_url, score, review_text = map(str.strip, place_info)
      
      a_id, ai_text = map(str.strip, fa.readline().strip().split(",", maxsplit=1))

      if k_id != a_id:
        print(f"ID mismatch: {k_id} != {a_id}")
        break

      
      if score == " -1.0":
        score = None
      else:
        score = float(score)
      li.append((k_id, place_name, road_address_name, score, f"POINT({x} {y})", category_dict[category]))
      txt.append(ai_text + review_text)
      #cur.execute(f"INSERT INTO locations (id, name, address, coordinates, review_vector, review_vector, category_id) VALUES ('{k_id}', '{place_name}', '{road_address_name}', ST_GeomFromText('POINT({x} {y})', 4326), '{embeddings}', {category_dict[category]});")
      
      cnt += 1
      if cnt % 25 == 0:
        embeddings = client.models.embed_content( 
          model="gemini-embedding-exp-03-07",
          contents=txt,
        ).embeddings


        for embedding, place_info in zip(embeddings, li):
          embedding_str = '['+','.join(map(str, embedding.values))+']'
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
            (place_info[0], place_info[1], place_info[2], place_info[3], place_info[4], embedding_str, place_info[5])
          )
        conn.commit()
        print(f"Inserted {cnt} records")
        time.sleep(15)

    except Exception as e:
      print(f"Error: {e}")
      print(f"Failed to insert record: {place_info}")
      break
  
  embeddings = client.models.embed_content( 
    model="gemini-embedding-exp-03-07",
    contents=txt,
  ).embeddings


  for embedding, place_info in zip(embeddings, li):
    embedding_str = '['+','.join(map(str, embedding.values))+']'
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
      (place_info[0], place_info[1], place_info[2], place_info[3], place_info[4], embedding_str, place_info[5])
    )
  conn.commit()
  print(f"Inserted {cnt} records")
  print(f"cnt: {cnt}")
  conn.commit()
  fk.close()
  fa.close()
  cur.close()
  conn.close()

if __name__ == "__main__":
  main()