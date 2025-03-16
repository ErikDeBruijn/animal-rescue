#!/usr/bin/env python3
import unittest
import sys
import requests
import time
import subprocess
import os
import signal
import threading

class TestServerDevMode(unittest.TestCase):
    """Tests om te verifiëren dat de editor endpoints alleen werken in dev mode"""

    @classmethod
    def setUpClass(cls):
        # Start eerst een server zonder dev flag
        print("Starting server in production mode...")
        cls.prod_server = subprocess.Popen(
            ["python3", "server.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        # Geef de server tijd om op te starten
        time.sleep(2)
        
        # Controleer of de server draait
        try:
            response = requests.get("http://localhost:5050")
            if response.status_code != 200:
                raise Exception("Server is niet goed opgestart in productie mode")
        except Exception as e:
            print(f"Fout bij opstarten server: {e}")
            cls.tearDownClass()
            sys.exit(1)
            
        print("Server running in production mode")

    @classmethod
    def tearDownClass(cls):
        # Stop de server na de tests
        if hasattr(cls, 'prod_server') and cls.prod_server:
            print("Shutting down production server...")
            cls.prod_server.terminate()
            cls.prod_server.wait(timeout=5)
            
        if hasattr(cls, 'dev_server') and cls.dev_server:
            print("Shutting down development server...")
            cls.dev_server.terminate()
            cls.dev_server.wait(timeout=5)

    def test_01_editor_blocked_in_prod_mode(self):
        """Test of de editor niet beschikbaar is in productie mode"""
        response = requests.get("http://localhost:5050/editor")
        self.assertEqual(response.status_code, 404, "Editor endpoint zou 404 moeten geven in productie mode")
        print("✅ Editor endpoint blocked in production mode")
        
    def test_02_api_levels_blocked_in_prod_mode(self):
        """Test of de level API endpoints niet beschikbaar zijn in productie mode"""
        # Test POST endpoint (opslaan van levels)
        response = requests.post("http://localhost:5050/api/levels", json={
            "levelIndex": "new",
            "levelCode": "{}"
        })
        self.assertEqual(response.status_code, 404, "POST /api/levels zou 404 moeten geven in productie mode")
        print("✅ POST /api/levels blocked in production mode")
        
        # Test DELETE endpoint 
        response = requests.delete("http://localhost:5050/api/levels/0")
        self.assertEqual(response.status_code, 404, "DELETE /api/levels/0 zou 404 moeten geven in productie mode")
        print("✅ DELETE /api/levels/0 blocked in production mode")
        
        # Test dat GET wel werkt (voor de game zelf)
        response = requests.get("http://localhost:5050/api/levels")
        self.assertEqual(response.status_code, 200, "GET /api/levels zou moeten werken in productie mode")
        print("✅ GET /api/levels works in production mode")
    
    def test_03_start_dev_mode_and_check_editor(self):
        """Test of de editor beschikbaar is in dev mode"""
        # Stop de productie server
        self.__class__.prod_server.terminate()
        self.__class__.prod_server.wait(timeout=5)
        self.__class__.prod_server = None
        
        # Start een nieuwe server in dev mode met environment variable
        print("Starting server in development mode...")
        env = os.environ.copy()
        env['DIERENREDDERS_DEV_MODE'] = 'true'
        self.__class__.dev_server = subprocess.Popen(
            ["python3", "server.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env
        )
        # Geef de server tijd om op te starten
        time.sleep(2)
        
        # Controleer of de server draait
        try:
            response = requests.get("http://localhost:5050")
            if response.status_code != 200:
                # Lees server output om te zien wat er misging
                stdout, stderr = self.__class__.dev_server.communicate(timeout=1)
                print(f"Server stdout: {stdout.decode('utf-8')}")
                print(f"Server stderr: {stderr.decode('utf-8')}")
                raise Exception("Server is niet goed opgestart in dev mode")
        except requests.exceptions.ConnectionError:
            # Als we geen verbinding kunnen maken, lees server output
            stdout, stderr = self.__class__.dev_server.communicate(timeout=1)
            print(f"Server stdout: {stdout.decode('utf-8')}")
            print(f"Server stderr: {stderr.decode('utf-8')}")
            raise Exception("Kon geen verbinding maken met de dev server")
        except Exception as e:
            print(f"Fout bij opstarten dev server: {e}")
            self.__class__.tearDownClass()
            sys.exit(1)
            
        # Print server output voor debug
        stdout_data = self.__class__.dev_server.stdout.read1(1024).decode('utf-8')
        if stdout_data:
            print(f"Server output: {stdout_data}")
            
        print("Server running in development mode")
        
        # Test of de editor nu toegankelijk is
        response = requests.get("http://localhost:5050/editor")
        self.assertEqual(response.status_code, 200, "Editor endpoint zou moeten werken in dev mode")
        print("✅ Editor endpoint works in development mode")
        
        # Test of de API endpoints nu toegankelijk zijn
        # Voor de test sturen we geen geldige data, maar controleren we alleen de toegang
        response = requests.post("http://localhost:5050/api/levels", json={
            "levelIndex": "new", 
            "levelCode": "{}"
        })
        # We verwachten hier geen 404 maar mogelijk andere errors zoals 400 of 500
        # omdat we geen volledig geldige data sturen
        self.assertNotEqual(response.status_code, 404, "POST /api/levels zou niet 404 moeten geven in dev mode")
        print("✅ POST /api/levels accessible in development mode")

if __name__ == "__main__":
    # Voer alleen de tests uit
    unittest.main(argv=['first-arg-is-ignored'], exit=False)