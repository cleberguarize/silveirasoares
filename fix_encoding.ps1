$bytes = [System.IO.File]::ReadAllBytes('C:\Users\Usuário\Desktop\Projeto teste\index.html')
$utf8text = [System.Text.Encoding]::UTF8.GetString($bytes)
# Find the "Avalia" part
$idx = $utf8text.IndexOf('Avalia')
if ($idx -ge 0) {
    $snippet = $utf8text.Substring($idx, [Math]::Min(30, $utf8text.Length - $idx))
    Write-Output "Around Avalia: [$snippet]"
    Write-Output "Bytes around Avalia:"
    $start = [Math]::Max(0, $idx - 5)
    $end = [Math]::Min($bytes.Length, $idx + 50)
    $byteStr = ""
    for ($i = $start; $i -lt $end; $i++) {
        $byteStr += "{0:X2} " -f $bytes[$i]
    }
    Write-Output $byteStr
}

# Check if file contains replacement character U+FFFD (EF BF BD in UTF-8)
$fffdCount = 0
for ($i = 0; $i -lt $bytes.Length - 2; $i++) {
    if ($bytes[$i] -eq 0xEF -and $bytes[$i+1] -eq 0xBF -and $bytes[$i+2] -eq 0xBD) {
        $fffdCount++
        $context = $utf8text.Substring([Math]::Max(0, $i - 20), [Math]::Min(40, $utf8text.Length - [Math]::Max(0, $i - 20)))
        Write-Output "FFFD at byte $i : ...$context..."
    }
}
Write-Output "Total FFFD replacements found: $fffdCount"
