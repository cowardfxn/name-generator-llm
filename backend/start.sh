#!/usr/bin/bash

source ./venv/bin/activate
uvicorn app.main:app --reload --port 8000
trap "deactivate" EXIT
