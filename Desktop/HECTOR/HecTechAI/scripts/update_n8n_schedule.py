import requests
import json

API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NDM5MzFkMy05NzcwLTQ2NzQtOTYyYi1lNGU2NTYwZmJmMjAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY5NDIxOTI1fQ.8nOhyRzJyZDn4K-wkBbzve_6LESecoCyQ-Q89Wttgo4"
WORKFLOW_ID = "pOlVs-p57KioSN_lbAH9F"
BASE_URL = "https://n8n.hectechai.com/api/v1"

headers = {
    "X-N8N-API-KEY": API_KEY,
    "Content-Type": "application/json"
}

def clean_node(node):
    allowed = ["parameters", "name", "type", "typeVersion", "position", "credentials"]
    # SPECIAL CASE: webhook nodes sometimes need webhookId or it recreates the URL
    if node.get("type") == "n8n-nodes-base.webhook":
        allowed.append("webhookId")
    return {k: node[k] for k in allowed if k in node}

def update_workflow():
    resp = requests.get(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=headers)
    workflow = resp.json()
    
    nodes = [clean_node(n) for n in workflow.get("nodes", [])]
    connections = workflow.get("connections", {})
    
    node_name = "Robot Seguimiento Diario"
    
    if not any(n.get("name") == node_name for n in nodes):
        schedule_node = {
            "parameters": {
                "rule": {
                    "interval": [{"triggerAtHour": 0}]
                }
            },
            "name": node_name,
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.1,
            "position": [-650, 150]
        }
        nodes.append(schedule_node)
        
        connections[node_name] = {
            "main": [[{"node": "Leer Leads", "type": "main", "index": 0}]]
        }

    # API MUST HAVE 'settings' even if empty, or it errors "missing"
    # But it must NOT have 'id', 'updatedAt', etc.
    payload = {
        "name": workflow.get("name"),
        "nodes": nodes,
        "connections": connections,
        "settings": {
            "executionOrder": "v1",
            "availableInMCP": True,
            "timeSavedMode": "fixed",
            "callerPolicy": "workflowsFromSameOwner"
        }
    }
    
    put_resp = requests.put(f"{BASE_URL}/workflows/{WORKFLOW_ID}", headers=headers, json=payload)
    
    if put_resp.status_code == 200:
        print("Workflow updated successfully!")
        requests.post(f"{BASE_URL}/workflows/{WORKFLOW_ID}/activate", headers=headers)
        print("Workflow activated!")
    else:
        print(f"Update failed: {put_resp.text}")

if __name__ == "__main__":
    update_workflow()
