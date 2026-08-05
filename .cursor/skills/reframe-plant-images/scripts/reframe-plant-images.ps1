<#
.SYNOPSIS
  Crop/reframe Sproutlet plant PNGs so subjects fill the frame consistently.
  Preserves (or restores) transparent backgrounds — never composites onto black.

.EXAMPLE
  .\reframe-plant-images.ps1 -Path public/plants/olea-europaea.png
  .\reframe-plant-images.ps1 -All
#>
[CmdletBinding(DefaultParameterSetName = 'Path')]
param(
  [Parameter(ParameterSetName = 'Path', Mandatory = $true)]
  [string]$Path,

  [Parameter(ParameterSetName = 'All')]
  [switch]$All,

  [int]$TargetHeight = 926,
  [double]$MarginRatio = 0.03,
  [double]$Zoom = 1.0,
  [int]$AlphaThreshold = 20,
  [int]$LumaThreshold = 18
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..\..'))
$plantsDir = Join-Path $repoRoot 'public\plants'

function Get-Luma([System.Drawing.Color]$c) {
  return [int]((0.2126 * $c.R) + (0.7152 * $c.G) + (0.0722 * $c.B))
}

function Test-HasTransparency([System.Drawing.Bitmap]$bmp) {
  $transparent = 0
  $sampled = 0
  for ($y = 0; $y -lt $bmp.Height; $y += 8) {
    for ($x = 0; $x -lt $bmp.Width; $x += 8) {
      $sampled++
      if ($bmp.GetPixel($x, $y).A -lt 250) { $transparent++ }
    }
  }
  return ($transparent / [double]$sampled) -gt 0.02
}

function Invoke-KnockoutBlackBackground([System.Drawing.Bitmap]$bmp, [int]$lumaMax = 22) {
  <#
    Flood-fill from image edges: near-black opaque pixels become transparent.
    Used when a cutout was wrongly flattened onto black.
  #>
  $w = $bmp.Width
  $h = $bmp.Height
  $visited = New-Object 'bool[,]' $w, $h
  $queue = New-Object System.Collections.Generic.Queue[object]

  function Enqueue-IfBg([int]$x, [int]$y) {
    if ($x -lt 0 -or $y -lt 0 -or $x -ge $w -or $y -ge $h) { return }
    if ($visited[$x, $y]) { return }
    $c = $bmp.GetPixel($x, $y)
    if ($c.A -lt 8) {
      $visited[$x, $y] = $true
      return
    }
    if ((Get-Luma $c) -gt $lumaMax) { return }
    $visited[$x, $y] = $true
    $queue.Enqueue(@($x, $y))
  }

  for ($x = 0; $x -lt $w; $x++) {
    Enqueue-IfBg $x 0
    Enqueue-IfBg $x ($h - 1)
  }
  for ($y = 0; $y -lt $h; $y++) {
    Enqueue-IfBg 0 $y
    Enqueue-IfBg ($w - 1) $y
  }

  $cleared = 0
  while ($queue.Count -gt 0) {
    $p = $queue.Dequeue()
    $x = $p[0]; $y = $p[1]
    $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $cleared++
    Enqueue-IfBg ($x - 1) $y
    Enqueue-IfBg ($x + 1) $y
    Enqueue-IfBg $x ($y - 1)
    Enqueue-IfBg $x ($y + 1)
  }
  return $cleared
}

function Get-ContentBounds([System.Drawing.Bitmap]$bmp) {
  $useAlpha = Test-HasTransparency $bmp
  $minX = $bmp.Width
  $minY = $bmp.Height
  $maxX = -1
  $maxY = -1

  for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
      $c = $bmp.GetPixel($x, $y)
      $isContent = $false
      if ($useAlpha) {
        $isContent = $c.A -gt $AlphaThreshold
      } else {
        $isContent = (Get-Luma $c) -gt $LumaThreshold
      }
      if ($isContent) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt 0) {
    throw "No subject pixels found (alpha/luma thresholds may be too strict)."
  }

  return @{
    minX = $minX
    minY = $minY
    maxX = $maxX
    maxY = $maxY
    contentW = ($maxX - $minX + 1)
    contentH = ($maxY - $minY + 1)
    mode = $(if ($useAlpha) { 'alpha' } else { 'luma' })
  }
}

function Reframe-PlantImage([string]$filePath) {
  $full = [System.IO.Path]::GetFullPath($filePath)
  if (-not (Test-Path $full)) { throw "File not found: $full" }

  $src = [System.Drawing.Bitmap]::FromFile($full)
  # Work on a mutable 32bpp copy so we can knockout / write alpha
  $work = New-Object System.Drawing.Bitmap $src.Width, $src.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gCopy = [System.Drawing.Graphics]::FromImage($work)
  $gCopy.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  $gCopy.DrawImage($src, 0, 0, $src.Width, $src.Height)
  $gCopy.Dispose()
  $src.Dispose()

  try {
    if (-not (Test-HasTransparency $work)) {
      $cleared = Invoke-KnockoutBlackBackground $work
      Write-Host ("{0}: knocked out black bg ({1} px)" -f (Split-Path $full -Leaf), $cleared)
    }

    $bounds = Get-ContentBounds $work
    $pad = [int][math]::Round([math]::Max($bounds.contentW, $bounds.contentH) * $MarginRatio)
    $cropX = [math]::Max(0, $bounds.minX - $pad)
    $cropY = [math]::Max(0, $bounds.minY - $pad)
    $cropRight = [math]::Min($work.Width - 1, $bounds.maxX + $pad)
    $cropBottom = [math]::Min($work.Height - 1, $bounds.maxY + $pad)
    $cropW = $cropRight - $cropX + 1
    $cropH = $cropBottom - $cropY + 1

    $scale = $TargetHeight / [double]$cropH
    $targetW = [math]::Max(1, [int][math]::Round($cropW * $scale))
    $targetH = $TargetHeight

    $fillX = [math]::Round(100.0 * $bounds.contentW / $work.Width, 1)
    $fillY = [math]::Round(100.0 * $bounds.contentH / $work.Height, 1)
    Write-Host ("{0}: {1} bounds {2}x{3} ({4}% x {5}%) -> {6}x{7}" -f `
      (Split-Path $full -Leaf), $bounds.mode, $bounds.contentW, $bounds.contentH, $fillX, $fillY, $targetW, $targetH)

    $out = New-Object System.Drawing.Bitmap $targetW, $targetH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($out)
    try {
      # Transparent canvas — do not fill with black
      $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
      $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
      $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $g.DrawImage(
        $work,
        (New-Object System.Drawing.Rectangle 0, 0, $targetW, $targetH),
        (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH),
        [System.Drawing.GraphicsUnit]::Pixel
      )
    } finally {
      $g.Dispose()
    }

    $tmp = "$full.tmp.png"
    $out.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
    $out.Dispose()
  } finally {
    $work.Dispose()
  }

  Move-Item -Force $tmp $full
}

$targets = @()
if ($All) {
  if (-not (Test-Path $plantsDir)) { throw "Missing plants dir: $plantsDir" }
  $targets = Get-ChildItem -Path $plantsDir -Filter '*.png' | ForEach-Object { $_.FullName }
  if (-not $targets.Count) { throw "No PNGs in $plantsDir" }
} else {
  if (-not [System.IO.Path]::IsPathRooted($Path)) {
    $Path = Join-Path (Get-Location) $Path
  }
  $targets = @([System.IO.Path]::GetFullPath($Path))
}

foreach ($file in $targets) {
  Reframe-PlantImage $file
}

Write-Host ("Done ({0} file(s))." -f $targets.Count)
