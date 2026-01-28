# utils.py
import json
import os
from datetime import datetime
from fpdf import FPDF
import textwrap

def log_agent_data(data, agent_name, filename="evaluations.json"):
    """
    Standardizes how every agent saves its data.
    """
    # 1. Package the data with a timestamp and the agent's identity
    entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "agent": agent_name,
        "results": data
    }

    # 2. Check if file exists and load it safely
    if os.path.exists(filename) and os.path.getsize(filename) > 0:
        with open(filename, 'r', encoding='utf-8') as f:
            try:
                current_data = json.load(f)
            except json.JSONDecodeError:
                current_data = [] # Start fresh if the file is corrupted
    else:
        current_data = []

    # 3. Append and save
    current_data.append(entry)
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(current_data, f, indent=4)
    
    return filename

# --- NEW FUNCTION TO GENERATE PDF REPORT ---
def generate_evaluation_pdf(json_filename="evaluations.json", output_pdf="Candidate_Report.pdf"):
    print(f"!!! DEBUG: Creating PDF at: {os.path.abspath(output_pdf)}", flush=True)
    try:
        if not os.path.exists(json_filename):
            print(f"!!! Error: {json_filename} not found")
            return None

        with open(json_filename, "r") as f:
            data = json.load(f)
        
        # 1. Initialize with explicit margins
        pdf = FPDF(unit='mm', format='A4')
        pdf.set_margins(10, 10, 10) 
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        pdf.set_font("Helvetica", 'B', 16)
        pdf.cell(0, 10, txt="Candidate Screening Report", ln=True, align='C')
        
        pdf.set_font("Helvetica", size=10)
        pdf.cell(0, 10, txt=f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True, align='C')
        pdf.ln(5)
        usable_width = 190
        for entry in data:
            agent = entry.get("agent", "Unknown Agent")
            results = entry.get("results", {})

            # Section Title
            pdf.set_x(10) # Force cursor to left margin
            pdf.set_fill_color(230, 230, 230)
            pdf.set_font("Helvetica", 'B', 12)
            pdf.cell(usable_width, 10, txt=f"Agent: {agent}", ln=True, fill=True)
            pdf.ln(2)

            if isinstance(results, dict):
                for key, value in results.items():
                    pdf.set_x(10) # Force cursor to left margin
                    clean_key = key.replace("_", " ").title()
                    val_str = str(value).replace("[", "").replace("]", "").replace("'", "")
                    
                    val_str = val_str.replace("’", "'").replace("‘", "'")
                    val_str = val_str.replace("“", '"').replace("”", '"')
                    val_str = val_str.replace("–", "-").replace("—", "-") 
                    # Wrap text to 80 characters for safety
                    wrapped_text = textwrap.fill(val_str, width=80)
                    
                    # 1. Key (Label)
                    pdf.set_font("Helvetica", 'B', 10)
                    pdf.multi_cell(usable_width, 7, txt=f"{clean_key}:", border=0)
                    
                    # 2. Value (Content)
                    pdf.set_x(10) # Reset X again before the value
                    pdf.set_font("Helvetica", size=10)
                    pdf.multi_cell(usable_width, 7, txt=wrapped_text, border=0)
                    pdf.ln(2)
            else:
                pdf.set_x(10)
                pdf.multi_cell(usable_width, 7, txt=textwrap.fill(str(results), width=80))
            
            pdf.ln(4)

        pdf.output(output_pdf)
        print(f"PDF successfully created: {output_pdf}", flush=True)
        return output_pdf

    except Exception as e:
        print(f"Error generating PDF: {e}", flush=True)
        import traceback
        traceback.print_exc() # This will show us EXACTLY which line failed
        return None