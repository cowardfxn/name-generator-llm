from typing import List
import torch
from transformers import AutoTokenizer, AutoModel
from optimum.gguf import GGUFModel


class EmbeddingService:
    def __init__(self):
        self.model_name = "Qwen/Qwen3-Embedding-0.6B-GGUF"
        self.model = GGUFModel.from_pretrained(self.model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        获取文本的向量表示
        """
        embeddings = []
        for text in texts:
            inputs = self.tokenizer(
                text, return_tensors="pt", padding=True, truncation=True, max_length=512
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self.model(**inputs)
                # 使用最后一层隐藏状态的平均值作为文本表示
                embedding = outputs.last_hidden_state.mean(dim=1)
                embeddings.append(embedding[0].cpu().numpy().tolist())

        return embeddings


class RerankerService:
    def __init__(self):
        self.model_name = "Qwen/Qwen3-Reranker-0.6B"
        self.model = AutoModel.from_pretrained(self.model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)

    def rerank(
        self, query: str, documents: List[str], top_k: int = 3
    ) -> List[tuple[str, float]]:
        """
        对检索到的文档进行重排序
        """
        scores = []
        for doc in documents:
            inputs = self.tokenizer(
                text=query,
                text_pair=doc,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512,
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self.model(**inputs)
                # 使用CLS token的输出计算相似度分数
                score = outputs.last_hidden_state[:, 0, :].mean().item()
                scores.append((doc, score))

        # 按分数降序排序并返回top_k个结果
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]
