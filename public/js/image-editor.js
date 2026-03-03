/**
 * Professional Image Editor — NLKMenu Admin Panel
 * Built on Fabric.js for full canvas-based image editing
 * Features: Crop, Draw, Text, Shapes, Filters, Stickers, Undo/Redo, AI tools
 */
"use strict";

var NLKImageEditor = (function () {

    // ─── State ────────────────────────────────────────────────────────────────
    var canvas = null;
    var fabricCanvas = null;
    var originalImageDataUrl = null;
    var mainImageObject = null;
    var undoStack = [];
    var redoStack = [];
    var maxHistory = 30;
    var currentTool = 'select';
    var isDrawing = false;
    var drawingObject = null;
    var startX = 0, startY = 0;
    var onSaveCallback = null;
    var isOpen = false;
    var currentFillColor = '#ff0000';
    var currentStrokeColor = '#000000';
    var currentStrokeWidth = 3;
    var currentFontFamily = 'Arial';
    var currentFontSize = 28;
    var currentTextColor = '#ffffff';
    var cropRect = null;
    var isCropping = false;
    var filterValues = { brightness: 0, contrast: 0, saturation: 0, blur: 0, pixelate: 0 };
    var activeFilter = null;
    var lastAiResultBase64 = null;
    var imageBeforeAi = null;

    // ─── Emojis / Stickers ────────────────────────────────────────────────────
    var stickers = [
        '⭐', '🌟', '💥', '🔥', '❤️', '💙', '💚', '💛', '🧡', '💜',
        '😊', '😂', '🤩', '😍', '🥰', '😎', '🤔', '👍', '👎', '🎉',
        '🎂', '🍕', '🍔', '🌮', '🍜', '🍣', '🍦', '🥗', '🍰', '☕',
        '🌹', '🌺', '🌸', '🌻', '🌼', '🍀', '🌴', '🌵', '🎋', '🌊',
        '⚡', '🌈', '🎵', '🎶', '💎', '🏆', '🎯', '🚀', '✈️', '🎠',
        '💯', '✅', '❌', '⚠️', '🔴', '🟢', '🔵', '🟡', '🟠', '⚫'
    ];

    // ─── Font list ─────────────────────────────────────────────────────────────
    var fonts = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana',
        'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino', 'Tahoma'];

    // ─── Init ─────────────────────────────────────────────────────────────────
    function init() {
        var modalEl = document.getElementById('nlk_image_editor_modal');
        if (!modalEl) return;

        canvas = document.getElementById('nlk_editor_canvas');
        if (!canvas) return;

        buildFabricCanvas();
        bindToolbar();
        bindFilters();
        bindSaveCancel();
        buildStickerGrid();
        buildFontOptions();
        buildShapePanel();
        bindCanvasEvents();
        bindModalEvents();
        bindAiTools();
        bindBackground();
    }

    // ─── Create Fabric Canvas ────────────────────────────────────────────────
    function buildFabricCanvas() {
        var container = document.getElementById('nlk_editor_canvas_container');
        var w = container ? container.clientWidth || 800 : 800;
        var h = container ? container.clientHeight || 600 : 600;

        fabricCanvas = new fabric.Canvas('nlk_editor_canvas', {
            width: w,
            height: h,
            backgroundColor: null,
            preserveObjectStacking: true,
            selection: true,
        });

        // Center the canvas element in the container via CSS
        var canvasEl = document.getElementById('nlk_editor_canvas');
        if (canvasEl && canvasEl.parentElement) {
            canvasEl.parentElement.style.position = 'relative';
        }

        // Handle canvas resize
        window.addEventListener('resize', debounce(resizeCanvas, 200));
    }

    function resizeCanvas() {
        // On window resize, reload image to refit canvas to new container size
        if (originalImageDataUrl && isOpen) {
            loadImage(originalImageDataUrl);
        }
    }

    // ─── Open Editor ─────────────────────────────────────────────────────────
    function open(imageDataUrl, callback) {
        onSaveCallback = callback;
        originalImageDataUrl = imageDataUrl;

        var modalEl = document.getElementById('nlk_image_editor_modal');
        if (!modalEl) return;

        // ── Hide any currently open Bootstrap modal (e.g. Quick Edit) ──────────
        var parentModalEl = document.querySelector('.modal.show:not(#nlk_image_editor_modal):not(#nlk_ai_result_modal)');
        var parentBsModal = null;
        if (parentModalEl) {
            parentBsModal = bootstrap.Modal.getInstance(parentModalEl);
            if (parentBsModal) {
                parentBsModal.hide();
            }
        }

        var bsModal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
        modalEl._bsModal = bsModal;

        modalEl.addEventListener('shown.bs.modal', function onShown() {
            modalEl.removeEventListener('shown.bs.modal', onShown);
            // Delay so modal animation and layout fully complete before reading container dims
            setTimeout(function () {
                loadImage(imageDataUrl);
            }, 50);
        }, { once: true });

        // ── When the editor closes, restore the parent modal ─────────────────
        modalEl.addEventListener('hidden.bs.modal', function onHidden() {
            modalEl.removeEventListener('hidden.bs.modal', onHidden);
            if (parentBsModal && parentModalEl) {
                // Small delay so the editor's backdrop is fully removed first
                setTimeout(function () {
                    parentBsModal.show();
                }, 200);
            }
        }, { once: true });

        bsModal.show();
        isOpen = true;
    }

    // ─── Load image onto canvas ───────────────────────────────────────────────
    function loadImage(dataUrl) {
        var opts = dataUrl.indexOf('data:') === 0 ? {} : { crossOrigin: 'anonymous' };

        fabric.Image.fromURL(dataUrl, function (img) {
            if (!img || !img.width) {
                console.error('[NLK Image Editor] Failed to load image');
                return;
            }
            fabricCanvas.clear();
            filterValues = { brightness: 0, contrast: 0, saturation: 0, blur: 0, pixelate: 0 };
            resetFilterSliders();

            // ── Size canvas to exactly match the image ──────────────────────
            var container = document.getElementById('nlk_editor_canvas_container');
            var maxW = container ? (container.clientWidth || 800) : 800;
            var maxH = container ? (container.clientHeight || 600) : 600;

            var imgW = img.width || img.getElement().naturalWidth || 400;
            var imgH = img.height || img.getElement().naturalHeight || 400;

            // Scale down to fit container, never enlarge beyond natural size
            var scale = Math.min(maxW / imgW, maxH / imgH, 1);
            if (scale < 0.05) scale = 0.05;

            var canvasW = Math.round(imgW * scale);
            var canvasH = Math.round(imgH * scale);

            // Canvas = exactly the image dimensions
            fabricCanvas.setWidth(canvasW);
            fabricCanvas.setHeight(canvasH);

            // Image fills the canvas at (0,0)
            img.set({
                left: 0,
                top: 0,
                scaleX: scale,
                scaleY: scale,
                selectable: false,
                evented: false,
                data: { type: 'main' },
                originX: 'left',
                originY: 'top'
            });

            fabricCanvas.add(img);
            mainImageObject = img;
            fabricCanvas.sendToBack(img);
            fabricCanvas.renderAll();

            undoStack = [];
            redoStack = [];
            saveHistory();
        }, opts);
    }

    // ─── Tool Bindings ────────────────────────────────────────────────────────
    function bindToolbar() {
        // Select tool
        bindTool('nlk_tool_select', function () {
            setTool('select');
            fabricCanvas.isDrawingMode = false;
            fabricCanvas.selection = true;
        });

        // Crop tool
        bindTool('nlk_tool_crop', function () {
            setTool('crop');
            startCrop();
        });

        // Apply crop button
        var applyCropBtn = document.getElementById('nlk_apply_crop');
        if (applyCropBtn) {
            applyCropBtn.addEventListener('click', applyCrop);
        }

        // Cancel crop button
        var cancelCropBtn = document.getElementById('nlk_cancel_crop');
        if (cancelCropBtn) {
            cancelCropBtn.addEventListener('click', cancelCrop);
        }

        // Free Draw
        bindTool('nlk_tool_draw', function () {
            setTool('draw');
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.color = currentStrokeColor;
            fabricCanvas.freeDrawingBrush.width = currentStrokeWidth;
            fabricCanvas.selection = false;
        });

        // Eraser
        bindTool('nlk_tool_eraser', function () {
            setTool('eraser');
            fabricCanvas.isDrawingMode = true;
            fabricCanvas.freeDrawingBrush.color = '#1e1e2e';
            fabricCanvas.freeDrawingBrush.width = currentStrokeWidth * 4;
            fabricCanvas.selection = false;
        });

        // Text tool
        bindTool('nlk_tool_text', function () {
            setTool('text');
            fabricCanvas.isDrawingMode = false;
            fabricCanvas.selection = true;
            addText();
        });

        // Shape tools
        ['rect', 'circle', 'line', 'arrow', 'triangle'].forEach(function (shape) {
            var btn = document.getElementById('nlk_tool_' + shape);
            if (btn) {
                btn.addEventListener('click', function () {
                    setTool(shape);
                    fabricCanvas.isDrawingMode = false;
                    fabricCanvas.selection = false;
                });
            }
        });

        // Delete selected
        var deleteBtn = document.getElementById('nlk_tool_delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', deleteSelected);
        }

        // Undo / Redo
        var undoBtn = document.getElementById('nlk_tool_undo');
        if (undoBtn) undoBtn.addEventListener('click', undo);
        var redoBtn = document.getElementById('nlk_tool_redo');
        if (redoBtn) redoBtn.addEventListener('click', redo);

        // Flip H / V
        var flipHBtn = document.getElementById('nlk_tool_flip_h');
        if (flipHBtn) flipHBtn.addEventListener('click', function () { flipMainImage('h'); });
        var flipVBtn = document.getElementById('nlk_tool_flip_v');
        if (flipVBtn) flipVBtn.addEventListener('click', function () { flipMainImage('v'); });

        // Rotate
        var rotateLBtn = document.getElementById('nlk_tool_rotate_l');
        if (rotateLBtn) rotateLBtn.addEventListener('click', function () { rotateMainImage(-90); });
        var rotateRBtn = document.getElementById('nlk_tool_rotate_r');
        if (rotateRBtn) rotateRBtn.addEventListener('click', function () { rotateMainImage(90); });

        // Draw color
        var strokeColorEl = document.getElementById('nlk_stroke_color');
        if (strokeColorEl) {
            strokeColorEl.addEventListener('input', function () {
                currentStrokeColor = this.value;
                if (fabricCanvas.isDrawingMode) {
                    fabricCanvas.freeDrawingBrush.color = currentStrokeColor;
                }
                updateSelectedObjectStyle();
            });
        }

        // Fill color
        var fillColorEl = document.getElementById('nlk_fill_color');
        if (fillColorEl) {
            fillColorEl.addEventListener('input', function () {
                currentFillColor = this.value;
                updateSelectedObjectStyle();
            });
        }

        // Brush size
        var brushSizeEl = document.getElementById('nlk_brush_size');
        if (brushSizeEl) {
            brushSizeEl.addEventListener('input', function () {
                currentStrokeWidth = parseInt(this.value) || 3;
                if (fabricCanvas.isDrawingMode) {
                    fabricCanvas.freeDrawingBrush.width = currentStrokeWidth;
                }
                updateSelectedObjectStyle();
                var label = document.getElementById('nlk_brush_size_label');
                if (label) label.textContent = this.value;
            });
        }

        // Font family
        var fontFamilyEl = document.getElementById('nlk_font_family');
        if (fontFamilyEl) {
            fontFamilyEl.addEventListener('change', function () {
                currentFontFamily = this.value;
                var obj = fabricCanvas.getActiveObject();
                if (obj && obj.type === 'i-text') {
                    obj.set('fontFamily', currentFontFamily);
                    fabricCanvas.renderAll();
                }
            });
        }

        // Font size
        var fontSizeEl = document.getElementById('nlk_font_size');
        if (fontSizeEl) {
            fontSizeEl.addEventListener('input', function () {
                currentFontSize = parseInt(this.value) || 28;
                var obj = fabricCanvas.getActiveObject();
                if (obj && obj.type === 'i-text') {
                    obj.set('fontSize', currentFontSize);
                    fabricCanvas.renderAll();
                }
                var label = document.getElementById('nlk_font_size_label');
                if (label) label.textContent = this.value;
            });
        }

        // Text color
        var textColorEl = document.getElementById('nlk_text_color');
        if (textColorEl) {
            textColorEl.addEventListener('input', function () {
                currentTextColor = this.value;
                var obj = fabricCanvas.getActiveObject();
                if (obj && obj.type === 'i-text') {
                    obj.set('fill', currentTextColor);
                    fabricCanvas.renderAll();
                }
            });
        }

        // Text bold, italic, underline
        ['bold', 'italic', 'underline'].forEach(function (prop) {
            var btn = document.getElementById('nlk_text_' + prop);
            if (btn) {
                btn.addEventListener('click', function () {
                    var obj = fabricCanvas.getActiveObject();
                    if (!obj || obj.type !== 'i-text') return;
                    if (prop === 'bold') {
                        obj.set('fontWeight', obj.fontWeight === 'bold' ? 'normal' : 'bold');
                    } else if (prop === 'italic') {
                        obj.set('fontStyle', obj.fontStyle === 'italic' ? 'normal' : 'italic');
                    } else if (prop === 'underline') {
                        obj.set('underline', !obj.underline);
                    }
                    this.classList.toggle('active');
                    fabricCanvas.renderAll();
                });
            }
        });

        // Add overlay image
        var addImageBtn = document.getElementById('nlk_add_image_btn');
        var addImageInput = document.getElementById('nlk_add_image_input');
        if (addImageBtn && addImageInput) {
            addImageBtn.addEventListener('click', function () { addImageInput.click(); });
            addImageInput.addEventListener('change', function () {
                if (!this.files || !this.files[0]) return;
                var reader = new FileReader();
                reader.onload = function (e) { addOverlayImage(e.target.result); };
                reader.readAsDataURL(this.files[0]);
                this.value = '';
            });
        }

        // Reset / Clear all annotations
        var resetBtn = document.getElementById('nlk_tool_reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                Swal.fire({
                    text: (window.nlkEditorTranslations && window.nlkEditorTranslations.resetConfirm)
                        || 'Reset all edits?',
                    icon: 'warning',
                    showCancelButton: true,
                    buttonsStyling: false,
                    confirmButtonText: (window.translations && window.translations.okGotIt) || 'Yes, reset',
                    cancelButtonText: (window.translations && window.translations.cancel) || 'Cancel',
                    customClass: {
                        confirmButton: 'btn btn-warning me-2',
                        cancelButton: 'btn btn-light'
                    }
                }).then(function (result) {
                    if (result.isConfirmed) {
                        loadImage(originalImageDataUrl);
                    }
                });
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function (e) {
            if (!isOpen) return;
            if (e.key === 'Delete' || e.key === 'Backspace') {
                var active = fabricCanvas.getActiveObject();
                if (active && active !== mainImageObject && !active.isEditing) {
                    deleteSelected();
                }
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
        });
    }

    // ─── Tool state helper ────────────────────────────────────────────────────
    function setTool(tool) {
        currentTool = tool;
        document.querySelectorAll('[id^="nlk_tool_"]').forEach(function (btn) {
            btn.classList.remove('active');
        });
        var el = document.getElementById('nlk_tool_' + tool);
        if (el) el.classList.add('active');

        // Show/hide crop controls
        var cropControls = document.getElementById('nlk_crop_controls');
        if (cropControls) cropControls.style.display = tool === 'crop' ? 'flex' : 'none';

        // Cancel crop if switching away
        if (tool !== 'crop' && cropRect) cancelCrop();

        // ── Toggle main image interactivity ───────────────────────────────
        // In SELECT mode: main image can be moved, scaled, rotated
        // In all other modes: main image is locked (not selectable)
        if (mainImageObject) {
            var isSelect = (tool === 'select');
            mainImageObject.selectable = isSelect;
            mainImageObject.evented = isSelect;
            // Show transform controls clearly
            mainImageObject.hasBorders = isSelect;
            mainImageObject.hasControls = isSelect;
            if (!isSelect) {
                fabricCanvas.discardActiveObject();
            }
            fabricCanvas.renderAll();
        }
    }

    function bindTool(id, fn) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    }

    // ─── Canvas drawing events ────────────────────────────────────────────────
    function bindCanvasEvents() {
        fabricCanvas.on('mouse:down', function (opt) {
            if (fabricCanvas.isDrawingMode) return;
            var pointer = fabricCanvas.getPointer(opt.e);
            startX = pointer.x;
            startY = pointer.y;

            if (['rect', 'circle', 'line', 'arrow', 'triangle'].indexOf(currentTool) === -1) return;

            isDrawing = true;
            fabricCanvas.selection = false;

            if (currentTool === 'rect') {
                drawingObject = new fabric.Rect({
                    left: startX, top: startY, width: 0, height: 0,
                    fill: 'transparent',
                    stroke: currentStrokeColor,
                    strokeWidth: currentStrokeWidth,
                    selectable: true, evented: true
                });
            } else if (currentTool === 'circle') {
                drawingObject = new fabric.Ellipse({
                    left: startX, top: startY, rx: 0, ry: 0,
                    fill: 'transparent',
                    stroke: currentStrokeColor,
                    strokeWidth: currentStrokeWidth,
                    selectable: true, evented: true
                });
            } else if (currentTool === 'triangle') {
                drawingObject = new fabric.Triangle({
                    left: startX, top: startY, width: 0, height: 0,
                    fill: 'transparent',
                    stroke: currentStrokeColor,
                    strokeWidth: currentStrokeWidth,
                    selectable: true, evented: true
                });
            } else if (currentTool === 'line' || currentTool === 'arrow') {
                drawingObject = new fabric.Line([startX, startY, startX, startY], {
                    stroke: currentStrokeColor,
                    strokeWidth: currentStrokeWidth,
                    selectable: true, evented: true
                });
            }

            if (drawingObject) {
                fabricCanvas.add(drawingObject);
            }
        });

        fabricCanvas.on('mouse:move', function (opt) {
            if (!isDrawing || !drawingObject) return;
            var pointer = fabricCanvas.getPointer(opt.e);
            var dx = pointer.x - startX;
            var dy = pointer.y - startY;

            if (currentTool === 'rect') {
                drawingObject.set({
                    left: dx < 0 ? pointer.x : startX,
                    top: dy < 0 ? pointer.y : startY,
                    width: Math.abs(dx),
                    height: Math.abs(dy)
                });
            } else if (currentTool === 'circle') {
                drawingObject.set({
                    left: dx < 0 ? pointer.x : startX,
                    top: dy < 0 ? pointer.y : startY,
                    rx: Math.abs(dx) / 2,
                    ry: Math.abs(dy) / 2
                });
            } else if (currentTool === 'triangle') {
                drawingObject.set({
                    left: dx < 0 ? pointer.x : startX,
                    top: dy < 0 ? pointer.y : startY,
                    width: Math.abs(dx),
                    height: Math.abs(dy)
                });
            } else if (currentTool === 'line' || currentTool === 'arrow') {
                drawingObject.set({ x2: pointer.x, y2: pointer.y });
            }

            fabricCanvas.renderAll();
        });

        fabricCanvas.on('mouse:up', function () {
            if (isDrawing && drawingObject) {
                isDrawing = false;
                drawingObject.setCoords();
                drawingObject = null;
                saveHistory();
            }
        });

        // Save history on object modification (including main image transforms)
        fabricCanvas.on('object:modified', function (e) {
            saveHistory();
            // Re-lock main image if it was moved (in case user resized it)
            // We keep it selected (don't auto-lock), just save the state
        });
        fabricCanvas.on('object:added', function (e) {
            if (e.target !== mainImageObject) saveHistory();
        });
    }

    // ─── Text adding ──────────────────────────────────────────────────────────
    function addText() {
        var text = new fabric.IText('اكتب هنا', {
            left: fabricCanvas.getWidth() / 2 - 80,
            top: fabricCanvas.getHeight() / 2 - 20,
            fontFamily: currentFontFamily,
            fontSize: currentFontSize,
            fill: currentTextColor,
            stroke: null,
            shadow: 'rgba(0,0,0,0.5) 2px 2px 5px',
            selectable: true, evented: true,
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        text.enterEditing();
        fabricCanvas.renderAll();
        setTool('select');
        fabricCanvas.selection = true;
    }

    // ─── Update selected object style ─────────────────────────────────────────
    function updateSelectedObjectStyle() {
        var obj = fabricCanvas.getActiveObject();
        if (!obj) return;
        if (obj.type === 'i-text') {
            obj.set('fill', currentTextColor);
        } else {
            obj.set({ stroke: currentStrokeColor, strokeWidth: currentStrokeWidth });
        }
        fabricCanvas.renderAll();
    }

    // ─── Sticker panel ────────────────────────────────────────────────────────
    function buildStickerGrid() {
        var grid = document.getElementById('nlk_sticker_grid');
        if (!grid) return;
        stickers.forEach(function (emoji) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'nlk-sticker-btn';
            btn.textContent = emoji;
            btn.title = emoji;
            btn.addEventListener('click', function () {
                addSticker(emoji);
            });
            grid.appendChild(btn);
        });
    }

    function addSticker(emoji) {
        var text = new fabric.Text(emoji, {
            left: fabricCanvas.getWidth() / 2 - 25,
            top: fabricCanvas.getHeight() / 2 - 25,
            fontSize: 50,
            selectable: true, evented: true,
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        fabricCanvas.renderAll();
        saveHistory();
    }

    // ─── Font dropdown ────────────────────────────────────────────────────────
    function buildFontOptions() {
        var sel = document.getElementById('nlk_font_family');
        if (!sel) return;
        fonts.forEach(function (f) {
            var opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            opt.style.fontFamily = f;
            sel.appendChild(opt);
        });
    }

    // ─── Shape panel (just an alias for tool buttons set) ─────────────────────
    function buildShapePanel() {
        // already built in HTML
    }

    // ─── Overlay image ────────────────────────────────────────────────────────
    function addOverlayImage(dataUrl) {
        fabric.Image.fromURL(dataUrl, function (img) {
            var cw = fabricCanvas.getWidth();
            var ch = fabricCanvas.getHeight();
            var scale = Math.min(200 / img.width, 200 / img.height);
            img.set({
                left: cw / 2 - (img.width * scale) / 2,
                top: ch / 2 - (img.height * scale) / 2,
                scaleX: scale, scaleY: scale,
                selectable: true, evented: true,
            });
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
            saveHistory();
        }, { crossOrigin: 'anonymous' });
    }

    // ─── Crop ─────────────────────────────────────────────────────────────────
    function startCrop() {
        if (cropRect) cancelCrop();
        var cw = fabricCanvas.getWidth();
        var ch = fabricCanvas.getHeight();
        var pw = cw * 0.6;
        var ph = ch * 0.6;
        cropRect = new fabric.Rect({
            left: cw * 0.2, top: ch * 0.2,
            width: pw, height: ph,
            fill: 'rgba(255,255,255,0.15)',
            stroke: '#00d4ff',
            strokeWidth: 2,
            strokeDashArray: [6, 4],
            selectable: true, evented: true,
            data: { type: 'cropRect' },
            cornerColor: '#00d4ff',
            cornerSize: 10,
        });
        fabricCanvas.add(cropRect);
        fabricCanvas.setActiveObject(cropRect);
        fabricCanvas.renderAll();
        isCropping = true;
    }

    function applyCrop() {
        if (!cropRect || !mainImageObject) { cancelCrop(); return; }

        var bounds = cropRect.getBoundingRect();
        fabricCanvas.remove(cropRect);
        cropRect = null;
        isCropping = false;

        // Render to a temp canvas using the crop rect
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = bounds.width;
        tempCanvas.height = bounds.height;
        var ctx = tempCanvas.getContext('2d');

        // Draw the fabric canvas onto temp, translated
        ctx.drawImage(fabricCanvas.lowerCanvasEl, -bounds.left, -bounds.top);

        var croppedDataUrl = tempCanvas.toDataURL('image/png');
        loadImage(croppedDataUrl);
        originalImageDataUrl = croppedDataUrl;
    }

    function cancelCrop() {
        if (cropRect) {
            fabricCanvas.remove(cropRect);
            cropRect = null;
        }
        isCropping = false;
        setTool('select');
    }

    // ─── Flip & Rotate ────────────────────────────────────────────────────────
    function flipMainImage(axis) {
        if (!mainImageObject) return;
        if (axis === 'h') {
            mainImageObject.set('flipX', !mainImageObject.flipX);
        } else {
            mainImageObject.set('flipY', !mainImageObject.flipY);
        }
        fabricCanvas.renderAll();
        saveHistory();
    }

    function rotateMainImage(deg) {
        if (!mainImageObject) return;
        mainImageObject.rotate((mainImageObject.angle || 0) + deg);
        fabricCanvas.renderAll();
        saveHistory();
    }

    // ─── Delete selected ──────────────────────────────────────────────────────
    function deleteSelected() {
        var obj = fabricCanvas.getActiveObject();
        if (!obj) return;
        if (obj === mainImageObject) return; // don't delete main image
        if (obj.data && obj.data.type === 'cropRect') return;

        if (obj.type === 'activeSelection') {
            obj.getObjects().forEach(function (o) {
                if (o !== mainImageObject) fabricCanvas.remove(o);
            });
            fabricCanvas.discardActiveObject();
        } else {
            fabricCanvas.remove(obj);
        }
        fabricCanvas.renderAll();
        saveHistory();
    }

    // ─── Filters ─────────────────────────────────────────────────────────────
    function bindFilters() {
        // Preset filters
        document.querySelectorAll('[data-filter]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                applyPresetFilter(this.getAttribute('data-filter'));
                document.querySelectorAll('[data-filter]').forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');
            });
        });

        // Brightness slider
        bindSlider('nlk_filter_brightness', 'nlk_filter_brightness_val', function (val) {
            filterValues.brightness = val / 100;
            applyAdjustmentFilters();
        });

        // Contrast slider
        bindSlider('nlk_filter_contrast', 'nlk_filter_contrast_val', function (val) {
            filterValues.contrast = val / 100;
            applyAdjustmentFilters();
        });

        // Saturation slider
        bindSlider('nlk_filter_saturation', 'nlk_filter_saturation_val', function (val) {
            filterValues.saturation = val / 100;
            applyAdjustmentFilters();
        });

        // Blur slider
        bindSlider('nlk_filter_blur', 'nlk_filter_blur_val', function (val) {
            filterValues.blur = val / 20;
            applyAdjustmentFilters();
        });
    }

    function bindSlider(sliderId, labelId, fn) {
        var slider = document.getElementById(sliderId);
        var label = document.getElementById(labelId);
        if (!slider) return;
        slider.addEventListener('input', function () {
            var val = parseFloat(this.value);
            if (label) label.textContent = this.value;
            fn(val);
        });
    }

    function resetFilterSliders() {
        var sliders = ['brightness', 'contrast', 'saturation', 'blur'];
        sliders.forEach(function (name) {
            var slider = document.getElementById('nlk_filter_' + name);
            if (slider) slider.value = 0;
            var label = document.getElementById('nlk_filter_' + name + '_val');
            if (label) label.textContent = '0';
        });
        filterValues = { brightness: 0, contrast: 0, saturation: 0, blur: 0 };

        document.querySelectorAll('[data-filter]').forEach(function (b) {
            b.classList.remove('active');
        });
        var normalBtn = document.querySelector('[data-filter="normal"]');
        if (normalBtn) normalBtn.classList.add('active');
    }

    function applyPresetFilter(filterName) {
        if (!mainImageObject) return;
        mainImageObject.filters = [];
        activeFilter = filterName;

        switch (filterName) {
            case 'grayscale':
                mainImageObject.filters.push(new fabric.Image.filters.Grayscale());
                break;
            case 'sepia':
                mainImageObject.filters.push(new fabric.Image.filters.Sepia());
                break;
            case 'invert':
                mainImageObject.filters.push(new fabric.Image.filters.Invert());
                break;
            case 'vintage':
                mainImageObject.filters.push(new fabric.Image.filters.Sepia());
                mainImageObject.filters.push(new fabric.Image.filters.Noise({ noise: 40 }));
                mainImageObject.filters.push(new fabric.Image.filters.Brightness({ brightness: -0.1 }));
                break;
            case 'warm':
                mainImageObject.filters.push(new fabric.Image.filters.ColorMatrix({
                    matrix: [1.2, 0, 0, 0, 10, 0, 1.1, 0, 0, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 1, 0]
                }));
                break;
            case 'cool':
                mainImageObject.filters.push(new fabric.Image.filters.ColorMatrix({
                    matrix: [0.9, 0, 0, 0, 0, 0, 1.0, 0, 0, 5, 0, 0, 1.2, 0, 10, 0, 0, 0, 1, 0]
                }));
                break;
            case 'blackwhite':
                mainImageObject.filters.push(new fabric.Image.filters.ColorMatrix({
                    matrix: [0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0, 0, 0, 1, 0]
                }));
                mainImageObject.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.3 }));
                break;
            case 'normal':
            default:
                break;
        }

        // Re-apply adjustment filters on top
        applyAdjustmentFilters(true);
    }

    function applyAdjustmentFilters(fromPreset) {
        if (!mainImageObject) return;

        // Remove old adjustment filters
        mainImageObject.filters = mainImageObject.filters.filter(function (f) {
            return !(f instanceof fabric.Image.filters.Brightness) &&
                !(f instanceof fabric.Image.filters.Contrast) &&
                !(f instanceof fabric.Image.filters.Saturation) &&
                !(f instanceof fabric.Image.filters.Blur);
        });

        if (filterValues.brightness !== 0) {
            mainImageObject.filters.push(new fabric.Image.filters.Brightness({ brightness: filterValues.brightness }));
        }
        if (filterValues.contrast !== 0) {
            mainImageObject.filters.push(new fabric.Image.filters.Contrast({ contrast: filterValues.contrast }));
        }
        if (filterValues.saturation !== 0) {
            mainImageObject.filters.push(new fabric.Image.filters.Saturation({ saturation: filterValues.saturation }));
        }
        if (filterValues.blur > 0) {
            mainImageObject.filters.push(new fabric.Image.filters.Blur({ blur: filterValues.blur }));
        }

        mainImageObject.applyFilters();
        fabricCanvas.renderAll();
        if (!fromPreset) saveHistory();
    }

    // ─── Undo / Redo ─────────────────────────────────────────────────────────
    function saveHistory() {
        var state = JSON.stringify(fabricCanvas.toJSON(['data']));
        undoStack.push(state);
        if (undoStack.length > maxHistory) undoStack.shift();
        redoStack = [];
        updateUndoRedoButtons();
    }

    function undo() {
        if (undoStack.length <= 1) return;
        var current = undoStack.pop();
        redoStack.push(current);
        var prev = undoStack[undoStack.length - 1];
        restoreState(prev);
    }

    function redo() {
        if (redoStack.length === 0) return;
        var next = redoStack.pop();
        undoStack.push(next);
        restoreState(next);
    }

    function restoreState(state) {
        fabricCanvas.loadFromJSON(state, function () {
            fabricCanvas.renderAll();
            // Re-identify main image
            mainImageObject = null;
            fabricCanvas.getObjects().forEach(function (obj) {
                if (obj.data && obj.data.type === 'main') {
                    mainImageObject = obj;
                    obj.selectable = false;
                    obj.evented = false;
                }
            });
            updateUndoRedoButtons();
        });
    }

    function updateUndoRedoButtons() {
        var undoBtn = document.getElementById('nlk_tool_undo');
        var redoBtn = document.getElementById('nlk_tool_redo');
        if (undoBtn) undoBtn.disabled = undoStack.length <= 1;
        if (redoBtn) redoBtn.disabled = redoStack.length === 0;
    }

    // ─── AI Tools (Remove Background + Upscale) ──────────────────────────────
    function bindAiTools() {
        var removeBgBtn = document.getElementById('nlk_ai_remove_bg');
        var upscaleBtn = document.getElementById('nlk_ai_upscale');
        var acceptBtn = document.getElementById('nlk_ai_result_accept');
        var revertBtn = document.getElementById('nlk_ai_result_revert');

        if (removeBgBtn) {
            removeBgBtn.addEventListener('click', function () {
                runAiAction('remove_bg');
            });
        }
        if (upscaleBtn) {
            upscaleBtn.addEventListener('click', function () {
                runAiAction('upscale');
            });
        }
        if (acceptBtn) {
            acceptBtn.addEventListener('click', function () {
                if (lastAiResultBase64) {
                    loadImage(lastAiResultBase64);
                    originalImageDataUrl = lastAiResultBase64;
                }
                closeAiResultModal();
            });
        }
        if (revertBtn) {
            revertBtn.addEventListener('click', function () {
                lastAiResultBase64 = null;
                closeAiResultModal();
            });
        }
    }

    function runAiAction(action) {
        var processUrl = window.processImageUrl || null;
        if (!processUrl) {
            Swal.fire({
                text: (window.nlkEditorTranslations && window.nlkEditorTranslations.aiProcessUrlMissing) || 'processImageUrl not defined.',
                icon: 'warning',
                buttonsStyling: false,
                confirmButtonText: (window.translations && window.translations.okGotIt) || 'Ok',
                customClass: { confirmButton: 'btn btn-primary' }
            });
            return;
        }

        // Export current canvas as base64 for AI processing
        var currentBase64 = fabricCanvas.toDataURL({ format: 'png', quality: 1.0 });
        if (!currentBase64) { return; }

        // Show loading overlay
        var overlayMsg = action === 'remove_bg'
            ? ((window.nlkEditorTranslations && window.nlkEditorTranslations.removingBackground) || 'Removing background...')
            : ((window.nlkEditorTranslations && window.nlkEditorTranslations.upscalingImage) || 'Upscaling image...');
        showAiOverlay(overlayMsg);

        // Update button state
        var btn = document.getElementById(action === 'remove_bg' ? 'nlk_ai_remove_bg' : 'nlk_ai_upscale');
        if (btn) {
            btn.querySelectorAll('.nlk-ai-spinner').forEach(function (s) { s.classList.remove('d-none'); });
            btn.querySelectorAll('.nlk-ai-icon').forEach(function (i) { i.classList.add('d-none'); });
            btn.disabled = true;
        }

        var csrfToken = document.querySelector('meta[name="csrf-token"]');
        var tokenValue = csrfToken ? csrfToken.getAttribute('content') : '';

        fetch(processUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': tokenValue,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                image_base64: currentBase64,
                action: action
            })
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Server error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                hideAiOverlay();
                resetAiButton(action);

                var resultBase64 = data.image || data.result || data.url || null;
                if (!resultBase64) throw new Error('No image in response');

                // Ensure data URI format
                if (!resultBase64.startsWith('data:')) {
                    resultBase64 = 'data:image/png;base64,' + resultBase64;
                }

                lastAiResultBase64 = resultBase64;
                showAiResultModal(resultBase64);
            })
            .catch(function (err) {
                hideAiOverlay();
                resetAiButton(action);
                console.error('[NLK Image Editor] AI error:', err);
                Swal.fire({
                    text: (window.nlkEditorTranslations && window.nlkEditorTranslations.aiError) || 'AI processing failed. Please try again.',
                    icon: 'error',
                    buttonsStyling: false,
                    confirmButtonText: (window.translations && window.translations.okGotIt) || 'Ok',
                    customClass: { confirmButton: 'btn btn-primary' }
                });
            });
    }

    function showAiOverlay(text) {
        var overlay = document.getElementById('nlk_ai_overlay');
        var overlayText = document.getElementById('nlk_ai_overlay_text');
        if (!overlay) return;
        if (overlayText) overlayText.textContent = text;
        overlay.classList.add('show');
        overlay.style.display = 'flex';
    }

    function hideAiOverlay() {
        var overlay = document.getElementById('nlk_ai_overlay');
        if (!overlay) return;
        overlay.classList.remove('show');
        overlay.style.display = 'none';
    }

    function resetAiButton(action) {
        var btn = document.getElementById(action === 'remove_bg' ? 'nlk_ai_remove_bg' : 'nlk_ai_upscale');
        if (!btn) return;
        btn.querySelectorAll('.nlk-ai-spinner').forEach(function (s) { s.classList.add('d-none'); });
        btn.querySelectorAll('.nlk-ai-icon').forEach(function (i) { i.classList.remove('d-none'); });
        btn.disabled = false;
    }

    function showAiResultModal(base64) {
        var img = document.getElementById('nlk_ai_result_img');
        if (img) img.src = base64;
        var modalEl = document.getElementById('nlk_ai_result_modal');
        if (modalEl) {
            var m = bootstrap.Modal.getOrCreateInstance(modalEl);
            m.show();
        }
    }

    function closeAiResultModal() {
        var modalEl = document.getElementById('nlk_ai_result_modal');
        if (modalEl) {
            var m = bootstrap.Modal.getInstance(modalEl);
            if (m) m.hide();
        }
    }

    // ─── Save & Cancel ─────────────────────────────────────────────────────────
    function bindSaveCancel() {
        var saveBtn = document.getElementById('nlk_editor_save');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                // Export full canvas to PNG
                // Temporarily set transparent background
                var oldBg = fabricCanvas.backgroundColor;
                var exportDataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1.0, multiplier: 1 });
                fabricCanvas.backgroundColor = oldBg;

                if (typeof onSaveCallback === 'function') {
                    onSaveCallback(exportDataUrl);
                }
                closeEditor();
            });
        }

        var cancelBtn = document.getElementById('nlk_editor_cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function () {
                closeEditor();
            });
        }
    }

    function closeEditor() {
        var modalEl = document.getElementById('nlk_image_editor_modal');
        if (modalEl && modalEl._bsModal) {
            modalEl._bsModal.hide();
        }
        isOpen = false;
        if (cropRect) {
            fabricCanvas.remove(cropRect);
            cropRect = null;
        }
        isCropping = false;
        currentTool = 'select';
    }

    function bindModalEvents() {
        var modalEl = document.getElementById('nlk_image_editor_modal');
        if (!modalEl) return;
        modalEl.addEventListener('hidden.bs.modal', function () {
            isOpen = false;
        });
    }

    // ─── Background Feature ──────────────────────────────────────────────────
    var currentBgImageDataUrl = null;

    function bindBackground() {
        var bgToolBtn = document.getElementById('nlk_tool_bg');
        var bgPanel = document.getElementById('nlk_bg_panel');
        if (!bgToolBtn || !bgPanel) return;

        // Toggle panel via toolbar button
        bgToolBtn.addEventListener('click', function () {
            var visible = bgPanel.style.display !== 'none';
            bgPanel.style.display = visible ? 'none' : 'block';
            bgToolBtn.classList.toggle('active', !visible);
        });

        // Tab switching
        var tabs = bgPanel.querySelectorAll('.nlk-bg-tab');
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                tabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');
                bgPanel.querySelectorAll('.nlk-bg-section').forEach(function (s) { s.style.display = 'none'; });
                var section = document.getElementById('nlk_bg_section_' + tab.getAttribute('data-bg-type'));
                if (section) section.style.display = 'block';
            });
        });

        // Transparent
        var applyNone = document.getElementById('nlk_bg_apply_none');
        if (applyNone) applyNone.addEventListener('click', function () { applyCanvasBackground(null); });

        // Color swatches + custom
        var swatches = bgPanel.querySelectorAll('.nlk-color-swatch');
        var customColor = document.getElementById('nlk_bg_custom_color');
        swatches.forEach(function (sw) {
            sw.addEventListener('click', function () {
                swatches.forEach(function (s) { s.style.borderColor = 'transparent'; });
                sw.style.borderColor = 'var(--kt-primary, #009ef7)';
                if (customColor) customColor.value = sw.getAttribute('data-color');
            });
        });
        var applyColor = document.getElementById('nlk_bg_apply_color');
        if (applyColor) {
            applyColor.addEventListener('click', function () {
                applyCanvasBackground({ type: 'color', color: customColor ? customColor.value : '#ffffff' });
            });
        }

        // Gradient presets + custom
        var gradSwatches = bgPanel.querySelectorAll('.nlk-gradient-swatch');
        var gradC1 = document.getElementById('nlk_bg_grad_c1');
        var gradC2 = document.getElementById('nlk_bg_grad_c2');
        gradSwatches.forEach(function (sw) {
            sw.addEventListener('click', function () {
                gradSwatches.forEach(function (s) { s.style.borderColor = 'transparent'; });
                sw.style.borderColor = 'var(--kt-primary, #009ef7)';
                if (gradC1) gradC1.value = sw.getAttribute('data-c1');
                if (gradC2) gradC2.value = sw.getAttribute('data-c2');
            });
        });
        var applyGradient = document.getElementById('nlk_bg_apply_gradient');
        if (applyGradient) {
            applyGradient.addEventListener('click', function () {
                var dir = document.getElementById('nlk_bg_grad_dir');
                applyCanvasBackground({
                    type: 'gradient',
                    c1: gradC1 ? gradC1.value : '#6366f1',
                    c2: gradC2 ? gradC2.value : '#ec4899',
                    dir: dir ? dir.value : '135deg'
                });
            });
        }

        // Background image upload
        var bgImgInput = document.getElementById('nlk_bg_image_input');
        var bgImgApply = document.getElementById('nlk_bg_apply_image');
        var bgImgThumb = document.getElementById('nlk_bg_image_thumb');
        var bgImgPreview = document.getElementById('nlk_bg_image_preview');
        var bgImgSize = document.getElementById('nlk_bg_image_size');
        if (bgImgInput) {
            bgImgInput.addEventListener('change', function () {
                var file = bgImgInput.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function (e) {
                    currentBgImageDataUrl = e.target.result;
                    if (bgImgThumb) bgImgThumb.src = currentBgImageDataUrl;
                    if (bgImgPreview) bgImgPreview.style.display = 'block';
                    if (bgImgApply) bgImgApply.disabled = false;
                };
                reader.readAsDataURL(file);
            });
        }
        if (bgImgApply) {
            bgImgApply.addEventListener('click', function () {
                if (!currentBgImageDataUrl) return;
                var size = bgImgSize ? bgImgSize.value : 'cover';
                applyCanvasBackground({ type: 'image', dataUrl: currentBgImageDataUrl, size: size });
            });
        }
    }

    function applyCanvasBackground(options) {
        if (!fabricCanvas) return;

        // Remove old background layer
        fabricCanvas.getObjects().filter(function (o) { return o._nlkBgLayer; })
            .forEach(function (o) { fabricCanvas.remove(o); });

        var cw = fabricCanvas.getWidth();
        var ch = fabricCanvas.getHeight();

        if (!options) {
            fabricCanvas.backgroundColor = '';
            fabricCanvas.renderAll();
            saveHistory();
            return;
        }

        if (options.type === 'color') {
            var rect = new fabric.Rect({
                left: 0, top: 0, width: cw, height: ch,
                fill: options.color, selectable: false, evented: false
            });
            rect._nlkBgLayer = true;
            fabricCanvas.insertAt(rect, 0);
            fabricCanvas.backgroundColor = '';
            fabricCanvas.renderAll();
            saveHistory();
            return;
        }

        if (options.type === 'gradient') {
            var dirMap = {
                'to right': { x1: 0, y1: 0.5, x2: 1, y2: 0.5 },
                'to bottom': { x1: 0.5, y1: 0, x2: 0.5, y2: 1 },
                '135deg': { x1: 0, y1: 0, x2: 1, y2: 1 },
                'to top right': { x1: 0, y1: 1, x2: 1, y2: 0 },
                'to bottom left': { x1: 1, y1: 0, x2: 0, y2: 1 }
            };
            var coords = dirMap[options.dir] || dirMap['135deg'];
            var grad = new fabric.Gradient({
                type: 'linear',
                gradientUnits: 'percentage',
                coords: coords,
                colorStops: [
                    { offset: 0, color: options.c1 },
                    { offset: 1, color: options.c2 }
                ]
            });
            var gradRect = new fabric.Rect({
                left: 0, top: 0, width: cw, height: ch,
                fill: grad, selectable: false, evented: false
            });
            gradRect._nlkBgLayer = true;
            fabricCanvas.insertAt(gradRect, 0);
            fabricCanvas.backgroundColor = '';
            fabricCanvas.renderAll();
            saveHistory();
            return;
        }

        if (options.type === 'image') {
            fabric.Image.fromURL(options.dataUrl, function (img) {
                var size = options.size || 'cover';
                var scaleX, scaleY;
                if (size === 'cover') {
                    var sc = Math.max(cw / img.width, ch / img.height);
                    scaleX = scaleY = sc;
                } else if (size === 'contain') {
                    var sc = Math.min(cw / img.width, ch / img.height);
                    scaleX = scaleY = sc;
                } else {
                    scaleX = cw / img.width;
                    scaleY = ch / img.height;
                }
                img.set({
                    left: (cw - img.width * scaleX) / 2,
                    top: (ch - img.height * scaleY) / 2,
                    scaleX: scaleX, scaleY: scaleY,
                    selectable: false, evented: false
                });
                img._nlkBgLayer = true;

                // Remove again (async safety)
                fabricCanvas.getObjects().filter(function (o) { return o._nlkBgLayer; })
                    .forEach(function (o) { fabricCanvas.remove(o); });
                fabricCanvas.insertAt(img, 0);
                fabricCanvas.backgroundColor = '';
                fabricCanvas.renderAll();
                saveHistory();
            }, { crossOrigin: 'anonymous' });
        }
    }

    // ─── Utilities ────────────────────────────────────────────────────────────
    function debounce(fn, delay) {
        var timeout;
        return function () {
            clearTimeout(timeout);
            timeout = setTimeout(fn, delay);
        };
    }

    // ─── Public API ──────────────────────────────────────────────────────────
    return {
        init: init,
        open: open
    };

})();

// ─── Image Upload Widget Manager ──────────────────────────────────────────────
// Manages the unified image select + edit button for each image context
var NLKImageWidget = (function () {

    function initWidget(config) {
        /**
         * config = {
         *   fileInputId: 'category_image',
         *   croppedInputId: 'category_image_cropped',
         *   previewImgId: 'category_image_preview_img',
         *   previewDivId: 'category_image_preview',
         *   editBtnId: 'category_edit_image_btn',
         *   currentImgId: 'category_current_image_preview', // optional
         * }
         */
        var fileInput = document.getElementById(config.fileInputId);
        var editBtn = document.getElementById(config.editBtnId);
        var croppedInput = document.getElementById(config.croppedInputId);
        var previewImg = document.getElementById(config.previewImgId);
        var previewDiv = document.getElementById(config.previewDivId);

        if (!fileInput) return;

        fileInput.addEventListener('change', function () {
            if (!this.files || !this.files[0]) return;
            var file = this.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                // Show preview
                if (previewImg) previewImg.src = e.target.result;
                if (previewDiv) previewDiv.style.display = 'block';
                // Clear old cropped value
                if (croppedInput) croppedInput.value = '';
                // Show edit button
                if (editBtn) editBtn.style.display = 'inline-flex';
            };
            reader.readAsDataURL(file);
        });

        if (editBtn) {
            editBtn.addEventListener('click', function () {
                // Get current image to edit
                var currentBase64 = '';
                if (croppedInput && croppedInput.value && croppedInput.value.startsWith('data:')) {
                    currentBase64 = croppedInput.value;
                } else if (previewImg && previewImg.src && previewImg.src.startsWith('data:')) {
                    currentBase64 = previewImg.src;
                } else if (fileInput.files && fileInput.files[0]) {
                    var fr = new FileReader();
                    fr.onload = function (ev) {
                        openEditorWithBase64(ev.target.result, croppedInput, previewImg, previewDiv);
                    };
                    fr.readAsDataURL(fileInput.files[0]);
                    return;
                } else if (config.currentImgUrl) {
                    currentBase64 = config.currentImgUrl;
                }

                if (currentBase64) {
                    openEditorWithBase64(currentBase64, croppedInput, previewImg, previewDiv);
                }
            });
        }
    }

    function openEditorWithBase64(base64, croppedInput, previewImg, previewDiv) {
        NLKImageEditor.open(base64, function (editedBase64) {
            if (croppedInput) croppedInput.value = editedBase64;
            if (previewImg) previewImg.src = editedBase64;
            if (previewDiv) previewDiv.style.display = 'block';
        });
    }

    function initAll() {
        // Category image widget
        initWidget({
            fileInputId: 'category_image',
            croppedInputId: 'category_image_cropped',
            previewImgId: 'category_image_preview_img',
            previewDivId: 'category_image_preview',
            editBtnId: 'category_edit_image_btn',
        });

        // Add product image widget
        initWidget({
            fileInputId: 'product_image_input',
            croppedInputId: 'product_image_cropped',
            previewImgId: 'product_image_preview_img',
            previewDivId: 'product_image_preview',
            editBtnId: 'product_add_edit_image_btn',
        });

        // Edit product image widget (quick modal)
        initWidget({
            fileInputId: 'edit_product_image_input',
            croppedInputId: 'edit_product_image_cropped',
            previewImgId: 'edit_product_image_preview_img',
            previewDivId: 'edit_product_image_preview',
            editBtnId: 'product_edit_edit_image_btn',
        });

        // Full product edit page
        initWidget({
            fileInputId: 'full_product_image_input',
            croppedInputId: 'full_product_image_cropped',
            previewImgId: 'full_product_image_preview_img',
            previewDivId: 'full_product_image_preview',
            editBtnId: 'full_product_edit_image_btn',
        });
    }

    return { initAll: initAll, initWidget: initWidget };
})();

// ─── Bootstrap ────────────────────────────────────────────────────────────────
(function () {
    function boot() {
        NLKImageEditor.init();
        NLKImageWidget.initAll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
