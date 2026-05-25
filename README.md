# 👥 Aplecs

**Aplecs** és una aplicació web d'alta fidelitat dissenyada per a docents de primària i secundària. Permet generar grups de treball de forma intel·ligent, flexible i altament visual en pocs segons.

L'aplicació està optimitzada per a l'entorn **GitHub Codespaces** i funciona de forma completament autònoma ("out-of-the-box"), emmagatzemant tota la informació de forma local al navegador (sense necessitat de bases de dades o servidors de dades externs complexos).

---

## ⚡ Característiques Principals

### 1. Mode Ràpid (Creació de grups a l'aula)
*   **Dissenyat per ser projectat:** Ideal per fer grups ràpids enmig de la classe de cara als alumnes. **No es mostra cap marca visual de conflicte, incompatibilitat o nivell en aquest mode**, mantenint la total privadesa del criteri del docent.
*   **Pujar Alumnes:** Enganxa la teva llista d'alumnes des de qualsevol document (un alumne per línia) o carrega directament un exemple de demostració de 18 alumnes per provar l'aplicació.
*   **Configuració Intel·ligent:** Indica el nombre de grups desitjat o el nombre de membres per grup; l'aplicació calcularà l'altre paràmetre de forma automàtica.
*   **Botons Principals:**
    *   `"Generar Grups a l'Atzar"`: Genera agrupacions 100% aleatòries immediatament.
    *   `"Tornar a Barrejar"`: Reorganitza els alumnes completament des de zero a l'atzar.
    *   `"Barrejar sense Repetir Companys"`: Botó intel·ligent que analitza l'historial de la sessió i utilitza un algorisme d'optimització de cerca local (*Hill Climbing*) per evitar que els alumnes tornin a coincidir amb persones amb les quals ja han treballat en la sessió activa. A més, **intenta evitar de forma silenciosa (sota mànega) col·locar alumnes incompatibles junts**, sense mostrar cap avís en pantalla.

### 2. Mode Avançat (Projectes Llargs i Heterogenis)
*   **Atributs individuals dels Alumnes:**
    1.  `Nivell Educatiu / Rendiment`: Assigna un nivell (**Alt**, **Mitjà**, **Baix**) per garantir que tots els grups siguin acadèmicament equitatius, equilibrats i heterogenis.
    2.  `Incompatibilitats / Restriccions`: Llista de forma senzilla i visual quins alumnes **no poden compartir grup** sota cap concepte.
*   **Algorisme Avançat Resistent:** Calcula de manera instantània els millors grups equilibrant els nivells i respectant de forma absolutament estricta totes les incompatibilitats. En cas d'incompatibilitats impossibles de resoldre matemàticament, l'aplicació en dona avís i permet resoldre-ho manualment.
*   **Retocs Finals amb Drag-and-Drop:** Un cop creats els grups, pots ajustar qualsevol membre arrossegant visualment la seva targeta d'un grup a un altre amb el ratolí. L'estat d'incompatibilitats es comprova en temps real i s'indica amb un avís groc de conflicte (`⚠️`) si col·loques dos alumnes incompatibles junts.

### 3. Gestió de Dades
*   `"Exportar Projecte (.json)"`: Descarrega un fitxer local amb tot l'estat actual (alumnes, nivells configurats, incompatibilitats, historial de co-ocurrència de la sessió i la graella de grups actual).
*   `"Importar Projecte"`: Carrega el fitxer `.json` descarregat prèviament per restaurar l'aplicació exactament on la vas deixar.
*   `"Descarregar Graella de Grups (.csv / Excel)"`: Descarrega una taula compatible amb Microsoft Excel o Google Sheets que conté els grups en columnes, llesta per imprimir o projectar a l'aula.

---

## 🚀 Com Començar a GitHub Codespaces (1 sol clic)

L'aplicació està dissenyada per arrencar immediatament a GitHub Codespaces:

1.  Obre el teu repositori a GitHub.
2.  Clica al botó verd **"Code"**, selecciona la pestanya **"Codespaces"** i clica a **"Create codespace on main"**.
3.  Un cop s'hagi obert l'entorn de treball (VS Code a la web), obre un terminal nou.
4.  Executa la següent comanda al terminal:
    ```bash
    python server.py
    ```
5.  Apareixerà una notificació a la cantonada inferior dreta indicant que hi ha un servei web actiu al port `8000`. Fes clic a **"Open in Browser"** (Obrir en el navegador).
6.  **Llest!** Ja pots utilitzar l'aplicació de forma 100% interactiva.

---

## 🛠️ Detall de la Lògica dels Algorismes

### Algorisme "Barrejar sense Repetir Companys"
*   **Matriu de Co-ocurrència:** S'estructura una clau interna per a cada parella de la sessió `A___B` i es guarda el nombre de vegades que han estat junts en un grup.
*   **Evitació Silenciosa:** A més de les repeticions, en avaluar el cost s'aplica una penalització alta (`+500` per incidència) si coincideixen alumnes marcats com a incompatibles a la base de dades. D'aquesta manera, **el sistema evita ajuntar-los de forma automàtica i sota mànega**, però sense revelar cap avís visual a la pantalla (perfecte per projectar davant dels alumnes).
*   **Cerca Local (Hill Climbing):** Partint d'una distribució a l'atzar, el sistema realitza fins a 3.000 intents de permutació de parelles d'alumnes, consolidant només les millores de cost total.

### Algorisme Mode Avançat
*   **Funció d'Avaluació de Restriccions:** Cada incompatibilitat no respectada té un cost de penalització dura (`10.000`). El desequilibri acadèmic es mesura sumant el quadrat de la diferència entre el nombre de membres d'un nivell en un grup i la mitjana:
    $$\text{Cost\_Nivell} = \sum_{g} \sum_{L \in \{\text{Alt, Mitjà, Baix}\}} (Count_g(L) - Expected(L))^2$$
*   **Hill Climbing amb Random Restarts:** L'algorisme genera una assignació aleatòria inicial i optimitza el cost de manera iterativa. Per evitar que es quedi bloquejat en solucions subòptimes, s'apliquen fins a **15 reinicis aleatoris complets**.

---

## 💻 Autor i Suport

Fet amb molt de carinyo per **[Francesc Sala Carbó](https://github.com/SirSiscu)**.

Si trobes que aquesta eina és d'utilitat per al teu dia a dia com a docent o vols donar suport al seu desenvolupament lliure, pots convidar-me a un cafè:

👉 **[Buy me a coffee](https://buymeacoffee.com/francescsala)** ☕
