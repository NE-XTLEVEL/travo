import requests
import time
import sys
import os
import dotenv

dotenv.load_dotenv(verbose=True)

category = "cafe"  # 카테고리 그룹 네임임

filename = f"../new_data/add_kakao_{category}.txt"
f = open(filename, "w", encoding="utf-8")

group_code_dict = {"hotspot" : "AT4", "restaurant" : "FD6", "cafe" : "CE7", "cultural" : "CT1", "accommodation" : "AD5"}

REST_API_KEY = os.getenv("REST_API_KEY") 
url = "https://dapi.kakao.com/v2/local/search/category.json"
headers = {
  "Authorization": f"KakaoAK {REST_API_KEY}"
}
params = {
  "category_group_code": group_code_dict[category],  # 카테고리 그룹 코드
}
start_x = 126.77057943742453
start_y = 37.6743258328972 

interval = 0.004

end_x = 127.20101201218863 + interval
end_y = 37.47293281685266 - interval

x = start_x
cnt = 0

while x < end_x:
  y = start_y

  while y > end_y:
    params["rect"] = f"{x},{y},{x+interval},{y - interval}" # 사각형 영역 설정

    for page in range(1, 46):
      time.sleep(0.5)
      
      params["page"] = page

      try:
        response = requests.get(url, headers=headers, params=params)
      except:
        print(f"Error: {response.status_code}")
        print(f"API 호출 중 오류 발생. x: {x}, y: {y}")
        f.close()
        sys.exit()


      if response.status_code == 200:
        data = response.json()
        documents = data.get("documents", [])
        meta = data.get("meta", {})
        is_end = meta.get("is_end", False)
        total_count = meta.get("total_count", 0)
        
        if total_count > 45*15:
          print(f"장소 수 넘침 x: {x}, y: {y}, total_count: {total_count}")
          break

        if len(documents) == 0:
            break
        
        for document in documents:
          address_name = document.get("address_name", "")
          place_name = document.get("place_name", "")
          road_address_name = document.get("road_address_name", "")
          place_x = document.get("x", "")
          place_y = document.get("y", "")
          id = document.get("id", "")
          phone = document.get("phone", "")
          place_url = document.get("place_url", "")
          category_name = document.get("category_name", "")

          if "서울" not in address_name:
            continue

          cnt += 1

          if cnt%100 == 0:
            print(f"cnt: {cnt}, x: {x}, y: {y}")

          f.write(f"{address_name}, {place_name}, {road_address_name}, {place_x}, {place_y}, {id}, {phone}, {place_url}, {category_name}\n")
      
        
        if is_end:
          break
      else:
        print(f"Error {response.status_code}: {response.text}")
    y -= interval
  x += interval

print(f"데이터 수집 완료 cnt: {cnt}")
f.close()