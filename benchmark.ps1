# ===================================================================
# Automated Git Performance Benchmark Script
# ===================================================================

# --- CONFIGURATION ---
# The full path to your local Git repository folder.
# IMPORTANT: Use a dedicated, empty repo for this test.
# Example: $gitRepoPath = "C:\Users\YourName\Documents\git-benchmark-repo"
$gitRepoPath = "PASTE_THE_FULL_PATH_TO_YOUR_GIT_REPO_HERE"

# The number of times to run the test for each file to get an average.
$numberOfTrials = 5

# The list of test files located in the SAME folder as this script.
$testFiles = @("1MB.zip", "10MB.zip", "50MB.zip", "100MB.zip")
# ===================================================================


# --- SCRIPT LOGIC (No need to edit below this line) ---

# Function to clear the Git repository for a clean test
function Clear-GitRepo {
    param ($path)
    Write-Host "  -> Clearing repository for next test..."
    # Navigate into the repo
    Push-Location $path
    
    # Remove all files except .git folder
    Get-ChildItem -Path . -Exclude ".git" | Remove-Item -Recurse -Force
    
    # Navigate back out
    Pop-Location
}

# --- MAIN EXECUTION ---

Write-Host "Starting Git Benchmark..." -ForegroundColor Yellow
Write-Host "Repository: $gitRepoPath"
Write-Host "Trials per file: $numberOfTrials"
Write-Host "--------------------------------------------------"

if (-not (Test-Path $gitRepoPath)) {
    Write-Host "ERROR: The Git repository path does not exist. Please configure `$gitRepoPath`." -ForegroundColor Red
    return
}

# Loop through each test file
foreach ($file in $testFiles) {
    
    $filePath = Join-Path $PSScriptRoot $file
    if (-not (Test-Path $filePath)) {
        Write-Host "Skipping '$file' - not found." -ForegroundColor Magenta
        continue
    }

    Write-Host "Benchmarking '$file'..." -ForegroundColor Cyan

    $pushTimes = @()
    $pullTimes = @()

    # Loop for the specified number of trials
    for ($i = 1; $i -le $numberOfTrials; $i++) {
        
        Write-Host "  -> Trial $i of $numberOfTrials"

        # --- PUSH TEST ---
        Clear-GitRepo -path $gitRepoPath
        Copy-Item -Path $filePath -Destination $gitRepoPath
        
        Push-Location $gitRepoPath
        git add . > $null
        git commit -m "benchmark trial $i for $file" > $null
        $pushResult = Measure-Command { git push }
        $pushTimes += $pushResult.TotalSeconds
        Pop-Location

        # --- PULL TEST ---
        Clear-GitRepo -path $gitRepoPath

        Push-Location $gitRepoPath
        $pullResult = Measure-Command { git pull }
        $pullTimes += $pullResult.TotalSeconds
        Pop-Location
    }

    # Calculate averages
    $avgPushTime = ($pushTimes | Measure-Object -Average).Average
    $avgPullTime = ($pullTimes | Measure-Object -Average).Average

    # Print results for this file
    Write-Host "--------------------------------------------------" -ForegroundColor Green
    Write-Host "Results for '$file':" -ForegroundColor Green
    Write-Host "  Average Push Time: $($avgPushTime.ToString("F3")) seconds"
    Write-Host "  Average Pull Time: $($avgPullTime.ToString("F3g")) seconds"
    Write-Host "--------------------------------------------------"
}

Write-Host "Benchmark complete." -ForegroundColor Yellow