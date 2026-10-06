$ErrorActionPreference = "Stop"

$dest = "$env:USERPROFILE\.gemini\config"
$repo = "De-violet/antigravity-customizations"
$branch = "main"

Write-Host "==> Memasang modul Antigravity ke $dest..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "$dest\plugins" | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\skills" | Out-Null

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path 2>$null

if ($scriptDir -and (Test-Path "$scriptDir\plugins") -and (Test-Path "$scriptDir\skills")) {
    Copy-Item -Path "$scriptDir\plugins\*" -Destination "$dest\plugins" -Recurse -Force
    Copy-Item -Path "$scriptDir\skills\*" -Destination "$dest\skills" -Recurse -Force
} else {
    $zipUrl = "https://github.com/$repo/archive/refs/heads/$branch.zip"
    $tempZip = "$env:TEMP\agy-mods-$([Guid]::NewGuid()).zip"
    $tempExtract = "$env:TEMP\agy-mods-extract-$([Guid]::NewGuid())"

    Write-Host "==> Mengunduh berkas dari GitHub ($repo)..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing

    Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

    Copy-Item -Path "$tempExtract\antigravity-customizations-$branch\plugins\*" -Destination "$dest\plugins" -Recurse -Force
    Copy-Item -Path "$tempExtract\antigravity-customizations-$branch\skills\*" -Destination "$dest\skills" -Recurse -Force

    Remove-Item -Path $tempZip, $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "==> Berhasil! Modul Antigravity sudah aktif." -ForegroundColor Green
Write-Host "    Jalankan 'agy' di PowerShell atau Terminal untuk menggunakannya." -ForegroundColor Yellow
