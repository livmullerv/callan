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

## Szinkron és Claude (telefon + gép + Claude ugyanazzal az adattal)

Az adatok egy saját közvetítőn át a Google Drive-odra kerülnek, egy „Callan” mappába:

- **Callan – adatok:** a teljes adat, ebből szinkronizál minden eszköz.
- **Callan – áttekintés:** olvasható összefoglaló, ezt olvassa Claude.
- **Callan postaláda:** ide ír Claude, Callan a következő szinkronnál beteszi a tételeket, és kitörli a fájlt.

A közvetítő egy Google Apps Script program a saját Google-fiókodban (ingyenes, nem kell hozzá szerver). A `Code.gs` fájlt külön kapod, mert benne van a titkos kulcs. **Ne töltsd fel a GitHubra.**

### 1. A közvetítő beállítása (gépen, egyszer, kb. 10 perc)

1. Nyisd meg a **script.google.com** oldalt azzal a Google-fiókkal, amelyiknek a Drive-ját használni akarod, és kattints az **Új projekt** gombra.
2. Bal fent nevezd át: **Callan közvetítő**.
3. A `Code.gs` szerkesztőben töröld ki, ami ott van, és másold be a kapott `Code.gs` teljes tartalmát. Mentsd el (Ctrl+S).
4. Fent a függvényválasztóban válaszd a **setup** függvényt, és nyomd meg a **Futtatás** gombot.
   - Engedélyt kér a Drive-hoz: *Engedélyek áttekintése* → válaszd ki a fiókodat.
   - Megjelenik a „A Google nem ellenőrizte ezt az alkalmazást” üzenet. Ez a saját programod, ezért ez rendben van: *Speciális* → *Ugrás a Callan közvetítő oldalra (nem biztonságos)* → *Engedélyezés*.
   - Ezután a Drive-odon megjelenik a **Callan** mappa.
5. Jobb fent: **Telepítés → Új telepítés**. A fogaskeréknél válaszd ezt: **Webalkalmazás**.
   - Végrehajtás mint: **Én**
   - Hozzáférés: **Bárki**. Erre azért van szükség, hogy Callan bejelentkezés nélkül elérje; a titkos kulcs védi.
   - **Telepítés** → másold ki a **Webalkalmazás URL-jét** (`…/exec` a vége).

### 2. Callan csatlakoztatása

1. **Gépen:** nyisd meg Callant (a GitHub Pages címét) Chrome-ban vagy Edge-ben. A címsor jobb oldalán lévő telepítés ikonnal asztali appként is felteheted.
2. **Beállítások → Szinkron és Claude:** a *Közvetítő címe* mezőbe a webalkalmazás URL-je kerül, a *Titkos kulcs* mezőbe a `Code.gs` elején lévő `SECRET` értéke. Ezután **Csatlakozás**.
   - Mivel a gép még üres, nem tölt fel semmit. Mutat egy QR-kódot, és megvárja a telefont.
3. **Telefonon:** olvasd be a QR-kódot a kamerával. Callan megnyílik, magától csatlakozik, és feltölti az adataidat.
4. **Gépen:** pár percen belül magától letölti őket, vagy nyomd meg a **Megnézem újra** gombot.

Innentől minden változás pár másodpercen belül felmegy, megnyitáskor és kétpercenként pedig lejön a másik eszköz változása. Ha ugyanazt a tételt mindkét helyen másképp szerkesztetted, annak az eszköznek a változata marad meg, amelyik később szinkronizál. Ha egy eszköz adatait a felhő adatai írják felül, Callan előtte elmenti a régieket, és a Beállításokban vissza lehet állítani őket.

Ha később módosítani kell a `Code.gs`-t: **Telepítés → Telepítések kezelése → szerkesztés (ceruza) → Verzió: Új verzió**. Így megmarad ugyanaz az URL.

### Claude-kapcsolat: a postaláda formátuma

Claude a Google Drive-kapcsolatával új szövegfájlt hoz létre a **Callan postaláda** mappában (`text/plain`, Google Dokumentummá alakítás nélkül), ezzel a tartalommal:

```json
{
  "callan": 1,
  "from": "Claude",
  "note": "Rövid megjegyzés, honnan jön (opcionális)",
  "ops": [
    { "op": "task", "title": "Árajánlat", "date": "2026-11-17", "time": "10:00", "est": 45, "project": "Tradevance" },
    { "op": "task", "title": "Weboldal", "due": "2026-11-30", "hours": 10, "project": "Little Fires" },
    { "op": "event", "title": "Fogorvos", "date": "2026-11-18", "start": "15:30", "end": "16:15", "travel": 20, "category": "Család", "note": "…" },
    { "op": "event", "title": "Szülinap", "date": "2026-11-20", "allDay": true, "project": "MomLife" },
    { "op": "idea", "title": "Cím", "body": "Szöveg", "project": "Regény" },
    { "op": "treasure", "title": "Könyv címe", "category": "Könyv", "where": "Libri", "link": "https://…", "date": "2026-12-02" },
    { "op": "project", "title": "Karácsony", "category": "Család", "kind": "collection" }
  ]
}
```

- A projekteket és kategóriákat név szerint keresi meg, kis- és nagybetűtől, valamint ékezettől függetlenül.
- Feladatnál a `due` határidős feladatot jelent (a `hours` vagy az `est` percben adja meg a rászánt időt). `due` nélkül adott napi feladat lesz, `date` és opcionális `time` mezővel.
- Eseménynél `start` nélkül egész napos lesz.
- A sikeresen felvett tételeket és az esetleg kihagyottakat Callan a Ma képernyőn jelzi („Claude beírt … dolgot”).

## Változások

**1.5.0**
- Asztali elrendezés: legalább 1000 px széles ablakban 2 vagy 3 képernyő látszik egymás mellett, mindegyik külön görgethető.
- Lapozás a fejléc nyilaival vagy a ← → billentyűkkel, a képernyők csúszva haladnak. Egy fülre kattintva az a képernyő becsúszik a látható részbe.
- Az oszlopok száma a fejlécben választható (2 vagy 3). A választást eszközönként megjegyzi.
- A Beállítások és az űrlapok gépen középre nyíló ablakban jelennek meg. Az Esc gomb mindig bezárja őket.
- A telefonos nézet változatlan.

**1.4.0**
- Szinkron telefon és gép között, valamint kapcsolat Claude-dal, a Google Drive-on keresztül, egy saját Apps Script közvetítővel. Tételenkénti háromutas összefésülés, offline szerkesztés után is.
- Másik eszköz csatlakoztatása QR-kóddal; üres eszköz nem írja felül a felhőt; a felülírt adatok visszaállíthatók.
- Claude postaláda: feladat, esemény, ötlet, kincs és projekt felvétele; Callan jelzi, mi érkezett.
- „Callan – áttekintés” fájl a Drive-on, hogy Claude lássa a terveidet.

**1.3.0**
- Értesítések: az emlékeztető mentés után azonnal feltöltődik, és akkor is kimegy, ha rögtön bezárod az appot (korábban 2,5 mp várakozás volt, közben bezárva elveszhetett).
- Beállítások → Értesítések: látszik a feltöltött emlékeztetők listája, és az „Ellenőrzés a szerveren” gombbal megnézheted, mi vár kiküldésre és mi ment ki az elmúlt órákban.
- Öntözés: Beállítások → Öntözés. Növényenként megadható, hány naponta kell öntözni. Öntözőkanna jelöli a napokat a Naptárban, a Ma képernyőn a beosztás felett jelenik meg „Megöntöztem” gombbal, és kérhető reggeli értesítés.

**1.2.0**
- Az idővonalon minden blokk elején a kategória ikonja áll. Kategóriánként 34 ikon közül lehet választani (Beállítások → Kategóriák → az ikonra koppintva).
- „Helyette mást…”: a mai nap egy tételére koppintva ugyanabba az idősávba másik szokást, feladatot vagy egy új teendőt tehetsz. Az eredeti ma kimarad (sorozatot nem tör), a feladat holnapra kerül.
- Kincsesláda: saját kategóriák, jelleggel (termék / szolgáltatás / virtuális). A jelleg dönti el, mit kérdez: „Hol kapható?” vagy „Hol?”. A „Hol láttam?” mező megszűnt; a régi bejegyzések szövege megjegyzésként megmaradt.
- Push értesítések az ntfy appon keresztül: időponthoz kötött eseményekről, feladatokról és határidőkről. Beállítások → Értesítések.

**1.1.0**
- A feladatok az idővonalra kerülnek. Kétféle ütemezés: *Adott napon* (rászánt idővel, opcionális kezdéssel) és *Határidőig* (a rászánt időt az app felosztja a határidőig hátralévő napokra, csak oda, ahol van elég szabad idő; a kipipált blokkok levonódnak, a maradék újraoszlik).
- Ötleteknél a legördülőből új kategória vehető fel (az Írói munka alá kerül gyűjtőként).
- Ciklusnaptár: Beállítások → Ciklusnaptár. A Naptárban csepp jelöli a napokat (teli: rögzített, körvonalas: várható).
- A visszaállítás a `.txt` mentést is felajánlja a fájlválasztóban.
- A korábbi adatok frissítéskor automatikusan átalakulnak, semmi nem vész el.

## Fontos

- **Ne nevezd át a repót.** A tárolt adatok a címhez kötődnek, új címen az app üresen indul.
- A Chrome-ban a webhelyadatok törlése az app adatait is törli — előtte ments.
- A kód nyilvános, az adataid nem: azok sosem kerülnek fel a GitHubra.
- A `Code.gs` (a közvetítő) titkos kulcsot tartalmaz, ezért ne tedd a GitHub-repóba.
- A `js/vendor/qrcode.js` Kazuhiko Arase QR-kód könyvtára (MIT licenc).
