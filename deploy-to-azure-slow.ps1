$services = @("map-route-service", "matching-service", "notification-service", "order-service", "payment-service", "pricing-service", "promo-service", "punishment-service", "rating-service", "report-service", "user-service")

$AcrName = "dealanregistry2026yazid"
$acrLoginServer = "$AcrName.azurecr.io"

Write-Host "Memulai login ke Azure CLI..."
az acr login --name $AcrName

foreach ($service in $services) {
    Write-Host "===================================="
    Write-Host "Membangun image $service..." -ForegroundColor Cyan
    $servicePath = Join-Path $PSScriptRoot $service
    $remoteImage = "$acrLoginServer/dealan-$($service):latest"
    
    Write-Host "1. Docker Build $remoteImage..." -ForegroundColor Yellow
    docker build -t $remoteImage $servicePath
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

Write-Host "Semua image berhasil di-deploy ke ACR!" -ForegroundColor Green
