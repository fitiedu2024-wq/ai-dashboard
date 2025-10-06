with open('models.py', 'r') as f:
    content = f.read()

# Check if create_engine is imported
if 'from sqlalchemy import' in content and 'create_engine' not in content.split('\n')[0:10]:
    # Add create_engine to imports
    content = content.replace(
        'from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text',
        'from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, create_engine'
    )
elif 'from sqlalchemy import' not in content:
    # Add full import at top
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('import') or line.startswith('from'):
            continue
        else:
            lines.insert(i, 'from sqlalchemy import create_engine')
            break
    content = '\n'.join(lines)

with open('models.py', 'w') as f:
    f.write(content)

print("Fixed models.py")
