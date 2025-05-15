import os
import asyncio
from playwright.async_api import async_playwright

SEMA_NUM = 30
semaphore = asyncio.Semaphore(SEMA_NUM)  # 동시 실행 수 제한

async def crawl_kakao_map_review(id, name):
  async with semaphore:
    async with async_playwright() as p:
      browser = await p.chromium.launch(headless=True)
      page = await browser.new_page()

      try:
        await page.goto(f"https://place.map.kakao.com/{id}#comment", timeout=100000)
      except Exception as e:
        print(f"Failed to load page {id} - {e}")
        return

      max_scroll_attempts = 5

      previous_height = await page.evaluate("() => document.body.scrollHeight")
      review_elements = []
      total_count = 0
      for _ in range(max_scroll_attempts):
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(4)  # 로딩 대기
        current_height = await page.evaluate("() => document.body.scrollHeight")
        if current_height <= previous_height:
          # 더 이상 스크롤되지 않으면 루프 종료
          break
        previous_height = current_height
      
      score = '-1.0'
      score_locator = page.locator("div[class='info_main']").locator("span[class='num_star']").first
      if await score_locator.is_visible():
        score = await score_locator.inner_text()



      review_locator = page.locator("p[class='desc_review']")
      
      count = await review_locator.count()
      total_count += count

      for i in range(count):
        review = review_locator.nth(i)

        btn_more_locator = review.locator("span[class='btn_more']")
        
        btn_more_count = await btn_more_locator.count()
        
        if btn_more_count > 0:
          for j in range(btn_more_count):
            btn_more = btn_more_locator.nth(j)
            if await btn_more.is_visible():
              try:
                await btn_more.click()
                # 클릭 후 콘텐츠가 확장될 시간 대기
                await asyncio.sleep(2)
              except Exception as e:
                print(f"Failed to click btn_more: {e}")
      
      for i in range(count):
        review_text = await review_locator.nth(i).inner_text()
        if review_text[-3:] == " 접기":
          review_text = review_text[:-3]
        review_elements.append(review_text)



      await browser.close()

      return (id, name, score, review_elements)

async def main():
  # seasons = ["4", "3", "2", "1"]
  # 4: Spring, 3: Summer, 2: Fall, 1: Winter
  category = "shopping"
  WRITE_FILE = f"review_kakao_{category}.txt"
  START_LINE = 0

  fr = open(f"kakao_{category}.txt", "r", encoding="utf-8")
  if START_LINE == 0:
    if os.path.exists(WRITE_FILE):
      print(f"{WRITE_FILE} already exists.")
      return
    fw = open(WRITE_FILE, "w", encoding="utf-8")
  else:
    fw = open(WRITE_FILE, "a", encoding="utf-8")
  
  for _ in range(START_LINE+1):
    fr.readline()  # Skip line
  flag = False
  while True:
    tasks = []
    async_num = SEMA_NUM*5
    for _ in range(async_num):
      line = fr.readline()
      if not line:
        flag = True
        break
      line = line.strip()
      if line == "":
        continue
      print(line)
      id = line.split(",")[5].strip()
      name = line.split(",")[1].strip()
      try:
        tasks.append(asyncio.create_task(crawl_kakao_map_review(id, name)))
      except:
        fr.close()
        fw.close()
        return
    
    results = await asyncio.gather(*tasks)

    for result in results:
      if result:
        id = result[0]
        name = result[1]
        score = result[2]
        reviews = result[3]
        fw.write(f"{id}, {name}, {score}, {reviews}\n")
      else:
        print("Error in result")
        return
    if flag:
      break
    
if __name__ == "__main__":
  asyncio.run(main())