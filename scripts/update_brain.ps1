
$brainPath = "c:\Users\ester\Desktop\HECTOR\HecTechAI\HECTECH_AI_BRAIN.md"
$protocolsPath = "c:\Users\ester\Desktop\HECTOR\HecTechAI\HECTECH_OPERATIONAL_PROTOCOLS.md"

$brainContent = Get-Content -Path $brainPath -Raw -Encoding UTF8
$protocolsContent = Get-Content -Path $protocolsPath -Raw -Encoding UTF8

# Define the start and end markers for the section to replace
$startMarker = "## Protocolos Operacionales"
$endMarker = "Manual generado para el Notebook de HecTech*"

$startIndex = $brainContent.IndexOf($startMarker)
$endIndexMatch = $brainContent.IndexOf($endMarker, $startIndex)

if ($startIndex -ge 0 -and $endIndexMatch -ge 0) {
    # Find the end of the line for the end marker
    $endIndex = $brainContent.IndexOf("`n", $endIndexMatch)
    if ($endIndex -eq -1) { $endIndex = $brainContent.Length }

    # Construct the new content
    $preContent = $brainContent.Substring(0, $startIndex)
    
    # We want to keep the header "## Protocolos Operacionales" or replace it?
    # The new protocols file has its own H1. Ideally we keep the H2 container.
    # New content format:
    # ## Protocolos Operacionales
    # (New Protocols Content)
    # ---
    # *Manual...* (This part comes from the new file actually)
    
    # Let's just create the new block
    $newBlock = "## Protocolos Operacionales`n`n" + $protocolsContent
    
    # The post content starts AFTER the old block
    # The old block ended with *Manual...* so we should skip that.
    $postContent = $brainContent.Substring($endIndex)

    $finalContent = $preContent + $newBlock + $postContent
    
    Set-Content -Path $brainPath -Value $finalContent -Encoding UTF8
    Write-Host "Successfully updated HECTECH_AI_BRAIN.md"
} else {
    Write-Error "Could not find markers in the file."
    Write-Host "Start Index: $startIndex"
    Write-Host "End Index Match: $endIndexMatch"
}
