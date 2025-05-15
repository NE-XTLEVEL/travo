import numpy as np



category_dict = {
    "accommodation": 3,
    "restaurant": 1,
    "landmark": 6,
    "cafe": 2,
    "cultural": 5,
    "hotspot": 4,
}

def main():
  n = 10000000000
  li = np.zeros(n, dtype=bool)
  
  category = "cafe"  # Change this to the desired category

  fk = open(f"../new_data/kakao_{category}.txt", "r", encoding="utf-8")
  fw = open(f"../new_data/red_kakao_{category}.txt", "w", encoding="utf-8")
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
        break
      
      if li[int(k_id)]:
        print(f"Duplicate ID: {k_id}")
      elif float(score) != -1 and float(score) < 4:  
        print(f"Low score: {k_id}, {score}")
      else:
        fw.write(f"{k_id}, {place_name}, {address_name}, {road_address_name}, {x}, {y}, {phone}, {place_url}, {score}, {review_text}\n")
        li[int(k_id)] = True
        cnt += 1

      if cnt % 10000 == 0:
        print(f"Inserted {cnt} records")
    except Exception as e:
      print(f"Error: {e}")
      print(f"Failed record: {place_info}")
      continue


  print(f"cnt: {cnt}")


if __name__ == "__main__":
  main()