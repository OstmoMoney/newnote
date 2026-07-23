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

## AI-motor: Claude eller Ollama

Trykk **⚙** øverst til høyre og velg motor.

### Claude (skybasert, bruker credits)

Appen bruker Claude API (modell `claude-opus-4-8`) med strukturert
JSON-output for kategoriseringen.

1. Hent en nøkkel på <https://platform.claude.com>
2. Velg **Claude** i innstillingene og lim inn nøkkelen

Nøkkelen lagres kun lokalt på enheten (AsyncStorage) og sendes bare til
Anthropic sitt API.

### Ollama (lokal, gratis)

Kjør en lokal modell på PC-en din i stedet — ingen Claude-credits brukes.

1. Installer Ollama: <https://ollama.com/download>
2. Hent en modell, f.eks. `ollama pull llama3.1`
3. Start Ollama slik at telefonen når den:
   `OLLAMA_HOST=0.0.0.0 ollama serve`
4. I appen: velg **Ollama (lokal)**, sett adressen til PC-ens IP
   (f.eks. `http://192.168.1.10:11434` — *ikke* localhost fra mobil) og
   modellnavnet (`llama3.1`).

PC og mobil må være på samme nettverk. Ollama-strukturert-output brukes,
så modellen svarer med gyldig JSON etter samme skjema som Claude.

## Slik "trener" AI-en seg

Kategoriseringen blir bedre jo mer du bruker appen: hvert notat og — spesielt
— hver **manuelle korrigering** (når du trykker på et notat og flytter det)
sendes med som kontekst til modellen. Flytter du «tomater» til *Handleliste*,
går nye dagligvarer dit automatisk. Dette er den viktigste kilden til presise
plasseringer, og veier tyngre enn standardreglene.

> Merk: nøkkelen/adressen ligger på enheten din. Skal appen distribueres til
> andre, bør kallene flyttes bak en liten backend/proxy.

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
