@echo off
cd /d "%~dp0"

:: Se a pessoa clonou do GitHub e ainda não rodou npm install, instala automaticamente
if not exist "%~dp0node_modules\electron\dist\electron.exe" (
    echo Instalando dependencias do Teleprompter pela primeira vez...
    call npm install
)

start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0"
exit
