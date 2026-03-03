# NLK Image Editor

A powerful, customizable, and easy-to-integrate Image Editor package for Laravel.
Provide your users with professional image editing capabilities directly within your application UI, without relying on external tabs or heavy desktop software. 

![Laravel Image Editor](https://img.shields.io/badge/Laravel-8%2B-red.svg?style=flat-square&logo=laravel)
![PHP 8.0+](https://img.shields.io/badge/PHP-8.0%2B-blue.svg?style=flat-square&logo=php)

## 🚀 Features

- **Full Canvas Control**: Move, scale, and rotate the main image and any added objects freely.
- **Background Operations**: Support for changing canvas background to transparent, solid colors, stunning gradients, or uploaded images.
- **Crop Tool**: Interactive visual cropping. 
- **Drawing & Eraser**: Freehand drawing with adjustable brush size and colors.
- **Text & Typography**: Add rich text with custom typography (font family, size, colors, bold, italic).
- **Shapes & Stickers**: Insert rectangles, circles, triangles, arrows, and a rich library of pre-defined emojis/stickers.
- **Image Filters**: Apply various photo filters like Grayscale, Sepia, Vintage, Invert, along with sliders for Brightness, Contrast, Saturation, and Blur.
- **AI Integration Ready**: Built-in UI controls and loading states for AI background removal and image upscaling (AI processing logic must be provided by the host application's backend).
- **History Management**: Comprehensive Undo and Redo functionality.
- **Localization**: Out-of-the-box support for English, Arabic, and Turkish. Fully customizable via Laravel's translation system.

## 📦 Installation

This package is designed to be easily plugged into any Laravel 8+ project. 

Require the package via Composer:

```bash
composer require nlk/image-editor
```

### Publishing Assets

The package contains Blade components, Javascript files, and Translations. Publish them into your application using:

```bash
# Publish everything (JS, Views, Translations)
php artisan vendor:publish --provider="Nlk\ImageEditor\ImageEditorServiceProvider"

# OR publish specifically by tags:
php artisan vendor:publish --tag=nlk-image-editor-assets
php artisan vendor:publish --tag=nlk-image-editor-views
php artisan vendor:publish --tag=nlk-image-editor-lang
```

> **Note:** Don't forget to push the scripts stack in your main layout to render the package's javascript files correctly. The package pushes scripts to the `@push('js')` stack.

## 🧑‍💻 Usage

### 1. Render the Editor Component

Place the component tag anywhere in your blade view. This renders the hidden editor modal structure.

```html
<x-nlk::image-editor />
```

### 2. Configure JavaScript Environment

The editor relies on a global variable for identifying where to route AI processing requests (if you use them). Make sure you define it before the scripts are loaded:

```html
<script>
    window.processImageUrl = "{{ route('your.ai.processing.route') }}";
</script>
```

### 3. Initialize the Widget (HTML Elements)

The package provides a helper `NLKImageWidget.initWidget()` to easily bind the editor to standard file inputs.

**Blade HTML example:**

```html
<!-- Upload area -->
<label for="my_image_input">Upload Image</label>
<input type="file" id="my_image_input" accept="image/*" style="display:none;" />

<!-- Hidden input to store the final Base64 edited image -->
<input type="hidden" name="image_cropped" id="my_image_cropped" value="">

<!-- Preview area -->
<div id="my_image_preview" style="display:none;">
    <img id="my_image_preview_img" src="" alt="Preview">
    <button type="button" id="my_edit_image_btn" style="display:none;">Edit Image</button>
</div>
```

**JavaScript Initialization:**

```js
document.addEventListener('DOMContentLoaded', function() {
    NLKImageWidget.initWidget({
        fileInputId: 'my_image_input',
        croppedInputId: 'my_image_cropped',
        previewImgId: 'my_image_preview_img',
        previewDivId: 'my_image_preview',
        editBtnId: 'my_edit_image_btn',
    });
});
```

### 4. Opening the Editor Manually (API)

If you have a custom UI flow, you can invoke the editor manually by passing a Base64 string payload:

```js
NLKImageEditor.open(currentBase64Image, function (editedBase64String) {
    // Callback executed when the user clicks 'Save' in the editor
    document.getElementById('my_image_cropped').value = editedBase64String;
    document.getElementById('my_image_preview_img').src = editedBase64String;
});
```

## 🧠 AI Endpoint Structure

If you wish to use the AI Background Remover and AI Upscaler UI buttons, your Laravel route (`window.processImageUrl`) should accept a `POST` request with the following JSON payload:

```json
{
    "action": "remove_bg",  // or "upscale"
    "image": "data:image/png;base64,....." // Original image base64
}
```

And it must return a JSON response containing the processed base64 image:

```json
{
    "success": true,
    "image": "data:image/png;base64,....."
}
```

## 🌐 Translations

Translations are located in `resources/lang/vendor/nlk/` after running `vendor:publish`. You can modify the translated strings for `en`, `ar`, and `tr` directly in your host application without altering the core package. 

## 🛡️ License

This package is open-source software built for NLKMenu frameworks.
