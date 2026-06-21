import PyPDF2 as pypdf2
import docx
import io

def parse_pdf(file) -> str:
    file_bytes = file.read() if hasattr(file, 'read') else file
    filename = getattr(file, 'filename', '') or getattr(file, 'name', '')

    if filename.endswith('.docx'):
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            return '\n'.join([para.text for para in doc.paragraphs if para.text.strip()])
        except Exception as e:
            return str(e)

    if filename.endswith('.txt'):
        try:
            return file_bytes.decode('utf-8')
        except Exception as e:
            return str(e)

    try:
        reader = pypdf2.PdfReader(io.BytesIO(file_bytes))
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
        return text.strip()
    except Exception as e:
        return str(e)