import numpy as np
import re

category_dict = {
    "accommodation": 3,
    "restaurant": 1,
    "landmark": 6,
    "cafe": 2,
    "cultural": 5,
    "hotspot": 4,
}

yoils = ["월", "화", "수", "목", "금", "토", "일"]
pattern = re.compile(r'([월화수목금토일])\s*(\d{1,2}:\d{2})\s*~\s*(\d{1,2}:\d{2})')

def main():
  category = "restaurant"  # Change this to the desired category

  fk = open(f"../new_data/new_kakao_{category}.txt", "r", encoding="utf-8")
  fw = open(f"../new_data/time_kakao_{category}.txt", "w", encoding="utf-8")
  
  for _ in range(0):
    fk.readline()
    
  cnt = 0
  while True:
    try:
      place_info = fk.readline().strip().split(",", maxsplit=10)

      if not place_info or place_info[0] == "":
          break

      k_id, place_name, time, address_name, road_address_name, x, y,  phone, place_url, score, review_text = map(str.strip, place_info)

      
      if time is not None:
        weeks = []
        if "매일" in time:
          st_ed = time.split("매일")[1]
          st, ed = st_ed.split("~", maxsplit=1)
          st = st.strip()
          ed = ed.strip()
          st = st[:5]
          ed = ed[:5]

          if int(ed[:2]) < 5:
            ed = "24:00"
          
          for _ in range(7):
            weeks.append(f"{st}~{ed}")
        else:
          matches = pattern.findall(time)
          matches.reverse()
          schedule = { day: (open_t, close_t) for day, open_t, close_t in matches }
          for yoil in yoils:
            if yoil in schedule:
              open_t, close_t = schedule[yoil]
              if int(close_t[:2]) < 5:
                close_t = "24:00"
              weeks.append(f"{open_t}~{close_t}")
            else:
              weeks.append("None")
            
        fw.write(f"{k_id}, {weeks[0]}, {weeks[1]}, {weeks[2]}, {weeks[3]}, {weeks[4]}, {weeks[5]}, {weeks[6]}\n")
        cnt += 1
      else:
        fw.write(f"{k_id}, None, None, None, None, None, None, None\n")
      if cnt % 1000 == 0:
        print(f"Inserted {cnt} records")
    except Exception as e:
      print(schedule)
      print(f"Error: {e}")
      print(f"Failed record: {place_info}")
      break


  print(f"cnt: {cnt}")


if __name__ == "__main__":
  main()