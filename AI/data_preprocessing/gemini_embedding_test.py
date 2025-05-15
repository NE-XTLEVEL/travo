from google import genai
import os
import dotenv

dotenv.load_dotenv(verbose=True)

client = genai.Client(api_key=os.getenv("GEMINI_KEY"))
 
result = client.models.embed_content(
        model="gemini-embedding-exp-03-07",
        contents=["How does alphafold work?", "What is the capital of France?", "What is the weather like today?"],
)
 
print(result.embeddings)
print(len(result.embeddings))