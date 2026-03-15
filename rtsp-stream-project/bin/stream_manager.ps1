$config = Get-Content "../config/cameras.json" | ConvertFrom-Json

function Start-Streams {
    foreach ($cam in $config.cameras) {
        $name = $cam.name
        $url = $cam.url
        $output = "$($config.remote_server)/$name"
        Write-Host "[+] Starting $name..." -ForegroundColor Cyan
        Start-Job -Name "Stream_$name" -ScriptBlock {
            param($f, $i, $o, $out)
            Invoke-Expression "& '$f' -rtsp_transport tcp -i '$i' $o '$out'"
        } -ArgumentList $config.ffmpeg_path, $url, $config.opts, $output
    }
}

function Stop-Streams {
    Write-Host "[-] Stopping all jobs..." -ForegroundColor Yellow
    Get-Job -Name "Stream_*" | Stop-Job
    Get-Job -Name "Stream_*" | Remove-Job
}

if ($args[0] -eq "start") { Start-Streams }
elseif ($args[0] -eq "stop") { Stop-Streams }
elseif ($args[0] -eq "status") { Get-Job -Name "Stream_*" }
else { Write-Host "Usage: ./stream_manager.ps1 [start | stop | status]" }