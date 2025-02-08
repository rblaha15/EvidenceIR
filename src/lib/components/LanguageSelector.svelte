<script lang="ts">
	import { page } from '$app/state';
	import { languageCodes, setUserPreferredLanguage, type LanguageCode } from '$lib/languages';
	import { languageNames } from '$lib/translations';

	const redirect = (code: LanguageCode) => {
		window.location.replace(
			'/' + code + page.url.pathname.slice(page.data.languageCode.length + 1) + page.url.search
		);
	};
</script>

<div class="dropdown">
	<button class="btn btn-link nav-link py-2 px-2 dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
		<i class="my-1 bi-globe"></i>
		<span class="mx-2">{page.data.languageCode.toUpperCase()}</span>
	</button>
	<ul class="dropdown-menu dropdown-menu-end">
		{#each languageCodes as code}
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
