<script lang="ts">
    import { languageNames } from '$lib/translations';
    import languageCodes, { type LanguageCode } from '$lib/languageCodes';
    import { Languages } from "@lucide/svelte";
    import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "$lib/components/ui/select";

    const {
        onChange, options = languageCodes, selected, readonly,
    }: {
        onChange: (code: LanguageCode) => Promise<void> | void;
        options?: readonly LanguageCode[];
        selected: LanguageCode | string;
        readonly?: boolean;
    } = $props();

    const onValueChange = (code: string) => {
        onChange(code as LanguageCode);
    };
</script>

<Select {onValueChange} type="single" value={selected} disabled={readonly}>
    <SelectTrigger hideChevron={readonly}>
        <Languages />
        {selected.toUpperCase()}
    </SelectTrigger>
    <SelectContent>
        <SelectGroup>
            {#each options.filter(it => it !== 'sk') as code}
                <SelectItem
                    value={code}
                    label={code.toUpperCase()}
                >
                    <span class="text-lg">{code.toUpperCase()}</span>
                    {languageNames[code]}
                </SelectItem>
            {/each}
        </SelectGroup>
    </SelectContent>
</Select>