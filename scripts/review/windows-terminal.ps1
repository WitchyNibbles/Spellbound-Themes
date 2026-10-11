# Captures Windows Terminal running the release terminal sample (spec 9): witchyterm's Moonlit Candle profile, wsl.exe
# in the release run's workspace, `fish -i -c "source scripts/ritual.fish"`, exactly what the VS Code terminal scene runs.
# A plain #0D0916 backdrop is shown behind the window first, so the profile's translucency shows the theme's own
# background and nothing from the desktop. Prints one line, "dpi=<n> size=<w>x<h>", and never a path.
# Usage (Windows PowerShell 5.1, from a copy under %TEMP%):
#   powershell.exe -NoProfile -ExecutionPolicy Bypass -File windows-terminal.ps1 -Workspace <dir> -Out <png>
param(
  [Parameter(Mandatory = $true)][string]$Workspace,
  [Parameter(Mandatory = $true)][string]$Out
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing, System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class SpellboundWin {
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern IntPtr FindWindow(string className, string title);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr window);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr window);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr window, uint message, IntPtr wParam, IntPtr lParam);
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr window, int attribute, out RECT rect, int size);
}
'@
[SpellboundWin]::SetProcessDPIAware() | Out-Null

# The visible profile that uses witchyterm's scheme (witchyterm themes one profile, spec 3.1's pinned scheme).
$settingsFile = Join-Path $env:LOCALAPPDATA 'Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json'
$settings = ((Get-Content -Raw -Encoding UTF8 $settingsFile) -split "`n" | Where-Object { $_ -notmatch '^\s*//' }) -join "`n" | ConvertFrom-Json
$profiles = @($settings.profiles.list | Where-Object { $_.colorScheme -eq 'Moonlit Candle' -and -not $_.hidden })
if ($profiles.Count -ne 1) { throw "expected one visible Windows Terminal profile with the Moonlit Candle scheme, found $($profiles.Count)" }

$title = 'Spellbound ritual'
# Windows Terminal's top-level windows have this class. FindWindow is given it rather than $null, because PowerShell
# passes $null to a string parameter as an empty string, which matches no window.
$class = 'CASCADIA_HOSTING_WINDOW_CLASS'
if ([SpellboundWin]::FindWindow($class, $title) -ne [IntPtr]::Zero) { throw "a Windows Terminal window titled '$title' is already open; close it first" }
$backdrop = New-Object System.Windows.Forms.Form
$backdrop.FormBorderStyle = 'None'
$backdrop.StartPosition = 'Manual'
$backdrop.Bounds = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$backdrop.BackColor = [System.Drawing.ColorTranslator]::FromHtml('#0D0916')
$backdrop.ShowInTaskbar = $false
$backdrop.Show()
[System.Windows.Forms.Application]::DoEvents()
$window = [IntPtr]::Zero
try {
  Start-Process wt.exe -ArgumentList @('-w', 'new', '--pos', '120,120', '--size', '60,24', '-p', $profiles[0].guid, '--title', "`"$title`"",
    '--suppressApplicationTitle', 'wsl.exe', '--cd', "`"$Workspace`"", '-e', 'fish', '-i', '-c', '"source scripts/ritual.fish"')
  $deadline = (Get-Date).AddSeconds(30)
  while ($window -eq [IntPtr]::Zero -and (Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 250
    [System.Windows.Forms.Application]::DoEvents()
    $window = [SpellboundWin]::FindWindow($class, $title)
  }
  if ($window -eq [IntPtr]::Zero) {
    # A window that opens late is still this script's (its title was free before the launch). Look a while longer, so
    # the finally block below closes it by its handle, and fail the capture either way (final review M16).
    $grace = (Get-Date).AddSeconds(15)
    while ($window -eq [IntPtr]::Zero -and (Get-Date) -lt $grace) {
      Start-Sleep -Milliseconds 250
      [System.Windows.Forms.Application]::DoEvents()
      $window = [SpellboundWin]::FindWindow($class, $title)
    }
    throw "no Windows Terminal window titled '$title' within 30 s$(if ($window -ne [IntPtr]::Zero) { '; it opened later and is closed' })"
  }
  [SpellboundWin]::SetForegroundWindow($window) | Out-Null
  # fish, eza and the swatches print within a few seconds; the ritual then sleeps, so the window stays as it is.
  for ($i = 0; $i -lt 40; $i++) { Start-Sleep -Milliseconds 250; [System.Windows.Forms.Application]::DoEvents() }
  # The window's own bounds without the drop shadow (DWMWA_EXTENDED_FRAME_BOUNDS).
  $rect = New-Object SpellboundWin+RECT
  [SpellboundWin]::DwmGetWindowAttribute($window, 9, [ref]$rect, [System.Runtime.InteropServices.Marshal]::SizeOf($rect)) | Out-Null
  $width = $rect.Right - $rect.Left
  $height = $rect.Bottom - $rect.Top
  $bitmap = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CopyFromScreen($rect.Left, $rect.Top, 0, 0, $bitmap.Size)
  $bitmap.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
  "dpi=$([SpellboundWin]::GetDpiForWindow($window)) size=${width}x${height}"
} finally {
  # Only the window this script opened is closed, by its handle (WM_CLOSE); its tab ends the ritual's wsl.exe.
  if ($window -ne [IntPtr]::Zero) { [SpellboundWin]::PostMessage($window, 0x10, [IntPtr]::Zero, [IntPtr]::Zero) | Out-Null }
  $backdrop.Close()
}
