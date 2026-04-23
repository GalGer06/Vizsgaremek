# Manuális Tesztelési Terv - Future Nature Projekt

Ez a dokumentum a Future Nature alkalmazás manuális tesztelési eseteit tartalmazza táblázatos formában.

## 1. Regisztráció és Bejelentkezés

| Teszteset Megnevezése | Elvárt Eredmény | Tényleges Eredmény |
|:---|:---|:---|
| Sikeres regisztráció valid adatokkal | A felhasználó létrejön, átirányítás a login oldalra vagy automatikus belépés. | Sikeres, a felhasználó bekerült az adatbázisba és átirányított a belépéshez. |
| Regisztráció már létező e-mail címmel | Hibaüzenet megjelenítése, a regisztráció sikertelen. | Megjelent a "Email már használatban" hibaüzenet. |
| Jelszó erősség ellenőrzése | Gyenge jelszó esetén  figyelmeztetés. | A rendszer kérte a legalább 6 karaktert. |
| Sikeres bejelentkezés | Helyes adatokkal a felhasználó a főoldalra kerül, a profilja betöltődik. | A token mentése megtörtént, a főoldal megjelent. |
| Bejelentkezés hibás jelszóval | Hibaüzenet: "Hibás felhasználónév vagy jelszó". | Megfelelő hibaüzenet jelent meg, a belépés elutasítva. |
| Kijelentkezés folyamata | A kijelentkezés gombra kattintva a munkamenet megszűnik, és a bejelentkező oldalra kerül a felhasználó. | A localStorage törlődött, visszakerültem az /auth oldalra. |

## 2. Navigáció és Felület

| Teszteset Megnevezése | Elvárt Eredmény | Tényleges Eredmény |
|:---|:---|:---|
| Fejléc gombok elrendezése | Az emoji és a szöveg egy sorban jelenik meg (nem törik meg). | A flexbox beállítások után az emojik és szövegek tökéletesen egy sorban vannak. |
| Mobil menü működése | Hamburger menüre kattintva a menüpontok listája legördül. | A menü animáltan lenyílik, minden link kattintható marad. |
| Nyelvváltás (Google Translate) | A "TRANSATE" gombra kattintva az oldal nyelve angolra vált. | A Google API lefordította az elemeket, a váltás sikeres. |
| Alapvető reszponzivitás | Különböző képernyőméreteken (tablet, mobile) az elemek nem csúsznak szét. | Mobil és tablet nézetben is stabil a layout. |
| Navigáció a logóra kattintva | A logóra kattintva a felhasználó bárhonnan visszakerül a főoldalra. | A navigáció azonnal végrehajtódik. |

## 3. Feladatok és Pontozás

| Teszteset Megnevezése | Elvárt Eredmény | Tényleges Eredmény |
|:---|:---|:---|
| Napi feladatok betöltése | Minden nap 10 új vagy véletlenszerű kérdés jelenik meg. | A 10 kérdés sikeresen betöltődött a backendről. |
| Helyes válasz pontozás | Helyes válasz esetén felugró animáció (+30 pont). | A zöld "+30" felirat megjelent és elhalványult. |
| Téma teljesítése ablak | Egy téma utolsó kérdése után megjelenik a záró felugró ablak. | Az utolsó kérdés után a gratuláló ablak sikeresen felugrott. |
| Kérdések sorrendje | Csak azután választható a következő kérdés, ha az előző ki lett töltve. | A rögzítés előtt a következő kérdések rejtve maradnak. |
| Rossz válasz jelzése | Hibás válasz esetén a kiválasztott elem pirosra színeződik, és a helyes válasz zölden villan fel. | A vizuális visszajelzés egyértelmű. |
| Pontszám frissülése | A profil oldalon a pontszám azonnal frissül válaszadás után. | A pontszám szinkronizálva van a backenddel. |

## 4. Ticket Rendszer

| Teszteset Megnevezése | Elvárt Eredmény | Tényleges Eredmény |
|:---|:---|:---|
| Új kérdés beküldése | A felhasználó tud új kérdést és válaszokat javasolni. | A POST kérés sikeres, a Ticket mentve. |
| Kötelező mezők a Ticketnél | Üresen hagyott kérdés vagy válasz beküldésekor hibaüzenet (validáció). | A gomb hibaüzenetet dob. |

## 5. Adminisztrációs Funkciók

| Teszteset Megnevezése | Elvárt Eredmény | Tényleges Eredmény |
|:---|:---|:---|
| Admin panel elérése | Csak admin jogú felhasználó látja és érheti el az /admin oldalt. | Sima felhasználóval próbálva átirányított a főoldalra. |
| Kérdések szerkesztése | Az admin képes módosítani a meglévő kérdések szövegét vagy válaszait. | A módosítások azonnal látszódnak a felhasználói oldalon is. |
| Felhasználók kezelése | Admin képes felhasználókat törölni vagy jogkört módosítani. | A jogosultság váltás (Admin/User) működik. |
| Admin statisztikák | Az admin felületen látható az összes regisztrált felhasználó száma és a beküldött kérdések listája. | Az adatok valós időben frissülnek az adatbázis alapján. |

## 6. Profil és Beállítások

| Teszteset Megnevezése | Elvárt Eredmény | Tényleges Eredmény |
|:---|:---|:---|
| Profilkép feltöltése | A felhasználó tud új profilképet beállítani, ami azonnal frissül a fejlécben is. | A base64 kódolású kép sikeresen mentésre került. |
| Ranglista megtekintése | A felhasználó látja a helyezését a többi felhasználóhoz képest. | A sorrend pontszám alapján helyes. |
| Felhasználónév módosítása | A profil oldalon a felhasználó meg tudja változtatni a megjelenített nevét. | A frissítés után az új név látható a fejlécben is. |

## 7. Egyéb és Hibatűrés

| Teszteset Megnevezése | Elvárt Eredmény | Tényleges Eredmény |
|:---|:---|:---|
| 404-es oldal tesztelése | Nem létező URL megadásakor egy "Az oldal nem található" üzenet jelenik meg. | A NotFound komponens helyesen betöltődött. |
| Hálózati hiba kezelése | Ha a szerver nem elérhető, az alkalmazás "Szerver hiba" vagy "Betöltés sikertelen" üzenetet ad. | A catch ágakban kezelt hibaüzenetek megjelennek. |
| Gyors egymás utáni kattintás | Többszöri gyors kattintás a válaszokra nem okoz dupla pontgyűjtést vagy fagyást. | A `checkedAnswers` állapot megakadályozza a többszöri pontozást. |

## 8. Speciális Funkciók és Logika

| Teszteset Megnevezése | Elvárt Eredmény | Tényleges Eredmény |
|:---|:---|:---|
| Zöld átmeneti animáció | A bolygónk védelme gombra kattintva egy teljes képernyős zöld overlay jelenik meg. | Az overlay megjelent, sima átmenetet biztosítva. |
| Automatikus görgetés következő kérdéshez | Válaszadás után az oldal automatikusan a következő kérdéshez görget. | A `window.scrollTo` simán a következő kártya közepére vitt. |
| Már megválaszolt kérdések betöltése | Az oldal újratöltésekor a már megválaszolt kérdések "lelakatolt" állapotban maradnak a korábbi válasszal. | A backendről érkező `isAnswered` flag alapján az állapot helyreállt. |
| Profilkép placeholder | Ha a felhasználónak nincs profilképe, a neve kezdőbetűje jelenik meg egy színes körben. | A körben a név kezdőbetűje betű jelent meg. |

