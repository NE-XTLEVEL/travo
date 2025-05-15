import os
import asyncio
from playwright.async_api import async_playwright

SEMA_NUM = 40  # 동시 실행 수
semaphore = asyncio.Semaphore(SEMA_NUM)  # 동시 실행 수 제한

async def crawl_kakao_map_home(id, name, line):
  async with semaphore:
    async with async_playwright() as p:
      browser = await p.chromium.launch(headless=True)
      page = await browser.new_page()

      try:
        await page.goto(f"https://place.map.kakao.com/{id}#home", timeout=100000)
      except Exception as e:
        print(f"Failed to load page {id} - {e}")
        await browser.close()
        return (id, name, None, line)

    
      try:
        data = await page.locator("div[id='foldDetail2']").inner_text()
      except Exception as e:
        data = None

      await browser.close()

      return (id, name, data, line)
    
# async def crawl_with_timeout(id, name, line, timeout=10.0):
#   try:
#     return await asyncio.wait_for(crawl_kakao_map_home(id, name, line), timeout)
#   except asyncio.TimeoutError:
#     print(f"Timeout for {id}")
#     return (id, name, None, line)

async def main():
  # seasons = ["4", "3", "2", "1"]
  # 4: Spring, 3: Summer, 2: Fall, 1: Winter
  category = "cafe"
  WRITE_FILE = f"../new_data/new_kakao_{category}.txt"
  START_LINE = 0

  fr = open(f"../new_data/kakao_{category}.txt", "r", encoding="utf-8")
  if START_LINE == 0:
    # if os.path.exists(WRITE_FILE):
    #   print(f"{WRITE_FILE} already exists.")
    #   return
    fw = open(WRITE_FILE, "w", encoding="utf-8")
  else:
    fw = open(WRITE_FILE, "a", encoding="utf-8")
  
  for _ in range(START_LINE):
    fr.readline()  # Skip line
  flag = False
  cnt = 0
  while True:
    tasks = []
    async_num = SEMA_NUM*10
    for _ in range(async_num):
      line = fr.readline()
      if not line:
        flag = True
        break
      line = line.strip()
      if line == "":
        continue

      id = line.split(",")[0].strip()
      name = line.split(",")[1].strip()
      try:
        tasks.append(asyncio.create_task(crawl_kakao_map_home(id, name, line)))
      except:
        fr.close()
        fw.close()
        return
    
    results = await asyncio.gather(*tasks)

    for result in results:
      if result:
        id = result[0]
        name = result[1]
        data = result[2]
        line = result[3]
        remain_line = line.split(",")[2:]

        remain_line = ",".join(remain_line)

        fw.write(f"{id}, {name}, {data}, {remain_line}\n")
      else:
        print("Error in result")
        return
      
    cnt += len(results)
    print(f"Processed {cnt} lines")
    if flag:
      break
    
if __name__ == "__main__":
  asyncio.run(main())