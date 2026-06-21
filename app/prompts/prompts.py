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
You are a senior technical recruiter with 15 years of experience making high-stakes hiring decisions.

### INPUT DATA
1. Candidate Profile (JSON): {resume_json}
2. Job Description (JSON): {jd_json}

### EVALUATION PROTOCOL

**Step 1 — Experience Assessment**
- Is the candidate within 3 years of the target range? If so, qualify them.
- Does their career progression (titles, scope of work) suggest readiness for a step-up?
- Flag if experience is inflated (too many jobs, vague descriptions, short tenures).

**Step 2 — Skill Analysis**
- Matched Skills: Direct or functionally equivalent matches.
- Bridgeable Gaps: Missing skills the candidate can learn in <30 days given their stack.
- Hard Gaps: Fundamentally different domains with no transferable foundation.

**Step 3 — Red Flag Detection**
Look for: unexplained employment gaps >6 months, excessive job hopping (3+ jobs in 3 years), credential mismatches, vague/generic skill listings with no context, repeated same-level roles with no progression.

**Step 4 — Communication Quality**
Assess the resume itself: Is it clear and specific? Are achievements quantified? Does it show impact or just list duties? This predicts how the candidate communicates on the job.

**Step 5 — Scorecard**
Score each dimension 0–100:
- technical_score: How well do their skills match the JD requirements?
- experience_score: Does their seniority and domain match?
- growth_score: Does their career show consistent upward progression?
- communication_score: How clearly and specifically is the resume written?

**Step 6 — Decision**
- STATUS = "Selected" if (matched + bridgeable) covers >= 70% of JD requirements AND no critical hard gaps AND no severe red flags.
- Lean "Selected" if the candidate shows strong learnability signals.
- Lean "Rejected" if red flags suggest reliability or fit risk.

### OUTPUT
Return ONLY a valid JSON object:
{{
  "candidate_status": "Selected" | "Rejected",
  "match_score": 0,
  "scorecard": {{
    "technical_score": 0,
    "experience_score": 0,
    "growth_score": 0,
    "communication_score": 0
  }},
  "experience_summary": "2-3 sentences on seniority vs JD requirements.",
  "gap_analysis": {{
    "matched_skills": [],
    "bridgeable_gaps": [
      {{"missing_skill": "X", "transferable_skill_found": "Y", "time_to_proficiency": "2 weeks"}}
    ],
    "hard_gaps": []
  }},
  "red_flags": [],
  "communication_quality": "Brief assessment of how clearly and specifically the resume is written.",
  "upskill_potential": "How quickly and easily could this person close their gaps?",
  "interview_questions": [
    "Targeted question based on a specific gap or concern",
    "Targeted question based on a specific gap or concern",
    "Targeted question based on a specific gap or concern"
  ],
  "reasoning": "3-sentence objective justification for the decision."
}}
"""

HEAD_TO_HEAD_PROMPT = """
You are a senior technical recruiter making a final hiring decision between pre-screened candidates.

### JOB DESCRIPTION
{jd_json}

### CANDIDATES (already individually scored)
{candidates_json}

### YOUR TASK
These candidates have already passed individual screening. Now compare them RELATIVE to each other and produce a final definitive ranking.

Consider:
- Who best fits the specific requirements of THIS role (not just highest score)?
- Who shows stronger career trajectory and growth signals?
- Who has fewer red flags?
- If two candidates are close in score, who would you bet on for long-term success in this role?

Return ONLY a valid JSON object:
{{
  "final_ranking": [
    {{
      "rank": 1,
      "name": "Candidate Name",
      "decisive_reason": "1-2 sentences on why this candidate ranks here specifically vs the others.",
      "hire_confidence": "High" | "Medium" | "Low"
    }}
  ],
  "recruiter_note": "2-3 sentence overall summary of the candidate pool quality and your top recommendation."
}}
"""
