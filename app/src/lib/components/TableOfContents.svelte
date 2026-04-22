<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { onMount } from 'svelte';
    import { parseTitleId, refreshTOC, registerTOC } from '$lib/helpers/globals';
    import { page } from '$app/state';
    import { replaceState } from '$app/navigation';

    const { t, onclick }: { t: Translations, onclick?: () => void } = $props();

    type T = { id: string, text: string, level: number, elementTop: number, elementBottom: number }
    type A = (T | A)[];

    function groupNested(list: T[]): A {
        if (list.length === 0) return [];

        // Root array
        const root: A = [];
        // Stack of arrays, start with root
        const stack: A[] = [root];

        let prev = list[0];
        root.push(prev);

        for (let i = 1; i < list.length; i++) {
            const curr = list[i];
            const top = stack[stack.length - 1];

            if (curr.level === prev.level) {
                // Same level -> push into the current array
                top.push(curr);
            } else if (curr.level > prev.level) {
                // Higher level -> create a new nested array
                const newArr: (T | any[])[] = [curr];
                top.push(newArr);
                stack.push(newArr);
            } else {
                // Lower level -> climb up until a valid parent
                stack.pop();
                const parent = stack[stack.length - 1];
                parent.push(curr);
            }

            prev = curr;
        }

        return root;
    }

    let headerElements = $state<HTMLHeadingElement[]>([]);
    let main = $state<HTMLElement>();
    let nav = $state<HTMLElement>();

    const sections = $derived(headerElements.map(element => {
        const text = element.childNodes.values().toArray().filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join(' ').trim();
        const level = Number(element.tagName.slice(1));
        const id = parseTitleId(text);

        return {
            id, text, level,
            elementTop: element.offsetTop, elementBottom: element.offsetTop + element.offsetHeight,
        };
    }));

    let scrollOffset = $state<number>(0);
    const top = $derived(scrollOffset + (nav?.offsetHeight ?? 0));
    const bottom = $derived(scrollOffset + (main?.offsetHeight ?? 0));
    const first = $derived(
        sections.findIndex(({ elementTop }) => top <= elementTop)
    );
    const last = $derived(
        sections.findLastIndex(({ elementBottom }) => elementBottom <= bottom)
    );
    const currentSections = $derived(
        sections.slice(Math.max(0, first - 1), last + 1).map(({ id }) => id)
    );

    onMount(() => {
        main = document.querySelector('main')!.parentNode! as HTMLElement;
        nav = document.querySelector('nav')!;

        scrollOffset = main!.scrollTop;

        registerTOC(() => {
            headerElements = [...main!.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6').values()]
                .filter(e =>
                    e.checkVisibility() &&
                    e.id !== 'toc-title' &&
                    e.id !== 'main-title' &&
                    e.id !== 'form-subtitle',
                );
        });
        refreshTOC();

        let ready = true;
        main.addEventListener('scroll', () => {
            if (ready) {
                ready = false;
                setTimeout(() => {
                    scrollOffset = main!.scrollTop;
                    ready = true;
                }, 100);
            }
        });
    });
</script>

{#snippet header(item: T)}
    <li>
        <a
            href="#{item.id}"
            data-sveltekit-replacestate="true"
            data-active={currentSections.includes(item.id)}
            class="block py-0.5 pl-3 border-l-2 border-l-transparent
                hover:border-l-toc data-[active=true]:border-l-toc
                hover:text-toc data-[active=true]:text-toc
                data-[active=true]:font-medium"
            onclick={e => {
                e.preventDefault();
                onclick?.();
                replaceState(new URL(page.url).also(u => u.hash = `#${item.id}`).toString(), {});
                const anchor = document.getElementById(item.id);
                if (anchor) main?.scrollTo({
                    top: anchor.offsetTop - (nav?.offsetHeight ?? 0) + 1,
                    behavior: 'smooth',
                });
            }}
        >{item.text}</a>
    </li>
{/snippet}

{#snippet links(items: A)}
    <ul class="in-[ul]:pl-4">
        {#each items as item}
            {#if Array.isArray(item)}
                {@render links(item)}
            {:else}
                {@render header(item)}
            {/if}
        {/each}
    </ul>
{/snippet}

{#if sections.length}
    <h4 id="toc-title">{t.form.toc.title}</h4>
    <nav>
        {@render links(groupNested(sections))}
    </nav>
{/if}