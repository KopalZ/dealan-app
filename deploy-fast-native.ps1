$services = @("punishment-service", "rating-review-service", "shipment-service", "user-service")

$AcrName = "dealanregistry2026yazid"
$acrLoginServer = "$AcrName.azurecr.io"

Write-Host "Memulai login ke Azure CLI..."
az acr login --name $AcrName

$env:GOOS = "linux"
$env:GOARCH = "amd64"
$env:CGO_ENABLED = "0"

foreach ($service in $services) {
    Write-Host "===================================="
    Write-Host "Kompilasi Native Windows untuk $service..." -ForegroundColor Cyan
    $servicePath = Join-Path $PSScriptRoot $service
    Set-Location $servicePath
    
    # Compile Go Natively on Windows
    go build -o main ./cmd/main.go
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Go Build gagal untuk $service"
        continue
    }

    # Rewrite Dockerfile to use pre-compiled binary
    $fastDockerfile = @"
FROM alpine:3.18
WORKDIR /app
COPY main .
EXPOSE 8080
CMD ["./main"]
"@
    Set-Content -Path "Dockerfile" -Value $fastDockerfile

    $remoteImage = "$acrLoginServer/dealan-$($service):latest"
    
    Write-Host "1. Docker Build $remoteImage (Super Fast)..." -ForegroundColor Yellow
    docker build -t $remoteImage .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build gagal untuk $service"
        continue
    }

    Write-Host "2. Docker Push $remoteImage..." -ForegroundColor Green
    docker push $remoteImage
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Push gagal untuk $service"
        continue
    }

    Write-Host "3. Membersihkan RAM (Docker RMI)..." -ForegroundColor Magenta
    docker rmi $remoteImage -f
}

Set-Location $PSScriptRoot
Write-Host "Semua sisa image berhasil di-deploy ke ACR!" -ForegroundColor Green
