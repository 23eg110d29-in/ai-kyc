import os

# ChromaDB requires persistent disk storage and SQLite3 — not available on
# Vercel serverless. We gracefully disable RAG features in that environment.
try:
    from langchain_community.vectorstores import Chroma
    from langchain_openai import OpenAIEmbeddings
    from langchain_core.documents import Document
    from backend.core.config import settings

    embeddings = (
        OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
        if settings.OPENAI_API_KEY != "your_openai_api_key_here"
        else None
    )
    RAG_AVAILABLE = True
except Exception:
    embeddings = None
    RAG_AVAILABLE = False


def get_vector_store():
    if not RAG_AVAILABLE or not embeddings:
        return None
    return Chroma(
        collection_name="kyc_docs",
        embedding_function=embeddings,
        persist_directory=settings.CHROMA_PERSIST_DIR,
    )


def add_document_to_rag(doc_id: str, text: str, metadata: dict = None):
    if not RAG_AVAILABLE or not embeddings:
        return
    vector_store = get_vector_store()
    if vector_store is None:
        return
    if not metadata:
        metadata = {}
    metadata["doc_id"] = doc_id
    doc = Document(page_content=text, metadata=metadata)
    vector_store.add_documents([doc])


def query_rag(query: str, k: int = 3):
    if not RAG_AVAILABLE or not embeddings:
        return []
    vector_store = get_vector_store()
    if vector_store is None:
        return []
    return vector_store.similarity_search(query, k=k)
