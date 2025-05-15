# 1. 베이스 이미지로 Python 3.11을 사용
FROM python:3.12.7

# 2. 작업 디렉터리 생성
WORKDIR /app

# 3. requirements.txt 파일을 복사 (모든 의존성 목록)
COPY requirements.txt .

# 4. 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 5. FastAPI 애플리케이션 코드 복사
COPY . .

RUN python download.py
# 6. 포트 8000을 노출
ENV PORT=8080
EXPOSE 8080

CMD ["sh","-c","uvicorn main:app --host 0.0.0.0 --port $PORT"]