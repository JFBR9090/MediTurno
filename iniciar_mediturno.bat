@echo off
title MediTurno - Servidor Local
color 0A
echo ========================================================
echo          INICIANDO SERVIDOR DE MEDITURNO
echo ========================================================
echo.

:: 1. Verificar o Iniciar MySQL si no esta corriendo
echo [1/2] Verificando Base de Datos MySQL...
netstat -ano | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo Iniciando servicio MySQL de Laragon...
    start /B "" "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqld.exe" --defaults-file="C:\laragon\bin\mysql\mysql-8.0.30-winx64\my.ini" --console
    timeout /t 3 /nobreak >nul
) else (
    echo MySQL ya esta activo en el puerto 3306.
)

:: 2. Iniciar servidor Laravel
echo.
echo [2/2] Iniciando Servidor Web Laravel (http://127.0.0.1:8000)...
cd /d "%~dp0backend"

:: Abrir navegador automaticamente
start http://127.0.0.1:8000

echo.
echo ========================================================
echo Servidor activo en http://127.0.0.1:8000
echo NO cierres esta ventana mientras uses la aplicacion.
echo Para detener el servidor presiona Ctrl + C
echo ========================================================
echo.

"C:\xampp\php\php.exe" artisan serve --host=127.0.0.1 --port=8000
pause
