const MODEL = "claude-opus-4-8";
const API_URL = "https://api.anthropic.com/v1/messages";

// Strukturert output-skjema: modellen MÅ svare med gyldig JSON i denne formen.
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

const SYSTEM_PROMPT = `Du er kategoriserings-motoren i notat-appen "newnote". Brukeren skriver korte notater og trykker send — du bestemmer hvilken kategori notatet skal ligge i. Brukeren ser aldri kategoriene mens de skriver, så du må være presis og konsekvent.

Regler:
- Finnes det en eksisterende kategori som tydelig passer, bruk den (action "existing") med eksakt samme navn.
- Passer ingen eksisterende kategori, opprett en ny (action "new") med et kort, tydelig norsk navn — f.eks. "Filmer", "Handleliste", "Todo", "PC-kommandoer", "Ideer", "Prosjekter" eller navnet på et spesifikt prosjekt.
- Er du reelt usikker mellom to eksisterende kategorier, bruk action "ambiguous" og oppgi de to beste i candidates. Bruk dette sparsomt — helst når det finnes mange kategorier og valget faktisk er tvetydig.
- En filmtittel alene (f.eks. "Interstellar") → "Filmer".
- Varer/mat (f.eks. "melk, brød, egg") → "Handleliste".
- Terminal-/PC-kommandoer (f.eks. "git rebase -i", "ipconfig /flushdns") → "PC-kommandoer".
- Ting brukeren skal gjøre → "Todo".
- Lær av historikken i meldingen — spesielt manuelle korrigeringer fra brukeren; de viser hvor brukeren faktisk vil ha ting. Har brukeren flyttet lignende notater til en bestemt kategori før, skal nye lignende notater dit direkte.
- cleanedNote skal alltid fylles ut, også ved "ambiguous".`;

/**
 * Kategoriser et notat med Claude.
 * @returns {Promise<{action: string, category: string, candidates: string[], cleanedNote: string, emoji: string}>}
 */
export async function categorizeNote({ apiKey, text, categories, notes, learning }) {
  const categorySummary = categories.map((c) => ({
    navn: c.name,
    emoji: c.emoji,
    antallNotater: notes.filter((n) => n.categoryId === c.id).length,
    sisteNotater: notes
      .filter((n) => n.categoryId === c.id)
      .slice(-3)
      .map((n) => n.text),
  }));

  const payload = {
    dagensDato: new Date().toISOString().slice(0, 10),
    eksisterendeKategorier: categorySummary,
    historikk: learning.slice(-20).map((l) => ({
      notat: l.text,
      kategori: l.category,
      kilde: l.source === "manual" ? "manuelt korrigert av bruker" : "automatisk",
    })),
    nyttNotat: text,
  };

  // Direkte fetch i stedet for @anthropic-ai/sdk: SDK-en drar inn node:fs,
  // som ikke finnes i React Native.
  const httpResponse = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: MODEL,
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

  if (!httpResponse.ok) {
    let detail = `HTTP ${httpResponse.status}`;
    try {
      const err = await httpResponse.json();
      detail = err?.error?.message || detail;
    } catch {}
    throw new Error(detail);
  }

  const response = await httpResponse.json();

  if (response.stop_reason === "refusal") {
    throw new Error("Modellen avslo forespørselen.");
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) {
    throw new Error("Tomt svar fra modellen.");
  }

  const result = JSON.parse(textBlock.text);

  // Vask resultatet slik at appen aldri får inkonsistente verdier
  const existingNames = categories.map((c) => c.name.toLowerCase());
  if (result.action === "existing" && !existingNames.includes((result.category || "").toLowerCase())) {
    result.action = result.category ? "new" : "ambiguous";
  }
  if (result.action === "ambiguous") {
    result.candidates = (result.candidates || [])
      .filter((name) => existingNames.includes(name.toLowerCase()))
      .slice(0, 2);
    if (result.candidates.length === 0) {
      // Ingen gyldige kandidater — fall tilbake til ny kategori
      result.action = "new";
      result.category = result.category || "Diverse";
    }
  }
  if (!result.cleanedNote) result.cleanedNote = text;
  if (!result.emoji) result.emoji = "📁";

  return result;
}
