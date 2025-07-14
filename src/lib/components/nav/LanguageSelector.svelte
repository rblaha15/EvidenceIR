<script lang="ts">
	import { page } from '$app/state';
	import { languageCodes, setUserPreferredLanguage, type LanguageCode } from '$lib/languages';
	import { languageNames } from '$lib/translations';
	import { goto } from '$app/navigation';

	const redirect = (code: LanguageCode) => {
		goto(
			'/' + code + page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search,
			{ replaceState: true },
		);
	};
</script>

<div class="dropdown">
	<button class="btn py-2 px-2 dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
		<i class="m-1 bi-globe"></i>
		<span class="mx-1">{page.data.languageCode.toUpperCase()}</span>
	</button>
	<ul class="dropdown-menu">
		{#each languageCodes.filter(it => it !== 'sk') as code}
			<li>
				<button
					class="dropdown-item d-flex align-items-center"
					class:active={page.data.languageCode === code}
					aria-pressed={page.data.languageCode === code}
					onclick={() => {
						setUserPreferredLanguage(code);
						redirect(code);
					}}
				>
					<span class="fs-6 me-2">{code.toUpperCase()}</span>
					{languageNames[code]}
					<i class="bi-check2 ms-auto" class:d-none={page.data.languageCode !== code}></i>
				</button>
			</li>
		{/each}
	</ul>
</div>
