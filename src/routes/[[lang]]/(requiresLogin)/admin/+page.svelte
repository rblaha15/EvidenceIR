<script lang="ts">
    import { getToken } from '$lib/client/auth';
    import { type Company, type Person, seznamFirmy, seznamLidi, startFirmyListening, startLidiListening } from '$lib/client/realtime';
    import download from 'downloadjs';
    import { onMount } from 'svelte';
    import { allKeys, getTranslations } from '$lib/translations';
    import { languageCodes } from '$lib/languages';
    import type { Template } from '$lib/helpers/templates';
    import { page } from '$app/stores';
    import { relUrl } from '$lib/helpers/stores';
    import { companies } from '../new/companies';
    import PeopleTable from './PeopleTable.svelte';
    import CompaniesTable from './CompaniesTable.svelte';

    onMount(async () => {
        await startLidiListening();
        await startFirmyListening();
    });

    let loading = $state(false);

    const poVybraniPeople = (
        ev: Event & {
            currentTarget: EventTarget & HTMLInputElement;
        }
    ) => {
        const file = ev.currentTarget.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = async (evt) => {
                const text = evt.target?.result as string | null;
                newDataPeople = (text ?? '')
                    .split('\n')
                    .filter((radek) => radek != '')
                    .map((radek) => radek.split(';').filter((vec) => vec != ''))
                    .map(([email, montazky, uvadeci, osoba]) => ({
                        email,
                        assembly: montazky.split('#').filter((vec) => vec != ''),
                        commissioning: uvadeci.split('#').filter((vec) => vec != ''),
                        responsible: osoba
                    }))
                    .map(({ assembly, commissioning, email, responsible }) => ({
                        email,
                        assemblyCompanies: Object.fromEntries(assembly.map((crn) => [crn, crn])),
                        commissioningCompanies: Object.fromEntries(commissioning.map((crn) => [crn, crn])),
                        responsiblePerson: responsible
                    })) as Person[];
            };
        }
    };
    const poVybraniCompanies = (
        ev: Event & {
            currentTarget: EventTarget & HTMLInputElement;
        }
    ) => {
        const file = ev.currentTarget.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = async (evt) => {
                const text = evt.target?.result as string | null;
                newDataCompanies = (text ?? '')
                    .split('\n')
                    .filter((radek) => radek != '')
                    .map((radek) => radek.split(';').map((vec) => (vec != '' ? vec : undefined)))
                    .map(([crn, companyName, email, phone, representative]) => ({
                        crn,
                        companyName,
                        email,
                        phone,
                        representative
                    })) as Company[];
            };
        }
    };

    const stahnoutPeople = () => {
        download(new File([oldDataPeople.map(
            ({ email, assemblyCompanies, commissioningCompanies, responsiblePerson }) =>
                `${email};${Object.values(assemblyCompanies).join('#')};${Object.values(commissioningCompanies).join('#')};${responsiblePerson ?? ''}`.trim()
        ).join('\n')], 'lidi.csv'), 'lidi.csv', 'text/csv');
    };

    const potvrditPeople = async () => {
        loading = true;

        const token = await getToken();

        await fetch(`/api/aktualizovat?type=lidi&token=${token}`, {
            method: 'POST',
            body: JSON.stringify({
                people: newDataPeople
            })
        });
        loading = false;
        newDataPeople = [];
    };

    const stahnoutCompanies = () => {
        download(new File([oldDataCompanies.map(({ crn, companyName, email, phone, representative }) =>
            `${crn};${companyName};${email ?? ''};${phone ?? ''};${representative ?? ''}`.trim()
        ).join('\n')], 'firmy.csv'), 'firmy.csv', 'text/csv');
    };

    const potvrditCompanies = async () => {
        loading = true;

        const token = await getToken();

        await fetch(`/api/aktualizovat?type=firmy&token=${token}`, {
            method: 'POST',
            body: JSON.stringify({
                companies: newDataCompanies
            })
        });
        loading = false;
        newDataCompanies = [];
    };

    const sort = (o: Record<string, any> | undefined): Record<string, any> | undefined => o ? Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b))) : undefined;

    const compareByEmail = (p1: Person, p2: Person) => p1.email.localeCompare(p2.email);
    const oldDataPeople = $derived($seznamLidi.toSorted(compareByEmail));

    let newDataPeople = $state(<Person[]> []);
    const pEmail = (p: Person) => p.email;
    const pByEmail = (people: Person[], email: string) => people.find(p => p.email === email);
    const oldEmailsPeople = $derived(oldDataPeople.map(pEmail));
    const newEmailsPeople = $derived(newDataPeople.map(pEmail));
    const changesPeople = $derived(newDataPeople.filter(p => oldEmailsPeople.includes(p.email) && JSON.stringify(sort(pByEmail(oldDataPeople, p.email) ?? p)) != JSON.stringify(sort(p))));
    const removalsPeople = $derived(oldDataPeople.filter(p => !newEmailsPeople.includes(p.email)));
    const additionsPeople = $derived(newDataPeople.filter(p => !oldEmailsPeople.includes(p.email)));

    const compareByCRN = (c1: Company, c2: Company) => c1.crn.localeCompare(c2.crn);
    const oldDataCompanies = $derived($seznamFirmy.toSorted(compareByCRN));
    let newDataCompanies = $state(<Company[]> []);

    const cCRN = (c: Company) => c.crn;
    const cByCRN = (companies: Company[], crn: string) => companies.find(c => c.crn === crn);
    const oldEmailsCompanies = $derived(oldDataCompanies.map(cCRN));
    const newEmailsCompanies = $derived(newDataCompanies.map(cCRN));
    const changesCompanies = $derived(newDataCompanies.filter(c => oldEmailsCompanies.includes(c.crn) && JSON.stringify(sort(cByCRN(oldDataCompanies, c.crn) ?? c)) != JSON.stringify(sort(c))));
    const removalsCompanies = $derived(oldDataCompanies.filter(c => !newEmailsCompanies.includes(c.crn)));
    const additionsCompanies = $derived(newDataCompanies.filter(c => !oldEmailsCompanies.includes(c.crn)));

    const parseSelf = (template: Template<(string | number)[]>) => template.parseTemplate(
        Object.fromEntries(template[1].map(it => [it, `{${it}}`] as const))
    );

    onMount(async () => {
        ['people', 'companies', 'translations'].forEach(tab => {
            const tabEl = document.querySelector(`#${tab}-tab`)!;
            tabEl.addEventListener('show.bs.tab', _ => {
                if (!location.hash.startsWith('#' + tab))
                    location.replace($relUrl(`/admin#${tab}`));
            });
        });
    });
    $effect(() => {
        $page.url;
        if (oldDataCompanies) {
            (async () => {
                const { Tab } = await import('bootstrap');
                if ($page.url.hash) new Tab(`${$page.url.hash.split('-')[0]}-tab`).show();
                if ($page.url.hash.includes('companies-')) {
                    const crn = $page.url.hash.split('-')[1];
                    document.getElementById(crn)?.scrollIntoView();
                }
            })();
        }
    });
    const addColor = <T>(array: T[], color: string) => array.map(it => [it, color] as [T, string]);
    const addColors = <T>(additions: T[], changes: T[], removals: T[]) => [
        ...addColor(additions, 'success'),
        ...addColor(changes, 'warning'),
        ...addColor(removals, 'danger'),
    ];
</script>

<h1>Admin</h1>

<ul class="nav nav-tabs" role="tablist">
    <li class="nav-item" role="presentation">
        <button
            aria-controls="people-tab-pane"
            aria-selected="true"
            class="nav-link active"
            data-bs-target="#people-tab-pane"
            data-bs-toggle="tab"
            id="people-tab"
            role="tab"
            type="button">Uživatelé
        </button
        >
    </li>
    <li class="nav-item" role="presentation">
        <button
            aria-controls="companies-tab-pane"
            aria-selected="false"
            class="nav-link"
            data-bs-target="#companies-tab-pane"
            data-bs-toggle="tab"
            id="companies-tab"
            role="tab"
            type="button">Firmy
        </button
        >
    </li>
    <li class="nav-item" role="presentation">
        <button
            aria-controls="translations-tab-pane"
            aria-selected="false"
            class="nav-link"
            data-bs-target="#translations-tab-pane"
            data-bs-toggle="tab"
            id="translations-tab"
            role="tab"
            type="button">Překlady
        </button
        >
    </li>
</ul>
<div class="tab-content">
    <div
        aria-labelledby="people-tab"
        class="tab-pane fade show active"
        id="people-tab-pane"
        role="tabpanel"
        tabindex="0"
    >
        <h2>Seznam uživatelů a příslušných firem</h2>
        <p class="mt-3 mb-0">
            Vložte .csv soubor oddělený středníky (;), kde v prvním sloupci je email, v druhém sloupci iča
            montážních firem oddělená hashy (#), v třetím slopci jsou stejně oddělená iča uvaděčů a ve
            čtvrtém spoupci jméno odpovědné osoby: <br />
            Př.: email@example.com;12345678#87654321;14725836#63852741;Jan Novák
        </p>

        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center mt-2">
            {#if loading}
                <div class="d-flex align-items-center">
                    <span>Odesílání dat</span>
                    <div class="spinner-border text-danger ms-2"></div>
                </div>
            {:else if newDataPeople.length === 0}
                <button
                    type="button"
                    class="btn btn-primary"
                    onclick={() => document.getElementById('file-people')?.click()}
                >
                    Vybrat soubor
                </button>
            {:else}
                <button type="button" class="btn btn-danger" onclick={potvrditPeople}>
                    Potvrdit změny
                </button>
                <button
                    type="button"
                    class="btn btn-outline-info mt-2 ms-md-2 mt-md-0"
                    onclick={() => (newDataPeople = [])}
                >
                    Zrušit změny
                </button>
                <button
                    type="button"
                    class="btn btn-outline-info mt-2 ms-md-2 mt-md-0"
                    onclick={() => document.getElementById('file-people')?.click()}
                >
                    Vybrat jiný soubor
                </button>
            {/if}
            <button
                class="btn btn-outline-primary mt-2 ms-md-2 mt-md-0"
                onclick={stahnoutPeople}
                type="button"
            >
                Stáhnout aktuální data
            </button>
        </div>

        {#if newDataPeople.length !== 0 && !loading}
            <h4 class="mt-3">Změny, které se chystáte provést:</h4>
            {#if additionsPeople.length === 0 && removalsPeople.length === 0 && changesPeople.length === 0}
                <p>Žádné změny</p>
            {/if}
            <PeopleTable peopleWithColors={addColors(additionsPeople,changesPeople,removalsPeople)} />
        {/if}

        <div class="mt-3">
            <h4>Aktuálně uložená data:</h4>
            <PeopleTable people={oldDataPeople} />
        </div>

        <input
            accept="text/csv"
            id="file-people"
            onchange={poVybraniPeople}
            style="display: none;"
            type="file"
        />
    </div>
    <div
        aria-labelledby="companies-tab"
        class="tab-pane fade"
        id="companies-tab-pane"
        role="tabpanel"
        tabindex="0"
    >
        <h2>Seznam firem</h2>
        <p class="mt-3">
            Vložte .csv soubor oddělený středníky (;), kde každý řádek popisuje jednu montážní firmu nebo
            uvaděče.
        </p>
        <p>
            V případě FO: ičo;jméno;email;telefonní číslo;jméno (znovu) <br />
            Př.: 12345678;Jan Novák;jan.novak@seznam.cz;+420777666555;Jan Novák
        </p>
        <p>
            V případě PO: ičo;název firmy;email na firmu;telefonní číslo na firmu;jméno zástupce firmy <br
        />
            Př.: 87654321;Topení Novák s.r.o.;info@novak.cz;+420765765765;Jan Novák
        </p>
        <p class="mb-0">Všechna pole kromě iča a názvu/jména osoby mohou být vynechána</p>

        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center mt-2">
            {#if loading}
                <div class="d-flex align-items-center">
                    <span>Odesílání dat</span>
                    <div class="spinner-border text-danger ms-2"></div>
                </div>
            {:else if newDataCompanies.length === 0}
                <button
                    type="button"
                    class="btn btn-primary"
                    onclick={() => document.getElementById('file-companies')?.click()}
                >
                    Vybrat soubor
                </button>
            {:else}
                <button type="button" class="btn btn-danger" onclick={potvrditCompanies}>
                    Potvrdit změny
                </button>
                <button
                    type="button"
                    class="btn btn-outline-info mt-2 ms-md-2 mt-md-0"
                    onclick={() => (newDataCompanies = [])}
                >
                    Zrušit změny
                </button>
                <button
                    type="button"
                    class="btn btn-outline-info mt-2 ms-md-2 mt-md-0"
                    onclick={() => document.getElementById('file-companies')?.click()}
                >
                    Vybrat jiný soubor
                </button>
            {/if}
            <button
                class="btn btn-outline-primary mt-2 ms-md-2 mt-md-0"
                onclick={stahnoutCompanies}
                type="button"
            >
                Stáhnout aktuální data
            </button>
        </div>

        {#if newDataCompanies.length !== 0 && !loading}
            <h4 class="mt-3">Změny, které se chystáte provést:</h4>
            {#if additionsCompanies.length === 0 && removalsCompanies.length === 0 && changesCompanies.length === 0}
                <p>Žádné změny</p>
            {/if}
            <CompaniesTable companiesWithColors={addColors(additionsCompanies,changesCompanies,removalsCompanies)} />
        {/if}

        <div class="mt-3">
            <h4>Aktuálně uložená data:</h4>
            <CompaniesTable companies={oldDataCompanies} />
        </div>

        <input
            accept="text/csv"
            id="file-companies"
            onchange={poVybraniCompanies}
            style="display: none;"
            type="file"
        />
    </div>
    <div
        aria-labelledby="translations-tab"
        class="tab-pane fade"
        id="translations-tab-pane"
        role="tabpanel"
        tabindex="0"
    >
        <h2>Překlady</h2>
        <table class="table text-break table-striped table-hover">
            <thead>
            <tr>
                <th>ID</th>
                {#each languageCodes as lang}
                    <th>{lang.toUpperCase()}</th>
                {/each}
            </tr>
            </thead>
            <tbody>
            {#each allKeys as tr}
                <tr>
                    <th>{tr}</th>
                    {#each languageCodes as lang}
                        {@const v = getTranslations(lang).getMaybeTemplate(tr)}
                        {@const cs = getTranslations('cs').getMaybeTemplate(tr)}
                        {@const en = getTranslations('en').getMaybeTemplate(tr)}
                        <td class="col-3"
                            class:table-danger={lang !== 'cs' && cs === v}
                            class:table-warning={lang !== 'en' && lang !== 'cs' && en === v}>
                            {#if typeof v === 'string'}
                                {v}
                            {:else}
                                {parseSelf(v)}
                            {/if}
                        </td>
                    {/each}
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
</div>
