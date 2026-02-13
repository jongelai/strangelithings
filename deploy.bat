@echo off
echo.
echo [1/3] Preparando cambios...
git add .

echo [2/3] Guardando cambios automaticamente...
:: Esto crea un mensaje tipo: "Auto-commit: 13/02/2026 - 18:15"
set msg=Auto-commit: %date% - %time%
git commit -m "%msg%"

echo [3/3] Sincronizando y Subiendo...
git pull origin main --rebase

echo Enviando a GitHub...
git push origin main

echo.
echo ¡Hecho! Los cambios estan en Hawkins (GitHub).
echo URL: https://github.com/jongelai/strangelithings
echo.
pause