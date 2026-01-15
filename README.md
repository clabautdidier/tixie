# Tixie — AI-assisted large application experiment

Samenvatting
-----------
Tixie is een experimenteel project dat tot doel heeft een volledige, "grote" applicatie te bouwen met behulp van AI-technologieën. Het project dient twee doelen: (1) onderzoeken hoe AI het ontwikkelproces kan versnellen en verbeteren, en (2) input leveren om het lessenpakket van de hogeschool aan te passen aan de nieuwe technologieën.

Hoofdlijnen van het project
--------------------------
- Backend: Spring Boot (Java, Maven) in de module `tixie.api`.
- Frontend: eenvoudige admin UI onder `frontend/admin` (HTML/CSS/JS).
- Database-migraties: SQL-migraties aanwezig in `tixie.api/src/main/resources/db/migration` (Flyway-style).
- Doel: een complete applicatie met gebruikersbeheer, locaties, configuratie-items en eigenschappen, gebouwd iteratief met AI-ondersteuning.

Repository structuur (belangrijkste paden)
-----------------------------------------
- `/tixie.api` — Spring Boot applicatie
  - `pom.xml`, `mvnw`, `mvnw.cmd` — Maven wrapper en projectconfig
  - `src/main/java/be/thomasmore/tixie/api` — Java broncode (controllers, services, repositories, security, dto, entity, etc.)
  - `src/main/resources/db/migration` — SQL-migraties (V1.0.0__, V1.0.1__...)
  - `src/test` — unit/integratietests
- `/frontend/admin` — statische admin interface (HTML + JS)
- `architectuur/` — ontwerp- en requirements-documentatie

Belangrijke architectuur- en designkeuzes
-----------------------------------------
- Spring Boot voor de backend API met traditionele layered architecture (controller → service → repository).
- Flyway-style SQL-migraties voor database-schema en testdata.
- Frontend is vooralsnog statisch (plain HTML/JS) en communiceert met de backend via REST-API.
- Authentificatie: JWT-gebaseerde tokenstroom (controleer `tixie.api` security package).

Hoe de applicatie lokaal te draaien
----------------------------------
Voordat je start: zorg dat Java (11+), Maven (of de wrapper) en een geschikte database (H2/Postgres/MySQL zoals geconfigureerd) geïnstalleerd en bereikbaar zijn.

Backend (Windows PowerShell):

```powershell
# vanuit de project root
cd tixie.api
# start de Spring Boot applicatie via Maven wrapper
.\mvnw spring-boot:run
```

- De applicatie gebruikt de migraties in `src/main/resources/db/migration` om tabellen en testdata te maken.
- Bij eerste start wordt er een `admin` gebruiker aangemaakt en het wachtwoord wordt tijdelijk naar de logs geschreven (controleer de console/logs voor die informatie).

Frontend:

- De admin UI staat in `frontend/admin`. Dit is een set statische bestanden; je kunt ze lokaal openen in een browser (file://) of ze serveren via een simpele HTTP-server.
- De frontend roept de backend-API endpoints aan (zie `frontend/admin/js` bestanden zoals `api.js`, `auth.js`). Controleer CORS/host-instellingen als de UI en API op verschillende origins draaien.

Database
--------
- SQL migraties: `tixie.api/src/main/resources/db/migration`.
- Pas `src/main/resources/application.properties` aan om de JDBC-URL, gebruiker en wachtwoord in te stellen voor jouw database.

Bekende issues en belangrijke TODOs
----------------------------------
- Authenticatie: bij eerste start wordt het admin-wachtwoord gelogd, maar sommige gebruikers ervaren 401 Unauthorized bij het inloggen. Dit wordt onderzocht. Mogelijke oorzaken:
  - mismatch tussen wat de frontend verzendt en de verwachte DTO in de backend
  - security-config of password encoder misconfiguratie
  - user details service wiring (er zijn aanwijzingen dat er geen expliciete `setUserDetailsService` beschikbaar is op `DaoAuthenticationProvider` — controleer hoe `AuthenticationManager` en `UserDetailsService` worden geregistreerd)
- Communicatie-DTOs: momenteel wordt er vaak direct met `User` entity-objecten gecommuniceerd tussen frontend en backend. Dit wordt aangepast: er komt een aparte `User` DTO voor API-communicatie, en we zullen mapping via mapper-classes toevoegen (bv. in `mapper/` package).

Aanbevolen volgende stappen
---------------------------
1. Voeg een `UserDTO` toe en gebruik die voor alle API-calls (vermijdt leaking van entity details).
2. Onderzoek en repareer het authenticatiepad: controleer `security` package, `AuthenticationManagerBuilder`, en waar `UserDetailsService` wordt aangemaakt/geregistreerd.
3. Voeg een kleine set unit- en integratietests voor security endpoints (login/happy-path en 401-edge-case).
4. Overweeg de frontend te moderniseren (bv. React/Vue) of een eenvoudige static-server tijdens ontwikkeling.

Bijdragen
---------
- Fork & clone, maak feature-branches, en open PR's.
- Voeg heldere commit messages en beschrijf de purpose van veranderingen (vooral rond security).

Contact / Documentatie
----------------------
- Zie `architectuur/` voor ontwerp- en requirements-documenten.
- Zie `tixie.api/HELP.md` voor project-specifieke hints (indien aanwezig).

Licentie
--------
- Voeg hier je licentie toe of vraag het team welke licentie gebruikt moet worden.

© Project Tixie — Onderwijsexperiment voor AI-ondersteunde softwareontwikkeling

