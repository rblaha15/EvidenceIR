<script lang="ts">
	import { odhlasit, prihlasit, zaregistovat } from '$lib/firebase';

	export let prihlasen: string;
	export let jePrihlasen: boolean;

	let email: string;
	let heslo: string;
	let hesloZnovu: string;

	let zrusitBtnP: HTMLButtonElement;
	let zrusitBtnR: HTMLButtonElement;

	let errorP: string | null = null;
	let errorR: string | null = null;
</script>

<div class="d-flex flex-column align-items-end">
	{#if jePrihlasen}
		<span>{prihlasen}</span>
		<span><a href="/" on:click={odhlasit}>Odhlásit se</a></span>
	{:else}
		<span><a href="/" data-bs-toggle="modal" data-bs-target="#prihlaseni">Přihlásit se</a></span>
	{/if}
</div>

<div class="modal" id="prihlaseni">
	<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header ">
				<h4 class="modal-title">Přihlášení</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" title="Zrušit" />
			</div>

			<div class="modal-body">
				<form>
					<div class="mt-3 mx-2">
						<input
							autocomplete="email"
							type="email"
							class="form-control"
							placeholder="Email"
							bind:value={email}
						/>
					</div>
					<div class="mt-3 mx-2">
						<input
							autocomplete="current-password"
							type="password"
							class="form-control"
							placeholder="Heslo"
							bind:value={heslo}
						/>
					</div>
					{#if errorP}
						<p class="mt-3 mx-2 mb-0 text-danger">{@html errorP}</p>
					{/if}
					<button
						type="submit"
						class="btn btn-primary mt-3 mx-2"
						on:click={() => {
							prihlasit(email, heslo)
								.then(() => zrusitBtnP.click())
								.catch((e) => {
									console.log(e.code);
									if (e.code == 'auth/network-request-failed') {
										errorP = 'Zkontrolujte připojení k internetu!';
									} else if (e.code == 'auth/user-not-found') {
										errorP =
											'Takový účet neexistuje! <a href="/" data-bs-toggle="modal" data-bs-target="#registrace">Vytvořit ho?</a>';
									} else if (e.code == 'auth/wrong-password') {
										errorP = 'Špatné heslo!';
									} else if (e.code == 'auth/too-many-requests') {
										errorP = 'Moc žádostí! Počkejte prosím chvíli';
									} else {
										errorP = 'Něco se nepovedlo :\\';
									}
								});
						}}
					>
						Přihlásit se
					</button>
					<p class="mt-3 mx-2">
						Nemáte účet? <a href="/" data-bs-toggle="modal" data-bs-target="#registrace"
							>Registrovat se</a
						>
					</p>
				</form>
			</div>

			<div class="modal-footer">
				<button
					type="button"
					class="btn btn-outline-danger"
					data-bs-dismiss="modal"
					bind:this={zrusitBtnP}>Zrušit</button
				>
			</div>
		</div>
	</div>
</div>

<div class="modal" id="registrace">
	<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header ">
				<h4 class="modal-title">Registrace</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" title="Zrušit" />
			</div>

			<div class="modal-body">
				<form>
					<div class="col">
						<div class="row mt-3 mx-2">
							<input
								autocomplete="email"
								type="email"
								class="form-control"
								placeholder="Email"
								bind:value={email}
							/>
						</div>
						<div class="row mt-3 mx-2">
							<input
								autocomplete="new-password"
								type="password"
								class="form-control"
								placeholder="Heslo"
								bind:value={heslo}
							/>
						</div>
						<div class="row mt-3 mx-2">
							<input
								autocomplete="new-password"
								type="password"
								class="form-control"
								placeholder="Potvrďte heslo"
								bind:value={hesloZnovu}
							/>
						</div>
					</div>
					{#if errorR}
						<p class="mt-3 mx-2 mb-0 text-danger">{@html errorR}</p>
					{/if}
					<button
						type="submit"
						class="btn btn-primary mt-3 mx-2"
						on:click={() => {
							if (heslo === hesloZnovu) {
								zaregistovat(email, heslo)
									.then(() => zrusitBtnR.click())
									.catch((e) => {
										console.log(e.code);
										if (e.code == 'auth/network-request-failed') {
											errorR = 'Zkontrolujte připojení k internetu!';
										} else if (e.code == 'auth/weak-password') {
											errorR = 'Heslo je příliš slabé!';
										} else {
											errorR = 'Něco se nepovedlo :\\';
										}
									});
							} else {
								errorR = 'Hesla se neshodují!';
							}
						}}
					>
						Registrovat
					</button>
				</form>
			</div>

			<div class="modal-footer">
				<button
					type="button"
					class="btn btn-outline-danger"
					data-bs-dismiss="modal"
					bind:this={zrusitBtnR}>Zrušit</button
				>
			</div>
		</div>
	</div>
</div>
