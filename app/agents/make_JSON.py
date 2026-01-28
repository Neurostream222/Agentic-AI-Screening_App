import json
import os

def append_to_json(new_data, filename="data_output.json"):
    # 1. Check if the file exists and is not empty
    if os.path.exists(filename) and os.path.getsize(filename) > 0:
        with open(filename, 'r', encoding='utf-8') as f:
            try:
                # Load existing data
                data_list = json.load(f)
            except json.JSONDecodeError:
                # If file is corrupted, start fresh
                data_list = []
    else:
        # If file doesn't exist, create an empty list
        data_list = []

    # 2. Add the new extracted data to the list
    if isinstance(data_list, list):
        data_list.append(new_data)
    else:
        # If the file wasn't a list, wrap the old data and new data in one
        data_list = [data_list, new_data]

    # 3. Save the updated list back to the file
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data_list, f, indent=4)

# Example usage:
new_entry = {"id": 102, "status": "pending"}
append_to_json(new_entry)