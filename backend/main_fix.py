with open('main.py', 'r') as f:
    content = f.read()

# Fix first enqueue call (analyze-async)
old1 = """job_queue.enqueue(
            job_id=job_id,
            domain=domain,
            analysis_type='deep_analysis',
            func=run_deep_analysis,
            domain=domain,
            competitors=competitors
        )"""

new1 = """job_queue.enqueue(
            job_id,
            'deep_analysis',
            run_deep_analysis,
            domain,
            competitors,
            domain=domain
        )"""

content = content.replace(old1, new1)

# Fix second enqueue call (deep-analysis)
old2 = """job_queue.enqueue(
            job_id=job_id,
            domain=domain,
            analysis_type='deep_site_analysis',
            func=full_site_analysis,
            domain,
            competitors
        )"""

new2 = """job_queue.enqueue(
            job_id,
            'deep_site_analysis',
            full_site_analysis,
            domain,
            competitors,
            domain=domain
        )"""

content = content.replace(old2, new2)

with open('main.py', 'w') as f:
    f.write(content)

print("Fixed main.py")
