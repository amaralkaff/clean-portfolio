# Video Compression Guide

## Current Video Sizes
- `parion.webm` - 6.5M (largest)
- `lsa-course.webm` - 5.2M  
- `surveyor-pilkada.webm` - 4.1M
- `ews-earthquake.webm` - 3.7M
- `workout-ai.webm` - 2.6M
- `gomoku-game.webm` - 657K (already optimized)

Total: ~22.7 MB

## Quick Start

### Step 1: Install FFmpeg
```powershell
# Run as Administrator
.\scripts\install-ffmpeg.ps1
```

Or manually:
1. Download from: https://www.gyan.dev/ffmpeg/builds/
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to system PATH
4. Restart terminal

### Step 2: Compress Videos
```powershell
cd scripts
.\compress-videos.ps1
```

### Step 3: Review & Replace
1. Check compressed videos in `public/video/compressed/`
2. Compare quality with originals
3. If satisfied, replace originals:
```powershell
Move-Item ".\public\video\compressed\*" ".\public\video\" -Force
```

## Compression Settings

The script uses optimal WebM/VP9 settings:

### Default Settings (Balanced)
- **CRF**: 30 (0-63, lower = better quality)
- **Bitrate**: 500 kbps
- **Preset**: slow (better compression)
- **Codec**: VP9 (modern, efficient)

### Customize Compression

For higher quality (larger files):
```powershell
.\compress-videos.ps1 -CRF 25 -TargetBitrate 800
```

For maximum compression (lower quality):
```powershell
.\compress-videos.ps1 -CRF 35 -TargetBitrate 300
```

For faster encoding (less compression):
```powershell
.\compress-videos.ps1 -Preset fast
```

## Expected Results

With default settings, expect:
- **50-70% size reduction** 
- **Minimal quality loss** for web viewing
- **Total size**: ~7-10 MB (from 22.7 MB)

## Tips

1. **Test First**: Compress one video first to check quality
   ```powershell
   ffmpeg -i ".\public\video\parion.webm" -c:v libvpx-vp9 -crf 30 -b:v 500k "test.webm"
   ```

2. **Preview Quality**: Open compressed videos in browser before replacing

3. **Backup Originals**: Keep originals in a backup folder
   ```powershell
   Copy-Item ".\public\video\*.webm" ".\public\video\original-backup\" -Force
   ```

4. **Progressive Loading**: Consider keeping higher quality for hero videos

## Alternative: Online Tools

If FFmpeg installation is problematic:
1. **CloudConvert**: https://cloudconvert.com/webm-compressor
2. **FreeConvert**: https://www.freeconvert.com/webm-compressor
3. **VideoSmaller**: https://www.videosmaller.com/

## Optimization Recommendations

Based on your video content:
- `parion.webm` (6.5M) → Target: 2M
- `lsa-course.webm` (5.2M) → Target: 1.5M
- `surveyor-pilkada.webm` (4.1M) → Target: 1.2M
- `ews-earthquake.webm` (3.7M) → Target: 1M
- `workout-ai.webm` (2.6M) → Target: 800K
- `gomoku-game.webm` (657K) → Keep as is

This would reduce total size from **22.7 MB to ~7 MB** (69% reduction)!