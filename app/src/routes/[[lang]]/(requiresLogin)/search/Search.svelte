<script generics="D, T" lang="ts">
    import type { Translations } from '$lib/translations';
    import { wordsToFilter } from '../new/companies';
    import { nazevSHvezdou, type SearchWidget } from '$lib/Vec.svelte';

    interface Props {
        t: Translations;
        widget: SearchWidget<D, T>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    let search = $state(widget.value ? ' ' : '');

    const all = $derived(widget.items(data));
    let filtered = $derived(
        search == ' ' ? all : all?.filter((item) =>
            wordsToFilter(search).every(
                filter => widget.getSearchItem(item).pieces.some(piece =>
                    wordsToFilter(t.get(piece.text)).some(word => word.includes(filter))
                )
            )
        ) ?? []
    );
    let hidden = $state(true);
</script>

<div class="position-relative mb-2">
    <label class="form-floating d-block">
        <input
            bind:value={search}
            class="form-control border ps-3"
            class:border-bottom-0={filtered.length > 0 && !hidden && search !== '' || hidden && widget.value}
            class:rb-0={filtered.length > 0 && !hidden && search !== ''}
            onblur={() => {
                if (filtered.length !== 1)
                    widget.value = null;
                else {
                    widget.value = filtered[0];
                    search = ' ';
                    hidden = true;
                }
                setTimeout(() => !widget.value ? search = '' : null, 200)
            }}
            onfocus={() => {
				search = widget.value ? t.get(widget.getSearchItem(widget.value).pieces[0].text) : ''
                hidden = false
            }}
            placeholder=""
            type={widget.type(data)}
        />
        <label for="">{nazevSHvezdou(widget, data, t)}</label>
    </label>

    {#if search !== '' && filtered.length > 0 && !hidden}
        <div class="list-group position-absolute z-3 w-100 shadow-lg pb-2" onfocusout={()=>console.log('hi')}>
            {#each filtered as item, i}
                {@const searchItem = widget.getSearchItem(item)}
                <a
                    class="list-group-item-action list-group-item d-flex flex-column flex-md-row flex-row align-items-md-center"
                    class:rt-0={i === 0}
                    href={searchItem.href ?? '#'}
                    onclick={(e) => {
                        e.preventDefault();
                        widget.value = item;
                        search = ' ';
                        hidden = true
                    }}
                >
                    {#each searchItem.pieces as piece}
                        <p class="mb-0" style="flex: none; width: {(piece.width ?? 1 / searchItem.pieces.length) * 100}%"
                        >{t.get(piece.text)}</p>
                    {/each}
                </a>
            {/each}
        </div>
    {/if}

    {#if widget.value && hidden}
        {@const searchItem = widget.getSearchItem(widget.value)}
        <div class="list-group w-100 position-absolute z-2 selected">
            <div
                class="list-group-item-action list-group-item d-flex flex-column flex-md-row flex-row align-items-md-center"
                class:rt-0={true}
            >
                {#each searchItem.pieces as piece}
                    <p class="mb-0 me-1" style="flex: none; width: {(piece.width ?? 1 / searchItem.pieces.length) * 100}%"
                    >{t.get(piece.text)}</p>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .rb-0 {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    .rt-0 {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .form-control:focus {
        box-shadow: none;
    }

    .selected {
        transform: translateY(calc(-100% + 1px));
        pointer-events: none;

        div {
            background: none;
            border-top: none;

            p {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }
    }
</style>
