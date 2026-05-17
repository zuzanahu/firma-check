# Firma Check

Aplikace slouží k rychlému ověření základních údajů o české firmě. Uživatel zadá IČO, případně i název firmy, klikne na tlačítko a aplikace ověří firmu přes ARES, zobrazí základní údaje, ukáže sídlo firmy na mapě, umožní firmu uložit do seznamu a uložené firmy exportovat.

## Živé demo

[firma-check.vercel.app](https://firma-check.vercel.app)

## Spuštění lokálně

1. Nainstaluj závislosti:
   ```bash
   cd firma-check
   npm install
   ```

2. Nastav prostředí:
   - Vytvoř nový soubor `.env` v rootu projektu (ve složce `firma-check`).
   - Zkopíruj obsah `.env.example` do `.env`.
   - Doplň potřebné API klíče podle popisu v `.env.example`.

3. Spusť aplikaci:
   ```bash
   npm run dev
   ```

4. Otevři aplikaci v prohlížeči na adrese `http://localhost:3000`.

## Technologický stack

- **Framework:** Next.js (API volání přes Next.js API routes)
- **Jazyk:** TypeScript
- **Databáze:** SQLite v prohlížeči přes WASM (sql.js) s perzistencí v IndexedDB
- **Nasazení:** Vercel
- **Nástroje:** ESLint (linter), Prettier (formátování kódu), Vitest (unit testy), Playwright (E2E testy)
- **Prostředí:** Zed editor, macOS

## Použitá API

- **ARES API** – voláno přes API route `api/ares/[ico]`
- **Geocoding API (Mapy.com)** – voláno přes API route `api/geocode`
- **Map tiles API (Mapy.com)** – voláno přímo z klienta

## SQLite cache

SQLite slouží jako cache pro data z externích API (ARES a Mapy.com geocoding). Databáze běží celá v prohlížeči přes WASM (sql.js) a data přetrvávají v IndexedDB. Při prvním dotazu se data načtou z API a uloží do cache; při opakovaném dotazu na stejné IČO nebo adresu se použije cache. Aplikace zobrazuje, zda data pochází z API nebo ze SQLite cache.

Protože Vercel funguje jako serverless platforma bez perzistentního filesystému, zvolila jsem browser-side SQLite – cache i uložené firmy žijí v jedné databázi na straně klienta.

**Cache je per-user:** každý uživatel má vlastní databázi ve svém prohlížeči, izolovanou od ostatních. To znamená, že pokud stejné IČO ověří dva různí uživatelé, každý si udělá vlastní dotaz na ARES API – sdílená server-side cache neexistuje. Pro tento use case to ale nevadí: aplikace slouží k jednorázovému ověření firmy, ne k agregaci dat napříč uživateli. Výhodou naopak je, že uživatel nepotřebuje účet, data zůstávají jen v jeho prohlížeči a odpadají starosti s ochranou osobních údajů na serveru. Nevýhodou je, že při vymazání dat prohlížeče (localStorage/IndexedDB) uživatel přijde o celou historii uložených firem.

## Ukládání firem do seznamu „Moje firmy"

- Uložit a odebrat firmu lze na `/firma/[ico]`.
- Odebrat firmu ze seznamu lze také na `/moje-firmy`.
- Firmy se ukládají do SQLite databáze, která je uložena pouze v prohlížeči (viz výše).

## CSV export

Export v CSV formátu je dostupný v sekci „Moje firmy" na `/moje-firmy`. CSV obsahuje tyto sloupce: IČO, obchodní název, právní formu, stav subjektu, adresu sídla, datum vzniku, datum posledního ověření, zdroj dat (API/cache) a souřadnice sídla (pokud jsou dostupné). Soubor je ke stažení s hlavičkou sloupců a kódováním UTF-8 BOM pro kompatibilitu s Excelem.

## AI vizuální prvek

Ikona lupy v navigaci je generovaná pomocí AI.

**Nástroj:** ChatGPT (úvodní návrh), Claude Sonnet 4.6 (finální SVG)

**Proč:** Ikona v navigaci vizuálně odděluje název aplikace od navigačních odkazů a pomáhá uživateli identifikovat účel aplikace na první pohled.

**Postup:** Nejprve jsem v ChatGPT vygenerovala základní návrh loga lupy. Výsledný obrázek jsem pak vložila do Claude a pomocí dalších promptů (viz ukázky níže) jsem ho nechala převést do přesnějšího SVG formátu.

## Použité AI nástroje

- **Perplexity** – vyhledávání na internetu
- **Claude Sonnet 4.6** – generování loga ve formátu SVG
- **Claude Code (Opus 4.7, Sonnet 4.6)** – generování kódu
- **Claude Code Skills:**
  - [`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator) – pomohl mi vytvořit vlastní skill `commit-workflow` na míru; skill se spouštěl při každém commitu a nastavoval pravidla (jedna funkcionalita = jeden commit)
  - [`commit-workflow`](https://github.com/anthropics/skills/tree/main/skills/commit-workflow) – skill spouštěný při každém commitu; nastavoval pravidla pro commity (jedna funkcionalita = jeden commit)
  - [`senior-qa`](https://aitmpl.com/component/skill/development/senior-qa) – napsal testy přes Vitest a Playwright
  - [`nextjs-best-practices`](https://aitmpl.com/component/skill/development/nextjs-best-practices) – kontrola Next.js best practices
  - [`web-design-guidelines`](https://aitmpl.com/component/skill/creative-design/web-design-guidelines) – pomáhal s designem, přístupností a UX

## Ukázky promptů

### 1. Dotaz na způsoby implementace CSV exportu – Perplexity

```
What methods are used to export .csv from a web app (built in Next.js)?
```

### 2. Přidání CSV exportu – Claude Code Sonnet 4.6

```
Write a new feature. Add a "CSV export" button to @app/components/SavedList.tsx.
The data pull from db from @db/schema.ts saved_companies table.

CSV export musí obsahovat minimálně:
- IČO, obchodní název, právní formu, stav subjektu, adresu sídla, datum vzniku,
  datum posledního ověření, zdroj posledního načtení dat: API/cache,
  souřadnice sídla, pokud jsou dostupné.

CSV musí:
- jít stáhnout jako soubor,
- obsahovat hlavičku sloupců,
- exportovat skutečně uložené firmy, ne ukázková/fake data.
```

### 3. Commit s načteným skillem `commit-workflow` – Claude Code Sonnet 4.6

Prompt:
```
commit this
```

Claude načetl skill, spustil lint, opravil upozornění na chybějící závislost v `useEffect` a poté mi nabídl rozdělení změn do čtyř samostatných commitů. Stačilo tedy napsat `commit this` a agent sám navrhl granulární commity po jedné funkcionalitě.

### 4. Generování loga – ChatGPT a Claude Sonnet 4.6

I když vytvoření loga zabralo více iterací, výsledek byl lepší a rychlejší, než kdybych ho vytvářela sama.

**ChatGPT (iterace 1–4):**

```
1. Vytvoř mi logo pro firmu "FirmaCheck": Aplikace slouží k rychlému ověření
   základních údajů o české firmě. Uživatel zadá IČO, případně i název firmy,
   klikne na tlačítko a aplikace ověří firmu přes ARES, zobrazí základní údaje,
   ukáže sídlo firmy na mapě, umožní firmu uložit do seznamu a uložené firmy
   exportovat.
2. Make the text bigger and easier to read and discard small details,
   make it very readable.
3. Větší a tučnější, aby to bylo vidět po zmenšení a nebylo tolik detailů –
   má to být logo v navigaci.
4. Lupu dej doprava od názvu a název udělej skoro stejně vysoký jako lupa.
```

Výsledný obrázek lupy jsem vložila do Claude a zadala jsem následující prompty:

**Claude Sonnet 4.6 (iterace 5–8):**

```
5. Create an image like this (it should be an icon for a web app icon).
6. It is designed from very simple elements like squares, etc.,
   so do it more intricate.
7. Make it more upscale.
8. Přidej trochu nerovnoměrnosti; když je to hodně rovnoměrné, taky to vypadá špatně.
```

Výsledkem bylo logo, které je v navigaci. Z loga jsem ještě odstranila držátko lupy a zelený kruh s ikonou – opět vložením loga do Claude a dalšími prompty:

**Claude Sonnet 4.6 (iterace 9–10):**

```
9. Remove the handle from this SVG and put the green tick inside the circle.
10. Remove the green tick altogether.
```

Finální SVG jsem použila jako `icon.svg` – ikonu aplikace zobrazenou v záložce prohlížeče.

## Iterace během práce

### 1. Napojení API klíče od Mapy.com

1. Claude napsal veškerou logiku pro zobrazení mapy, geokódování adresy a uložení výsledků do databáze.
2. Po spuštění aplikace mapa hlásila neplatný API klíč.
3. Claude nenabídl přímé řešení, začala jsem proto hledat sama.
4. Zjistila jsem, že je potřeba si vytvořit účet na Mapy.com.
5. Vytvořila jsem API klíč a úspěšně ho napojila do aplikace.
6. Při čtení podmínek použití Mapy.com jsem zjistila, že jsem zodpovědná za zabezpečení přístupu ke klíči.
7. V dokumentaci Mapy.com jsem našla způsoby, jak zabezpečení zajistit.
8. Doplnila jsem podrobnější popis do `.env.example`.
9. Vytvořila jsem dva produkční klíče – jeden pro `/v1/maptiles` API a druhý pro `/v1/geocode`. Protože klíč pro maptiles je viditelný na klientovi, omezila jsem jeho použití pouze na doménu `firma-check.vercel.app`.

### 2. Export do CSV

1. Zadala jsem úlohu Claude Code s popisem ze zadání.
2. Upřesnila jsem umístění tlačítka – má být na stejné úrovni jako nadpis „Moje firmy".
3. Po stažení exportu jsem zjistila chyby v souřadnicích – u některých firem se zobrazovaly, u jiných ne.
4. Po dvou iteracích s Claude jsem problém stále nevyřešila.
5. Podívala jsem se do kódu sama a identifikovala příčinu.
6. Zadala jsem Claude přesnější prompt a chybu opravil.

## Čas strávený na jednotlivých částech

| Část | Čas |
|---|---|
| Průzkum problematiky, nastavení Next.js, experimentální spuštění databáze a nasazení na Vercel | 2,5 hod. |
| Nastavení Claude Code, hledání a instalace skillů | 2,5 hod. |
| ARES API a cache | 1 hod. |
| Geocoding API, cache a map tiles API | 2 hod. |
| Seznam firem a CSV export | 2,5 hod. |
| UI/UX, refaktor, responzivní UI | 4 hod. |
| Testování (Vitest, Playwright), finální refaktor | 2,5 hod. |
| Psaní dokumentace a manuální testování | 2 hod. |
| **Celkem** | **~19 hod.** |

## Co bych vylepšila, kdybych měla více času

- Více bych si rozmyslela a případně opravila potenciální bezpečnostní hrozby.
- Více refaktorovala kód, aby byl do budoucna lépe srozumitelný.
- Vylepšila UI na základě cílové skupiny uživatelů – zdá se mi, že text je místy příliš malý.
- Sjednotila jazyk v projektu: cílem bylo mít kód v angličtině a vše uživatelsky viditelné v češtině, ale není to důsledné (např. commit messages byly nekonzistentní).
- Lépe vyřešila mapování názvů z ARES API, které jsou v češtině – v kódu jsem je převedla do angličtiny, ale optimální přístup by stál za hlubší úvahu.
