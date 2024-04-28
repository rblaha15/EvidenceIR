<script lang="ts">
	import { page } from '$app/stores';
	import { prihlasit } from '$lib/firebase';

	let email: string;
	let heslo: string;

	let error: string | null = null;

	function prihlasitSe() {
		error = '';
		prihlasit(email, heslo)
			.then(() => (window.location.href = `${$page.url.origin}/`))
			.catch((e) => {
				console.log(e.code);
				if (e.code == 'auth/network-request-failed') {
					error = 'Zkontrolujte připojení k internetu!';
				} else if (e.code == 'auth/user-not-found') {
					error = `Takový účet neexistuje! <a href="/signup?email=${email}">Vytvořit ho?</a>`;
				} else if (e.code == 'auth/wrong-password') {
					error = 'Špatné heslo!';
				} else if (e.code == 'auth/too-many-requests') {
					error = 'Moc žádostí! Počkejte prosím chvíli';
				} else {
					error = 'Něco se nepovedlo :\\';
				}
			});
	}
</script>

<div class="container my-3">
	<h1>Přihlášení</h1>

	<form>
		<div class="mt-3">
			<input
				autocomplete="email"
				type="email"
				class="form-control"
				placeholder="Email"
				bind:value={email}
			/>
		</div>
		<div class="mt-3">
			<input
				autocomplete="current-password"
				type="password"
				class="form-control"
				placeholder="Heslo"
				bind:value={heslo}
			/>
		</div>
		{#if error}
			<p class="text-danger mt-3 mb-0">{@html error}</p>
		{/if}
		<div class="d-flex align-content-center mt-3">
			<button type="submit" class="btn btn-primary me-2" on:click={prihlasitSe}>
				Přihlásit se
			</button>
			<button type="button" class="btn btn-outline-secondary" on:click={() => history.back()}>
				Zpět
			</button>
		</div>
		<p class="mt-3">
			Nemáte účet? <a href="/signup">Registrovat se</a>
		</p>
	</form>
</div>
