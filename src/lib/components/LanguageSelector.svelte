<script lang="ts">
	import { page } from '$app/stores';
	import { languageCodes, setUserPreferedLanguage, type LanguageCode } from '$lib/languages';
	import { languageFlags, languageNames } from '$lib/translations';
	import 'flag-icons/css/flag-icons.min.css';

	const redirect = (code: LanguageCode) => {
		window.location.replace($page.route.id!.replace('[lang]', code) + $page.url?.search ?? '');
	};
</script>

<div class="dropdown">
	<button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown">
		<!-- <span class="me-1 fi fi-{languageFlags[$page.data.languageCode]}" /> -->
		<span class="me-1 fi fi-eu" />
		<span style="font-size: 1.25rem">{$page.data.languageCode.toUpperCase()}</span>
		<!-- {languageNames[$page.data.languageCode]} -->
	</button>
	<ul class="dropdown-menu">
		{#each languageCodes as code}
			<li>
				<button
					class="dropdown-item"
					on:click={() => {
						setUserPreferedLanguage(code);
						redirect(code);
					}}
				>
                    <span style="font-size: 1.25rem">{code.toUpperCase()}</span>
					<!-- <span class="me-1 fi fi-{languageFlags[code]}" /> -->
					{languageNames[code]}
				</button>
			</li>
		{/each}
	</ul>
</div>
