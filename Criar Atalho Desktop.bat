@echo off
set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$desktop = [Environment]::GetFolderPath('Desktop');" ^
  "$proj = '%PROJECT_DIR%';" ^
  "$wsh = New-Object -ComObject WScript.Shell;" ^
  "$sc = $wsh.CreateShortcut((Join-Path $desktop 'Teleprompter Overlay.lnk'));" ^
  "$sc.TargetPath = Join-Path $proj 'Iniciar Teleprompter.bat';" ^
  "$sc.WorkingDirectory = $proj;" ^
  "$sc.IconLocation = (Join-Path $proj 'teleprompter.ico') + ',0';" ^
  "$sc.Description = 'Iniciar Teleprompter Overlay (Focus-Safe)';" ^
  "$sc.WindowStyle = 7;" ^
  "$sc.Save();"

exit
