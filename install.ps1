$ErrorActionPreference = "Stop"

$dest = "$env:USERPROFILE\.gemini\config"
Write-Host "==> Memasang modul Antigravity ke $dest..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "$dest\plugins", "$dest\skills" | Out-Null

$tempZip = "$env:TEMP\agy-mods.zip"
$tempExtract = "$env:TEMP\agy-mods-extracted"

Write-Host "==> Mengunduh berkas dari GitHub..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "https://github.com/De-violet/antigravity-customizations/archive/refs/heads/main.zip" -OutFile $tempZip -UseBasicParsing

Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

Copy-Item -Path "$tempExtract\antigravity-customizations-main\plugins\*" -Destination "$dest\plugins" -Recurse -Force
Copy-Item -Path "$tempExtract\antigravity-customizations-main\skills\*" -Destination "$dest\skills" -Recurse -Force

Remove-Item -Path $tempZip, $tempExtract -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "==> Berhasil! Modul Antigravity sudah aktif." -ForegroundColor Green
Write-Host "    Jalankan 'agy' di PowerShell untuk menggunakannya." -ForegroundColor Yellow
