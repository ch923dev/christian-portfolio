#!/usr/bin/env python3
"""Local dev server for the portfolio that disables caching.

Plain `python -m http.server` lets the browser cache portfolio.js/.css, so
edits don't show up until a hard refresh. This sends `Cache-Control: no-store`
so every reload fetches the latest files.

Usage:  python dev-server.py [port]   (default 8731)
Then open http://127.0.0.1:8731/
"""
import http.server
import socketserver
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8731


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, *args):
        pass  # quiet


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), NoCacheHandler) as httpd:
    print(f"Serving (no-cache) at http://127.0.0.1:{PORT}/  —  Ctrl+C to stop")
    httpd.serve_forever()
