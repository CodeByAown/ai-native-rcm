""""
User may choose different workflows, we initialize our langgraph workflow based on these.
"""
from typing import Dict, Any
from langgraph.graph import StateGraph, END
from deps import RCMState


def build_workflow(steps: list[str], TASK_REGISTRY: Dict[str, Any]) -> StateGraph:
    workflow = StateGraph(RCMState)

    # Add nodes
    for step in steps:
        workflow.add_node(step, TASK_REGISTRY[step])

    # Wire them in sequence
    for i in range(len(steps) - 1):
        workflow.add_edge(steps[i], steps[i + 1])

    # Mark entry and end
    workflow.set_entry_point(steps[0])
    workflow.add_edge(steps[-1], END)

    return workflow
