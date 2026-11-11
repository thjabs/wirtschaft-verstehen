# Prueft die Wortzahlen aller Inhaltsdateien gegen die Vorgaben aus CLAUDE.md (Abschnitt 3).
# Aufruf:  powershell -NoProfile -ExecutionPolicy Bypass -File tools\wortzahl.ps1 [-NurProbleme]
# Hinweis: Diese Datei bleibt bewusst reines ASCII, weil PowerShell 5.1 Skripte ohne BOM als ANSI liest.
param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot),
  [switch]$NurProbleme
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

$inhalte = Join-Path $Root 'inhalte'
$schulen = @('Neoklassik', 'Postkeynesianismus', 'Marxismus')
$zeilen = New-Object System.Collections.Generic.List[object]

function Lies([string]$pfad) {
  $t = [System.IO.File]::ReadAllText($pfad, [System.Text.Encoding]::UTF8)
  $t = $t -replace "`r`n?", "`n"
  if ($t.Length -gt 0 -and [int][char]$t[0] -eq 0xFEFF) { $t = $t.Substring(1) }
  return $t
}

function Rumpf([string]$t) {
  $m = [regex]::Match($t, '\A---\n.*?\n---\n?', 'Singleline')
  if ($m.Success) { return $t.Substring($m.Length) }
  return $t
}

# Teilt einen Text an Ueberschriften der angegebenen Ebene (2 = "## ", 3 = "### ").
function Teile([string]$t, [int]$ebene) {
  $rx = '(?m)^' + ('#' * $ebene) + '[ \t]+(.+?)[ \t]*$'
  $ms = [regex]::Matches($t, $rx)
  $res = @()
  for ($i = 0; $i -lt $ms.Count; $i++) {
    $start = $ms[$i].Index + $ms[$i].Length
    if ($i + 1 -lt $ms.Count) { $ende = $ms[$i + 1].Index } else { $ende = $t.Length }
    $res += [pscustomobject]@{
      Titel = $ms[$i].Groups[1].Value
      Text  = $t.Substring($start, $ende - $start).Trim()
    }
  }
  return , $res
}

function Woerter([string]$t) {
  if (-not $t) { return 0 }
  $t = [regex]::Replace($t, '<!--.*?-->', ' ', 'Singleline')
  $t = [regex]::Replace($t, '!\[[^\]]*\]\([^)]*\)', ' ')
  $t = [regex]::Replace($t, '\[\[([^\]|]+)\|([^\]]+)\]\]', '$2')
  $t = [regex]::Replace($t, '\[\[([^\]]+)\]\]', '$1')
  $t = [regex]::Replace($t, '\[([^\]]*)\]\([^)]*\)', '$1')
  $t = [regex]::Replace($t, '(?m)^#+[ \t].*$', ' ')
  return [regex]::Matches($t, '[\p{L}\p{N}]+(?:[-''.,][\p{L}\p{N}]+)*').Count
}

function Listenpunkte([string]$t) {
  if (-not $t) { return 0 }
  return [regex]::Matches($t, '(?m)^[ \t]*(?:[-*+]|\d+\.)[ \t]+\S').Count
}

# $min/$max = Sollbereich, $hart = absolute Obergrenze (0 = keine eigene).
function Pruefe([string]$datei, [string]$abschnitt, [int]$n, [int]$min, [int]$max, [int]$hart, [string]$einheit) {
  if ($n -eq 0) { $status = 'leer' }
  elseif ($n -lt $min) { $status = 'ZU KURZ' }
  elseif ($hart -gt 0 -and $n -gt $hart) { $status = 'ZU LANG' }
  elseif ($n -gt $max) {
    if ($hart -gt 0) { $status = 'ok (lang)' } else { $status = 'ZU LANG' }
  }
  else { $status = 'ok' }
  $soll = "$min-$max"
  if ($hart -gt 0) { $soll = "$soll (max $hart)" }
  $script:zeilen.Add([pscustomobject]@{
      Datei = $datei; Abschnitt = $abschnitt; Zahl = $n; Soll = "$soll $einheit"; Status = $status
    })
}

# --- Fragen -------------------------------------------------------------------
$fragenOrdner = Join-Path $inhalte 'fragen'
if (Test-Path -LiteralPath $fragenOrdner) {
  Get-ChildItem -LiteralPath $fragenOrdner -Filter '*.md' | Sort-Object Name | ForEach-Object {
    $name = 'fragen/' + $_.Name
    $text = Rumpf (Lies $_.FullName)
    $haupt = Teile $text 2
    foreach ($schule in $schulen) {
      $teil = $haupt | Where-Object { $_.Titel -eq $schule } | Select-Object -First 1
      if (-not $teil) {
        $script:zeilen.Add([pscustomobject]@{ Datei = $name; Abschnitt = $schule; Zahl = 0; Soll = 'Abschnitt'; Status = 'FEHLT' })
        continue
      }
      $unter = Teile $teil.Text 3
      $kern = ($unter | Where-Object { $_.Titel -eq 'Kernsatz' } | Select-Object -First 1).Text
      $antw = ($unter | Where-Object { $_.Titel -eq 'Antwort' } | Select-Object -First 1).Text
      $quel = ($unter | Where-Object { $_.Titel -eq 'Quellen' } | Select-Object -First 1).Text
      Pruefe $name "$schule / Kernsatz" (Woerter $kern) 12 70 0 'Woerter'
      Pruefe $name "$schule / Antwort" (Woerter $antw) 250 500 600 'Woerter'
      Pruefe $name "$schule / Quellen" (Listenpunkte $quel) 2 4 0 'Belege'
    }
    $konflikt = $haupt | Where-Object { $_.Titel -like 'Wo sie sich widersprechen*' } | Select-Object -First 1
    if ($konflikt) { Pruefe $name 'Konflikt' (Woerter $konflikt.Text) 150 300 0 'Woerter' }
    else { $script:zeilen.Add([pscustomobject]@{ Datei = $name; Abschnitt = 'Konflikt'; Zahl = 0; Soll = 'Abschnitt'; Status = 'FEHLT' }) }
  }
}

# --- Grundlagen ---------------------------------------------------------------
$grenzen = @{
  'entstehung'  = @(400, 600)
  'aktuell'     = @(250, 400)
  'debatten'    = @(200, 400)
  'stroemungen' = @(150, 300)
}
$grundOrdner = Join-Path $inhalte 'grundlagen'
if (Test-Path -LiteralPath $grundOrdner) {
  Get-ChildItem -LiteralPath $grundOrdner -Directory | Sort-Object Name | ForEach-Object {
    $schulOrdner = $_
    Get-ChildItem -LiteralPath $schulOrdner.FullName -Filter '*.md' | Sort-Object Name | ForEach-Object {
      $thema = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
      $name = 'grundlagen/' + $schulOrdner.Name + '/' + $_.Name
      $n = Woerter (Rumpf (Lies $_.FullName))
      if ($grenzen.ContainsKey($thema)) { Pruefe $name $thema $n $grenzen[$thema][0] $grenzen[$thema][1] 0 'Woerter' }
      else { $script:zeilen.Add([pscustomobject]@{ Datei = $name; Abschnitt = $thema; Zahl = $n; Soll = '(keine Vorgabe)'; Status = 'ok' }) }
    }
  }
  $weitere = Join-Path $grundOrdner 'weitere-theorien.md'
  if (Test-Path -LiteralPath $weitere) {
    foreach ($teil in (Teile (Rumpf (Lies $weitere)) 2)) {
      Pruefe 'grundlagen/weitere-theorien.md' $teil.Titel (Woerter $teil.Text) 60 120 0 'Woerter'
    }
  }
}

# --- Glossar (Kurzerklaerung = erster Absatz, 1-2 Saetze) -----------------------
$glossar = Join-Path $inhalte 'glossar.md'
if (Test-Path -LiteralPath $glossar) {
  foreach ($teil in (Teile (Rumpf (Lies $glossar)) 2)) {
    $kurz = ($teil.Text -split "\n[ \t]*\n")[0]
    Pruefe 'glossar.md' $teil.Titel (Woerter $kurz) 8 50 0 'Woerter (Kurz)'
  }
}

# --- Ausgabe ------------------------------------------------------------------
$probleme = @($zeilen | Where-Object { $_.Status -cmatch 'ZU|FEHLT' })
$leer = @($zeilen | Where-Object { $_.Status -eq 'leer' })
$ok = @($zeilen | Where-Object { $_.Status -like 'ok*' })

if ($NurProbleme) { $zeige = $probleme } else { $zeige = $zeilen }
$zeige | Format-Table -AutoSize -Property Datei, Abschnitt, Zahl, Soll, Status | Out-String -Width 220 | Write-Host

Write-Host ("Gesamt: {0} Abschnitte, {1} ok, {2} leer (noch zu schreiben), {3} Ausreisser." -f $zeilen.Count, $ok.Count, $leer.Count, $probleme.Count)
if ($probleme.Count -gt 0) {
  Write-Host 'Ausreisser:'
  $probleme | ForEach-Object { Write-Host ("  {0} | {1}: {2} (Soll {3}) -> {4}" -f $_.Datei, $_.Abschnitt, $_.Zahl, $_.Soll, $_.Status) }
}
