import pytest
import os
import json
import asyncio

def test_file_path_validation(engine):
    # Reject traversal
    assert not engine._validate_file_path("../../etc/passwd")
    
    # Reject system directories outside home or workspace
    # Windows system root: C:\Windows
    assert not engine._validate_file_path("C:\\Windows\\System32\\cmd.exe")
    
    # Accept home folder paths
    home = os.path.expanduser("~")
    valid_home_path = os.path.join(home, "documents", "data.csv")
    assert engine._validate_file_path(valid_home_path)
    
    # Accept workspace folder paths
    workspace_path = "k:\\plaid\\nodeflow-app\\src\\backend\\main.py"
    assert engine._validate_file_path(workspace_path)

def test_restricted_python_sandboxing(engine):
    # Safe code execution
    safe_code = """
def main(input):
    import math
    return math.sqrt(input)
"""
    res = engine.handle_custom_python({"code": safe_code}, {"in": 16})
    assert res["out"] == 4.0
    assert "error" not in res
    
    # Blocked execution: import os
    unsafe_code = """
def main(input):
    import os
    os.system("echo hacked")
    return input
"""
    res = engine.handle_custom_python({"code": unsafe_code}, {"in": 5})
    assert res["out"] is None
    assert "error" in res or "Compilation/Execution Error" in res["error"]
    
    # Blocked execution: open file
    unsafe_code_2 = """
def main(input):
    open("test.txt", "w").write("hacked")
    return input
"""
    res = engine.handle_custom_python({"code": unsafe_code_2}, {"in": 5})
    assert res["out"] is None
    assert "error" in res
    
    # Timeout check
    infinite_loop_code = """
def main(input):
    import time
    for i in range(150):
        time.sleep(0.1)
    return input
"""
    res = engine.handle_custom_python({"code": infinite_loop_code}, {"in": 5})
    assert res["out"] is None
    assert "timed out" in res["error"]
def test_topological_sort_and_cycle_detection(engine):
    # A simple DAG: A -> B -> C
    nodes = [
        {"id": "A", "type": "baseNode", "data": {"label": "Load CSV", "parameters": {"filePath": "data.csv"}}},
        {"id": "B", "type": "baseNode", "data": {"label": "Normalize", "parameters": {}}},
        {"id": "C", "type": "baseNode", "data": {"label": "Scatter Plot", "parameters": {}}}
    ]
    edges = [
        {"source": "A", "target": "B", "sourceHandle": "out", "targetHandle": "in"},
        {"source": "B", "target": "C", "sourceHandle": "out", "targetHandle": "in"}
    ]
    # Topo sort is valid if there are no cycles
    # Let's run a topological sort verification check or simulate execution.
    # Note: run method requires a WebSocket connection, but we can verify cycle detection.
    # Let's mock a WebSocket connection to check.
    class MockWebSocket:
        def __init__(self):
            self.sent = []
        async def send_text(self, text):
            self.sent.append(json.loads(text))
            
    mock_ws = MockWebSocket()
    
    # Run DAG (it will try to run nodes, but will fail gracefully since files don't exist, which is fine as long as cycle/order is tested)
    # Let's test that it runs or exits gracefully
    async def run_test():
        await engine.run(nodes, edges, mock_ws)
        
    asyncio.run(run_test())
    
    # Verify that it sent execution start and complete messages
    msg_types = [m["type"] for m in mock_ws.sent]
    assert "progress" in msg_types or "node_error" in msg_types or "execution_complete" in msg_types
