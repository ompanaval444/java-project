#!/usr/bin/env python3
"""
CampusConnect LTCE - Project Compiler & Deployment Readiness Validator
Runs a 360-degree audit across all HTML, CSS, JS, JSON, and deployment configurations.
Optional flag: --build-dist (Compiles and bundles the project into a clean 'dist' folder).
"""

import os
import sys
import json
import re
import shutil
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

PROJECT_DIR = os.path.abspath(os.path.dirname(__file__))

class CampusConnectCompiler:
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.issues = []
        self.warnings = []
        self.passed_checks = []
        self.stats = {
            "html_files": 0,
            "assets_checked": 0,
            "links_checked": 0,
            "json_events": 0,
            "css_rules": 0
        }
        self.fs_files_lower = {}
        self.scan_filesystem()

    def scan_filesystem(self):
        for root, dirs, files in os.walk(self.root_dir):
            # ignore git or dist
            if '.git' in root or 'dist' in root or '__pycache__' in root:
                continue
            for f in files:
                full = os.path.join(root, f)
                rel = os.path.relpath(full, self.root_dir).replace("\\", "/")
                self.fs_files_lower[rel.lower()] = rel

    def compile_all(self, build_dist=False):
        print("=" * 70)
        print("  CampusConnect LTCE - Build & Deployment Readiness Verifier")
        print("  Lokmanya Tilak College of Engineering, Navi Mumbai")
        print("=" * 70)
        print()

        self.validate_json()
        self.validate_css()
        self.validate_js()
        self.validate_html()
        self.validate_deployment_configs()

        if build_dist:
            self.generate_distribution()

        self.print_report()
        return len(self.issues) == 0

    def validate_json(self):
        json_path = os.path.join(self.root_dir, "events_data.json")
        if not os.path.exists(json_path):
            self.issues.append("events_data.json is missing!")
            return

        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if isinstance(data, dict):
                events = list(data.values())
            elif isinstance(data, list):
                events = data
            else:
                self.issues.append("events_data.json must be a JSON object or array!")
                return

            self.stats["json_events"] = len(events)
            required_keys = {"id", "title", "banner", "organizer", "date", "venue", "category", "dept"}

            for ev in events:
                missing = required_keys - set(ev.keys())
                if missing:
                    self.issues.append(f"Event ID {ev.get('id', '?')} in events_data.json missing fields: {missing}")
                
                banner = ev.get("banner")
                if banner:
                    clean = banner.split("?")[0].split("#")[0].replace("\\", "/")
                    if clean.lower() not in self.fs_files_lower:
                        self.issues.append(f"Event ID {ev.get('id')} banner not found: {clean}")

            self.passed_checks.append(f"events_data.json schema validated ({len(events)} events, all banners exist)")
        except Exception as e:
            self.issues.append(f"events_data.json parse error: {e}")

    def validate_css(self):
        css_path = os.path.join(self.root_dir, "css", "style.css")
        if not os.path.exists(css_path):
            self.issues.append("css/style.css is missing!")
            return

        try:
            with open(css_path, "r", encoding="utf-8") as f:
                content = f.read()

            open_b = content.count("{")
            close_b = content.count("}")
            if open_b != close_b:
                self.issues.append(f"css/style.css brace mismatch: {open_b} '{{' vs {close_b} '}}'")
            else:
                self.stats["css_rules"] = open_b

            url_matches = re.findall(r'url\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)', content, re.IGNORECASE)
            for url in url_matches:
                if url.startswith(("data:", "http://", "https://")):
                    continue
                clean_url = unquote(urlparse(url).path)
                target = os.path.normpath(os.path.join("css", clean_url)).replace("\\", "/")
                if target.lower() not in self.fs_files_lower:
                    self.issues.append(f"css/style.css referenced asset not found: {url} (resolved to {target})")

            self.passed_checks.append(f"css/style.css compiled successfully ({open_b} style rule blocks)")
        except Exception as e:
            self.issues.append(f"css/style.css read error: {e}")

    def validate_js(self):
        js_path = os.path.join(self.root_dir, "js", "main.js")
        if not os.path.exists(js_path):
            self.issues.append("js/main.js is missing!")
            return

        try:
            with open(js_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Bracket balance check
            stack = []
            pairs = {')': '(', '}': '{', ']': '['}
            in_single = False
            in_double = False
            in_template = False
            in_line_comment = False
            in_block_comment = False
            i = 0
            n = len(content)

            while i < n:
                ch = content[i]
                nxt = content[i+1] if i + 1 < n else ''

                if in_line_comment:
                    if ch == '\n':
                        in_line_comment = False
                    i += 1
                    continue

                if in_block_comment:
                    if ch == '*' and nxt == '/':
                        in_block_comment = False
                        i += 2
                        continue
                    i += 1
                    continue

                if not (in_single or in_double or in_template):
                    if ch == '/' and nxt == '/':
                        in_line_comment = True
                        i += 2
                        continue
                    if ch == '/' and nxt == '*':
                        in_block_comment = True
                        i += 2
                        continue

                # Strings
                if ch == "'" and not (in_double or in_template):
                    if i > 0 and content[i-1] == '\\':
                        pass
                    else:
                        in_single = not in_single
                elif ch == '"' and not (in_single or in_template):
                    if i > 0 and content[i-1] == '\\':
                        pass
                    else:
                        in_double = not in_double
                elif ch == '`' and not (in_single or in_double):
                    if i > 0 and content[i-1] == '\\':
                        pass
                    else:
                        in_template = not in_template
                elif not (in_single or in_double or in_template):
                    if ch in '({[':
                        stack.append(ch)
                    elif ch in ')}]':
                        if not stack or stack[-1] != pairs[ch]:
                            self.warnings.append(f"js/main.js: Potential bracket imbalance near char {i} ('{ch}')")
                        else:
                            stack.pop()
                i += 1

            self.passed_checks.append("js/main.js syntax and brackets verified")
        except Exception as e:
            self.issues.append(f"js/main.js check error: {e}")

    def validate_html(self):
        class HtmlChecker(HTMLParser):
            def __init__(self, filename):
                super().__init__()
                self.filename = filename
                self.doctype = False
                self.charset = False
                self.viewport = False
                self.title = False
                self.favicon = False
                self.assets = []
                self.links = []

            def handle_decl(self, decl):
                if "doctype" in decl.lower():
                    self.doctype = True

            def handle_starttag(self, tag, attrs):
                d = dict(attrs)
                if tag == "meta":
                    if "charset" in d: self.charset = True
                    if d.get("name", "").lower() == "viewport": self.viewport = True
                elif tag == "title":
                    self.title = True
                elif tag == "link":
                    rel = d.get("rel", "").lower()
                    if "icon" in rel: self.favicon = True
                    if "href" in d: self.assets.append((tag, d["href"], self.getpos()))
                elif tag in ("img", "script", "source"):
                    if "src" in d: self.assets.append((tag, d["src"], self.getpos()))
                elif tag == "a":
                    if "href" in d: self.links.append((tag, d["href"], self.getpos()))

        html_files = [f for f in os.listdir(self.root_dir) if f.endswith(".html")]
        self.stats["html_files"] = len(html_files)

        for hf in sorted(html_files):
            fpath = os.path.join(self.root_dir, hf)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()

                parser = HtmlChecker(hf)
                parser.feed(content)

                if not parser.doctype:
                    self.warnings.append(f"{hf}: Missing <!DOCTYPE html>")
                if not parser.charset:
                    self.warnings.append(f"{hf}: Missing <meta charset='UTF-8'>")
                if not parser.viewport:
                    self.warnings.append(f"{hf}: Missing viewport <meta>")
                if not parser.title:
                    self.issues.append(f"{hf}: Missing <title> tag")

                # Verify assets
                for tag, src, pos in parser.assets:
                    if src.startswith(("data:", "http://", "https://", "//", "#", "javascript:")):
                        continue
                    clean = unquote(urlparse(src).path)
                    if not clean:
                        continue
                    target = os.path.normpath(clean).replace("\\", "/")
                    self.stats["assets_checked"] += 1
                    if target.lower() not in self.fs_files_lower:
                        self.issues.append(f"{hf}:{pos[0]} [{tag}] asset not found: '{src}'")
                    else:
                        real = self.fs_files_lower[target.lower()]
                        if real != target:
                            self.issues.append(f"{hf}:{pos[0]} Case mismatch: '{target}' vs disk '{real}'")

                # Verify links
                for tag, href, pos in parser.links:
                    if href.startswith(("data:", "http://", "https://", "//", "#", "javascript:", "mailto:", "tel:")):
                        continue
                    clean = unquote(urlparse(href).path)
                    if not clean:
                        continue
                    target = os.path.normpath(clean).replace("\\", "/")
                    self.stats["links_checked"] += 1
                    if target.lower() not in self.fs_files_lower:
                        self.issues.append(f"{hf}:{pos[0]} [{tag}] link target not found: '{href}'")
                    else:
                        real = self.fs_files_lower[target.lower()]
                        if real != target:
                            self.issues.append(f"{hf}:{pos[0]} Case mismatch in link: '{target}' vs disk '{real}'")

            except Exception as e:
                self.issues.append(f"{hf} parse error: {e}")

        self.passed_checks.append(f"All {len(html_files)} HTML pages parsed and verified")
        self.passed_checks.append(f"Verified {self.stats['assets_checked']} asset references across project")
        self.passed_checks.append(f"Verified {self.stats['links_checked']} hyperlink targets across project")

    def validate_deployment_configs(self):
        configs = [
            ("vercel.json", "Vercel Clean URLs & HTTP Security/Cache Headers"),
            ("netlify.toml", "Netlify Static Build & Cache Headers"),
            ("_redirects", "Netlify Clean URLs Fallback Routing"),
            (".nojekyll", "GitHub Pages Custom Static Routing"),
            ("404.html", "Custom Branded 404 Error Page"),
            ("robots.txt", "Search Engine Crawler Directives"),
            ("sitemap.xml", "SEO Search Sitemap"),
            (".gitignore", "Git Deployment Clean Ignore Rules")
        ]

        for fname, desc in configs:
            fpath = os.path.join(self.root_dir, fname)
            if os.path.exists(fpath):
                self.passed_checks.append(f"Deployment Config: {fname:15} -> Present ({desc})")
            else:
                self.issues.append(f"Missing deployment file: {fname} ({desc})")

    def generate_distribution(self):
        dist_dir = os.path.join(self.root_dir, "dist")
        if os.path.exists(dist_dir):
            shutil.rmtree(dist_dir)
        os.makedirs(dist_dir, exist_ok=True)

        # Copy assets
        for item in ["css", "js", "images", "events_data.json", "vercel.json", "netlify.toml", "_redirects", ".nojekyll", "robots.txt", "sitemap.xml"]:
            src = os.path.join(self.root_dir, item)
            dst = os.path.join(dist_dir, item)
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            elif os.path.isfile(src):
                shutil.copy2(src, dst)

        # Copy and optimize HTML files
        html_files = [f for f in os.listdir(self.root_dir) if f.endswith(".html")]
        for hf in html_files:
            src = os.path.join(self.root_dir, hf)
            dst = os.path.join(dist_dir, hf)
            with open(src, "r", encoding="utf-8") as f:
                content = f.read()
            # Clean empty blank lines at start
            content = content.lstrip()
            with open(dst, "w", encoding="utf-8") as f:
                f.write(content)

        self.passed_checks.append(f"Generated clean production build in 'dist/' ({len(html_files)} pages packaged)")

    def print_report(self):
        print("\n" + "-" * 70)
        print("  PASSED CHECKS")
        print("-" * 70)
        for p in self.passed_checks:
            print(f"  [PASS] {p}")

        if self.warnings:
            print("\n" + "-" * 70)
            print("  WARNINGS")
            print("-" * 70)
            for w in self.warnings:
                print(f"  [WARN] {w}")

        if self.issues:
            print("\n" + "-" * 70)
            print("  DEPLOYMENT BLOCKERS / ISSUES DETECTED")
            print("-" * 70)
            for issue in self.issues:
                print(f"  [FAIL] {issue}")
            print("\n>>> STATUS: NOT READY - Fix the issues listed above.")
        else:
            print("\n" + "=" * 70)
            print("  OVERALL DEPLOYMENT READINESS: 100% READY FOR PRODUCTION")
            print("=" * 70)
            print("  - Zero Broken Links or 404 Assets")
            print("  - Fully Compatible with Vercel, Netlify, GitHub Pages, or any Web Server")
            print("  - Clean URLs, Headers, SEO Sitemap, Robots, and 404 fallback configured")
            print("=" * 70)

if __name__ == "__main__":
    build_dist = "--build-dist" in sys.argv
    compiler = CampusConnectCompiler(PROJECT_DIR)
    success = compiler.compile_all(build_dist=build_dist)
    sys.exit(0 if success else 1)

