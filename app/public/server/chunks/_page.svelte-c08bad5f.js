import { c as create_ssr_component, v as validate_component, d as add_attribute, e as escape, f as each } from './index-f5798eac.js';

const Pisatko = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { nazev = "" } = $$props;
  let { text = "" } = $$props;
  if ($$props.nazev === void 0 && $$bindings.nazev && nazev !== void 0)
    $$bindings.nazev(nazev);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  return `<label${add_attribute("for", nazev, 0)}>${escape(nazev)}</label>
<input${add_attribute("id", nazev, 0)} type="${"text"}" class="${"form-control"}"${add_attribute("value", text, 0)}>`;
});
const Vybiratko = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { nazev = "" } = $$props;
  let { vybrano = "" } = $$props;
  let { moznosti = [""] } = $$props;
  if ($$props.nazev === void 0 && $$bindings.nazev && nazev !== void 0)
    $$bindings.nazev(nazev);
  if ($$props.vybrano === void 0 && $$bindings.vybrano && vybrano !== void 0)
    $$bindings.vybrano(vybrano);
  if ($$props.moznosti === void 0 && $$bindings.moznosti && moznosti !== void 0)
    $$bindings.moznosti(moznosti);
  return `<label${add_attribute("for", nazev, 0)}>${escape(nazev)}</label>


<div class="${"dropdown"}"${add_attribute("id", nazev, 0)}><button type="${"button"}" class="${"btn btn-primary dropdown-toggle"}" data-bs-toggle="${"dropdown"}">${escape(vybrano != "" ? vybrano : "Nevybr\xE1no")}</button>
	<ul class="${"dropdown-menu"}">${each(moznosti, (moznost) => {
    return `<li><a class="${"dropdown-item"}" href="${"/"}">${escape(moznost)}</a>
			</li>`;
  })}</ul></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let data;
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    data = {
      cisloIR: "",
      typIR: "",
      clovek: {
        jmeno: "",
        prijmeni: "",
        adresa: "",
        datumNarozeni: "",
        email: "",
        telefon: ""
      },
      montazniFirma: { ico: "", jmenoZastupce: "", email: "" },
      uvedeniDoProvozu: { ico: "", jmenoZastupce: "", email: "" }
    };
    $$rendered = `<main class="${"container"}"><h1>Evidence regul\xE1tor\u016F IR</h1>

	<p>${validate_component(Vybiratko, "Vybiratko").$$render(
      $$result,
      {
        moznosti: ["N\u011Bco", "N\u011Bco jin\xFDho"],
        nazev: "Typ regul\xE1toru:",
        vybrano: data.typIR
      },
      {
        vybrano: ($$value) => {
          data.typIR = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "S\xE9riov\xE9 \u010D\xEDslo regul\xE1toru:",
        text: data.cisloIR
      },
      {
        text: ($$value) => {
          data.cisloIR = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<h2>Koncov\xFD u\u017Eivatel</h2>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      { nazev: "Jm\xE9no", text: data.clovek.jmeno },
      {
        text: ($$value) => {
          data.clovek.jmeno = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "P\u0159\xEDjmen\xED",
        text: data.clovek.prijmeni
      },
      {
        text: ($$value) => {
          data.clovek.prijmeni = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "Adresa",
        text: data.clovek.adresa
      },
      {
        text: ($$value) => {
          data.clovek.adresa = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "Datum narozen\xED",
        text: data.clovek.datumNarozeni
      },
      {
        text: ($$value) => {
          data.clovek.datumNarozeni = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "Telefon",
        text: data.clovek.telefon
      },
      {
        text: ($$value) => {
          data.clovek.telefon = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      { nazev: "Email", text: data.clovek.email },
      {
        text: ($$value) => {
          data.clovek.email = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<h2>Mont\xE1\u017En\xED firma</h2>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "I\u010CO",
        text: data.montazniFirma.ico
      },
      {
        text: ($$value) => {
          data.montazniFirma.ico = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "Jm\xE9no z\xE1stupce",
        text: data.montazniFirma.jmenoZastupce
      },
      {
        text: ($$value) => {
          data.montazniFirma.jmenoZastupce = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "Email",
        text: data.montazniFirma.email
      },
      {
        text: ($$value) => {
          data.montazniFirma.email = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<h2>Uveden\xED do provozu</h2>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "I\u010CO",
        text: data.uvedeniDoProvozu.ico
      },
      {
        text: ($$value) => {
          data.uvedeniDoProvozu.ico = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "Jm\xE9no z\xE1stupce",
        text: data.uvedeniDoProvozu.jmenoZastupce
      },
      {
        text: ($$value) => {
          data.uvedeniDoProvozu.jmenoZastupce = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>
	<p>${validate_component(Pisatko, "Pisatko").$$render(
      $$result,
      {
        nazev: "Email",
        text: data.uvedeniDoProvozu.email
      },
      {
        text: ($$value) => {
          data.uvedeniDoProvozu.email = $$value;
          $$settled = false;
        }
      },
      {}
    )}</p>

	<button type="${"button"}" class="${"btn btn-primary"}">Odeslat </button></main>

${$$result.head += `<!-- HEAD_svelte-16v2z1q_START -->${$$result.title = `<title>Evidence regul\xE1tor\u016F IR</title>`, ""}<link href="${"https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css"}" rel="${"stylesheet"}"><script src="${"https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"}"><\/script><!-- HEAD_svelte-16v2z1q_END -->`, ""}`;
  } while (!$$settled);
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-c08bad5f.js.map
