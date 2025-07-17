@echo off
echo Iniciando SalvaCell Bot...
echo.

set "NODEJS_PATH=C:\Program Files\nodejs"
set "PATH=%NODEJS_PATH%;%PATH%"

echo PATH configurado: %NODEJS_PATH%
echo.

echo Verificando Node.js...
"%NODEJS_PATH%\node.exe" --version
if %errorlevel% neq 0 (
    echo Error: No se puede ejecutar Node.js
    pause
    exit /b 1
)

echo.
echo Ejecutando bot...
echo.

cd /d "%~dp0"
"%NODEJS_PATH%\node.exe" src/bot.js

pause
