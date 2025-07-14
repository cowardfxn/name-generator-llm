from typing import List, Optional
import weaviate
from app.services.embedding_service import EmbeddingService, RerankerService


class WeaviateService:
    def __init__(self):
        self.client = weaviate.Client("http://weaviate:8080")
        self.embedding_service = EmbeddingService()
        self.reranker_service = RerankerService()
        self._ensure_schema()

    def _ensure_schema(self):
        """
        确保所需的schema存在
        """
        if not self.client.schema.exists("Document"):
            class_obj = {
                "class": "Document",
                "vectorizer": "none",  # 我们使用自定义的embedding
                "properties": [
                    {
                        "name": "content",
                        "dataType": ["text"],
                        "description": "文档内容",
                    },
                    {
                        "name": "type",
                        "dataType": ["string"],
                        "description": "文档类型",
                    },
                ],
            }
            self.client.schema.create_class(class_obj)

    def add_documents(self, contents: List[str], doc_type: str):
        """
        添加文档到向量数据库
        """
        embeddings = self.embedding_service.get_embeddings(contents)

        with self.client.batch as batch:
            for content, vector in zip(contents, embeddings):
                batch.add_data_object(
                    data_object={"content": content, "type": doc_type},
                    class_name="Document",
                    vector=vector,
                )

    def search_similar(
        self, query: str, doc_type: Optional[str] = None, limit: int = 5
    ) -> List[str]:
        """
        搜索相似文档
        """
        # 获取查询的向量表示
        query_vector = self.embedding_service.get_embeddings([query])[0]

        # 构建查询
        query_builder = (
            self.client.query.get("Document")
            .with_near_vector({"vector": query_vector, "certainty": 0.7})
            .with_limit(limit * 2)  # 获取更多结果用于重排序
        )

        # 如果指定了文档类型，添加过滤条件
        if doc_type:
            query_builder = query_builder.with_where(
                {"path": ["type"], "operator": "Equal", "valueString": doc_type}
            )

        # 执行查询
        result = query_builder.with_additional("vector").do()

        # 提取文档内容
        if "data" in result and "Get" in result["data"]:
            documents = [obj["content"] for obj in result["data"]["Get"]["Document"]]

            # 使用reranker重新排序
            if documents:
                reranked_docs = self.reranker_service.rerank(query, documents, limit)
                return [doc for doc, _ in reranked_docs]

        return []

    def delete_documents(self, doc_type: Optional[str] = None):
        """
        删除文档
        """
        if doc_type:
            where_filter = {
                "path": ["type"],
                "operator": "Equal",
                "valueString": doc_type,
            }
            self.client.batch.delete_objects(class_name="Document", where=where_filter)
        else:
            self.client.batch.delete_objects(class_name="Document")
