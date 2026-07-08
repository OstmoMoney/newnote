# newnote

En ny type notat-app: **du skriver bare — AI-en sorterer.**

Svart bakgrunn, gult old school-skrift. Du ser aldri kategoriene mens du skriver.
Trykker du send, kategoriserer Claude notatet og legger det på rett sted —
og oppretter kategorien selv om den ikke finnes.

## Slik fungerer det

- **Skriv og send.** En filmtittel havner i *Filmer*, «melk, brød, egg» i
  *Handleliste* (kronologisk per dato), PC-kommandoer i *PC-kommandoer*, osv.
- **Lærer over tid.** Tidligere plasseringer — og spesielt dine manuelle
  korrigeringer — sendes med til modellen, så den treffer bedre og bedre.
- **Usikker AI?** Har det samlet seg mange kategorier og modellen er reelt
  usikker, får du en popup med de 2 beste kandidatene + søk + «opprett ny».
- **Dobbelttrykk** på et notat for å flytte det til en annen kategori manuelt
  (dette lærer den også av).
- **Swipe til venstre** for full oversikt over alle kategorier. Trykk på en
  kategori for å se notatene kronologisk, gruppert på dato.
  Hold inne et notat for å slette.

## Kom i gang

```sh
cd newnote
npm install
npx expo start
```

Åpne appen i Expo Go (eller en dev build) på telefonen.

## API-nøkkel

Appen bruker Claude API (modell `claude-opus-4-8`) med strukturert
JSON-output for kategoriseringen.

1. Hent en nøkkel på <https://platform.claude.com>
2. Trykk **⚙** øverst til høyre i appen og lim inn nøkkelen

Nøkkelen lagres kun lokalt på enheten (AsyncStorage) og sendes bare til
Anthropic sitt API.

> Merk: nøkkelen ligger på enheten din. Skal appen distribueres til andre,
> bør kallene flyttes bak en liten backend/proxy slik at nøkkelen ikke
> følger med appen.

## Struktur

```
newnote/
├── App.js                    # fonter + oppstart
├── screens/
│   ├── Main.js               # all tilstand, pager (skriv <-> kategorier)
│   ├── NotePage.js           # hovedsiden: skrivefelt + send + nylige
│   └── CategoriesPage.js     # kategori-oversikten (swipe venstre)
├── components/
│   ├── CategoryChooser.js    # popup: AI usikker / manuelt valg / søk / ny
│   ├── CategoryDetail.js     # notater i én kategori, gruppert på dato
│   ├── SettingsModal.js      # API-nøkkel
│   └── Toast.js              # «-> 🎬 Filmer»-bekreftelser
└── lib/
    ├── ai.js                 # Claude-kall + JSON-skjema + regler/læring
    └── storage.js            # AsyncStorage: kategorier, notater, læring
```
