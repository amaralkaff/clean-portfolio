# Install ffmpeg using Chocolatey or direct download
Write-Host "FFmpeg Installation Script" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

# Method 1: Try Chocolatey
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "`nChocolatey found. Installing ffmpeg..." -ForegroundColor Green
    if ($isAdmin) {
        choco install ffmpeg -y
    } else {
        Write-Host "Please run this script as Administrator to install via Chocolatey" -ForegroundColor Yellow
        Write-Host "Or use Method 2 below for manual installation" -ForegroundColor Yellow
    }
} else {
    Write-Host "`nChocolatey not found." -ForegroundColor Yellow
}

# Method 2: Manual download instructions
Write-Host "`n=== Manual Installation Instructions ===" -ForegroundColor Cyan
Write-Host "1. Download ffmpeg from: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor White
Write-Host "2. Choose 'release builds' -> 'full' version" -ForegroundColor White
Write-Host "3. Extract the zip file to C:\ffmpeg" -ForegroundColor White
Write-Host "4. Add C:\ffmpeg\bin to your system PATH:" -ForegroundColor White
Write-Host "   - Open System Properties -> Environment Variables" -ForegroundColor Gray
Write-Host "   - Edit the 'Path' variable" -ForegroundColor Gray
Write-Host "   - Add new entry: C:\ffmpeg\bin" -ForegroundColor Gray
Write-Host "5. Restart your terminal/PowerShell" -ForegroundColor White

Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")