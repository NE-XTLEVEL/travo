import numpy as np
import ast



def main():
  category = "cultural"

  fk = open(f"../data/kakao_{category}.txt", "r", encoding="utf-8")
  fr = open(f"../data/review_kakao_{category}.txt", "r", encoding="utf-8")
  fw = open(f"../new_data/kakao_{category}.txt", "w", encoding="utf-8")

  fk.readline() # Skip header

  for _ in range(0):
    fk.readline()
    fr.readline()
  cnt = 0
  while True:
    try:
      place_info = fk.readline().strip().split(",")

      if not place_info or place_info[0] == "":
        break

      address_name, place_name, road_address_name, x, y, k_id, phone, place_url = place_info
      
      r_id, r_name, r_score, reviews_str = fr.readline().strip().split(",", maxsplit=3)

      if k_id.strip() != r_id.strip():
        print(f"ID mismatch: {k_id} != {r_id}")
        break

      review_text = ""
      reviews = ast.literal_eval(reviews_str)
      review_cnt = 0
      for review in reviews:
        if "http" not in review:
          review_text += review.replace("\n", "\\n")
          review_cnt += 1
        if review_cnt > 10:
          break

      if r_score == " -1.0" and review_text == "":
        continue

      fw.write(f"{k_id}, {place_name}, {address_name}, {road_address_name}, {x}, {y}, {phone}, {place_url}, {r_score}, " + review_text + "\n")
      cnt += 1
      if cnt % 100 == 0:
        print(f"Processing {cnt} records")
    except Exception as e:
      print(f"Error: {e}")
      print(f"Failed to update record: {place_info}")
      break
  
  print(f"cnt: {cnt}")

  fk.close()
  fr.close()
  fw.close()

if __name__ == "__main__":
  main()
        