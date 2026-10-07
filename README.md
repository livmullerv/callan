# Callan

Személyes napi fókusz-app: Ma, Naptár, Projektek, Jegyzetek (Ötletek, Kincsesláda), Eredmények — és Callan, a sárkány.

## Élesítés GitHub Pages-en (egyszer kell)

1. **Új repó:** github.com → jobb fent **+** → *New repository*. Név: `callan`. Legyen **Public**. *Create repository*.
2. **Feltöltés:** a repó oldalán *uploading an existing file*. Csomagold ki a zipet a gépeden, és a **mappa tartalmát** (nem magát a mappát) húzd be: `index.html`, `sw.js`, `manifest.webmanifest`, `.nojekyll`, `README.md`, valamint a `css`, `js` és `icons` mappák. Lent *Commit changes*.
   - A `.nojekyll` rejtett fájl lehet a gépeden. Ha nem látszik, nem baj, nélküle is működik.
3. **Bekapcsolás:** *Settings* → bal oldalt *Pages* → *Source*: **Deploy from a branch** → *Branch*: **main**, mappa: **/ (root)** → *Save*.
4. 1–2 perc múlva az oldal tetején megjelenik a cím: `https://FELHASZNÁLÓNEVED.github.io/callan/`

## Telepítés a telefonra

1. Nyisd meg a fenti címet **Chrome**-ban.
2. Jobb fent **⋮** → **Alkalmazás telepítése** (vagy *Hozzáadás a kezdőképernyőhöz*).
3. A kezdőképernyőn megjelenik Callan ikonja. Innentől saját ablakban, internet nélkül is fut.

## Első indítás

A napi rutinod már be van töltve (8:00 ébredés, 9–11 írás, Little Fires, kínai, munkakeresés kétnaponta, Tradevance heti kvótaként, séta, Pilates kétnaponta, házimunka, olvasás, 21:00 esti zárás). Érdemes átnézni:

- **Beállítások** (fogaskerék a Ma képernyőn): napi időpontok, mérlegelés napja.
- **Projektek**: a regény teljes célja (szószám), a kalóriakeret, a többi cél és ütemezés — mindegyik szerkeszthető.

## Biztonsági mentés

Az adataid **a telefonodon** vannak, nem a GitHubon.

- Vasárnaponként Callan kéri a mentést. Egy koppintás → a megosztás menüben válaszd a **Drive**-ot.
- Bármikor: Beállítások → **Mentés most**.
- Telefoncserénél: telepítsd az appot, majd Beállítások → **Visszaállítás fájlból**, és válaszd a Drive-ról letöltött mentést.

## Frissítés később

1. Töltsd fel az új fájlokat ugyanígy (a régieket felülírja).
2. A `sw.js` elején a `VERSION` értéke minden kiadásnál nő — ezt a kapott fájlokban már átírva kapod.
3. A telefonon az app következő megnyitásakor Callan szól, hogy új verzió érkezett → **Frissítés**. Az adataid megmaradnak.

## Fontos

- **Ne nevezd át a repót.** A tárolt adatok a címhez kötődnek, új címen az app üresen indul.
- A Chrome-ban a webhelyadatok törlése az app adatait is törli — előtte ments.
- A kód nyilvános, az adataid nem: azok sosem kerülnek fel a GitHubra.
