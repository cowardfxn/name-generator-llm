# PowerShell equivalent of the given Bash script

# Activate the virtual environment
. .\venv\Scripts\Activate.ps1

# Start the uvicorn server
uvicorn app.main:app --reload --port 8000
