# Video Compression Script for WebM files
param(
    [string]$VideoPath = "..\public\video",
    [string]$OutputPath = "..\public\video\compressed",
    [int]$TargetBitrate = 500,  # Target bitrate in kbps (adjust as needed)
    [string]$Preset = "slow",   # Encoding preset: ultrafast, fast, medium, slow, veryslow
    [int]$CRF = 30              # Constant Rate Factor: 0-63 (lower = better quality, bigger file)
)

Write-Host "WebM Video Compression Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# Check if ffmpeg is available
$ffmpegPath = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpegPath) {
    Write-Host "ERROR: ffmpeg not found!" -ForegroundColor Red
    Write-Host "Please run install-ffmpeg.ps1 first to install ffmpeg" -ForegroundColor Yellow
    exit 1
}

# Convert relative paths to absolute
$VideoPath = Resolve-Path $VideoPath -ErrorAction SilentlyContinue
$OutputPath = Join-Path (Split-Path $VideoPath) "compressed"

if (-not (Test-Path $VideoPath)) {
    Write-Host "ERROR: Video path not found: $VideoPath" -ForegroundColor Red
    exit 1
}

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    Write-Host "Created output directory: $OutputPath" -ForegroundColor Green
}

# Get all WebM files
$videos = Get-ChildItem -Path $VideoPath -Filter "*.webm"

if ($videos.Count -eq 0) {
    Write-Host "No WebM files found in $VideoPath" -ForegroundColor Yellow
    exit 0
}

Write-Host "`nFound $($videos.Count) WebM files to compress" -ForegroundColor White
Write-Host "Output directory: $OutputPath" -ForegroundColor White
Write-Host "Settings: CRF=$CRF, Preset=$Preset, Target Bitrate=${TargetBitrate}k" -ForegroundColor White
Write-Host "----------------------------------------" -ForegroundColor Gray

$totalOriginalSize = 0
$totalCompressedSize = 0

foreach ($video in $videos) {
    $inputFile = $video.FullName
    $outputFile = Join-Path $OutputPath $video.Name
    
    # Get original file size
    $originalSize = (Get-Item $inputFile).Length / 1MB
    $totalOriginalSize += $originalSize
    
    Write-Host "`nProcessing: $($video.Name)" -ForegroundColor Cyan
    Write-Host "Original size: $([math]::Round($originalSize, 2)) MB" -ForegroundColor Gray
    
    # FFmpeg compression command for WebM (VP9 codec)
    # Two-pass encoding for better quality/size ratio
    
    # First pass
    Write-Host "Running first pass..." -ForegroundColor Yellow
    $pass1Args = @(
        "-i", "`"$inputFile`"",
        "-c:v", "libvpx-vp9",
        "-b:v", "${TargetBitrate}k",
        "-crf", $CRF,
        "-preset", $Preset,
        "-row-mt", "1",
        "-tiles", "2x2",
        "-g", "240",
        "-threads", "4",
        "-quality", "good",
        "-auto-alt-ref", "1",
        "-lag-in-frames", "25",
        "-pass", "1",
        "-f", "null",
        "NUL"
    )
    
    $pass1Cmd = "ffmpeg -y $($pass1Args -join ' ') 2>&1"
    Invoke-Expression $pass1Cmd | Out-Null
    
    # Second pass
    Write-Host "Running second pass..." -ForegroundColor Yellow
    $pass2Args = @(
        "-i", "`"$inputFile`"",
        "-c:v", "libvpx-vp9",
        "-b:v", "${TargetBitrate}k",
        "-crf", $CRF,
        "-preset", $Preset,
        "-row-mt", "1",
        "-tiles", "2x2",
        "-g", "240",
        "-threads", "4",
        "-quality", "good",
        "-auto-alt-ref", "1",
        "-lag-in-frames", "25",
        "-c:a", "libopus",
        "-b:a", "128k",
        "-pass", "2",
        "`"$outputFile`""
    )
    
    $pass2Cmd = "ffmpeg -y $($pass2Args -join ' ') 2>&1"
    $output = Invoke-Expression $pass2Cmd
    
    # Check if compression was successful
    if (Test-Path $outputFile) {
        $compressedSize = (Get-Item $outputFile).Length / 1MB
        $totalCompressedSize += $compressedSize
        $reduction = [math]::Round((1 - ($compressedSize / $originalSize)) * 100, 1)
        
        Write-Host "Compressed size: $([math]::Round($compressedSize, 2)) MB" -ForegroundColor Green
        Write-Host "Size reduction: $reduction%" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to compress $($video.Name)" -ForegroundColor Red
    }
}

# Clean up temporary files created by two-pass encoding
Remove-Item "ffmpeg2pass-0.log" -ErrorAction SilentlyContinue

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Compression Complete!" -ForegroundColor Green
Write-Host "Total original size: $([math]::Round($totalOriginalSize, 2)) MB" -ForegroundColor White
Write-Host "Total compressed size: $([math]::Round($totalCompressedSize, 2)) MB" -ForegroundColor White
$totalReduction = [math]::Round((1 - ($totalCompressedSize / $totalOriginalSize)) * 100, 1)
Write-Host "Overall size reduction: $totalReduction%" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nCompressed videos saved in: $OutputPath" -ForegroundColor Yellow
Write-Host "Review the compressed videos and replace the originals if satisfied." -ForegroundColor Yellow
Write-Host "`nTo replace originals, run:" -ForegroundColor Gray
Write-Host "  Move-Item '$OutputPath\*' '$VideoPath' -Force" -ForegroundColor Gray