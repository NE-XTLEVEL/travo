from sentence_transformers import SentenceTransformer
import numpy as np
sentences = ["안녕하세요?", "한국어 문장 임베딩을 위한 버트 모델입니다."]

model = SentenceTransformer('jhgan/ko-sroberta-multitask')
temp = model.encode(sentences)
embeddings = np.concatenate(temp, axis=0)
print(embeddings)
print(embeddings.shape)