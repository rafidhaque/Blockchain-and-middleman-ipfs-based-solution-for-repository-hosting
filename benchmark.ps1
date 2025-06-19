$gitRepoPath = "C:\Users\rafha\Documents\git-benchmark-repo"
$numberOfTrials = 5
$testFiles = @("1MB.zip", "5MB.zip", "10MB.zip", "20MB.zip")

function Clear-GitRepo {
    param ($path)
    Write-Host "   -> Clearing repository for next test..."
    Push-Location $path
    Get-ChildItem -Path . -Exclude ".git" | Remove-Item -Recurse -Force
    Pop-Location
}

Write-Host "Starting Git Benchmark..." -ForegroundColor Yellow
Write-Host "Repository: $gitRepoPath"
Write-Host "Trials per file: $numberOfTrials"
Write-Host "--------------------------------------------------"

if (-not (Test-Path $gitRepoPath)) {
    Write-Host "ERROR: The Git repository path does not exist. Please configure `$gitRepoPath`." -ForegroundColor Red
    return
}

foreach ($file in $testFiles) {
    
    $filePath = Join-Path $PSScriptRoot $file
    if (-not (Test-Path $filePath)) {
        Write-Host "Skipping '$file' - not found." -ForegroundColor Magenta
        continue
    }

    Write-Host "Benchmarking '$file'..." -ForegroundColor Cyan

    $pushTimes = @()
    $pullTimes = @()

    for ($i = 1; $i -le $numberOfTrials; $i++) {
        
        Write-Host "   -> Trial $i of $numberOfTrials"

        Clear-GitRepo -path $gitRepoPath
        Copy-Item -Path $filePath -Destination $gitRepoPath
        
        Push-Location $gitRepoPath
        git add . > $null
        git commit -m "benchmark trial $i for $file" > $null
        $pushResult = Measure-Command { git push }
        $pushTimes += $pushResult.TotalSeconds
        Pop-Location

        Clear-GitRepo -path $gitRepoPath

        Push-Location $gitRepoPath
        $pullResult = Measure-Command { git pull }
        $pullTimes += $pullResult.TotalSeconds
        Pop-Location
    }

    $avgPushTime = ($pushTimes | Measure-Object -Average).Average
    $avgPullTime = ($pullTimes | Measure-Object -Average).Average

    Write-Host "--------------------------------------------------" -ForegroundColor Green
    Write-Host "Results for '$file':" -ForegroundColor Green
    Write-Host "   Average Push Time: $($avgPushTime.ToString("F3")) seconds"
    Write-Host "   Average Pull Time: $($avgPullTime.ToString("F3g")) seconds"
    Write-Host "--------------------------------------------------"
}

Write-Host "Benchmark complete." -ForegroundColor Yellow
