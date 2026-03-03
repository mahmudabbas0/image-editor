{{-- Professional Image Editor Modal — KT/Metronic Style --}}
{{-- Usage: @include('components.image-editor-modal') --}}

<div class="modal fade" id="nlk_image_editor_modal" tabindex="-1" aria-hidden="true"
     data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-fullscreen p-0 m-0" style="max-width:100%;">
        <div class="modal-content rounded-0 border-0" style="background: var(--kt-page-bg, #f5f5f5);">

            {{-- ═══ TOP BAR (Metronic-style header) ═══════════════════════════ --}}
            <div class="d-flex align-items-center justify-content-between px-5 py-3 border-bottom"
                 style="background: var(--kt-card-bg, #fff); min-height: 58px; flex-shrink: 0; z-index: 10;">

                {{-- Brand --}}
                <div class="d-flex align-items-center gap-3">
                    <div class="d-flex align-items-center gap-2">
                        <span class="text-primary">
                            <i class="ki-duotone ki-picture fs-1">
                                <span class="path1"></span>
                                <span class="path2"></span>
                            </i>
                        </span>
                        <span class="fw-bold text-gray-800 fs-4">{{ __('nlk::editor.image_editor') }}</span>
                    </div>

                    {{-- Divider --}}
                    <div class="separator separator-vertical h-25px"></div>

                    {{-- Undo/Redo --}}
                    <div class="d-flex align-items-center gap-1">
                        <button type="button" id="nlk_tool_undo" class="btn btn-sm btn-icon btn-light btn-active-light-primary" title="{{ __('nlk::editor.undo') }} (Ctrl+Z)" disabled>
                            <i class="ki-duotone ki-arrow-left fs-3"><span class="path1"></span><span class="path2"></span></i>
                        </button>
                        <button type="button" id="nlk_tool_redo" class="btn btn-sm btn-icon btn-light btn-active-light-primary" title="{{ __('nlk::editor.redo') }} (Ctrl+Y)" disabled>
                            <i class="ki-duotone ki-arrow-right fs-3"><span class="path1"></span><span class="path2"></span></i>
                        </button>
                    </div>

                    {{-- Divider --}}
                    <div class="separator separator-vertical h-25px"></div>

                    {{-- Flip / Rotate --}}
                    <div class="d-flex align-items-center gap-1">
                        <button type="button" id="nlk_tool_flip_h" class="btn btn-sm btn-icon btn-light btn-active-light-primary" title="{{ __('nlk::editor.flip_horizontal') }}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h4M18 12h4M6 8l-4 4 4 4M18 8l4 4-4 4"/></svg>
                        </button>
                        <button type="button" id="nlk_tool_flip_v" class="btn btn-sm btn-icon btn-light btn-active-light-primary" title="{{ __('nlk::editor.flip_vertical') }}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M12 2v4M12 18v4M8 6l4-4 4 4M8 18l4 4 4-4"/></svg>
                        </button>
                        <button type="button" id="nlk_tool_rotate_l" class="btn btn-sm btn-icon btn-light btn-active-light-primary" title="{{ __('nlk::editor.rotate_left') }}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 7V3H7"/><path d="M3 3a9 9 0 1 1 0 18"/></svg>
                        </button>
                        <button type="button" id="nlk_tool_rotate_r" class="btn btn-sm btn-icon btn-light btn-active-light-primary" title="{{ __('nlk::editor.rotate_right') }}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 7V3h-4"/><path d="M21 3a9 9 0 1 0 0 18"/></svg>
                        </button>
                    </div>

                    {{-- Divider --}}
                    <div class="separator separator-vertical h-25px"></div>

                    {{-- Delete / Reset --}}
                    <div class="d-flex align-items-center gap-1">
                        <button type="button" id="nlk_tool_delete" class="btn btn-sm btn-icon btn-light btn-active-light-danger" title="{{ __('nlk::editor.delete_selected') }} (Del)">
                            <i class="ki-duotone ki-trash fs-3 text-danger">
                                <span class="path1"></span><span class="path2"></span><span class="path3"></span><span class="path4"></span><span class="path5"></span>
                            </i>
                        </button>
                        <button type="button" id="nlk_tool_reset" class="btn btn-sm btn-icon btn-light btn-active-light-warning" title="{{ __('nlk::editor.reset') }}">
                            <i class="ki-duotone ki-arrows-circle fs-3 text-warning">
                                <span class="path1"></span><span class="path2"></span>
                            </i>
                        </button>
                    </div>

                    {{-- Divider --}}
                    <div class="separator separator-vertical h-25px"></div>

                    {{-- ── AI Tools ──────────────────────────────────────── --}}
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge badge-light-primary fs-8 fw-semibold me-1">
                            <i class="ki-duotone ki-rocket fs-7 me-1"><span class="path1"></span><span class="path2"></span></i>
                            AI
                        </span>
                        <button type="button" id="nlk_ai_remove_bg" class="btn btn-sm btn-light-primary">
                            <span class="nlk-ai-spinner d-none me-1">
                                <span class="spinner-border spinner-border-sm"></span>
                            </span>
                            <i class="ki-duotone ki-picture fs-4 me-1 nlk-ai-icon"><span class="path1"></span><span class="path2"></span></i>
                            {{ __('nlk::editor.image_remove_bg') }}
                        </button>
                        <button type="button" id="nlk_ai_upscale" class="btn btn-sm btn-light-info">
                            <span class="nlk-ai-spinner d-none me-1">
                                <span class="spinner-border spinner-border-sm"></span>
                            </span>
                            <i class="ki-duotone ki-size fs-4 me-1 nlk-ai-icon"><span class="path1"></span><span class="path2"></span></i>
                            {{ __('nlk::editor.image_upscale') }}
                        </button>
                    </div>
                </div>

                {{-- Save / Cancel --}}
                <div class="d-flex align-items-center gap-3">
                    <button type="button" id="nlk_editor_cancel" class="btn btn-sm btn-light">
                        {{ __('nlk::editor.cancel') }}
                    </button>
                    <button type="button" id="nlk_editor_save" class="btn btn-sm btn-primary">
                        <i class="ki-duotone ki-check fs-3 me-1"><span class="path1"></span><span class="path2"></span></i>
                        {{ __('nlk::editor.save') }}
                    </button>
                </div>
            </div>

            {{-- ═══ EDITOR BODY ════════════════════════════════════════════════ --}}
            <div class="d-flex" style="flex: 1; height: calc(100vh - 58px); overflow: hidden;">

                {{-- ── LEFT SIDEBAR (Tool Buttons) ─────────────────────────── --}}
                <div class="d-flex flex-column align-items-center py-4 gap-1 border-end"
                     style="width: 58px; background: var(--kt-card-bg, #fff); flex-shrink: 0; overflow-y: auto;">

                    {{-- Select --}}
                    <button type="button" id="nlk_tool_select" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary active w-40px h-40px" title="{{ __('nlk::editor.select') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l6 18 3-7 7-3z"/></svg>
                    </button>

                    {{-- Crop --}}
                    <button type="button" id="nlk_tool_crop" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.crop') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14h14M2 6h14"/></svg>
                    </button>

                    <div class="separator my-2 w-75"></div>

                    {{-- Draw --}}
                    <button type="button" id="nlk_tool_draw" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.draw') }}">
                        <i class="ki-duotone ki-pencil fs-3"><span class="path1"></span><span class="path2"></span></i>
                    </button>
                    <button type="button" id="nlk_tool_eraser" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.eraser') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20H7L3 16l13-13 7 7-3 10z"/><path d="M6 17l5-5"/></svg>
                    </button>

                    <div class="separator my-2 w-75"></div>

                    {{-- Text --}}
                    <button type="button" id="nlk_tool_text" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.add_text') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                    </button>

                    <div class="separator my-2 w-75"></div>

                    {{-- Shapes --}}
                    <button type="button" id="nlk_tool_rect" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.rectangle') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    </button>
                    <button type="button" id="nlk_tool_circle" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.circle') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
                    </button>
                    <button type="button" id="nlk_tool_triangle" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.triangle') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l9 18H3z"/></svg>
                    </button>
                    <button type="button" id="nlk_tool_line" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.line') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="19" x2="19" y2="5"/></svg>
                    </button>
                    <button type="button" id="nlk_tool_arrow" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.arrow') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 19L19 5M13 5h6v6"/></svg>
                    </button>

                    <div class="separator my-2 w-75"></div>

                    {{-- Add Image (overlay) --}}
                    <button type="button" id="nlk_add_image_btn" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-primary w-40px h-40px" title="{{ __('nlk::editor.add_image') }}">
                        <i class="ki-duotone ki-add-files fs-3"><span class="path1"></span><span class="path2"></span><span class="path3"></span></i>
                    </button>
                    <input type="file" id="nlk_add_image_input" accept="image/*" style="display:none;">

                    <div class="separator my-2 w-75"></div>

                    {{-- Change Background --}}
                    <button type="button" id="nlk_tool_bg" class="nlk-tool-btn btn btn-icon btn-sm btn-light btn-active-light-success w-40px h-40px" title="{{ __('nlk::editor.change_background') }}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="2" width="20" height="20" rx="3"/>
                            <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none"/>
                            <path d="M2 15l5-5 4 4 3-3 5 5"/>
                        </svg>
                    </button>
                </div>

                {{-- ── CANVAS AREA ─────────────────────────────────────────── --}}
                <div class="d-flex flex-column flex-grow-1" style="overflow:hidden;">

                    {{-- Crop controls mini-bar --}}
                    <div id="nlk_crop_controls"
                         style="display:none; background: var(--kt-warning-light, #fff8dd); border-bottom: 1px solid var(--kt-warning, #ffc700); flex-shrink:0;"
                         class="align-items-center gap-3 px-4 py-2">
                        <i class="ki-duotone ki-information-5 text-warning fs-3"><span class="path1"></span><span class="path2"></span><span class="path3"></span></i>
                        <span class="text-gray-700 fs-7 fw-semibold">{{ __('nlk::editor.drag_to_define_crop_area') }}</span>
                        <div class="d-flex gap-2 ms-auto">
                            <button type="button" id="nlk_cancel_crop" class="btn btn-sm btn-light">
                                {{ __('nlk::editor.cancel') }}
                            </button>
                            <button type="button" id="nlk_apply_crop" class="btn btn-sm btn-warning">
                                <i class="ki-duotone ki-scissors fs-4 me-1"><span class="path1"></span><span class="path2"></span></i>
                                {{ __('nlk::editor.apply_crop') }}
                            </button>
                        </div>
                    </div>

                    {{-- AI Loading overlay --}}
                    <div id="nlk_ai_overlay" style="display:none; position:absolute; top:58px; left:58px; right:280px; bottom:0; background:rgba(255,255,255,0.85); z-index:20; align-items:center; justify-content:center; flex-direction:column; gap:12px;">
                        <div class="spinner-border text-primary" style="width:3rem; height:3rem;"></div>
                        <span class="text-gray-600 fw-semibold fs-5" id="nlk_ai_overlay_text">{{ __('nlk::editor.removing_background') }}</span>
                    </div>

                    {{-- Canvas --}}
                    <div id="nlk_editor_canvas_container"
                         style="flex:1; overflow:auto; position:relative; background: #2d2d3e; display:flex; align-items:center; justify-content:center; padding:16px;">
                        <canvas id="nlk_editor_canvas"></canvas>
                    </div>
                </div>

                {{-- ── RIGHT SIDEBAR (Properties) ──────────────────────────── --}}
                <div class="d-flex flex-column border-start"
                     style="width: 270px; background: var(--kt-card-bg, #fff); flex-shrink: 0; overflow-y: auto;">

                    {{-- ── BACKGROUND ── --}}
                    <div class="p-4 border-bottom" id="nlk_bg_panel" style="display:none;">
                        <div class="text-uppercase text-gray-400 fw-bold fs-8 mb-3 d-flex align-items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-1">
                                <rect x="2" y="2" width="20" height="20" rx="3"/>
                                <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none"/>
                                <path d="M2 15l5-5 4 4 3-3 5 5"/>
                            </svg>
                            {{ __('nlk::editor.change_background') }}
                        </div>

                        {{-- Type tabs: 2x2 grid --}}
                        <div class="row g-1 mb-3">
                            <div class="col-6">
                                <button type="button" class="nlk-bg-tab btn btn-sm btn-light btn-active-light-success w-100 active" data-bg-type="none">
                                    <svg width="11" height="11" viewBox="0 0 24 24" class="me-1"><rect x="2" y="2" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-dasharray="4 2"/><line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" stroke-width="2"/></svg>
                                    {{ __('nlk::editor.bg_transparent') }}
                                </button>
                            </div>
                            <div class="col-6">
                                <button type="button" class="nlk-bg-tab btn btn-sm btn-light btn-active-light-success w-100" data-bg-type="color">
                                    <svg width="11" height="11" viewBox="0 0 24 24" class="me-1"><circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/></svg>
                                    {{ __('nlk::editor.bg_color') }}
                                </button>
                            </div>
                            <div class="col-6">
                                <button type="button" class="nlk-bg-tab btn btn-sm btn-light btn-active-light-success w-100" data-bg-type="gradient">
                                    <svg width="11" height="11" viewBox="0 0 24 24" class="me-1"><defs><linearGradient id="tg2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs><rect width="24" height="24" fill="url(#tg2)" rx="3"/></svg>
                                    {{ __('nlk::editor.bg_gradient') }}
                                </button>
                            </div>
                            <div class="col-6">
                                <button type="button" class="nlk-bg-tab btn btn-sm btn-light btn-active-light-success w-100" data-bg-type="image">
                                    <i class="ki-duotone ki-picture fs-8 me-1"><span class="path1"></span><span class="path2"></span></i>
                                    {{ __('nlk::editor.bg_image') }}
                                </button>
                            </div>
                        </div>

                        {{-- NONE (transparent) --}}
                        <div id="nlk_bg_section_none" class="nlk-bg-section">
                            <div class="text-center py-3">
                                <div class="d-inline-flex align-items-center justify-content-center rounded-2 mb-2"
                                     style="width:64px;height:64px;background:repeating-conic-gradient(#e4e6ef 0% 25%,#f5f8fa 0% 50%) 0 0/16px 16px;">
                                </div>
                                <p class="text-muted fs-8 mb-2">{{ __('nlk::editor.bg_transparent_hint') }}</p>
                                <button type="button" id="nlk_bg_apply_none" class="btn btn-sm btn-light-success">
                                    {{ __('nlk::editor.apply') }}
                                </button>
                            </div>
                        </div>

                        {{-- COLOR --}}
                        <div id="nlk_bg_section_color" class="nlk-bg-section" style="display:none;">
                            {{-- Color presets --}}
                            <div class="d-flex flex-wrap gap-2 mb-3">
                                @foreach(['#ffffff','#000000','#f5f5f5','#1e1e2e','#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'] as $c)
                                <button type="button" class="nlk-color-swatch" data-color="{{ $c }}"
                                        style="width:28px;height:28px;border-radius:6px;background:{{ $c }};border:2px solid transparent;cursor:pointer;transition:border-color .15s;"
                                        title="{{ $c }}"></button>
                                @endforeach
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-3">
                                <label class="text-gray-600 fs-8 fw-semibold">{{ __('nlk::editor.custom_color') }}</label>
                                <input type="color" id="nlk_bg_custom_color" value="#ffffff"
                                       class="form-control form-control-sm form-control-solid" style="height:32px;padding:2px;width:60px;">
                            </div>
                            <button type="button" id="nlk_bg_apply_color" class="btn btn-sm btn-light-success w-100">
                                {{ __('nlk::editor.apply') }}
                            </button>
                        </div>

                        {{-- GRADIENT --}}
                        <div id="nlk_bg_section_gradient" class="nlk-bg-section" style="display:none;">
                            <div class="row g-2 mb-3">
                                @foreach([
                                    ['#6366f1','#ec4899'],
                                    ['#06b6d4','#3b82f6'],
                                    ['#22c55e','#eab308'],
                                    ['#f97316','#ef4444'],
                                    ['#1e1e2e','#6366f1'],
                                    ['#ffffff','#e4e6ef'],
                                ] as [$c1,$c2])
                                <div class="col-4">
                                    <button type="button" class="nlk-gradient-swatch w-100 rounded-2"
                                            data-c1="{{ $c1 }}" data-c2="{{ $c2 }}"
                                            style="height:40px;background:linear-gradient(135deg,{{ $c1 }},{{ $c2 }});border:2px solid transparent;cursor:pointer;transition:border-color .15s;"
                                    ></button>
                                </div>
                                @endforeach
                            </div>
                            <div class="row g-2 mb-3">
                                <div class="col-6">
                                    <label class="text-gray-600 fs-8 fw-semibold mb-1 d-block">{{ __('nlk::editor.color') }} 1</label>
                                    <input type="color" id="nlk_bg_grad_c1" value="#6366f1"
                                           class="form-control form-control-sm form-control-solid" style="height:32px;padding:2px;">
                                </div>
                                <div class="col-6">
                                    <label class="text-gray-600 fs-8 fw-semibold mb-1 d-block">{{ __('nlk::editor.color') }} 2</label>
                                    <input type="color" id="nlk_bg_grad_c2" value="#ec4899"
                                           class="form-control form-control-sm form-control-solid" style="height:32px;padding:2px;">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="text-gray-600 fs-8 fw-semibold mb-1 d-block">{{ __('nlk::editor.bg_gradient_direction') }}</label>
                                <select id="nlk_bg_grad_dir" class="form-select form-select-sm form-select-solid">
                                    <option value="to right">→ {{ __('nlk::editor.bg_grad_ltr') }}</option>
                                    <option value="to bottom">↓ {{ __('nlk::editor.bg_grad_ttb') }}</option>
                                    <option value="135deg">↘ {{ __('nlk::editor.bg_grad_diagonal') }}</option>
                                    <option value="to top right">↗ {{ __('nlk::editor.bg_grad_diagonal_rev') }}</option>
                                    <option value="to bottom left">↙ {{ __('nlk::editor.bg_grad_diagonal_bl') }}</option>
                                </select>
                            </div>
                            <button type="button" id="nlk_bg_apply_gradient" class="btn btn-sm btn-light-success w-100">
                                {{ __('nlk::editor.apply') }}
                            </button>
                        </div>

                        {{-- IMAGE --}}
                        <div id="nlk_bg_section_image" class="nlk-bg-section" style="display:none;">
                            <div class="mb-3">
                                <label class="btn btn-sm btn-light-primary w-100" for="nlk_bg_image_input">
                                    <i class="ki-duotone ki-folder-up fs-4 me-1"><span class="path1"></span><span class="path2"></span></i>
                                    {{ __('nlk::editor.bg_upload_image') }}
                                </label>
                                <input type="file" id="nlk_bg_image_input" accept="image/*" style="display:none;">
                            </div>
                            <div id="nlk_bg_image_preview" class="text-center mb-3" style="display:none;">
                                <img id="nlk_bg_image_thumb" src="" alt="" class="img-fluid rounded" style="max-height:80px;object-fit:cover;">
                            </div>
                            <div class="mb-3">
                                <label class="text-gray-600 fs-8 fw-semibold mb-1 d-block">{{ __('nlk::editor.bg_image_fit') }}</label>
                                <select id="nlk_bg_image_size" class="form-select form-select-sm form-select-solid">
                                    <option value="cover">Cover</option>
                                    <option value="contain">Contain</option>
                                    <option value="fill">Fill</option>
                                    <option value="tile">Tile</option>
                                </select>
                            </div>
                            <button type="button" id="nlk_bg_apply_image" class="btn btn-sm btn-light-success w-100" disabled>
                                {{ __('nlk::editor.apply') }}
                            </button>
                        </div>
                    </div>

                    {{-- ── FILTERS ── --}}
                    <div class="p-4 border-bottom">
                        <div class="text-uppercase text-gray-400 fw-bold fs-8 mb-3 d-flex align-items-center gap-2">
                            <i class="ki-duotone ki-color-swatch fs-5 text-gray-400"><span class="path1"></span><span class="path2"></span></i>
                            {{ __('nlk::editor.filters') }}
                        </div>

                        {{-- Preset filter swatches --}}
                        <div class="row g-2 mb-4">
                            @foreach([
                                ['normal',    '🖼️', 'Normal'],
                                ['grayscale', '🔲', 'Grayscale'],
                                ['sepia',     '🟫', 'Sepia'],
                                ['vintage',   '📷', 'Vintage'],
                                ['warm',      '🟠', 'Warm'],
                                ['cool',      '🔵', 'Cool'],
                                ['invert',    '🔄', 'Invert'],
                                ['blackwhite','⬛', 'B&W'],
                            ] as $f)
                            <div class="col-6">
                                <button type="button" data-filter="{{ $f[0] }}"
                                        class="nlk-filter-btn w-100 btn btn-sm btn-light btn-active-light-primary {{ $f[0]==='normal' ? 'active' : '' }}">
                                    <span style="font-size:1.1rem; display:block;">{{ $f[1] }}</span>
                                    <small class="text-gray-600">{{ $f[2] }}</small>
                                </button>
                            </div>
                            @endforeach
                        </div>

                        {{-- Sliders --}}
                        @foreach([
                            ['brightness', '☀️', 'admin.brightness', -100, 100],
                            ['contrast',   '🎭', 'admin.contrast',   -100, 100],
                            ['saturation', '🌈', 'admin.saturation', -100, 100],
                            ['blur',       '💧', 'admin.blur',          0, 100],
                        ] as [$id, $icon, $label, $min, $max])
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <label class="text-gray-600 fs-8 fw-semibold">{{ $icon }} @trans($label)</label>
                                <span id="nlk_filter_{{ $id }}_val" class="text-primary fw-bold fs-8">0</span>
                            </div>
                            <input type="range" id="nlk_filter_{{ $id }}" min="{{ $min }}" max="{{ $max }}" value="0" class="nlk-range w-100">
                        </div>
                        @endforeach
                    </div>

                    {{-- ── DRAW PROPERTIES ── --}}
                    <div class="p-4 border-bottom">
                        <div class="text-uppercase text-gray-400 fw-bold fs-8 mb-3">
                            <i class="ki-duotone ki-pencil fs-5 text-gray-400 me-1"><span class="path1"></span><span class="path2"></span></i>
                            {{ __('nlk::editor.draw_properties') }}
                        </div>
                        <div class="row g-3 mb-3">
                            <div class="col-6">
                                <label class="text-gray-600 fs-8 fw-semibold mb-1 d-block">{{ __('nlk::editor.stroke_color') }}</label>
                                <input type="color" id="nlk_stroke_color" value="#000000"
                                       class="form-control form-control-sm form-control-solid" style="height:36px; padding:2px;">
                            </div>
                            <div class="col-6">
                                <label class="text-gray-600 fs-8 fw-semibold mb-1 d-block">{{ __('nlk::editor.fill_color') }}</label>
                                <input type="color" id="nlk_fill_color" value="#ff0000"
                                       class="form-control form-control-sm form-control-solid" style="height:36px; padding:2px;">
                            </div>
                        </div>
                        <div>
                            <div class="d-flex justify-content-between mb-1">
                                <label class="text-gray-600 fs-8 fw-semibold">{{ __('nlk::editor.brush_size') }}</label>
                                <span id="nlk_brush_size_label" class="text-primary fw-bold fs-8">3</span>
                            </div>
                            <input type="range" id="nlk_brush_size" min="1" max="50" value="3" class="nlk-range w-100">
                        </div>
                    </div>

                    {{-- ── TEXT PROPERTIES ── --}}
                    <div class="p-4 border-bottom">
                        <div class="text-uppercase text-gray-400 fw-bold fs-8 mb-3">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="me-1"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                            {{ __('nlk::editor.text_properties') }}
                        </div>
                        <div class="mb-3">
                            <label class="text-gray-600 fs-8 fw-semibold mb-1 d-block">{{ __('nlk::editor.font_color') }}</label>
                            <input type="color" id="nlk_text_color" value="#ffffff"
                                   class="form-control form-control-sm form-control-solid" style="height:36px; padding:2px;">
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <label class="text-gray-600 fs-8 fw-semibold">{{ __('nlk::editor.font_size') }}</label>
                                <span id="nlk_font_size_label" class="text-primary fw-bold fs-8">28</span>
                            </div>
                            <input type="range" id="nlk_font_size" min="10" max="150" value="28" class="nlk-range w-100">
                        </div>
                        <div class="mb-3">
                            <label class="text-gray-600 fs-8 fw-semibold mb-1 d-block">{{ __('nlk::editor.font_family') }}</label>
                            <select id="nlk_font_family" class="form-select form-select-sm form-select-solid"></select>
                        </div>
                        <div class="d-flex gap-2">
                            <button type="button" id="nlk_text_bold" class="btn btn-sm btn-light btn-active-light-primary flex-grow-1" title="{{ __('nlk::editor.bold') }}"><b>B</b></button>
                            <button type="button" id="nlk_text_italic" class="btn btn-sm btn-light btn-active-light-primary flex-grow-1" title="{{ __('nlk::editor.italic') }}"><i>I</i></button>
                            <button type="button" id="nlk_text_underline" class="btn btn-sm btn-light btn-active-light-primary flex-grow-1" title="{{ __('nlk::editor.underline') }}"><u>U</u></button>
                        </div>
                    </div>

                    {{-- ── STICKERS ── --}}
                    <div class="p-4">
                        <div class="text-uppercase text-gray-400 fw-bold fs-8 mb-3">
                            <span class="me-1">😊</span>
                            {{ __('nlk::editor.stickers') }}
                        </div>
                        <div id="nlk_sticker_grid" class="nlk-sticker-grid"></div>
                    </div>
                </div>
                {{-- end right sidebar --}}
            </div>
            {{-- end editor body --}}

        </div>
    </div>
</div>

{{-- AI Result Child Modal --}}
<div class="modal fade" id="nlk_ai_result_modal" tabindex="-1" aria-hidden="true" data-bs-backdrop="true">
    <div class="modal-dialog modal-dialog-centered mw-600px">
        <div class="modal-content">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title fw-bold">
                    <i class="ki-duotone ki-rocket fs-3 text-primary me-2"><span class="path1"></span><span class="path2"></span></i>
                    {{ __('nlk::editor.ai_image_result') }}
                </h5>
                <div class="btn btn-icon btn-sm btn-active-icon-primary" data-bs-dismiss="modal">
                    <i class="ki-duotone ki-cross fs-1"><span class="path1"></span><span class="path2"></span></i>
                </div>
            </div>
            <div class="modal-body text-center pt-3">
                <p class="text-muted mb-4 fs-7">{{ __('nlk::editor.ai_image_result_hint') }}</p>
                <div class="bg-light rounded p-3">
                    <img id="nlk_ai_result_img" src="" alt="AI Result" class="img-fluid rounded" style="max-height:350px; object-fit:contain;" />
                </div>
            </div>
            <div class="modal-footer border-0 justify-content-center pt-0">
                <button type="button" class="btn btn-light" id="nlk_ai_result_revert">
                    <i class="ki-duotone ki-arrow-left fs-3 me-1"><span class="path1"></span><span class="path2"></span></i>
                    {{ __('nlk::editor.revert') }}
                </button>
                <button type="button" class="btn btn-primary" id="nlk_ai_result_accept">
                    <i class="ki-duotone ki-check fs-3 me-1"><span class="path1"></span><span class="path2"></span></i>
                    {{ __('nlk::editor.accept') }}
                </button>
            </div>
        </div>
    </div>
</div>

{{-- ═══ EDITOR STYLES ════════════════════════════════════════════════════════ --}}
<style>
/* ── Tool button active state ── */
.nlk-tool-btn.active {
    background-color: var(--kt-primary-light, #eff3ff) !important;
    color: var(--kt-primary, #009ef7) !important;
    border-color: transparent !important;
}

/* ── Range slider ── */
.nlk-range {
    -webkit-appearance: none;
    appearance: none;
    height: 5px;
    background: var(--kt-gray-200, #eff2f5);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
}
.nlk-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--kt-primary, #009ef7);
    cursor: pointer;
    box-shadow: 0 0 0 3px rgba(0,158,247,0.15);
}
.nlk-range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--kt-primary, #009ef7);
    cursor: pointer;
    border: none;
}

/* ── Filter preset buttons ── */
.nlk-filter-btn {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    padding: 6px 4px !important;
    font-size: 0.7rem !important;
    gap: 2px !important;
    transition: all 0.15s !important;
}

/* ── Sticker grid ── */
.nlk-sticker-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
}
.nlk-sticker-btn {
    border: none;
    background: transparent;
    font-size: 1.2rem;
    line-height: 1;
    cursor: pointer;
    padding: 5px;
    border-radius: 6px;
    transition: background 0.15s;
    text-align: center;
}
.nlk-sticker-btn:hover {
    background: var(--kt-gray-100, #f5f8fa);
}

/* ── Canvas checkerboard (shows for transparent areas) ── */
#nlk_editor_canvas_container canvas {
    display: block;
}
#nlk_editor_canvas_container .canvas-container {
    background-image: repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%);
    background-size: 14px 14px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.45);
}

/* ── AI Overlay absolute positioning ── */
#nlk_ai_overlay {
    position: absolute !important;
    display: none;
}
#nlk_ai_overlay.show {
    display: flex !important;
}
</style>

@push('js')
<script>
    window.nlkEditorTranslations = {
        aiError: '{{ __("nlk::editor.ai_processing_failed") }}',
        aiProcessUrlMissing: '{{ __("nlk::editor.ai_url_not_configured") }}',
        removingBackground: '{{ __("nlk::editor.removing_background") }}',
        upscalingImage: '{{ __("nlk::editor.upscaling_image") }}',
        resetConfirm: '{{ __("nlk::editor.reset_edits_confirm") }}'
    };
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
<script src="{{ asset('vendor/nlk/image-editor/js/image-editor.js') }}"></script>
@endpush
