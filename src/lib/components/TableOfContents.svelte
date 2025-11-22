<script lang="ts">
    import type { Translations } from '$lib/translations';
    import { onMount } from 'svelte';
    import { parseTitleId, refreshTOC, registerTOC } from '$lib/helpers/globals';
    import { page } from '$app/state';
    import { replaceState } from '$app/navigation';

    const { t }: { t: Translations } = $props();

    type T = { id: string, text: string, level: number, element: HTMLHeadingElement }
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
    let currentSection = $state<string>();
    let main: HTMLElement;

    const sections = $derived(headerElements.map(element => {
        const text = element.childNodes.values().toArray().filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join(' ').trim();
        const level = Number(element.tagName.slice(1));
        const id = parseTitleId(text);

        return { id, text, level, element };
    }));
    const sectionOffset = $derived(headerElements[0]?.offsetTop ?? 0);

    onMount(() => {
        main = document.querySelector('main')!.parentNode! as HTMLElement;

        const calculateCurrent = () => {
            currentSection = sections.findLast(
                ({ element }) => main.scrollTop >= element.offsetTop - sectionOffset,
            )?.id;
        };

        registerTOC(() => {
            headerElements = [...main!.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6').values()]
                .filter(e =>
                    e.checkVisibility() &&
                    !e.classList.contains('toc-title') &&
                    !e.classList.contains('modal-title') &&
                    e.id !== 'main-title' &&
                    e.id !== 'form-subtitle',
                );
            calculateCurrent();
        });
        refreshTOC();

        main.addEventListener('scroll', () => {
            calculateCurrent();
        });
    });
</script>

<h4 class="toc-title">{t.form.toc.title}</h4>

<nav>
    {#snippet nav(items: A)}
        <ul>
            {#each items as item}
                {#if Array.isArray(item)}
                    {@render nav(item)}
                {:else}
                    <li>
                        <a
                            href="#{item.id}"
                            class={{active: item.id === currentSection}}
                            data-sveltekit-replacestate="true"
                            onclick={e => {
                                e.preventDefault()
                                replaceState(new URL(page.url).also(u => u.hash = `#${item.id}`).toString(), {})
                                const anchor = document.getElementById(item.id)
                                if (anchor) main.scrollTo({
                                    top: anchor.offsetTop - sectionOffset,
                                    behavior: 'smooth',
                                })
                            }}
                        >{item.text}</a>
                    </li>
                {/if}
            {/each}
        </ul>
    {/snippet}
    {@render nav(groupNested(sections))}
</nav>