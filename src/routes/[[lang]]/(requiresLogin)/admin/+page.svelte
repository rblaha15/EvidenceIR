<!--suppress HtmlUnknownTag -->
<script lang="ts">
    import {
        type Company,
        type Person,
        companiesList,
        usersList,
        type SparePart,
        sparePartsList,
        startFirmyListening,
        startLidiListening,
        startSparePartsListening,
        startTechniciansListening,
        type Technician,
        techniciansList,
    } from '$lib/client/realtime';
    import { type Component, onMount, untrack } from 'svelte';
    import { setTitle } from '$lib/helpers/globals.js';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import TranslationsTable from './TranslationsTable.svelte';
    import AdminTable, { type TableOptions } from './AdminTable.svelte';
    import { regulusCRN } from '$lib/helpers/ares';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';

    interface BaseTabDefinition {
        title: string,
        longerTitle?: string,
    }

    interface TableDefinition<T extends Record<string, unknown>> extends BaseTabDefinition {
        contentType: 'table',
        tableOptions: TableOptions<T>,
    }

    interface CustomDefinition extends BaseTabDefinition {
        contentType: 'custom',
        contentOptions: {
            component: Component
        }
    }

    type TabDefinition = TableDefinition<any> | CustomDefinition;

    const addCompaniesLinks = (companies: Record<string, string>) => (companies?.keys() ?? [])
        .map(c => `<a href="#companies-${c}">${c}</a>`)
        .join(', ');

    const tabs: Record<string, TabDefinition> = {
        users: {
            title: 'Uživatelé',
            longerTitle: 'Seznam uživatelů a příslušných firem',
            contentType: 'table',
            tableOptions: {
                fileType: 'csv',
                fileName: 'uzivatele',
                store: usersList,
                construct: ([email, montazky, uvadeci, responsiblePerson, koNumber]) => ({
                    email: email ?? '',
                    assemblyCompanies:
                        montazky?.split('#')?.filter((vec) => vec != '')?.associateWithSelf() ?? {},
                    commissioningCompanies:
                        uvadeci?.split('#')?.filter((vec) => vec != '')?.associateWithSelf() ?? {},
                    responsiblePerson, koNumber,
                } as Person),
                deconstruct: ({ email, assemblyCompanies, commissioningCompanies, responsiblePerson, koNumber }) => [
                    email,
                    assemblyCompanies.getValues().join('#'),
                    commissioningCompanies.getValues().join('#'),
                    responsiblePerson, koNumber,
                ],
                key: p => p.email,
                instructions: [
                    'Vložte .csv soubor oddělený středníky (;), kde v prvním sloupci je email, v druhém sloupci iča montážních firem oddělená hashy (#), v třetím slopci jsou stejně oddělená iča uvaděčů, ve čtvrtém spoupci jméno odpovědné osoby a v pátém sloupci číslo KO zaměstnance:<br />Př.: email@example.com;12345678#87654321;14725836#63852741;Jan Novák',
                ],
                columns: {
                    email: { header: 'Email', cellType: 'header' },
                    assemblyCompanies: { header: 'Montážní firmy', transformValue: addCompaniesLinks },
                    commissioningCompanies: { header: 'Uvaděči', transformValue: addCompaniesLinks },
                    responsiblePerson: { header: 'Zodpovědná osoba' },
                    koNumber: { header: 'Číslo KO' },
                },
            },
        } satisfies TableDefinition<Person>,
        companies: {
            title: 'Firmy',
            longerTitle: 'Seznam firem',
            contentType: 'table',
            tableOptions: {
                fileType: 'csv',
                fileName: 'firmy',
                store: companiesList,
                construct: ([crn, companyName, email, phone, representative]) => ({
                    crn: crn ?? '',
                    companyName: companyName ?? '',
                    email, phone, representative,
                }),
                deconstruct: ({ crn, companyName, email, phone, representative }) =>
                    [crn, companyName, email, phone, representative],
                key: c => c.crn,
                instructions: [
                    'Vložte .csv soubor oddělený středníky (;), kde každý řádek popisuje jednu montážní firmu nebo uvaděče.',
                    'V případě FO: ičo;jméno;email;telefonní číslo;jméno (znovu)<br />Př.: 12345678;Jan Novák;jan.novak@seznam.cz;+420777666555;Jan Novák',
                    'V případě PO: ičo;název firmy;email na firmu;telefonní číslo na firmu;jméno zástupce firmy<br />Př.: 87654321;Topení Novák s.r.o.;info@novak.cz;+420765765765;Jan Novák',
                    'Uvaděči Regulusu jsou vedeni na kartě <a href="#technicians">Technici</a>',
                    'Všechna pole kromě iča a názvu/jména osoby mohou být vynechána',
                ],
                columns: {
                    crn: { header: 'IČO', cellType: 'header' },
                    companyName: { header: 'Jméno' },
                    email: { header: 'Email' },
                    phone: { header: 'Telefon' },
                    representative: { header: 'Zástupce' },
                },
            },
        } satisfies TableDefinition<Company>,
        technicians: {
            title: 'Technici',
            longerTitle: 'Seznam techniků',
            contentType: 'table',
            tableOptions: {
                fileType: 'csv',
                fileName: 'technici',
                store: techniciansList,
                construct: ([name, email, phone, initials]) => ({
                    name: name ?? '',
                    email: email ?? '',
                    phone: phone ?? '',
                    initials: initials ?? '',
                }),
                deconstruct: ({ name, email, phone, initials }) => [name, email, phone, initials],
                key: c => c.email,
                instructions: [
                    `Vložte .csv soubor oddělený středníky (;), kde v prvním sloupci je email, v druhém sloupci jméno, ve třetím telefonní číslo a ve čtvrtém spoupci iniciály (do SP) technika <a href="#companies-${regulusCRN}">Regulusu</a>:<br />Př.: Jan Novák;jan.novak@regulus.cz;+420789456123;JN;6417<br />Všechna pole jsou povinná`,
                ],
                columns: {
                    name: { header: 'Jméno', cellType: 'header' },
                    email: { header: 'Email' },
                    phone: { header: 'Telefonní číslo' },
                    initials: { header: 'Iniciály do SP' },
                },
            },
        } satisfies TableDefinition<Technician>,
        translations: {
            title: 'Překlady',
            contentType: 'custom',
            contentOptions: {
                component: TranslationsTable,
            },
        },
        spareParts: {
            title: 'Náhradní díly',
            longerTitle: 'Seznam náhradních dílů',
            contentType: 'table',
            tableOptions: {
                fileType: 'xlsx',
                fileName: 'nahradni_dily',
                store: sparePartsList,
                construct: ([code, name, unitPrice]) => ({
                    name: name ?? '',
                    code: Number(code ?? 0),
                    unitPrice: Number(unitPrice ?? 0),
                }),
                deconstruct: ({ code, name, unitPrice }) => [String(code), name, String(unitPrice)],
                key: c => `${c.code}`,
                instructions: [
                    'Vložte .xlsx soubor s tabulkou náhradních dílů, která obsahuje záhlaví (1. řádek) a v prvním sloupci má číslo, v druhém sloupci název a ve třetím spoupci jednotkovou cenu ND.<br />Všechna pole jsou povinná',
                ],
                columns: {
                    code: { header: 'Číslo' },
                    name: { header: 'Název', cellType: 'header' },
                    unitPrice: { header: 'Jednotková cena', transformValue: s => s.roundTo(2).toLocaleString('cs') + ' Kč' },
                },
            },
        } satisfies TableDefinition<SparePart>,
    };

    $effect(() => {
        tabs.keys().forEach(tab => {
            const tabEl = document.querySelector(`#${tab}-tab`)!;
            tabEl.addEventListener('show.bs.tab', () => {
                if (!page.url.hash.startsWith('#' + tab))
                    goto(relUrl(`/admin#${tab}`), { replaceState: true });
            });
        });
    });

    setTitle('Admin');
</script>

<ul class="nav nav-tabs" role="tablist">
    {#each tabs.entries() as [tab, { title }], i}
        <li class="nav-item" role="presentation">
            <button
                aria-controls="{tab}-tab-pane"
                aria-selected="false"
                class="nav-link"
                class:active={untrack(() => i === 0)}
                data-bs-target="#{tab}-tab-pane"
                data-bs-toggle="tab"
                id="{tab}-tab"
                role="tab"
                type="button"
            >{title}</button>
        </li>
    {/each}
</ul>

<div class="tab-content">
    {#each tabs.entries() as [tab, t], i}
        <div
            aria-labelledby="{tab}-tab"
            class="tab-pane fade"
            id="{tab}-tab-pane"
            class:active={untrack(() => i === 0)}
            class:show={untrack(() => i === 0)}
            role="tabpanel"
            tabindex="0"
        >
            <div class="d-flex flex-column gap-3">
                <h2 class="m-0">{t.title}</h2>
                {#if t.contentType === 'table'}
                    <AdminTable options={t.tableOptions} id={tab} />
                {:else if t.contentType === 'custom'}
                    <t.contentOptions.component />
                {/if}
            </div>
        </div>
    {/each}
</div>