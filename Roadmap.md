# 🗺️ Full de Ruta (Roadmap) - Aplecs

Aquest document detalla el desenvolupament del projecte organitzat per fases. Ens serveix per realitzar el seguiment i marcar les fites aconseguides de l'aplicació **Aplecs**.

---

## 🚀 Fase 1: Mode Ràpid i Gestió de Dades
Aquesta fase s'enfoca a proporcionar la funcionalitat bàsica de creació de grups i les eines d'importació i exportació de dades.

*   `[x]` Disseny i implementació de l'entorn de servidor web de desenvolupament (`server.py`) amb fallback automàtic a la llibreria estàndard de Python (zero dependències).
*   `[x]` Disseny i maquetació responsive en català amb Tailwind CSS i estètica premium (Outfit Font, Glassmorphism).
*   `[x]` Àrea d'entrada de text per a la llista d'alumnes amb detecció i comptador de línies en temps real.
*   `[x]` Càrrega intel·ligent de dades de demostració (Demo de 18 alumnes) amb 1 sol clic per a proves ràpides.
*   `[x]` Interconnexió intel·ligent entre els inputs de "Nombre de grups" i "Alumnes per grup" (es calculen un a l'altre automàticament).
*   `[x]` Algorisme de generació de grups 100% a l'atzar (`"Generar Grups a l'Atzar"` i `"Tornar a Barrejar"`).
*   `[x]` Implementació de la matriu de co-ocurrència per desar l'historial de companys que han treballat junts durant la sessió.
*   `[x]` Algorisme intel·ligent `"Barrejar sense Repetir Companys"` per minimitzar de forma robusta la repetició de companys (Cerca local *Hill Climbing*).
*   `[x]` **Evitació Silenciosa d'Incompatibilitats:** L'algorisme ràpid intenta silenciosament evitar posar companys incompatibles junts sota mànega, per a una total tranquil·litat del docent al projectar a classe.
*   `[x]` Secció de Gestió de dades:
    *   `[x]` `"Exportar Projecte (.json)"`: Baixar tot l'estat en un arxiu local.
    *   `[x]` `"Importar Projecte"`: Pujar un projecte anterior des d'un `.json`.
    *   `[x]` `"Descarregar Graella de Grups (.csv / Excel)"`: Baixar una graella neta en format CSV amb codificació UTF-8 BOM apta per a Excel.

---

## 🛠️ Fase 2: Mode Avançat i Drag-and-Drop
Aquesta fase afegeix la capacitat de fer distribucions acadèmiques equilibrades, control de conflictes i ajustos visuals directes amb el ratolí.

*   `[x]` Creació del selector de Pestanyes (Tabs) per alternar fàcilment entre Mode Ràpid i Mode Avançat sense perdre les dades de l'estat.
*   `[x]` Sincronització intel·ligent dels alumnes entre pestanyes que manté els nivells i incompatibilitats configurats per a cada alumne si el seu nom segueix a la llista de text.
*   `[x]` Atributs d'alumne:
    *   `[x]` **Rendiment / Nivell Educatiu** (Alt, Mitjà, Baix).
    *   `[x]` **Incompatibilitats / Exclusions** (selecció de companys amb qui no pot compartir grup).
*   `[x]` Modal d'edició d'atributs interactiu i dinàmic per a cada alumne amb relacions de restricció bidireccionals automàtiques.
*   `[x]` Algorisme d'equilibrat acadèmic heterogeni estricte respectant incompatibilitats dures (Hill Climbing amb 15 Random Restarts).
*   `[x]` Dibuix de targetes de grup amb comptador de membres en temps real i desglossament/resum de nivells per grup en Mode Avançat.
*   `[x]` Implementació del sistema de retocs manuals amb **Drag-and-Drop natiu** (arrossegar alumnes de targeta a targeta actualitzant l'estat i guardant a `localStorage`).

---

## ✨ Fase 3: Animacions, Control de Qualitat i Poliment Visual
Aquesta fase aporta valor afegit mitjançant transicions atractives, controls dinàmics d'errors i validació UX premium.

*   `[x]` Incorporació de fons amb gradients animats i orbes flotants en HSL que fan que la interfície se senti dinàmica.
*   `[x]` Integració de transicions de canvi d'estat visuals en hover sobre targetes, botons i elements d'entrada.
*   `[x]` Implementació d'animacions escalonades (cascada) en renderitzar els grups resultants.
*   `[x]` Disseny i programació d'un commutador de **Mode Fosc (Dark Mode)** adaptatiu de primer nivell guardat a preferències del docent.
*   `[x]` **Poliment visual en Mode Fosc:** Millora en l'estil dels botons outline i desactivats (disabled) per aconseguir una integració estètica perfecta amb fons foscos.
*   `[x]` **Privadesa en Mode Ràpid:** Ocultació visual completa de qualsevol indicació de conflicte, alerta vermella o línia de incompatibilitat en Mode Ràpid (per a projecció davant de la classe).
*   `[x]` Incorporació de reconeixement de l'autor (Francesc Sala Carbó), enllaç al seu perfil de GitHub, imatge de perfil (avatar) i botó de **Buy me a coffee**.
*   `[x]` Notificacions dinàmiques emergents en català (success, warning, error, info) que acompanyen cada acció del docent.
*   `[x]` Detecció de conflictes manuals en temps real (en Mode Avançat): s'indica de forma visual a les targetes del grup en vermell i amb icones d'alerta si el docent col·loca manualment companys incompatibles.
*   `[x]` Gestió de persistència integral automàtica en el navegador de l'usuari amb `localStorage`.
*   `[x]` Validació completa d'execució immediata per garantir una experiència autònoma ("out-of-the-box").
