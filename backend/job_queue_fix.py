# Read and fix job_queue.py
with open('job_queue.py', 'r') as f:
    content = f.read()

# Fix the enqueue signature
old_sig = "def enqueue(self, job_id: str, domain: str, analysis_type: str, func: Callable, *args) -> str:"
new_sig = "def enqueue(self, job_id: str, analysis_type: str, func: Callable, *args, **kwargs) -> str:"

content = content.replace(old_sig, new_sig)

# Fix the AnalysisJob creation
old_create = """db_job = AnalysisJob(
            job_id=job_id,
            status='pending',
            domain=domain,
            analysis_type=analysis_type
        )"""

new_create = """db_job = AnalysisJob(
            job_id=job_id,
            status='pending',
            domain=kwargs.get('domain', 'unknown'),
            analysis_type=analysis_type
        )"""

content = content.replace(old_create, new_create)

with open('job_queue.py', 'w') as f:
    f.write(content)

print("Fixed job_queue.py")
