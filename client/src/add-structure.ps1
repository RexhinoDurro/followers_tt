# SocialBoost Pro - Extend Existing React Project
# Run this from: followers_tt\client\src>

Write-Host "Adding SocialBoost Pro structure to existing project..." -ForegroundColor Green

# Check if we're in the right directory
if (!(Test-Path ".\App.tsx")) {
    Write-Host "Error: Please run this script from the client\src directory" -ForegroundColor Red
    Write-Host "Current location should be: followers_tt\client\src>" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating additional folders..." -ForegroundColor Yellow

# Create new folders in existing src directory
$newFolders = @(
    "components\layout",
    "components\ui", 
    "components\sections",
    "components\forms",
    "components\charts",
    "pages\services",
    "context",
    "hooks",
    "utils",
    "types",
    "styles",
    "data"
)

foreach ($folder in $newFolders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "Created: $folder" -ForegroundColor Green
    } else {
        Write-Host "Exists: $folder" -ForegroundColor Gray
    }
}

Write-Host "Creating component files..." -ForegroundColor Cyan

# Layout components
$layoutFiles = @(
    "components\layout\Header.tsx",
    "components\layout\Footer.tsx",
    "components\layout\Layout.tsx"
)

# UI components
$uiFiles = @(
    "components\ui\Button.tsx",
    "components\ui\Card.tsx",
    "components\ui\Modal.tsx",
    "components\ui\Input.tsx",
    "components\ui\Badge.tsx",
    "components\ui\LoadingSpinner.tsx"
)

# Section components
$sectionFiles = @(
    "components\sections\Hero.tsx",
    "components\sections\ServiceOverview.tsx",
    "components\sections\SocialProof.tsx",
    "components\sections\PricingPreview.tsx",
    "components\sections\Features.tsx",
    "components\sections\Testimonials.tsx",
    "components\sections\HowItWorks.tsx",
    "components\sections\TrustIndicators.tsx"
)

# Form components
$formFiles = @(
    "components\forms\CheckoutForm.tsx",
    "components\forms\ContactForm.tsx",
    "components\forms\PaymentForm.tsx"
)

# Chart components
$chartFiles = @(
    "components\charts\GrowthChart.tsx",
    "components\charts\AnalyticsCard.tsx"
)

# Page components
$pageFiles = @(
    "pages\HomePage.tsx",
    "pages\PricingPage.tsx",
    "pages\CartPage.tsx",
    "pages\CheckoutPage.tsx",
    "pages\OrderConfirmation.tsx",
    "pages\AboutUs.tsx",
    "pages\HowItWorksPage.tsx",
    "pages\FAQ.tsx",
    "pages\Contact.tsx",
    "pages\Blog.tsx",
    "pages\Dashboard.tsx"
)

# Service pages
$serviceFiles = @(
    "pages\services\InstagramGrowth.tsx",
    "pages\services\TikTokGrowth.tsx",
    "pages\services\YouTubeGrowth.tsx"
)

# Context files
$contextFiles = @(
    "context\CartContext.tsx",
    "context\AuthContext.tsx",
    "context\ThemeContext.tsx"
)

# Hook files
$hookFiles = @(
    "hooks\useCart.ts",
    "hooks\useAuth.ts",
    "hooks\useLocalStorage.ts",
    "hooks\useAnimation.ts"
)

# Utility files
$utilFiles = @(
    "utils\constants.ts",
    "utils\helpers.ts",
    "utils\validation.ts",
    "utils\api.ts"
)

# Type files
$typeFiles = @(
    "types\index.ts",
    "types\cart.ts",
    "types\user.ts",
    "types\services.ts"
)

# Style files
$styleFiles = @(
    "styles\globals.css",
    "styles\animations.css"
)

# Data files
$dataFiles = @(
    "data\services.ts",
    "data\testimonials.ts",
    "data\faq.ts",
    "data\pricing.ts"
)

# Combine all files
$allFiles = $layoutFiles + $uiFiles + $sectionFiles + $formFiles + $chartFiles + $pageFiles + $serviceFiles + $contextFiles + $hookFiles + $utilFiles + $typeFiles + $styleFiles + $dataFiles

# Create all files
foreach ($file in $allFiles) {
    if (!(Test-Path $file)) {
        New-Item -ItemType File -Force -Path $file | Out-Null
        Write-Host "Created: $file" -ForegroundColor Green
    } else {
        Write-Host "Exists: $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Structure added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Updated src/ structure:" -ForegroundColor White
Write-Host "src/" -ForegroundColor Cyan
Write-Host "+-- components/" -ForegroundColor Gray
Write-Host "|   +-- layout/           # Header, Footer, Layout" -ForegroundColor Gray
Write-Host "|   +-- ui/               # Button, Card, Modal, etc." -ForegroundColor Gray
Write-Host "|   +-- sections/         # Hero, Features, etc." -ForegroundColor Gray
Write-Host "|   +-- forms/            # Checkout, Contact forms" -ForegroundColor Gray
Write-Host "|   +-- charts/           # Growth charts" -ForegroundColor Gray
Write-Host "+-- pages/" -ForegroundColor Gray
Write-Host "|   +-- services/         # Instagram, TikTok, YouTube" -ForegroundColor Gray
Write-Host "|   +-- HomePage.tsx      # Main landing page" -ForegroundColor Gray
Write-Host "|   +-- CartPage.tsx      # Shopping cart" -ForegroundColor Gray
Write-Host "|   +-- CheckoutPage.tsx  # Payment processing" -ForegroundColor Gray
Write-Host "+-- context/              # React Context providers" -ForegroundColor Gray
Write-Host "+-- hooks/                # Custom React hooks" -ForegroundColor Gray
Write-Host "+-- utils/                # Helper functions" -ForegroundColor Gray
Write-Host "+-- types/                # TypeScript definitions" -ForegroundColor Gray
Write-Host "+-- styles/               # CSS files" -ForegroundColor Gray
Write-Host "+-- data/                 # Static data" -ForegroundColor Gray
Write-Host "+-- App.tsx               # Existing file" -ForegroundColor Gray
Write-Host "+-- main.tsx              # Existing file" -ForegroundColor Gray
Write-Host ""
Write-Host "Total new files created: $($allFiles.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Install additional dependencies:" -ForegroundColor White
Write-Host "   npm install react-router-dom lucide-react clsx tailwind-merge" -ForegroundColor Cyan
Write-Host "2. Configure Tailwind CSS if not already done" -ForegroundColor White
Write-Host "3. Start building your SocialBoost Pro components!" -ForegroundColor White