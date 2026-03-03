<?php

namespace Nlk\ImageEditor;

use Illuminate\Support\ServiceProvider;

class ImageEditorServiceProvider extends ServiceProvider
{
    public function boot()
    {
        // Load Views
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'nlk');

        // Load Translations
        $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'nlk');

        // Register View Components explicitly
        \Illuminate\Support\Facades\Blade::component('nlk::image-editor', \Nlk\ImageEditor\View\Components\ImageEditor::class);

        // Publish Assets and Views
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../public' => public_path('vendor/nlk/image-editor'),
            ], 'nlk-image-editor-assets');

            $this->publishes([
                __DIR__.'/../resources/views' => resource_path('views/vendor/nlk'),
            ], 'nlk-image-editor-views');

            $this->publishes([
                __DIR__.'/../resources/lang' => resource_path('lang/vendor/nlk'),
            ], 'nlk-image-editor-lang');
        }
    }

    public function register()
    {
        //
    }
}
