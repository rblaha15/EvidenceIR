<script lang="ts">
	import { page } from '$app/stores';
	import { languageCodes, setUserPreferedLanguage, type LanguageCode } from '$lib/languages';
	import { languageFlags, languageNames } from '$lib/translations';
	import 'flag-icons/css/flag-icons.min.css';

	const redirect = (code: LanguageCode) => {
		window.location.replace("/" + code + $page.url.pathname.slice($page.data.languageCode.length + 1));
	};
</script>

<div class="dropdown">
	<button type="button" class="btn dropdown-toggle" data-bs-toggle="dropdown">
		<span class="me-1 fi fi-eu" />
		<span class="fs-5">{$page.data.languageCode.toUpperCase()}</span>
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
                    <span class="fs-5">{code.toUpperCase()}</span>
					{languageNames[code]}
				</button>
			</li>
		{/each}
	</ul>
</div>
