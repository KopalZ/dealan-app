$services = @("auth-service", "chat-service", "driver-service", "location-service", "map-route-service", "matching-service", "notification-service", "order-service", "payment-service", "pricing-service", "promo-service", "punishment-service", "rating-review-service", "shipment-service", "user-service")

$AcrName = "dealanregistry2026yazid"
$acrLoginServer = "$AcrName.azurecr.io"
$ResourceGroupName = "dealan-rg"
$AksClusterName = "dealan-aks-cluster"

Write-Host "Menghubungkan kubectl ke cluster AKS..." -ForegroundColor Green
az aks get-credentials --resource-group $ResourceGroupName --name $AksClusterName --overwrite-existing

$tmpDir = Join-Path $PSScriptRoot ".azure_deploy_tmp"
if (Test-Path $tmpDir) {
    Remove-Item -Path $tmpDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tmpDir | Out-Null

Write-Host "Menerapkan ConfigMap dan Infrastruktur K8s (PostgreSQL, Redis, Kafka)..." -ForegroundColor Blue
kubectl apply -f (Join-Path $PSScriptRoot "dealan-config-k8s.yaml")
kubectl apply -f (Join-Path $PSScriptRoot "infrastructure-k8s.yaml")

Write-Host "Tunggu 10 detik..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

foreach ($service in $services) {
    # Fix nama file k8s untuk beberapa service yang tidak standar
    $k8sFileName = "$service-k8s.yaml"
    if ($service -eq "auth-service") { $k8sFileName = "auth-k8s.yaml" }
    elseif ($service -eq "rating-review-service") { $k8sFileName = "rating-review-k8s.yaml" }
    elseif ($service -eq "shipment-service") { $k8sFileName = "shipment-k8s.yaml" }
    elseif ($service -eq "user-service") { $k8sFileName = "user-k8s.yaml" }

    $k8sFile = Join-Path $PSScriptRoot "$service/$k8sFileName"

    if (Test-Path $k8sFile) {
        Write-Host "Mengonfigurasi manifest $service..." -ForegroundColor Blue
        $content = Get-Content $k8sFile -Raw
        
        # Ganti image format lama dengan ACR
        $targetImage = "$acrLoginServer/dealan-$($service):latest"
        $newContent = $content -replace "kelompokdealan/[a-zA-Z0-9_-]+:latest", $targetImage
        
        $outFile = Join-Path $tmpDir "$service-k8s.yaml"
        Set-Content -Path $outFile -Value $newContent
        
        kubectl apply -f $outFile
    } else {
        Write-Warning "Manifest untuk $service tidak ditemukan pada path: $k8sFile"
    }
}

Write-Host "Mengonfigurasi Ingress Controller..." -ForegroundColor Green
$helmExists = Get-Command helm -ErrorAction SilentlyContinue
if ($helmExists) {
    helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx 2>$null | Out-Null
    helm repo update 2>$null | Out-Null
    helm install ingress-nginx ingress-nginx/ingress-nginx `
      --create-namespace `
      --namespace ingress-basic `
      --set controller.service.externalTrafficPolicy="Local" 2>$null | Out-Null
}

kubectl apply -f (Join-Path $PSScriptRoot "ingress.yaml")
Remove-Item -Path $tmpDir -Recurse -Force

Write-Host "DEPOYMENT KUBERNETES SELESAI!" -ForegroundColor Green
