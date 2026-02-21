<script lang="ts">
    import Settings from '$lib/components/nav/Settings.svelte';
    import type { Translations } from '$lib/translations';
    import Button from '$lib/components/Button.svelte';

    const { t }: { t: Translations } = $props();
    const ts = $derived(t.nav.settings);
</script>

<div class="modal fade" id="settings" tabindex="-1" aria-labelledby="settingsLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="settingsLabel">{ts.title}</h4>
                <Button label={ts.close} class="btn-close" dismissModal />
            </div>

            <div class="modal-body">
                <Settings {t} />
            </div>

            <div class="modal-footer">
                <Button text={ts.close} color="primary" dismissModal />
            </div>
        </div>
    </div>
</div>