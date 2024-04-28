<script lang="ts">
	import { page } from '$app/stores';
	import { zmenitHeslo } from '$lib/firebase';

	export let data: { email: string | null };

	let email: string = data.email ?? '';
	let heslo: string;
	let hesloZnovu: string;

	let error: string | null = null;

	function registrovatSe() {
		error = '';
		if (heslo === hesloZnovu) {
			zmenitHeslo(email, heslo)
				.then(() => (window.location.href = `${$page.url.origin}/`))
				.catch((e) => {
					console.log(e.code);
					if (e.code == 'auth/network-request-failed') {
						error = 'Zkontrolujte připojení k internetu!';
					} else if (e.code == 'auth/weak-password') {
						error = 'Heslo je příliš slabé!';
					} else if (e.code == 'auth/user-not-found') {
						error = 'Prosím zadejte Váš firemní email';
					} else if (e.code == 'auth/email-already-in-use') {
						error = 'Tento účet již existuje';
					} else {
						error = 'Něco se nepovedlo :\\';
					}
				});
		} else {
			error = 'Hesla se neshodují!';
		}
	}
</script>

<div class="container my-3">
	<h1>Registrace</h1>

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
				autocomplete="new-password"
				type="password"
				class="form-control"
				placeholder="Heslo"
				bind:value={heslo}
			/>
		</div>
		<div class="mt-3">
			<input
				autocomplete="new-password"
				type="password"
				class="form-control"
				placeholder="Potvrďte heslo"
				bind:value={hesloZnovu}
			/>
		</div>
		{#if error}
			<p class="text-danger mt-3 mb-0">{@html error}</p>
		{/if}
		<div class="d-flex align-content-center mt-3">
			<button type="submit" class="btn btn-primary me-2" on:click={registrovatSe}>
				Registrovat
			</button>
			<button type="button" class="btn btn-outline-secondary" on:click={() => history.back()}>
				Zpět
			</button>
		</div>
	</form>
</div>
