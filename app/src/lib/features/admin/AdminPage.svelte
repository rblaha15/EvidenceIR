<!--suppress HtmlUnknownTag -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import arrays, {
        type Arrays,
        type Company, type HetaPumpDetails,
        type Person,
        type SparePart,
        type Technician,
    } from '$lib/client/db/arrays';
    import { call } from '$lib/client/endpoints';
    import { Separator } from '$lib/components/ui/separator';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import type { ValueType } from '$lib/features/admin/AdminTable.svelte';
    import UserActivity from '$lib/features/admin/UserActivity.svelte';
    import { setTitle } from '$lib/helpers/globals.js';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { type Component, onMount } from 'svelte';
    import AdminArrays, { type ArraysOptions } from './AdminArrays.svelte';
    import AdminTable, { type TableOptions } from './AdminTable.svelte';
    import BackupDownloader from './BackupDownloader.svelte';
    import DatabaseFrame from './DatabaseFrame.svelte';
    import DataImport from './DataImport.svelte';
    import LoyaltyProgramManager from './LoyaltyProgramManager.svelte';
    import StatsGetter from './StatsGetter.svelte';
    import TranslationsTable from './TranslationsTable.svelte';

    interface BaseTabDefinition {
        title: string;
        longerTitle?: string;
        separator?: boolean;
    }

    interface TableDefinition<T extends Record<string, ValueType>, Key extends keyof T> extends BaseTabDefinition {
        contentType: 'table';
        tableOptions: TableOptions<T, Key>;
    }

    interface ArraysDefinition<K extends string> extends BaseTabDefinition {
        contentType: 'arrays';
        arraysOptions: ArraysOptions<K>;
    }

    interface CustomDefinition extends BaseTabDefinition {
        contentType: 'custom';
        contentOptions: {
            component: Component;
        };
    }

    interface LinkDefinition extends BaseTabDefinition {
        contentType: 'link';
        href: string;
    }

    type TabDefinition = TableDefinition<any, any> | CustomDefinition | ArraysDefinition<any> | LinkDefinition;

    const addCompaniesLinks = (companies: string[]) =>
        companies.map(c => `<a href="#companies-${c}">${c}</a>`).join(', ');

    const addUserLink = (email: string | undefined) => (email ? `<a href="#users-${email}">${email}</a>` : '');

    const tabNames = ['arrays', 'users', 'companies', 'technicians', 'translations', 'loyaltyProgram', 'spareParts', 'stats', 'backup'];

    type Tab = typeof tabNames[number];

    const tabs: Record<Tab, TabDefinition> = {
        users: {
            title: 'Uživatelé',
            longerTitle: 'Seznam uživatelů a příslušných firem',
            contentType: 'table',
            tableOptions: {
                store: arrays.people,
                key: 'email',
                instructions: [
                    'Tabulka popisuje uživatele aplikace.',
                    'Zaměstnance Regulus není nutné v této tabulce uvádět, využití jsou jen specifikování čísla KO (potřeba pro odesílání NK), pole montážky, uvaděčí, ani vytvořit UPT u zaměstnanců nehraje roli.',
                    'Pro externí uživatele je povinné každé pole, krom čísla KO, které musí být prázdné.<br />Pro zaměstnance je povinné jméno a email (se jménem i příjmením*)',
                    '* výjimky: komanek@regulus.cz, blaha@regulus.cz, blahova@regulus.cz.',
                ],
                columns: {
                    name: { header: 'Jméno a příjmení' },
                    email: { header: 'Email', cellType: 'header' },
                    allowUPT: { header: 'Vytvořit UPT?', type: 'boolean' },
                    assemblyCompanies: { header: 'Montážní firmy', type: 'textArray', transformValue: addCompaniesLinks },
                    commissioningCompanies: { header: 'Uvaděči', type: 'textArray', transformValue: addCompaniesLinks },
                    responsiblePerson: { header: 'Odpovědná osoba', optional: true },
                    koNumber: { header: 'Číslo KO', optional: true },
                },
                sendData: array => call('db/admin/setUsers', { array }).then(arrays.fetchPeople),
                editable: {
                    defaultValue: {
                        name: '', email: '', assemblyCompanies: [], commissioningCompanies: [], allowUPT: false,
                    },
                },
            },
        } satisfies TableDefinition<Person, 'email'>,
        companies: {
            title: 'Firmy',
            longerTitle: 'Seznam firem',
            contentType: 'table',
            tableOptions: {
                file: {
                    fileType: 'csv',
                    fileName: 'firmy',
                    construct: ([crn, companyName, email, phone, representative, representativeUserEmail]) => ({
                        crn: crn!,
                        companyName: companyName!,
                        email,
                        phone,
                        representative,
                        representativeUserEmail,
                    }),
                    deconstruct: ({ crn, companyName, email, phone, representative, representativeUserEmail }) => [
                        crn,
                        companyName,
                        email || '',
                        phone || '',
                        representative || '',
                        representativeUserEmail || '',
                    ],
                },
                store: arrays.companies,
                key: 'crn',
                instructions: [
                    'Vložte .csv soubor oddělený středníky (;), kde každý řádek popisuje jednu montážní firmu nebo uvaděče.',
                    'V případě FO: ičo;jméno;email;telefonní číslo;jméno (znovu);uživatelský email (pokud se neshoduje)<br />Př.: 12345678;Jan Novák;info@novak.cz;+420777666555;Jan Novák;jan.novak@seznam.cz',
                    'V případě PO: ičo;název firmy;email na firmu;telefonní číslo na firmu;jméno zástupce firmy;uživatelský email zástupce<br />Př.: 87654321;Topení Novák s.r.o.;info@novak.cz;+420765765765;Jan Novák;jan.novak@seznam.cz',
                    'Uvaděči Regulusu jsou vedeni na kartě <a href="#technicians">Technici</a>',
                    'Všechna pole kromě iča a názvu/jména osoby mohou být vynechána',
                ],
                columns: {
                    crn: { header: 'IČO', cellType: 'header' },
                    companyName: { header: 'Jméno' },
                    email: { header: 'Email', optional: true },
                    phone: { header: 'Telefon', optional: true },
                    representative: { header: 'Zástupce', optional: true },
                    representativeUserEmail: { header: 'Uživatel', optional: true, transformValue: addUserLink },
                },
                sendData: array => call('db/admin/setCompanies', { array }).then(arrays.fetchCompanies),
                editable: {
                    defaultValue: {
                        crn: '',
                        companyName: '',
                    },
                },
            },
        } satisfies TableDefinition<Company, 'crn'>,
        technicians: {
            title: 'Technici',
            longerTitle: 'Seznam techniků',
            contentType: 'table',
            tableOptions: {
                store: arrays.technicians,
                key: 'email',
                instructions: [
                    'Tabulka popisuje techniky regulusu.',
                    'Všechna pole jsou povinná.',
                ],
                columns: {
                    name: { header: 'Jméno', cellType: 'header' },
                    email: { header: 'Email' },
                    phone: { header: 'Telefonní číslo' },
                    initials: { header: 'Iniciály do SP' },
                },
                sendData: array => call('db/admin/setTechnicians', { array }).then(arrays.fetchTechnicians),
                editable: {
                    defaultValue: {
                        name: '',
                        email: '',
                        phone: '',
                        initials: '',
                    },
                },
            },
        } satisfies TableDefinition<Technician, 'email'>,
        spareParts: {
            title: 'Náhradní díly',
            longerTitle: 'Seznam náhradních dílů',
            contentType: 'table',
            tableOptions: {
                file: {
                    fileType: 'xlsx',
                    fileName: 'nahradni_dily',
                    construct: ([code, name, unitPrice]) => ({
                        name: name ?? '',
                        code: Number(code ?? 0),
                        unitPrice: Number(unitPrice ?? 0),
                    }),
                    deconstruct: ({ code, name, unitPrice }) => [String(code), name, String(unitPrice)],
                },
                store: arrays.spareParts,
                key: 'code',
                instructions: [
                    'Tabulka náhradních dílů. Pro úpravu nahrajte vhodný .xlsx soubor.',
                    'Všechna pole jsou povinná.',
                ],
                columns: {
                    code: { header: 'Číslo', type: 'number' },
                    name: { header: 'Název', cellType: 'header' },
                    unitPrice: { header: 'Jednotková cena', type: 'price' },
                },
                sendData: array => call('db/admin/setSpareParts', { array }).then(arrays.fetchSpareParts),
            },
        } satisfies TableDefinition<SparePart, 'code'>,
        heatPumps: {
            title: 'Tepelná čerpadla',
            longerTitle: 'Seznam tepelných čerpadel',
            contentType: 'table',
            tableOptions: {
                store: arrays.heatPumps,
                key: 'model',
                instructions: [
                    'Tabulka tepelných čerpadel',
                    'Všechna pole jsou povinná.',
                ],
                columns: {
                    model: { header: 'Model', type: 'text' },
                    category: { header: 'Druh', type: 'options', options: ['CTC', 'RTC', 'ThermonaRTC', 'EcoHeatCTC'] },
                    type: { header: 'Typ', type: 'options', options: ['airToWater', 'groundToWater'] },
                    numberFormat: { header: 'Formát čísla', type: 'text' },
                    hide: { header: 'Schovat mezi další možnosti', type: 'boolean' },
                    number: { header: 'Pořadí', type: 'number' },
                },
                sendData: array => call('db/admin/setHeatPumps', { array }).then(arrays.fetchHeatPumps),
                editable: {
                    defaultValue: {
                        model: '', category: 'CTC', type: 'airToWater', numberFormat: '*', hide: false, number: 1,
                    },
                },
                nosort: true,
            },
        } satisfies TableDefinition<HetaPumpDetails, 'model'>,
        arrays: {
            title: 'Seznamy',
            contentType: 'arrays',
            arraysOptions: {
                fileType: 'xlsx',
                fileName: 'seznamy',
                instructions: [
                    'Pro úpravu nahrajte vhodný .xlsx soubor.',
                ],
                arrays: {
                    accumulationTanks: {
                        header: 'Nádrže',
                        excelHeader: 'nadrze',
                        store: arrays.accumulationTanks,
                    },
                    waterTanks: {
                        header: 'Zásobníky',
                        excelHeader: 'zasobniky',
                        store: arrays.waterTanks,
                    },
                    solarCollectors: {
                        header: 'Kolektory',
                        excelHeader: 'kolektory',
                        store: arrays.solarCollectors,
                    },
                    inverters: {
                        header: 'Střídače',
                        excelHeader: 'stridace',
                        store: arrays.inverters,
                    },
                    batteries: {
                        header: 'Baterie',
                        excelHeader: 'baterie',
                        store: arrays.batteries,
                    },
                    fvePanels: {
                        header: 'FVE Panely',
                        excelHeader: 'panely',
                        store: arrays.fvePanels,
                    },
                },
                sendData: a => call('db/admin/setArrays', a).then(arrays.fetchArrays),
            },
            separator: true,
        } satisfies ArraysDefinition<Arrays>,
        translations: {
            title: 'Překlady',
            contentType: 'custom',
            contentOptions: {
                component: TranslationsTable,
            },
            separator: true,
        },
        db: {
            title: 'Databáze',
            contentType: 'custom',
            contentOptions: {
                component: DatabaseFrame,
            },
        } satisfies CustomDefinition,
        stats: {
            title: 'Statistiky',
            contentType: 'custom',
            contentOptions: {
                component: StatsGetter,
            },
            longerTitle: 'Statistiky vytvořených servisních protokolů',
        },
        usersActivity: {
            title: 'Aktivita',
            contentType: 'custom',
            contentOptions: {
                component: UserActivity,
            },
            longerTitle: 'Aktivita uživatelů',
        },
        loyaltyProgram: {
            title: 'Věrnostní program',
            contentType: 'custom',
            contentOptions: {
                component: LoyaltyProgramManager,
            },
            separator: true,
        },
        backup: {
            title: 'Záloha',
            contentType: 'custom',
            contentOptions: {
                component: BackupDownloader,
            },
            longerTitle: 'Stáhnout zálohu databáze',
        },
        import: {
            title: 'Import',
            contentType: 'custom',
            contentOptions: {
                component: DataImport,
            },
            longerTitle: 'Import dat',
        },
    };

    const onTabChange = () => {
        goto(relUrl(`/admin#${currentTab}`), { replaceState: true });
    };

    let currentTab = $derived(page.url.hash.split('#')?.[1]?.split('-')?.[0] ?? tabs.keys()[0] as Tab);

    onMount(() => setTitle('Admin', false, false, true));
</script>

<Tabs bind:value={currentTab} class="flex w-full relative items-start" onValueChange={onTabChange}
      orientation="vertical" id="admin-tabs">
    <div class="sticky top-0 -mt-4 pt-4">
        <h1 class="pl-2.5">Admin</h1>
        <TabsList>
            {#each tabs.entries() as [tab, { title, separator }]}
                <TabsTrigger value={tab}>
                    {#snippet child({ props: { onclick, onfocus, onkeydown, ...props } })}
                        <a {...props} href="#{tab}">{title}</a>
                    {/snippet}
                </TabsTrigger>
                {#if separator}
                    <Separator class="my-2" />
                {/if}
            {/each}
        </TabsList>
    </div>
    {#each tabs.entries() as [tab, t]}
        <TabsContent value={tab} class="min-w-0">
            <div class="flex flex-col gap-4">
                <h2 class="m-0">{t.longerTitle || t.title}</h2>
                {#if t.contentType === 'table'}
                    <AdminTable options={t.tableOptions} id={tab} />
                {:else if t.contentType === 'arrays'}
                    <AdminArrays options={t.arraysOptions} />
                {:else if t.contentType === 'custom'}
                    {@const Component = t.contentOptions.component}
                    <Component />
                {/if}
            </div>
        </TabsContent>
    {/each}
</Tabs>