<!--suppress HtmlUnknownTag -->
<script lang="ts">
    import { call } from '$lib/client/endpoints';
    import { type Component, onMount } from 'svelte';
    import { setTitle } from '$lib/helpers/globals.js';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import DatabaseFrame from './DatabaseFrame.svelte';
    import DataImport from './DataImport.svelte';
    import TranslationsTable from './TranslationsTable.svelte';
    import AdminTable, { type TableOptions } from './AdminTable.svelte';
    import { regulusCRN } from '$lib/helpers/ares';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import StatsGetter from './StatsGetter.svelte';
    import BackupDownloader from './BackupDownloader.svelte';
    import LoyaltyProgramManager from './LoyaltyProgramManager.svelte';
    import AdminArrays, { type ArraysOptions } from './AdminArrays.svelte';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
    import { Separator } from "$lib/components/ui/separator";
    import {
        companies,
        people,
        type Company,
        type Person,
        technicians,
        type Technician,
        spareParts, type SparePart, type Arrays, accumulationTanks, waterTanks, solarCollectors, inverters, batteries,
        fetchArrays, fetchSpareParts, fetchTechnicians, fetchCompanies, fetchPeople
    } from '$lib/client/db/arrays';

    interface BaseTabDefinition {
        title: string;
        longerTitle?: string;
        separator?: boolean;
    }

    interface TableDefinition<T, K extends string = keyof T & string> extends BaseTabDefinition {
        contentType: 'table';
        tableOptions: TableOptions<T, K>;
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

    type TabDefinition = TableDefinition<any> | CustomDefinition | ArraysDefinition<any> | LinkDefinition;

    const addCompaniesLinks = (companies: string[]) =>
        companies.map(c => `<a href="#companies-${c}">${c}</a>`).join(', ');

    const addUserLink = (email: string | undefined) => (email ? `<a href="#users-${email}">${email}</a>` : '');

    const emptyUndefined = (v: string | undefined) => v || '';

    const tabNames = ['arrays', 'users', 'companies', 'technicians', 'translations', 'loyaltyProgram', 'spareParts', 'stats', 'backup'];

    type Tab = typeof tabNames[number];

    const tabs: Record<Tab, TabDefinition> = {
        users: {
            title: 'Uživatelé',
            longerTitle: 'Seznam uživatelů a příslušných firem',
            contentType: 'table',
            tableOptions: {
                fileType: 'csv',
                fileName: 'uzivatele',
                store: people,
                construct: ([name, email, montazky, uvadeci, allowUPT, responsiblePerson, koNumber]) =>
                    ({
                        name: name ?? '',
                        email: email ?? '',
                        assemblyCompanies:
                            montazky
                                ?.split('#')
                                ?.filter(vec => vec != '') ?? [],
                        commissioningCompanies:
                            uvadeci
                                ?.split('#')
                                ?.filter(vec => vec != '') ?? [],
                        allowUPT: allowUPT == 'true',
                        responsiblePerson,
                        koNumber,
                    }) as Person,
                deconstruct: ({ name, email, assemblyCompanies, commissioningCompanies, allowUPT, responsiblePerson, koNumber }) => [
                    name,
                    email,
                    assemblyCompanies.join('#'),
                    commissioningCompanies.join('#'),
                    `${allowUPT}`,
                    responsiblePerson || '',
                    koNumber || '',
                ],
                key: p => p.email,
                instructions: [
                    'Vložte .csv soubor oddělený středníky (;), kde v každém řádku je uveden jeden uživatel aplikace.',
                    'Zaměstnanec Regulusu: jméno a příjmení;email (se jménem a příjmením*);&lt;prázdno&gt;;&lt;prázdno&gt;;true;jméno znovu;číslo KO<br />Př.: Jan Novák;jan.novak@regulus.cz;;;true;Jan Novák;123',
                    'Externí uživatel: jméno a příjmení;email;iča montážních firem oddělená křížky (#);stejně oddělená iča uvaděčů;smí vytvořit UPT? (true/false);jméno odpovědné osoby;&lt;prázdno&gt;<br />Př.: Petr Černý;petr@cerny.cz;12345678#87654321;14725836#63852741;true;Jan Novák;',
                    'Zaměstnance není nutné v této tabulce uvádět, využití jsou jen specifikování čísla KO (potřeba pro odesílání NK) a pro určení jména (není nutné, popř. lze i v tabulce techniků)',
                    '* výjimky: komanek@regulus.cz, cervenka@regulus.cz, kocar@regulus.cz, malucha@regulus.cz, novak@regulus.cz, tereza@regulus.cz, martin@regulus.cz, blaha@regulus.cz, blahova@regulus.cz ',
                ],
                columns: {
                    name: { header: 'Jméno a příjmení' },
                    email: { header: 'Email', cellType: 'header' },
                    assemblyCompanies: { header: 'Montážní firmy', transformValue: addCompaniesLinks },
                    commissioningCompanies: { header: 'Uvaděči', transformValue: addCompaniesLinks },
                    allowUPT: { header: 'Vytvořit UPT?' },
                    responsiblePerson: { header: 'Zodpovědná osoba' },
                    koNumber: { header: 'Číslo KO', transformValue: emptyUndefined },
                },
                sendData: array => call('db/admin/setUsers', { array }).then(fetchPeople),
            },
        } satisfies TableDefinition<Person>,
        companies: {
            title: 'Firmy',
            longerTitle: 'Seznam firem',
            contentType: 'table',
            tableOptions: {
                fileType: 'csv',
                fileName: 'firmy',
                store: companies,
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
                key: c => c.crn,
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
                    email: { header: 'Email', transformValue: emptyUndefined },
                    phone: { header: 'Telefon', transformValue: emptyUndefined },
                    representative: { header: 'Zástupce', transformValue: emptyUndefined },
                    representativeUserEmail: { header: 'Uživatel', transformValue: addUserLink },
                },
                sendData: array => call('db/admin/setCompanies', { array }).then(fetchCompanies),
            },
        } satisfies TableDefinition<Company>,
        technicians: {
            title: 'Technici',
            longerTitle: 'Seznam techniků',
            contentType: 'table',
            tableOptions: {
                fileType: 'csv',
                fileName: 'technici',
                store: technicians,
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
                sendData: array => call('db/admin/setTechnicians', { array }).then(fetchTechnicians),
            },
        } satisfies TableDefinition<Technician>,
        spareParts: {
            title: 'Náhradní díly',
            longerTitle: 'Seznam náhradních dílů',
            contentType: 'table',
            tableOptions: {
                fileType: 'xlsx',
                fileName: 'nahradni_dily',
                store: spareParts,
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
                sendData: array => call('db/admin/setSpareParts', { array }).then(fetchSpareParts),
            },
        } satisfies TableDefinition<SparePart>,
        arrays: {
            title: 'Seznamy',
            contentType: 'arrays',
            arraysOptions: {
                fileType: 'xlsx',
                fileName: 'seznamy',
                instructions: [
                    'Vložte .xlsx soubor se seznamy akumulačních nádrží, zásobníků, solárních kolektorů, střídačů a baterií, který obsahuje záhlaví (1. řádek) a sloupce s názvy.',
                ],
                arrays: {
                    accumulationTanks: {
                        header: 'Nádrže',
                        excelHeader: 'nadrze',
                        store: accumulationTanks,
                    },
                    waterTanks: {
                        header: 'Zásobníky',
                        excelHeader: 'zasobniky',
                        store: waterTanks,
                    },
                    solarCollectors: {
                        header: 'Kolektory',
                        excelHeader: 'kolektory',
                        store: solarCollectors,
                    },
                    inverters: {
                        header: 'Střídače',
                        excelHeader: 'stridace',
                        store: inverters,
                    },
                    batteries: {
                        header: 'Baterie',
                        excelHeader: 'baterie',
                        store: batteries,
                    },
                },
                sendData: arrays => call('db/admin/setArrays', arrays).then(fetchArrays),
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

<Tabs bind:value={currentTab} onValueChange={onTabChange} orientation="vertical" class="flex w-full relative items-start">
    <div class="sticky top-0 -mt-4 pt-4">
        <h1 class="pl-2.5">Admin</h1>
        <TabsList>
            {#each tabs.entries() as [tab, { title, separator }]}
                <TabsTrigger value={tab}>{title}</TabsTrigger>
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
                    <AdminArrays options={t.arraysOptions} id={tab} />
                {:else if t.contentType === 'custom'}
                    <t.contentOptions.component />
                {/if}
            </div>
        </TabsContent>
    {/each}
</Tabs>