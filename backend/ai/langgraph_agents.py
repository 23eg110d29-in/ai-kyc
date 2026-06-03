from typing import TypedDict, Annotated, List, Dict, Any

# LangGraph and LangChain imports wrapped — they may fail on serverless
# if versions are incompatible or API keys are missing.
try:
    from langgraph.graph import StateGraph, END
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import HumanMessage, SystemMessage
    from backend.core.config import settings

    llm = None
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here":
        llm = ChatOpenAI(model="gpt-4o", temperature=0, openai_api_key=settings.OPENAI_API_KEY)

    LANGGRAPH_AVAILABLE = True
except Exception as e:
    print(f"LangGraph/LangChain not available: {e}")
    LANGGRAPH_AVAILABLE = False
    llm = None


class KYCState(TypedDict):
    user_data: Dict[str, Any]
    documents: List[Dict[str, Any]]
    verification_status: str
    confidence: float
    reason: str
    extracted_entities: Dict[str, Any]


def extract_entities_node(state: KYCState) -> KYCState:
    if not llm:
        state["extracted_entities"] = {"name": state["user_data"].get("username", "Unknown")}
        return state
    doc_text = "\n".join([f"[{d['type']}]: {d['text']}" for d in state["documents"]])
    prompt = f"Extract: Name, Date of Birth, ID Number.\nDocuments:\n{doc_text}"
    response = llm.invoke([HumanMessage(content=prompt)])
    state["extracted_entities"] = {"raw": response.content}
    return state


def verify_identity_node(state: KYCState) -> KYCState:
    if not llm:
        state["verification_status"] = "approved"
        state["confidence"] = 0.95
        state["reason"] = "Mock verification passed (no LLM key)"
        return state
    system_msg = SystemMessage(content="You are a KYC officer. Compare user data with document entities. Output YES or NO with confidence and reason.")
    user_msg = HumanMessage(content=f"User: {state['user_data']}\nEntities: {state['extracted_entities']}")
    response = llm.invoke([system_msg, user_msg])
    content = response.content.lower()
    state["verification_status"] = "approved" if "yes" in content[:10] else "rejected"
    state["confidence"] = 0.9 if state["verification_status"] == "approved" else 0.5
    state["reason"] = response.content
    return state


def build_kyc_graph():
    if not LANGGRAPH_AVAILABLE:
        return None
    try:
        workflow = StateGraph(KYCState)
        workflow.add_node("extract_entities", extract_entities_node)
        workflow.add_node("verify_identity", verify_identity_node)
        workflow.set_entry_point("extract_entities")
        workflow.add_edge("extract_entities", "verify_identity")
        workflow.add_edge("verify_identity", END)
        return workflow.compile()
    except Exception as e:
        print(f"Failed to build KYC graph: {e}")
        return None


kyc_app = build_kyc_graph()


def run_kyc_pipeline(user_data: dict, documents: list) -> dict:
    if not kyc_app:
        # Graceful fallback when LangGraph is unavailable
        return {
            "verification_status": "approved",
            "confidence": 0.95,
            "reason": "Auto-approved (AI pipeline unavailable in this environment)",
            "extracted_entities": {"name": user_data.get("username", "Unknown")},
        }
    initial_state = {
        "user_data": user_data,
        "documents": documents,
        "verification_status": "pending",
        "confidence": 0.0,
        "reason": "",
        "extracted_entities": {},
    }
    result = kyc_app.invoke(initial_state)
    return result
