RESUME_EXTRACTION_PROMPT = """
You are an expert in resume screening. Your task is to extract relevant details from a resume.
You will receive a resume in text format, and you need to identify key information such as:
- name (string)
- email (string)
- phone (string)
- education (string or null)
- work_experience (integer or null)
- skills (list of strings)
- certifications (list of strings)

Your response must be a valid JSON object.
Use `null` if a value is missing.

Here is the resume text:
{resume_text}

Expected response format:
{{
  "name": "John Doe",
  "email": "abc@gmail.com",
  "phone": "1234567890",
  "education": "Bachelor of Science in Computer Science",
  "work_experience": 7,
  "skills": ["Python", "FastAPI", "Machine Learning"],
  "certifications": ["Certified Python Developer"]
}}
"""

JD_EXTRACTION_PROMPT = """
You are an expert in filtering the required skills and experience from a given job description. Your task is to extract relevant details from a resume.
You will receive the job description in text format, and you need to identify key information such as:
- the job title (string)
- min_work_experience in years (integer or null)
- max_work_experience in years (integer or null)
- skills (list of strings)

Your response must be a valid JSON object.
Use `null` if a value is missing.
If experience is not avaialble as a range, for example, "5+ years", consider it as 5 for min_work_experience and 8 for max_work_experience (assuming +3 years as the maximum).

Here is the job description text:
{jd_text}

Expected response format:
{{
  "job_title": "Job Title Here",
  "min_work_experience": 7,
  "max_work_experience": 10,
  "skills": ["Python", "FastAPI", "Machine Learning"]
}}
"""

CANDIDATE_EVALUATION_PROMPT = """
You are an expert Technical Recruitment Agent specialized in "Potential-First" candidate matching.

### INPUT DATA
1. **Candidate Profile (JSON):** {resume_json}
2. **Job Description (JSON):** {jd_json}

### EVALUATION PROTOCOL
Follow these logic steps:

1. **Experience Elasticity:**
   - Consider the candidate "Qualified" on experience if they are within 3 years of the target, OR if their career progression (promotions/titles) suggests they are ready for a "step up."

2. **Semantic Skill & Gap Analysis:**
   - **Matched Skills:** Direct or equivalent technical matches.
   - **Bridgeable Gaps:** Skills the candidate lacks but can likely learn in <30 days given their current stack (e.g., knows React → can learn Vue; knows AWS → can learn Azure).
   - **Hard Gaps:** Critical requirements that are fundamentally different from their current experience.

3. **Decision Logic:**
   - STATUS = "Selected" if (Matched Skills + Bridgeable Gaps) covers >= 70% of the JD requirements.
   - Bias toward "Selected" if the candidate shows high "Learnability."

### OUTPUT REQUIREMENTS
Return ONLY a JSON object with this structure:
{{
  "candidate_status": "Selected" | "Rejected",
  "match_score": 0,
  "experience_summary": "Analysis of their seniority vs JD requirements",
  "gap_analysis": {{
    "matched_skills": [],
    "bridgeable_gaps": [
      {{"missing_skill": "X", "transferable_skill_found": "Y", "time_to_proficiency": "2 weeks"}}
    ],
    "hard_gaps": []
  }},
  "upskill_potential": "Short assessment of how easily this person adapts.",
  "reasoning": "A 3-sentence objective justification."
}}
"""

