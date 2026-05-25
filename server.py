#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Aplecs - Servidor de Desenvolupament
Aquest script aixeca un servidor web local per servir l'aplicació a GitHub Codespaces o localment.
Garanteix un funcionament immediat usant Flask (si està disponible) o la llibreria estàndard de Python (sense dependències).
"""

import sys
import os
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def run_flask():
    try:
        from flask import Flask, send_from_directory
        
        app = Flask(__name__, static_folder=DIRECTORY)
        
        @app.route('/')
        def serve_index():
            return send_from_directory(DIRECTORY, 'index.html')
            
        @app.route('/<path:path>')
        def serve_static(path):
            return send_from_directory(DIRECTORY, path)
            
        print("\n" + "="*60)
        print("🚀 APLECS (Mode Flask)")
        print(f"L'aplicació està disponible a: http://localhost:{PORT}")
        print("="*60 + "\n")
        
        # Obre el navegador automàticament
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except Exception:
            pass
            
        app.run(host='0.0.0.0', port=PORT, debug=False)
        return True
    except ImportError:
        return False

def run_fallback():
    import http.server
    import socketserver
    
    class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=DIRECTORY, **kwargs)
            
        def log_message(self, format, *args):
            # Omet els logs de peticions per mantenir el terminal net per al docent
            pass

    # Evita l'error "Address already in use" al reiniciar ràpidament
    socketserver.TCPServer.allow_reuse_address = True
    
    print("\n" + "="*60)
    print("🚀 APLECS (Mode Integrat Estàndard)")
    print("No s'ha detectat Flask, s'està utilitzant el servidor web natiu de Python.")
    print(f"L'aplicació està disponible a: http://localhost:{PORT}")
    print("="*60 + "\n")
    
    try:
        webbrowser.open(f"http://localhost:{PORT}")
    except Exception:
        pass
        
    with socketserver.TCPServer(("0.0.0.0", PORT), CustomHTTPRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Servidor aturat pel docent. Fins la propera!")
            sys.exit(0)

if __name__ == '__main__':
    # Canvia al directori de l'script per servir els fitxers adequats
    os.chdir(DIRECTORY)
    
    # Intenta obrir amb Flask primer, si no, usa el fallback natiu
    if not run_flask():
        run_fallback()
