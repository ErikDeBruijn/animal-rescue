#!/usr/bin/env python3
import unittest
import sys
import requests
import time
import os
import subprocess

# Check of de server al draait in productie mode
try:
    response = requests.get("http://localhost:5050")
    if response.status_code == 200:
        print("Productie server draait al. Test van dev mode:")
        
        # Test of de editor niet beschikbaar is in productie mode
        response = requests.get("http://localhost:5050/editor")
        if response.status_code == 404:
            print("✅ Editor endpoint blocked in production mode")
        else:
            print(f"❌ Editor endpoint is toegankelijk in productie mode (status code: {response.status_code})")
            
        # Test POST endpoint (opslaan van levels)
        response = requests.post("http://localhost:5050/api/levels", json={"levelIndex": "new", "levelCode": "{}"})
        if response.status_code == 404:
            print("✅ POST /api/levels blocked in production mode")
        else:
            print(f"❌ POST /api/levels is toegankelijk in productie mode (status code: {response.status_code})")
            
except:
    print("Productie server draait niet.")

print("\n== Nu starten we een server met --dev flag ==")

# Start een dev server met command line flag
try:
    dev_server = subprocess.Popen(
        ["python3", "server.py", "--dev"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    print("Dev server opgestart met --dev flag. Wachten op opstart...")
    time.sleep(3)
    
    # Test of de editor beschikbaar is in dev mode
    response = requests.get("http://localhost:5050/editor")
    if response.status_code == 200:
        print("✅ Editor endpoint works in development mode")
    else:
        print(f"❌ Editor endpoint is niet toegankelijk in dev mode (status code: {response.status_code})")
    
    # Stop de server
    dev_server.terminate()
    dev_server.wait(timeout=5)
    
except Exception as e:
    print(f"Error bij uitvoeren van dev mode test: {e}")

print("\n== Nu starten we een server met environment variable ==")

# Start een dev server met environment variable
try:
    env = os.environ.copy()
    env['DIERENREDDERS_DEV_MODE'] = 'true'
    
    dev_server = subprocess.Popen(
        ["python3", "server.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env
    )
    print("Dev server opgestart met DIERENREDDERS_DEV_MODE=true. Wachten op opstart...")
    time.sleep(3)
    
    # Test of de editor beschikbaar is in dev mode
    response = requests.get("http://localhost:5050/editor")
    if response.status_code == 200:
        print("✅ Editor endpoint works in development mode (via env var)")
    else:
        print(f"❌ Editor endpoint is niet toegankelijk in dev mode via env var (status code: {response.status_code})")
    
    # Lees server output voor debugging
    stdout_data = dev_server.stdout.read1(1024).decode('utf-8')
    if stdout_data:
        print(f"Server output: {stdout_data}")
        
    # Stop de server
    dev_server.terminate()
    dev_server.wait(timeout=5)
    
except Exception as e:
    print(f"Error bij uitvoeren van environment variable test: {e}")