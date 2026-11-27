# Design hybrid-rag w Figmie

Wtyczka deweloperska Figmy, która rysuje design system, landing page i aplikację hybrid-rag. Wszystko bierze z kodu:

| Co | Skąd |
|---|---|
| Kolory (zmienne) | `packages/design-tokens/src/palettes/vintage.css`, role z `theme.css` |
| Typografia (style tekstu) | `packages/ui` (`heading.tsx`, `text.tsx`), skala landingu z `apps/landing/src/app/globals.css` |
| Odstępy i promienie (zmienne) | skala Tailwind 4 px, odstępy sekcji landingu z `globals.css` |
| Teksty | katalogi i18n: `apps/web/src/i18n/messages`, `apps/landing/src/messages` |
| Ikony | `packages/ui/src/icons` (Lucide, Simple Icons) |
| Zrzuty ekranu | `apps/landing/public/screenshots` |

Po zmianach w kodzie wystarczy zbudować wtyczkę i uruchomić ją ponownie. Odbudowuje wtedy wszystkie trzy strony pliku.

## Uruchomienie

1. Zbuduj wtyczkę (domyślnie po angielsku; `-- --locale=pl` daje polskie teksty):

   ```bash
   npm run figma:build
   ```

2. Opcjonalnie sprawdź ją na atrapie API Figmy:

   ```bash
   npm run figma:test
   ```

3. W **Figma Desktop** utwórz w Drafts pusty plik projektowy `hybrid-rag`.
4. Menu **Plugins → Development → Import plugin from manifest…** i wskaż `design/figma/manifest.json` (wystarczy raz).
5. **Plugins → Development → hybrid-rag design generator**. Budowanie trwa około minuty, a postęp widać w powiadomieniach na dole ekranu.

## Struktura pliku

Plan Starter pozwala na 3 strony w pliku:

1. **Design System**: okładka, kolory, typografia, odstępy, promienie i cienie, siatka, ikony, potem komponenty: podstawowe (`packages/ui`, z alertami), landingu i aplikacji.
2. **Landing**: Home, Features, How it works i FAQ, desktop 1440 i mobile 375, w motywie jasnym i ciemnym.
3. **App**: Start, czat ze źródłami, grupa, dokument, laboratorium wyszukiwania i ustawienia, w motywie jasnym i ciemnym.

## Jasny i ciemny motyw

Jeśli plan pozwala na dwa tryby w kolekcji zmiennych, `Theme` ma tryby **Light** i **Dark**. Na Starterze (jeden tryb) są dwie kolekcje, `Theme · Light` i `Theme · Dark`, o tych samych nazwach zmiennych. Komponenty są podpięte pod jasną, a ciemne ekrany to kopie podpięte pod ciemną. Wtyczka sama wybiera wariant i pisze, który zastosowała.

## Pliki

- `build.mjs`: czyta źródła i bundluje `src/main.js` do `dist/code.js`.
- `src/lib/`: zmienne, style, helpery auto layoutu, komponenty, ikony, teksty, motyw ciemny (ciemne ekrany budowane są od nowa, nie klonowane).
- `src/foundations.js`, `src/components/*`, `src/screens/*`: to, co powstaje w pliku.
- `test/`: atrapa API Figmy i test.
- `BRIEF.md`: zasady dla każdego, kto rozwija generator.
