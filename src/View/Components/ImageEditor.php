<?php

namespace Nlk\ImageEditor\View\Components;

use Illuminate\View\Component;

class ImageEditor extends Component
{
    public function __construct()
    {
        //
    }

    public function render()
    {
        return view('nlk::components.image-editor-modal');
    }
}
