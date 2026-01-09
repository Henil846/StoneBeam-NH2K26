# StoneBeam-NH Real-Time Server Launcher
# Keeps server running even after chat ends

Write-Host "🚀 Starting StoneBeam-NH Real-Time Server..." -ForegroundColor Green
Write-Host "📡 Server will run on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Browser will open automatically..." -ForegroundColor Yellow
Write-Host "💡 To stop server: Close this window or press Ctrl+C" -ForegroundColor White
Write-Host ""

# Start the server in background
$serverJob = Start-Job -ScriptBlock {
    # Change to your project directory
    Set-Location "C:\Users\praja\OneDrive\New folder\StartUp"
    
    # Start the Node.js server
    node working-server.js
    
    # Keep the job running
    while ($true) {
        Start-Sleep -Seconds 1
    }
} -Name "StoneBeamServer"

# Open browser after a short delay
Start-Sleep -Seconds 3
Start-Process "http://localhost:3001"

# Show server status
Write-Host ""
Write-Host "✅ Server is running in background!" -ForegroundColor Green
Write-Host "📱 Open http://localhost:3001 in your browser" -ForegroundColor Cyan
Write-Host "🛑 To stop server: Close this PowerShell window" -ForegroundColor Red

# Keep the window open
try {
    # Wait for the server job to complete (never happens, keeps window open)
    Wait-Job $serverJob
}
catch {
    # Handle cleanup if window is closed
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Write-Host "🛑 Server stopped" -ForegroundColor Red
}
