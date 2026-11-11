# Winziger statischer Server fuer die lokale Vorschau (PowerShell 5.1, keine Abhaengigkeiten).
# Aufruf:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\serve.ps1 [-Root <Ordner>] [-Port 8765]
# Hinweis: Diese Datei bleibt bewusst reines ASCII, weil PowerShell 5.1 Skripte ohne BOM als ANSI liest.
param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [int]$Port = 8765
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path -LiteralPath $Root).Path.TrimEnd('\', '/')

$mime = @{
  '.html'  = 'text/html; charset=utf-8'
  '.htm'   = 'text/html; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.js'    = 'text/javascript; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.md'    = 'text/markdown; charset=utf-8'
  '.txt'   = 'text/plain; charset=utf-8'
  '.svg'   = 'image/svg+xml'
  '.png'   = 'image/png'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.webp'  = 'image/webp'
  '.ico'   = 'image/x-icon'
  '.woff2' = 'font/woff2'
}

function Send-Text($response, [int]$status, [string]$text) {
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
  $response.StatusCode = $status
  $response.ContentType = 'text/plain; charset=utf-8'
  $response.ContentLength64 = $bytes.Length
  $response.OutputStream.Write($bytes, 0, $bytes.Length)
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Vorschau laeuft: http://localhost:$Port/   (Ordner: $Root)"
Write-Host "Beenden mit Strg+C."

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $res = $ctx.Response
    try {
      $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '' -or $rel.EndsWith('/')) { $rel = $rel + 'index.html' }
      $path = [System.IO.Path]::GetFullPath((Join-Path $Root $rel))

      if (-not $path.StartsWith($Root + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
        Send-Text $res 403 'Verboten'
      }
      elseif (Test-Path -LiteralPath $path -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
        $type = $mime[$ext]
        if (-not $type) { $type = 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $res.StatusCode = 200
        $res.ContentType = $type
        $res.Headers['Cache-Control'] = 'no-store'
        $res.ContentLength64 = $bytes.Length
        if ($ctx.Request.HttpMethod -ne 'HEAD') {
          $res.OutputStream.Write($bytes, 0, $bytes.Length)
        }
      }
      else {
        Send-Text $res 404 "Nicht gefunden: $rel"
      }
    }
    catch {
      try { Send-Text $res 500 'Serverfehler' } catch { }
    }
    finally {
      try { $res.Close() } catch { }
    }
  }
}
finally {
  $listener.Stop()
  $listener.Close()
}
