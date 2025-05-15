import numpy as np
from google import genai
import dotenv
import os
import time

dotenv.load_dotenv(verbose=True)

client = genai.Client(api_key=os.getenv("GEMINI_KEY"))

def main():
  category = "cultural"

  fk = open(f"../new_data/kakao_{category}.txt", "r", encoding="utf-8")
  fw = open(f"../new_data/ai_kakao_{category}.txt", "w", encoding="utf-8")

  cnt = 0

  for _ in range(0):
    fk.readline()
  while True:
    try:
      place_info = fk.readline().strip().split(",", maxsplit=9)

      if not place_info or place_info[0] == "":
        break
      k_id, place_name, address_name, road_address_name, x, y,  phone, place_url, score, review_text = place_info
      


      response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=f"""당신은 여행 가이드입니다. 
        {address_name}에 위치한 {place_name}에 대해 두 문장으로 설명하세요. 반드시 RAG를 사용하여 검색된 정보를 바탕으로 작성하세요. 
        {review_text} 이것은 해당 장소에 대한 리뷰입니다. 필요하다면 참고하세요
        이와 관련없는 설명은 하지 마세요. 설명을 할 때 줄바꿈을 하지 마세요.
        설명할 내용이 없다면 장소 이름만 출력하세요.
        아래 ```로 감싸져 있는 부분은 예시입니다.
        ```
        Q. 서울 서대문구 창천동에 위치한 신촌이대거리에 대해 두 문장으로 설명하세요.
        A. 신촌이대거리는 다양한 볼거리, 즐길거리, 먹거리가 풍부하여 젊은 세대에게 인기 있는 명소입니다. 특히 맛집이 많아 데이트 코스로도 좋습니다.
        ```
        """
      )

      text = response.text
      if text[-1] != "\n":
        text += "\n"

      fw.write(f"{k_id}, {text}")

      #cur.execute(f"INSERT INTO locations (id, name, address, coordinates, review_vector, review_vector, category_id) VALUES ('{k_id}', '{place_name}', '{road_address_name}', ST_GeomFromText('POINT({x} {y})', 4326), '{embeddings}', {category_dict[category]});")
      cnt += 1
      time.sleep(0.3)
      if cnt % 10 == 0:
        print(f"Processing {cnt} records")

    except Exception as e:
      print(f"Error: {e}")
      print(f"Failed to insert record: {place_info}")
      print(f"cnt: {cnt}")
      fw.close()
      break

  fk.close()
  fw.close()



if __name__ == "__main__":
  main()