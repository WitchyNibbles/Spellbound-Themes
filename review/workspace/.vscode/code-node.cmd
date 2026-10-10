@echo off
rem js-debug drops ELECTRON_RUN_AS_NODE from the launch env; without it Code.exe starts the full app.
set ELECTRON_RUN_AS_NODE=1
"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" %*
