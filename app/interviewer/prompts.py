def question_prompt(role, difficulty, question_number):
    return f"""
You are a strict interviewer for a {role} role.

Rules:
- Ask ONE question only
- No hints or explanations
- Difficulty: {difficulty}
- Question number: {question_number}

Ask the next interview question.
"""


def evaluation_prompt(question, answer):
    return f"""
You are a technical interviewer evaluating a specific answer.
    
    Question: {question}
    Candidate answer: {answer}

    Provide scores from 1 to 10. You must follow the format below strictly so the system can parse the score.

    Format:
    Knowledge: [score]
    Reasoning: [score]
    Communication: [score]
    Justification: [short sentence]
    
"""
