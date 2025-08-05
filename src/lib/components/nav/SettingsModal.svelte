<script lang="ts">
    import Settings from '$lib/components/nav/Settings.svelte';
    import type { Translations } from '$lib/translations';

    const { t }: { t: Translations } = $props();
    const ts = $derived(t.nav.settings);
</script>

<div class="modal fade" id="settings" tabindex="-1" aria-labelledby="settingsLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="settingsLabel">{ts.title}</h4>
                <button
                    aria-label={ts.close}
                    class="btn-close"
                    data-bs-dismiss="modal"
                ></button>
            </div>

            <div class="modal-body">
                <Settings {t} />
            </div>

            <div class="modal-footer">
                <button
                    class="btn btn-primary"
                    data-bs-dismiss="modal"
                >{ts.close}</button>
            </div>
        </div>
    </div>
</div>