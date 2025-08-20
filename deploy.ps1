# SocialBoost Pro - Simple Structure Creator (Windows PowerShell)
# Creates all folders and empty files

Write-Host "🚀 Creating SocialBoost Pro Structure..." -ForegroundColor Green

# Create main project directory
New-Item -ItemType Directory -Force -Path "socialboost-pro" | Out-Null
Set-Location "socialboost-pro"

Write-Host "📁 Creating folders..." -ForegroundColor Yellow

# CLIENT FOLDERS
$clientFolders = @(
    "client\src\components\layout",
    "client\src\components\ui", 
    "client\src\components\sections",
    "client\src\components\forms",
    "client\src\components\charts",
    "client\src\pages\services",
    "client\src\context",
    "client\src\hooks",
    "client\src\utils",
    "client\src\types",
    "client\src\styles",
    "client\src\assets\images",
    "client\src\assets\icons",
    "client\src\assets\videos",
    "client\src\data",
    "client\public"
)

foreach ($folder in $clientFolders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# SERVER FOLDERS
$serverFolders = @(
    "server\api\migrations",
    "server\socialboost",
    "server\static",
    "server\media",
    "server\templates"
)

foreach ($folder in $serverFolders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

Write-Host "📝 Creating files..." -ForegroundColor Cyan

# CLIENT FILES
$clientFiles = @(
    # Root files
    "client\src\App.tsx",
    "client\src\main.tsx",
    "client\index.html",
    "client\package.json",
    "client\tailwind.config.js",
    "client\postcss.config.js",
    "client\vite.config.ts",
    "client\tsconfig.json",
    "client\tsconfig.app.json",
    "client\tsconfig.node.json",
    "client\.gitignore",
    
    # Layout components
    "client\src\components\layout\Header.tsx",
    "client\src\components\layout\Footer.tsx",
    "client\src\components\layout\Layout.tsx",
    
    # UI components
    "client\src\components\ui\Button.tsx",
    "client\src\components\ui\Card.tsx",
    "client\src\components\ui\Modal.tsx",
    "client\src\components\ui\Input.tsx",
    "client\src\components\ui\Badge.tsx",
    "client\src\components\ui\LoadingSpinner.tsx",
    
    # Section components
    "client\src\components\sections\Hero.tsx",
    "client\src\components\sections\ServiceOverview.tsx",
    "client\src\components\sections\SocialProof.tsx",
    "client\src\components\sections\PricingPreview.tsx",
    "client\src\components\sections\Features.tsx",
    "client\src\components\sections\Testimonials.tsx",
    "client\src\components\sections\HowItWorks.tsx",
    "client\src\components\sections\TrustIndicators.tsx",
    
    # Form components
    "client\src\components\forms\CheckoutForm.tsx",
    "client\src\components\forms\ContactForm.tsx",
    "client\src\components\forms\PaymentForm.tsx",
    
    # Chart components
    "client\src\components\charts\GrowthChart.tsx",
    "client\src\components\charts\AnalyticsCard.tsx",
    
    # Pages
    "client\src\pages\HomePage.tsx",
    "client\src\pages\PricingPage.tsx",
    "client\src\pages\CartPage.tsx",
    "client\src\pages\CheckoutPage.tsx",
    "client\src\pages\OrderConfirmation.tsx",
    "client\src\pages\AboutUs.tsx",
    "client\src\pages\HowItWorksPage.tsx",
    "client\src\pages\FAQ.tsx",
    "client\src\pages\Contact.tsx",
    "client\src\pages\Blog.tsx",
    "client\src\pages\Dashboard.tsx",
    
    # Service pages
    "client\src\pages\services\InstagramGrowth.tsx",
    "client\src\pages\services\TikTokGrowth.tsx",
    "client\src\pages\services\YouTubeGrowth.tsx",
    
    # Context
    "client\src\context\CartContext.tsx",
    "client\src\context\AuthContext.tsx",
    "client\src\context\ThemeContext.tsx",
    
    # Hooks
    "client\src\hooks\useCart.ts",
    "client\src\hooks\useAuth.ts",
    "client\src\hooks\useLocalStorage.ts",
    "client\src\hooks\useAnimation.ts",
    
    # Utils
    "client\src\utils\constants.ts",
    "client\src\utils\helpers.ts",
    "client\src\utils\validation.ts",
    "client\src\utils\api.ts",
    
    # Types
    "client\src\types\index.ts",
    "client\src\types\cart.ts",
    "client\src\types\user.ts",
    "client\src\types\services.ts",
    
    # Styles
    "client\src\styles\globals.css",
    "client\src\styles\animations.css",
    
    # Data
    "client\src\data\services.ts",
    "client\src\data\testimonials.ts",
    "client\src\data\faq.ts",
    "client\src\data\pricing.ts"
)

# SERVER FILES
$serverFiles = @(
    # Django project files
    "server\manage.py",
    "server\requirements.txt",
    
    # Main project
    "server\socialboost\__init__.py",
    "server\socialboost\settings.py",
    "server\socialboost\urls.py",
    "server\socialboost\wsgi.py",
    "server\socialboost\asgi.py",
    
    # API app
    "server\api\__init__.py",
    "server\api\admin.py",
    "server\api\apps.py",
    "server\api\models.py",
    "server\api\views.py",
    "server\api\serializers.py",
    "server\api\urls.py",
    "server\api\tests.py",
    "server\api\migrations\__init__.py"
)

# Create all client files
foreach ($file in $clientFiles) {
    New-Item -ItemType File -Force -Path $file | Out-Null
}

# Create all server files
foreach ($file in $serverFiles) {
    New-Item -ItemType File -Force -Path $file | Out-Null
}

# Create root files
"README.md", ".gitignore" | ForEach-Object {
    New-Item -ItemType File -Force -Path $_ | Out-Null
}

Write-Host "Structure created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Project Structure:" -ForegroundColor White
Write-Host "socialboost-pro/" -ForegroundColor Cyan
Write-Host "+-- client/                    # React frontend" -ForegroundColor Gray
Write-Host "|   +-- src/" -ForegroundColor Gray
Write-Host "|   |   +-- components/        # UI components" -ForegroundColor Gray
Write-Host "|   |   +-- pages/            # Page components" -ForegroundColor Gray
Write-Host "|   |   +-- context/          # React context" -ForegroundColor Gray
Write-Host "|   |   +-- hooks/            # Custom hooks" -ForegroundColor Gray
Write-Host "|   |   +-- utils/            # Utilities" -ForegroundColor Gray
Write-Host "|   |   +-- types/            # TypeScript types" -ForegroundColor Gray
Write-Host "|   |   +-- data/             # Static data" -ForegroundColor Gray
Write-Host "+-- server/                    # Django backend" -ForegroundColor Gray
Write-Host "|   +-- api/                  # Main API app" -ForegroundColor Gray
Write-Host "|   +-- socialboost/          # Django project" -ForegroundColor Gray
Write-Host "|   +-- requirements.txt      # Python deps" -ForegroundColor Gray
Write-Host "+-- README.md" -ForegroundColor Gray
Write-Host "+-- .gitignore" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. cd socialboost-pro" -ForegroundColor White
Write-Host "2. Set up client: cd client && npm install" -ForegroundColor White
Write-Host "3. Set up server: cd server && pip install -r requirements.txt" -ForegroundColor White
Write-Host ""
Write-Host "Total files created: $($clientFiles.Count + $serverFiles.Count + 2)" -ForegroundColor Green