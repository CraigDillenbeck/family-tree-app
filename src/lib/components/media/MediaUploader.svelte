<script lang="ts">
  import { supabase } from '$lib/supabase/client'
  import Button from '$lib/components/ui/Button.svelte'

  export type UploadedMedia = {
    id: string
    media_type: 'image' | 'video' | 'audio' | 'document'
    storage_path: string
    title: string | null
    caption: string | null
    signedUrl: string | null
  }

  interface Props {
    treeId: string
    personId?: string
    onUploaded?: (media: UploadedMedia) => void
    onCancel?: () => void
  }

  let { treeId, personId, onUploaded, onCancel }: Props = $props()

  let selectedFile: File | null = $state(null)
  let title = $state('')
  let caption = $state('')
  let uploading = $state(false)
  let progress = $state(0)
  let errorMessage: string | null = $state(null)
  let imagePreviewUrl: string | null = $state(null)
  let isDragging = $state(false)
  let fileInputEl: HTMLInputElement | undefined = $state()

  $effect(() => {
    if (!selectedFile?.type.startsWith('image/')) {
      imagePreviewUrl = null
      return
    }
    const url = URL.createObjectURL(selectedFile)
    imagePreviewUrl = url
    return () => URL.revokeObjectURL(url)
  })

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    selectedFile = files[0]
    errorMessage = null
    progress = 0
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    isDragging = false
    handleFiles(e.dataTransfer?.files ?? null)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    isDragging = true
  }

  function clearSelection() {
    selectedFile = null
    imagePreviewUrl = null
    title = ''
    caption = ''
    errorMessage = null
    progress = 0
    if (fileInputEl) fileInputEl.value = ''
  }

  async function upload() {
    if (!selectedFile || uploading) return
    uploading = true
    errorMessage = null
    progress = 10

    try {
      // Step 1: Get signed upload URL from server (validates plan limits)
      const requestRes = await fetch(`/api/trees/${treeId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          mimeType: selectedFile.type,
          fileSizeBytes: selectedFile.size,
          filename: selectedFile.name,
        }),
      })

      const requestData = await requestRes.json()
      if (!requestRes.ok) {
        errorMessage = requestData.error ?? 'Could not start upload. Please try again.'
        return
      }

      const { mediaId, storagePath, token } = requestData as {
        mediaId: string
        storagePath: string
        token: string
      }
      progress = 25

      // Step 2: Upload directly to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('tree-media')
        .uploadToSignedUrl(storagePath, token, selectedFile, {
          contentType: selectedFile.type,
        })

      if (uploadErr) {
        errorMessage = 'Upload failed. Please try again.'
        return
      }
      progress = 75

      // Step 3: Create DB record
      const confirmRes = await fetch(`/api/trees/${treeId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          mediaId,
          storagePath,
          mimeType: selectedFile.type,
          fileSizeBytes: selectedFile.size,
          title: title.trim() || null,
          caption: caption.trim() || null,
          personIds: personId ? [personId] : [],
        }),
      })

      const confirmData = await confirmRes.json()
      if (!confirmRes.ok) {
        errorMessage = confirmData.error ?? 'Could not save. Please try again.'
        return
      }

      progress = 100
      onUploaded?.(confirmData.media as UploadedMedia)
      clearSelection()
    } catch {
      errorMessage = 'Something went wrong. Please try again.'
    } finally {
      uploading = false
    }
  }

  const fileAccept = 'image/jpeg,image/png,image/webp,image/gif,image/heic,audio/mpeg,audio/mp4,audio/ogg,audio/wav,audio/aac,video/mp4,video/quicktime,video/webm'

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
</script>

<div class="uploader">

  {#if !selectedFile}
    <!-- Drop zone -->
    <div
      class="drop-zone"
      class:dragging={isDragging}
      role="button"
      tabindex="0"
      aria-label="Select a file to upload"
      onclick={() => fileInputEl?.click()}
      onkeydown={(e) => e.key === 'Enter' && fileInputEl?.click()}
      ondragover={handleDragOver}
      ondragleave={() => (isDragging = false)}
      ondrop={handleDrop}
    >
      <span class="drop-icon" aria-hidden="true">⬆</span>
      <p class="drop-primary">Drop a file here</p>
      <p class="drop-secondary">or <span class="drop-link">browse to choose</span></p>
      <p class="drop-hint">Photos, audio recordings, videos</p>
    </div>

    <input
      bind:this={fileInputEl}
      type="file"
      accept={fileAccept}
      class="file-input"
      onchange={(e) => handleFiles((e.currentTarget as HTMLInputElement).files)}
      aria-hidden="true"
    />

  {:else}
    <!-- File selected: show preview + form -->
    <div class="selected">

      {#if imagePreviewUrl}
        <div class="preview-wrap">
          <img src={imagePreviewUrl} alt="Preview" class="preview-img" />
        </div>
      {:else}
        <div class="file-badge">
          <span class="file-name">{selectedFile.name}</span>
          <span class="file-size">{formatBytes(selectedFile.size)}</span>
        </div>
      {/if}

      <div class="form-fields">
        <label class="field">
          <span class="field-label">Title <span class="field-optional">(optional)</span></span>
          <input
            type="text"
            bind:value={title}
            placeholder="A name for this file"
            class="field-input"
            maxlength="120"
            disabled={uploading}
          />
        </label>

        <label class="field">
          <span class="field-label">Caption <span class="field-optional">(optional)</span></span>
          <textarea
            bind:value={caption}
            placeholder="Add a note about this memory"
            class="field-textarea"
            rows={2}
            maxlength={300}
            disabled={uploading}
          ></textarea>
        </label>
      </div>

      {#if uploading}
        <div class="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div class="progress-fill" style="width: {progress}%"></div>
        </div>
      {/if}

      {#if errorMessage}
        <p class="error-msg" role="alert">{errorMessage}</p>
      {/if}

      <div class="form-actions">
        <Button onclick={upload} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
        <Button variant="ghost" onclick={clearSelection} disabled={uploading}>
          Choose a different file
        </Button>
        {#if onCancel}
          <Button variant="ghost" onclick={onCancel} disabled={uploading}>Cancel</Button>
        {/if}
      </div>

    </div>
  {/if}

</div>

<style>
  .uploader {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  /* ── Drop zone ── */
  .drop-zone {
    border: 1.5px dashed var(--color-border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-12) var(--space-8);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease),
                background var(--dur-fast) var(--ease);
    text-align: center;
  }
  .drop-zone:hover,
  .drop-zone.dragging {
    border-color: var(--color-gold);
    background: color-mix(in srgb, var(--color-gold) 4%, transparent);
  }

  .drop-icon {
    font-size: 28px;
    color: var(--color-text-hint);
  }

  .drop-primary {
    font-family: var(--font-ui);
    font-size: 15px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0;
  }

  .drop-secondary {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .drop-link {
    color: var(--color-gold);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .drop-hint {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-hint);
    margin: var(--space-2) 0 0;
  }

  .file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  /* ── Selected file ── */
  .selected {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .preview-wrap {
    border-radius: var(--radius-lg);
    overflow: hidden;
    max-height: 240px;
    background: var(--color-bg-surface-2);
  }

  .preview-img {
    width: 100%;
    max-height: 240px;
    object-fit: contain;
    display: block;
  }

  .file-badge {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .file-name {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-size {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  /* ── Form fields ── */
  .form-fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field-label {
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .field-optional {
    font-weight: var(--font-weight-regular);
    text-transform: none;
    letter-spacing: 0;
  }

  .field-input,
  .field-textarea {
    width: 100%;
    font-family: var(--font-ui);
    font-size: 14px;
    color: var(--color-text-primary);
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    box-sizing: border-box;
    transition: border-color var(--dur-fast) var(--ease);
    resize: none;
  }
  .field-input:focus,
  .field-textarea:focus {
    outline: none;
    border-color: var(--color-gold);
  }
  .field-input:disabled,
  .field-textarea:disabled {
    opacity: 0.6;
  }

  /* ── Progress ── */
  .progress-bar {
    height: 3px;
    background: var(--color-bg-surface-2);
    border-radius: 99px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--color-gold);
    border-radius: 99px;
    transition: width 200ms var(--ease);
  }

  /* ── Error ── */
  .error-msg {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-error);
    margin: 0;
    line-height: 1.5;
  }

  /* ── Actions ── */
  .form-actions {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    align-items: center;
  }
</style>
