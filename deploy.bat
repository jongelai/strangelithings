@echo off
echo.
echo [1/3] Preparando cambios...
git add .

echo [2/3] Guardando cambios (Commit)...
set /p msg="Introduce el mensaje del cambio: "
git commit -m "%msg%"

echo [3/3] Sincronizando y Subiendo...
:: El comando 'pull --rebase' bajara lo de GitHub y pondra tus archivos encima
git pull origin main --rebase

echo Enviando a GitHub...
git push origin main

echo.
echo Intento de envio finalizado. Revisa si hubo errores arriba.
pause