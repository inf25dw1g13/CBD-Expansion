# Script de teste para a API - powershell
# Gerado por IA, meramente para testar os endpoints básicos rapidamente

param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "=== Testes Food Delivery API ==="
Write-Host "Base URL: $BaseUrl"
Write-Host ""

# Flags de resultado
$results = @{
    Health        = $false
    Restaurantes  = $false
    Clientes      = $false
    Ingredientes  = $false
    Pratos        = $false
    Entregas      = $false
    Pedidos       = $false
}

function Call-Api {
    param(
        [string]$Method,
        [string]$Path,
        [Object]$Body = $null
    )

    $url = "$BaseUrl$Path"
    Write-Host "`n--> $Method $url"

    try {
        if ($Body -ne $null) {
            $json = $Body | ConvertTo-Json -Depth 10
            $resp = Invoke-RestMethod -Method $Method -Uri $url -Body $json -ContentType "application/json"
        } else {
            $resp = Invoke-RestMethod -Method $Method -Uri $url
        }
        Write-Host "<-- OK"
        $resp | ConvertTo-Json -Depth 10 | Write-Host
        return $resp
    } catch {
        Write-Host "<-- ERRO"
        $_.Exception.Message | Write-Host
        if ($_.ErrorDetails) {
            $_.ErrorDetails.Message | Write-Host
        }
        return $null
    }
}

# IDs criados pelo script
$restId     = $null
$pratoId    = $null
$clienteId  = $null
$ingId      = $null
$entregaId  = $null
$pedidoId   = $null

# Variáveis para guardar dados criados (para usar no PUT)
$restData   = $null

# 1. Health
Write-Host "== Health =="
$healthResp = Call-Api -Method GET -Path "/health"
if ($healthResp -and $healthResp.status -eq "OK") {
    $results.Health = $true
}

# 2. Restaurantes
Write-Host "`n== Restaurantes =="

try {
    $okRest = $false

    $restCreate = @{
        nome          = "Pizzaria Script"
        morada        = "Rua dos Scripts 123"
        telefone      = "912345678"
        especialidade = "Italiana"
    }
    $restResp = Call-Api -Method POST -Path "/api/restaurantes" -Body $restCreate
    if ($restResp -and $restResp.id) {
        $restId = $restResp.id
        
        if (Call-Api -Method GET -Path "/api/restaurantes/$restId") {
            # PUT precisa de todos os campos obrigatórios: nome, morada, telefone, especialidade
            # Usar valores originais do $restCreate para garantir que são strings
            $restUpdate = @{
                nome          = "Pizzaria Script Atualizada"
                morada        = $restCreate.morada
                telefone      = $restCreate.telefone
                especialidade = $restCreate.especialidade
            }
            if (Call-Api -Method PUT -Path "/api/restaurantes/$restId" -Body $restUpdate) {
                $okRest = $true
            }
        }
    }
    $results.Restaurantes = $okRest
} catch {
    $results.Restaurantes = $false
}

# 3. Clientes
Write-Host "`n== Clientes =="

try {
    $okClientes = $false

    $timestamp = [DateTime]::UtcNow.Ticks
    $clienteCreate = @{
        nome     = "Cliente Script $timestamp"
        email    = "cliente.script.$timestamp@example.com"
        telefone = "912345678"
    }
    $clienteResp = Call-Api -Method POST -Path "/api/clientes" -Body $clienteCreate
    if ($clienteResp -and $clienteResp.id) {
        $clienteId = $clienteResp.id
        if (Call-Api -Method GET -Path "/api/clientes/$clienteId") {
            $okClientes = $true
        }
    }
    $results.Clientes = $okClientes
} catch {
    $results.Clientes = $false
}

# 4. Ingredientes
Write-Host "`n== Ingredientes =="

try {
    $okIng = $false

    $timestamp = [DateTime]::UtcNow.Ticks
    $ingCreate = @{
        nome     = "Tomate Script $timestamp"
        unidade  = "g"
        alergeno = $false
    }
    $ingResp = Call-Api -Method POST -Path "/api/ingredientes" -Body $ingCreate
    if ($ingResp -and $ingResp.id) {
        $ingId = $ingResp.id
        if (Call-Api -Method GET -Path "/api/ingredientes/$ingId") {
            $okIng = $true
        }
    }
    $results.Ingredientes = $okIng
} catch {
    $results.Ingredientes = $false
}

# 5. Pratos
Write-Host "`n== Pratos =="

try {
    $okPratos = $false

    if ($restId) {
        $pratoCreate = @{
            restaurante_id = $restId
            nome           = "Pizza Script"
            preco          = 8.5
        }
        $pratoResp = Call-Api -Method POST -Path "/api/pratos" -Body $pratoCreate
        if ($pratoResp -and $pratoResp.id) {
            $pratoId = $pratoResp.id
            if (Call-Api -Method GET -Path "/api/pratos/$pratoId") {
                $okPratos = $true
            }
        }
    } else {
        Write-Host "Sem restaurante, não é possível testar pratos."
    }
    $results.Pratos = $okPratos
} catch {
    $results.Pratos = $false
}

# 6. Entregas
Write-Host "`n== Entregas =="

try {
    $okEntregas = $false

    if ($clienteId -and $restId) {
        $entregaCreate = @{
            cliente_id        = $clienteId
            restaurante_id    = $restId
            morada_entrega_id = 1
            estado            = "pendente"
        }
        $entregaResp = Call-Api -Method POST -Path "/api/entregas" -Body $entregaCreate
        if ($entregaResp -and $entregaResp.id) {
            $entregaId = $entregaResp.id
            if (Call-Api -Method GET -Path "/api/entregas/$entregaId") {
                $okEntregas = $true
            }
        }
    } else {
        Write-Host "Sem cliente/restaurante válidos para testar entregas."
    }
    $results.Entregas = $okEntregas
} catch {
    $results.Entregas = $false
}

# 7. Pedidos
Write-Host "`n== Pedidos =="

try {
    $okPedidos = $false

    if ($clienteId -and $restId -and $pratoId) {
        $pedidoCreate = @{
            cliente_id        = $clienteId
            restaurante_id    = $restId
            morada_entrega_id = 1
            metodo_pagamento  = "mbway"
            pratos            = @(@{
                    prato_id         = $pratoId
                    quantidade       = 2
                    observacoes_item = "Sem cebola"
            })
        }
        $pedidoResp = Call-Api -Method POST -Path "/api/pedidos" -Body $pedidoCreate
        if ($pedidoResp -and $pedidoResp.id) {
            $pedidoId = $pedidoResp.id
            if (Call-Api -Method GET -Path "/api/pedidos/$pedidoId") {
                $okPedidos = $true
            }
        }
    } else {
        Write-Host "Sem dados suficientes (cliente/restaurante/prato) para testar pedidos."
    }
    $results.Pedidos = $okPedidos
} catch {
    $results.Pedidos = $false
}

# 8. LIMPEZA
Write-Host "`n== Limpeza (DELETE) =="

if ($pedidoId)   { Call-Api -Method DELETE -Path "/api/pedidos/$pedidoId"     | Out-Null }
if ($entregaId)  { Call-Api -Method DELETE -Path "/api/entregas/$entregaId"   | Out-Null }
if ($pratoId)    { Call-Api -Method DELETE -Path "/api/pratos/$pratoId"       | Out-Null }
if ($ingId)      { Call-Api -Method DELETE -Path "/api/ingredientes/$ingId"   | Out-Null }
if ($clienteId)  { Call-Api -Method DELETE -Path "/api/clientes/$clienteId"   | Out-Null }
if ($restId)     { Call-Api -Method DELETE -Path "/api/restaurantes/$restId"   | Out-Null }

# 9. RESUMO FINAL
Write-Host "`n=== RESUMO FINAL ==="

$failed = @()
foreach ($k in $results.Keys) {
    if ($results[$k]) {
        Write-Host "[OK] $k"
    } else {
        Write-Host "[FAIL] $k"
        $failed += $k
    }
}

if ($failed.Count -eq 0) {
    Write-Host "`n>>> TODOS OS TESTES PASSARAM <<<"
} else {
    Write-Host "`n>>> ALGUNS TESTES FALHARAM <<<"
    Write-Host "Falharam: $($failed -join ', ')"
}

Write-Host "`n=== Fim dos testes ==="

