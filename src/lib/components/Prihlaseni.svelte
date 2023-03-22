<script lang="ts">
	import {
		jeAdmin,
		odhlasit,
		prihlasit,
		zmenitHeslo,
		prihlasenState,
		zodpovednaOsoba,
		seznamLidi
	} from '$lib/firebase';

	$: prihlasenyEmail = ($prihlasenState == 'null' ? null : $prihlasenState)?.email ?? '';
	$: osoba = $zodpovednaOsoba ?? 'Žádná';
	$: jePrihlasen = prihlasenyEmail != '';

	let email: string;
	let heslo: string;
	let hesloZnovu: string;

	let zrusitBtnP: HTMLButtonElement;
	let zrusitBtnR: HTMLButtonElement;

	let errorP: string | null = null;
	let errorR: string | null = null;

	function poVybrani(
		ev: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const file = ev.currentTarget.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.readAsText(file, 'UTF-8');
			reader.onload = async (evt) => {
				const text = evt.target?.result as string | null;
				if (text) {
					await fetch(`/api/aktualizovatLidi`, {
						method: 'POST',
						body: JSON.stringify({
							lidi: text
								.split('\n')
								.filter((radek) => radek != '')
								.map((radek) => radek.split(';').filter((vec) => vec != ''))
								.map(
									([email, montazky, uvadeci, osoba]) =>
										[
											email,
											montazky.split('#').filter((vec) => vec != ''),
											uvadeci.split('#').filter((vec) => vec != ''),
											osoba
										] as [string, string[], string[], string]
								)
								.map(([email, montazky, uvadeci, osoba]) => [
									email,
									Object.fromEntries(montazky.map((ico) => [ico, ico])),
									Object.fromEntries(uvadeci.map((ico) => [ico, ico])),
									osoba
								])
						})
					});
				}
			};
		}
	}
	function prihlasitSe() {
		errorP = '';
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
	}
	function registrovatSe() {
		errorR = '';
		if (heslo === hesloZnovu) {
			console.log(zrusitBtnR);
			zmenitHeslo(email, heslo)
				.then(() => zrusitBtnR.click())
				.catch((e) => {
					console.log(e.code);
					if (e.code == 'auth/network-request-failed') {
						errorR = 'Zkontrolujte připojení k internetu!';
					} else if (e.code == 'auth/weak-password') {
						errorR = 'Heslo je příliš slabé!';
					} else if (e.code == 'auth/user-not-found') {
						errorR = 'Prosím zadejte Váš firemní email';
					} else if (e.code == 'auth/email-already-in-use') {
						errorR = 'Tento účet již existuje';
					} else {
						errorR = 'Něco se nepovedlo :\\';
					}
				});
		} else {
			errorR = 'Hesla se neshodují!';
		}
	}
</script>

<div class="d-flex flex-column align-items-end">
	{#if jePrihlasen}
		<span>{prihlasenyEmail}</span>
		<span>Zodpovědná osoba: {osoba}</span>
		<span><a href="/" on:click={odhlasit}>Odhlásit se</a></span>
	{:else}
		<span><a href="/" data-bs-toggle="modal" data-bs-target="#prihlaseni">Přihlásit se</a></span>
	{/if}
	{#if $jeAdmin}
		<span><a href="/" data-bs-toggle="modal" data-bs-target="#admin">Upravit seznam lidí</a></span>
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
					<div class="mx-2 mt-3">
						<input
							autocomplete="email"
							type="email"
							class="form-control"
							placeholder="Email"
							bind:value={email}
						/>
					</div>
					<div class="mx-2 mt-3">
						<input
							autocomplete="current-password"
							type="password"
							class="form-control"
							placeholder="Heslo"
							bind:value={heslo}
						/>
					</div>
					{#if errorP}
						<p class="text-danger mx-2 mt-3 mb-0">{@html errorP}</p>
					{/if}
					<button type="submit" class="btn btn-primary mx-2 mt-3" on:click={prihlasitSe}>
						Přihlásit se
					</button>
					<p class="mx-2 mt-3">
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
						<div class="row mx-2 mt-3">
							<input
								autocomplete="email"
								type="email"
								class="form-control"
								placeholder="Email"
								bind:value={email}
							/>
						</div>
						<div class="row mx-2 mt-3">
							<input
								autocomplete="new-password"
								type="password"
								class="form-control"
								placeholder="Heslo"
								bind:value={heslo}
							/>
						</div>
						<div class="row mx-2 mt-3">
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
						<p class="text-danger mx-2 mt-3 mb-0">{@html errorR}</p>
					{/if}
					<button type="submit" class="btn btn-primary mx-2 mt-3" on:click={registrovatSe}>
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

<div class="modal" id="admin">
	<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
		<div class="modal-content">
			<div class="modal-header ">
				<h4 class="modal-title">Seznam emailů a příslušných firem</h4>
				<button type="button" class="btn-close" data-bs-dismiss="modal" title="Zavřít" />
			</div>

			<label class="mx-3 mt-2">
				<p>
					Vložte csv soubor oddělený středníky, kde v prvním sloupci je email, v druhém sloupci iča
					montážních firem oddělená hashy (#), v třetím slopci jsou stejně oddělená iča uvaděčů a ve
					čtvrtém spoupci jméno odpovědné osoby: <br />Př.:
					email@example.com;12345678#87654321;14725836#63852741;Jan Novák
				</p>
				<p><input type="file" accept="csv" on:change={poVybrani} /></p>
			</label>

			<div class="modal-body">
				<p>
					{$seznamLidi
						.map(
							([email, montazky, uvadeci, osoba]) =>
								`${email};${Object.values(montazky).join('#')};${Object.values(uvadeci).join(
									'#'
								)};${osoba}`
						)
						.join('\n')}
				</p>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Zavřít</button>
			</div>
		</div>
	</div>
</div>
