#!/usr/bin/env python3
# Local dev server that disables browser caching entirely — the plain
# `python3 -m http.server` sends only Last-Modified, and browsers were
# aggressively caching JS modules across edits, serving stale code even
# after a hard reload. Not part of the shipped site; dev tooling only.

import http.server
import sys

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


http.server.test(HandlerClass=NoCacheHandler, port=port)
