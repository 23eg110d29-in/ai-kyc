from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from backend.core.config import settings

class KYCState(TypedDict):
    user_data: Dict[str, Any]
    documents: List[Dict[str, Any]] # {"type": "passport", "text": "..."}
    verification_status: str
    confidence: float
    reason: str
    extracted_entities: Dict[str, Any]

llm = None
if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here":
    llm = ChatOpenAI(model="gpt-4o", temperature=0, openai_api_key=settings.OPENAI_API_KEY)

def extract_entities_node(state: KYCState) -> KYCState:
    if not llm:
        # Mock behavior if no API key
        state["extracted_entities"] = {"name": state["user_data"].get("username", "Unknown")}
        return state
        
    doc_text = "\n".join([f"[{d['type']}]: {d['text']}" for d in state["documents"]])
    prompt = f"Extract the following entities from the documents: Name, Date of Birth, ID Number.\nDocuments:\n{doc_text}"
    response = llm.invoke([HumanMessage(content=prompt)])
    # Simplified parsing
    state["extracted_entities"] = {"raw": response.content}
    return state

def verify_identity_node(state: KYCState) -> KYCState:
    if not llm:
        state["verification_status"] = "approved"
        state["confidence"] = 0.95
        state["reason"] = "Mock verification passed"
        return state
        
    system_msg = SystemMessage(content="You are a strict KYC compliance officer. Compare the user data with the extracted document entities. Determine if they match and if the documents appear legitimate. Output YES or NO followed by confidence and reason.")
    user_msg = HumanMessage(content=f"User Data: {state['user_data']}\nExtracted Entities: {state['extracted_entities']}")
    response = llm.invoke([system_msg, user_msg])
    
    content = response.content.lower()
    if "yes" in content[:10]:
        state["verification_status"] = "approved"
        state["confidence"] = 0.9
    else:
        state["verification_status"] = "rejected"
        state["confidence"] = 0.5
    state["reason"] = response.content
    return state

def build_kyc_graph():
    workflow = StateGraph(KYCState)
    workflow.add_node("extract_entities", extract_entities_node)
    workflow.add_node("verify_identity", verify_identity_node)
    
    workflow.set_entry_point("extract_entities")
    workflow.add_edge("extract_entities", "verify_identity")
    workflow.add_edge("verify_identity", END)
    
    return workflow.compile()

kyc_app = build_kyc_graph()

def run_kyc_pipeline(user_data: dict, documents: list) -> dict:
    initial_state = {
        "user_data": user_data,
        "documents": documents,
        "verification_status": "pending",
        "confidence": 0.0,
        "reason": "",
        "extracted_entities": {}
    }
    result = kyc_app.invoke(initial_state)
    return result
