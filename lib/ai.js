const CLAUDE_MODEL = "claude-opus-4-8";
const CLAUDE_URL = "https://api.anthropic.com/v1/messages";

// Strukturert output-skjema: modellen MÅ svare med gyldig JSON i denne formen.
// Brukes både av Claude (output_config.format) og Ollama (format).
const RESULT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["action", "category", "candidates", "cleanedNote", "emoji"],
  properties: {
    action: {
      type: "string",
      enum: ["existing", "new", "ambiguous"],
      description:
        "'existing' = legg i eksisterende kategori. 'new' = opprett ny kategori. 'ambiguous' = reelt usikker mellom to eksisterende kategorier.",
    },
    category: {
      type: "string",
      description:
        "Kategorinavnet notatet skal ligge i. Ved 'existing' må navnet matche en eksisterende kategori eksakt. Ved 'ambiguous': tom streng.",
    },
    candidates: {
      type: "array",
      items: { type: "string" },
      description:
        "Kun ved 'ambiguous': de to mest sannsynlige eksisterende kategorinavnene, beste først. Ellers tom liste.",
    },
    cleanedNote: {
      type: "string",
      description:
        "Notatet lett ryddet: stor forbokstav på titler, lister som punkter med '- ' per linje, ellers uendret.",
    },
    emoji: {
      type: "string",
      description: "Én passende emoji for kategorien (brukes hvis kategorien er ny).",
    },
  },
};

const SYSTEM_PROMPT = `Du er kategoriserings-motoren i notat-appen "newnote". Brukeren skriver korte notater og trykker "Take note" — du bestemmer hvilken kategori notatet havner i. Brukeren ser ALDRI kategoriene mens de skriver, så du må være presis og konsekvent, og gjenbruke eksisterende kategorier fremfor å lage nye varianter.

## Slik velger du kategori (i rekkefølge)
1. Se FØRST på historikken, spesielt manuelle korrigeringer (kilde "manuelt korrigert av bruker"). Har brukeren tidligere plassert et lignende notat i en bestemt kategori, skal nye lignende notater dit — dette OVERSTYRER standardreglene under. Dette er den viktigste kilden til riktig svar.
2. Finnes det en eksisterende kategori som tydelig passer, bruk den (action "existing") med EKSAKT samme navn og skrivemåte som i listen.
3. Passer ingen, opprett ny (action "new") med et kort, tydelig norsk navn.
4. Er du reelt usikker mellom to eksisterende kategorier, bruk "ambiguous" med de to beste i candidates. Bruk dette sparsomt.

## Standard-kategorier (bruk når historikken ikke sier noe annet)
- "Filmer" — filmer/serier/TV: en tittel som "Interstellar", "Dune", "The Bear".
- "Spill" — videospill: "Elden Ring", "spille Zelda", "God of War".
- "Handleliste" — DAGLIGVARER og mat du kjøper i butikken: "tomater", "melk, brød, egg", "kaffe", "bananer".
- "Ønskeliste" — ting du vil kjøpe som IKKE er mat: elektronikk og dingser som "Philips Hue", "HDMI-kabel", "nye hodetelefoner", "smartpære".
- "Todo" — ting du skal gjøre: "ringe tannlegen", "vaske bilen".
- "PC-kommandoer" — terminal/kommandoer: "git rebase -i", "ipconfig /flushdns".
- "Ideer", "Prosjekter", eller navnet på et konkret prosjekt der det passer.

## Konkrete eksempler
- "Spider-Man", "The Last of Us" (tittel som finnes både som film og spill): velg "Spill" hvis en "Spill"-kategori finnes eller notatet nevner spill/konsoll/PS5; ellers "Filmer".
- "tomater", "melk", "brød" (mat) → "Handleliste".
- "Philips Hue", "hodetelefoner" (elektronikk/gadget) → "Ønskeliste".
- Mat og elektronikk skal være TO SEPARATE lister — bland dem aldri.

## Viktig
- Gjenbruk kategorier: ikke lag "Filmer å se" hvis "Filmer" allerede finnes.
- cleanedNote skal alltid fylles ut, også ved "ambiguous": rydd lett (stor forbokstav på titler, lister som "- " per linje), ellers uendret.`;

// Ollama-modeller trenger en ekstra påminnelse om ren JSON.
const OLLAMA_JSON_SUFFIX =
  "\n\nSvar KUN med ett enkelt JSON-objekt som følger skjemaet nøyaktig. Ingen forklaring, ingen markdown, ingen kodeblokk.";

/** Bygger konteksten (kategorier + historikk + nytt notat) som sendes til modellen. */
function buildPayload({ text, categories, notes, learning }) {
  const categorySummary = categories.map((c) => ({
    navn: c.name,
    emoji: c.emoji,
    antallNotater: notes.filter((n) => n.categoryId === c.id).length,
    sisteNotater: notes
      .filter((n) => n.categoryId === c.id)
      .slice(-3)
      .map((n) => n.text),
  }));

  return {
    dagensDato: new Date().toISOString().slice(0, 10),
    eksisterendeKategorier: categorySummary,
    historikk: learning.slice(-30).map((l) => ({
      notat: l.text,
      kategori: l.category,
      kilde: l.source === "manual" ? "manuelt korrigert av bruker" : "automatisk",
    })),
    nyttNotat: text,
  };
}

/** Rydder resultatet slik at appen aldri får inkonsistente verdier. */
function sanitizeResult(result, categories, text) {
  const existingNames = categories.map((c) => c.name.toLowerCase());
  if (
    result.action === "existing" &&
    !existingNames.includes((result.category || "").toLowerCase())
  ) {
    result.action = result.category ? "new" : "ambiguous";
  }
  if (result.action === "ambiguous") {
    result.candidates = (result.candidates || [])
      .filter((name) => existingNames.includes(name.toLowerCase()))
      .slice(0, 2);
    if (result.candidates.length === 0) {
      result.action = "new";
      result.category = result.category || "Diverse";
    }
  }
  if (!result.cleanedNote) result.cleanedNote = text;
  if (!result.emoji) result.emoji = "📁";
  return result;
}

/** Kaller Claude API (bruker Anthropic-nøkkel). */
async function callClaude({ apiKey, payload }) {
  const res = await fetch(CLAUDE_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: RESULT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    }),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err?.error?.message || detail;
    } catch {}
    throw new Error(detail);
  }

  const response = await res.json();
  if (response.stop_reason === "refusal") {
    throw new Error("Modellen avslo forespørselen.");
  }
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("Tomt svar fra modellen.");
  return JSON.parse(textBlock.text);
}

/** Kaller en lokal Ollama-modell (gratis, ingen Claude-credits). */
async function callOllama({ baseUrl, model, payload }) {
  const url = `${(baseUrl || "").replace(/\/+$/, "")}/api/chat`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        format: RESULT_SCHEMA,
        options: { temperature: 0 },
        messages: [
          { role: "system", content: SYSTEM_PROMPT + OLLAMA_JSON_SUFFIX },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
    });
  } catch {
    throw new Error(
      `Får ikke kontakt med Ollama (${url}). Kjører Ollama, og er URL-en riktig? På mobil må du bruke PC-ens IP, ikke localhost.`
    );
  }

  if (!res.ok) {
    let detail = `Ollama HTTP ${res.status}`;
    try {
      const j = await res.json();
      detail = j?.error || detail;
    } catch {}
    throw new Error(detail);
  }

  const data = await res.json();
  const content = data?.message?.content;
  if (!content) throw new Error("Tomt svar fra Ollama.");
  try {
    return JSON.parse(content);
  } catch {
    throw new Error("Ollama svarte ikke med gyldig JSON. Prøv en annen modell.");
  }
}

/**
 * Kategoriser et notat. Velger provider basert på innstillinger.
 * @returns {Promise<{action, category, candidates, cleanedNote, emoji}>}
 */
export async function categorizeNote({
  provider,
  apiKey,
  ollamaUrl,
  ollamaModel,
  text,
  categories,
  notes,
  learning,
}) {
  const payload = buildPayload({ text, categories, notes, learning });
  const raw =
    provider === "ollama"
      ? await callOllama({ baseUrl: ollamaUrl, model: ollamaModel, payload })
      : await callClaude({ apiKey, payload });
  return sanitizeResult(raw, categories, text);
}
