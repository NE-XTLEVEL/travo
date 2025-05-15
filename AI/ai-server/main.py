from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from llm_model import llm
from langchain.schema import SystemMessage, HumanMessage
from prompt import landmark_system_prompt, landmark_user_prompt
from landmark import landmark_list

model = SentenceTransformer('jhgan/ko-sroberta-multitask')

app = FastAPI()

class Prompt(BaseModel):
  prompt: str

class LandmarkPrompt(BaseModel):
  days: int
  prompt: str

class EmbeddingResponse(BaseModel):
  embedding: list

class LandmarkResponse(BaseModel):
  landmarks: list

@app.get("/")
def read_root():
  return {"Hello": "World"}


@app.post("/embedding")
async def get_embedding(prompt: Prompt) -> EmbeddingResponse:
  """
  Get the embedding for a given text.
  """
  embedding = model.encode(prompt.prompt, convert_to_tensor=True)
  return EmbeddingResponse(embedding=embedding.tolist())

@app.post("/landmark")
async def get_landmark(landmark_prompt: LandmarkPrompt) -> LandmarkResponse:
  """
  Get the landmark for a given text.
  """

  messages = [
    SystemMessage(content=landmark_system_prompt),
    HumanMessage(content=landmark_user_prompt.format(days=landmark_prompt.days, description=landmark_prompt.prompt))
  ]

  response = llm.invoke(messages)

  try:
    response = response.content
    landmark_str = response.split("추천 관광지: ")[1]
    
    landmarks = landmark_str.split(",")
    landmarks = list(set(landmarks))
    landmarks = [landmark.strip() for landmark in landmarks]
    landmarks = [landmark for landmark in landmarks if landmark in landmark_list]

    if len(landmarks) != landmark_prompt.days:
      raise ValueError("The number of landmarks does not match the number of days.")

    return {
      "landmarks": landmarks,
    }
  except:
    return {
      "landmarks": None,
    }
  