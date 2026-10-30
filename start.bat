@echo off
title CampusConnect LTCE - Local Server
echo ======================================================================
echo           CampusConnect - Lokmanya Tilak College of Engineering
echo                     Official Campus Events Hub
echo ======================================================================
echo.
echo [1/2] Opening default browser at http://localhost:8000 ...
start "" http://localhost:8000/index.html
echo [2/2] Starting Python HTTP Server on port 8000...
echo.
echo Press Ctrl+C in this terminal window anytime to stop the server.
echo ======================================================================
python -m http.server 8000
pause
