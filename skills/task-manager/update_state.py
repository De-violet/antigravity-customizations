#!/usr/bin/env python3
import json
import os
import sys
import argparse
from datetime import datetime

def get_project_name(cwd=None):
    if not cwd:
        cwd = os.getcwd()
    home = os.path.expanduser("~")
    rel = os.path.relpath(cwd, home)
    if rel in [".", ""]:
        return "default"
    # Ambil nama folder utama proyek
    parts = rel.split(os.sep)
    return parts[0] if parts else "default"

def get_state_file_path(project_name=None, cwd=None):
    if not cwd:
        cwd = os.getcwd()
    
    # 1. Prioritas Utama: Jika proyek lokal memiliki folder .agents/
    workspace_agents = os.path.join(cwd, ".agents")
    if os.path.exists(workspace_agents):
        return os.path.join(workspace_agents, "memory", "state.json")

    # 2. Level Project di config global
    home = os.path.expanduser("~")
    if not project_name:
        project_name = get_project_name(cwd)
    
    projects_dir = os.path.join(home, ".gemini", "config", "memory", "projects")
    os.makedirs(projects_dir, exist_ok=True)
    return os.path.join(projects_dir, f"{project_name}.json")

def load_memory(file_path):
    default_data = {
        "active_project_goal": "",
        "user_constraints": [],
        "completed_milestones": [],
        "pending_tasks": [],
        "history": [],
        "last_updated": datetime.now().isoformat()
    }
    if not os.path.exists(file_path):
        return default_data
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Pastikan semua keys standar ada
            for k, v in default_data.items():
                if k not in data:
                    data[k] = v
            return data
    except Exception:
        return default_data

def save_memory(file_path, data):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    data["last_updated"] = datetime.now().isoformat()
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def reset_memory(file_path):
    data = load_memory(file_path)
    # Arsipkan goal lama ke history jika ada
    if data.get("active_project_goal"):
        archive_entry = {
            "goal": data["active_project_goal"],
            "completed_milestones": data.get("completed_milestones", []),
            "archived_at": datetime.now().isoformat()
        }
        data["history"].append(archive_entry)

    data["active_project_goal"] = ""
    data["user_constraints"] = []
    data["completed_milestones"] = []
    data["pending_tasks"] = []
    save_memory(file_path, data)
    print(f"Memory reset for {file_path}. Goal archived to history.")

def main():
    parser = argparse.ArgumentParser(description="Task & Project Memory Manager")
    parser.add_argument("pos_goal", nargs="?", default=None, help="Positional goal (or '-')")
    parser.add_argument("pos_constraint", nargs="?", default=None, help="Positional constraint (or '-')")
    parser.add_argument("pos_completed", nargs="?", default=None, help="Positional milestone (or '-')")

    parser.add_argument("--goal", "-g", help="Set active project goal")
    parser.add_argument("--constraint", "-c", help="Add user constraint")
    parser.add_argument("--remove-constraint", help="Remove user constraint")
    parser.add_argument("--complete", "-m", help="Add completed milestone")
    parser.add_argument("--reset", action="store_true", help="Reset active goal and constraints (archive to history)")
    parser.add_argument("--status", "-s", action="store_true", help="Show current memory status")
    parser.add_argument("--project", "-p", help="Target specific project name")

    args = parser.parse_args()

    file_path = get_state_file_path(project_name=args.project)
    
    if args.status:
        data = load_memory(file_path)
        print(f"File: {file_path}")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return

    if args.reset:
        reset_memory(file_path)
        return

    data = load_memory(file_path)
    updated = False

    # 1. Goal
    goal = args.goal or (args.pos_goal if args.pos_goal != "-" else None)
    if goal:
        data["active_project_goal"] = goal
        updated = True

    # 2. Constraint
    constraint = args.constraint or (args.pos_constraint if args.pos_constraint != "-" else None)
    if constraint and constraint not in data["user_constraints"]:
        data["user_constraints"].append(constraint)
        updated = True

    if args.remove_constraint and args.remove_constraint in data["user_constraints"]:
        data["user_constraints"].remove(args.remove_constraint)
        updated = True

    # 3. Completed milestone
    complete = args.complete or (args.pos_completed if args.pos_completed != "-" else None)
    if complete and complete not in data["completed_milestones"]:
        data["completed_milestones"].append(complete)
        updated = True

    if updated:
        save_memory(file_path, data)
        print(f"Memory updated ({file_path}):")
        print(json.dumps({
            "goal": data["active_project_goal"],
            "constraints": data["user_constraints"],
            "milestones": data["completed_milestones"]
        }, indent=2, ensure_ascii=False))
    else:
        print(f"Memory status ({file_path}):")
        print(json.dumps({
            "goal": data["active_project_goal"] or "(none)",
            "constraints": data["user_constraints"],
            "milestones": data["completed_milestones"]
        }, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
