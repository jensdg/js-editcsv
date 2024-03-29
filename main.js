import { importCVSBtn, downloadCSVBtn, imptTblFormat } from './modules/data.js';
import { createModal, insertChartBtn } from './modules/charts.js';
import { insertRowsBtn, insertColsBtn, cutSelectBtn, copySelectBtn, pasteInTblBtn, deletRowsBtn, 
    deletColsBtn, insertTable } from './modules/table.js';

// example table/csv to start with
let startTable = `Hauptartikelnr;Artikelname;Hersteller;Beschreibung;Materialangaben;Geschlecht;Produktart;Ärmel;Bein;Kragen;Herstellung;Taschenart;Grammatur;Material;Ursprungsland;Bildname
102.85;"Paul - Men's Supersoft Organic T-Shirt";Nakedshirt;"Single Jersey, Rundhalsausschnitt mit Rippstrickbündchen, Nackenband, Seitennähte, Doppelnaht an Ärmelabschluss und Bund, Medium Fit, Neutrales Größenetikett im Nacken ";"100% Bio-Baumwolle ";Herren;T-Shirts;Kurzarm;;Rundhals;"Fair & Umweltfreundlich";;"200 g/m²";Bio-Baumwolle;;102.85.jpg
110.85;"Mouse - Girl's Fashion T-Shirt";Nakedshirt;"Single Jersey, Rundhalsausschnitt mit Rippstrickkragen,  
Ärmelabschluss und Bund sind gekräuselt, Seitennähte,  
Neutrales Größenetikett im Nacken. ";"100 % Baumwolle";Kinder;T-Shirts;Kurzarm;;Rundhals;Fair;;"155 g/m² ";Baumwolle;;110.85.jpg
105.85;"Coco - Women's Tank Top";Nakedshirt;"Single Jersey Hals- und Armausschnitte mit Rippstrick-Einfassung, 
Seitennähte, Doppelnaht am Bund, Medium Fit, Neutrales Größenetikett im Nacken. ";"100 % Baumwolle";Damen;T-Shirts;Ärmellos;;Rundhals;Fair;;"155 g/m²";Baumwolle;;105.85.jpg
BL1080;"Ladies Tank Top";Bella;"gekämmte Baumwolle, taillierter; langer Schnitt; tiefer 
Rundhals -Ausschnitt / Boat Neck, schmale; fein-gerippte Bündchen (Baby-Ripp), Seitennähte, Mediumweight / mittelschwerer Stoff
";"100 % Baumwolle";Damen;T-Shirts;Ärmellos;;Boat-Neck;Konventionell;;"195 g/m²";Baumwolle;GT;bl1080.jpg
ALW2002;"Women´s Mesh Back Sports Bra";"All Sport";"Antimikrobiell, Atmungsaktiver ""Racer-Back"" aus Netzstoff für festen Halt, Optimale Passform durch StretchFlex Technik, Vorne doppellagig, Elasthan knit Jersey";;Damen;T-Shirts;Ärmellos;;Boat-Neck;;;;Polyestergemisch;PH;alw2002.jpg
A136;"Solid Brushed Twill Cap";Anvil;"Baumwoll-Twill, Sechs Segmente, Knopf und sechs umstickte Luftlöcher, Vorgeformter Schirm mit sechs Nähten, Klemmverschluss mit Messingschnalle und verdecktem Messingringeinschub, Farblich abgestimmtes Schweißband, Unbedruckt maschinenwaschbar, Leicht gebürstet.";"100% Baumwolle";;Caps;;;;Konventionell;;;Baumwolle;KH;a136.jpg`;

let activeTab;//indicates the open tab
let tabHeaders = ['Data', 'Table', 'Charts'];//tab names

createTabs(document.body, tabHeaders);
let tabContent = createTabContent(document.body, tabHeaders);//array of tab content divs

// create the modal box with canvas for the pie chart
let canvasInModal = createModal('divCanvas', document.body, 450, 300);
// insert the buttons
importCVSBtn(tabContent[0]);
downloadCSVBtn(tabContent[0]);
pasteInTblBtn(tabContent[1]);
cutSelectBtn(tabContent[1]);
copySelectBtn(tabContent[1]);
insertRowsBtn(tabContent[1]);
insertColsBtn(tabContent[1]);
deletRowsBtn(tabContent[1]);
deletColsBtn(tabContent[1]);
insertChartBtn(tabContent[2], canvasInModal, 'chartBtn1');
insertChartBtn(tabContent[1], canvasInModal, 'chartBtn2');

// some spans for th UI
let insert = document.createElement('span');
insert.innerHTML = 'insert';
insert.classList.add('insert');
tabContent[1].appendChild(insert);

let del = document.createElement('span');
del.innerHTML = 'delete';
del.classList.add('delete');
tabContent[1].appendChild(del);

let chartSelect = document.createElement('span');
chartSelect.innerHTML = 'select a single column';
chartSelect.classList.add('chartSelect');
tabContent[2].appendChild(chartSelect);

let pieChart = document.createElement('span');
pieChart.innerHTML = 'Pie Chart';
pieChart.classList.add('pieChart');
tabContent[2].appendChild(pieChart);
tabContent[1].appendChild(pieChart.cloneNode(true));

// some lines for the UI
let line_1 = document.createElement('div');
line_1.classList.add('line_1');
document.body.appendChild(line_1);
let line_2 = document.createElement('div');
line_2.classList.add('line_2');
document.body.appendChild(line_2);
let line_3 = document.createElement('div');
line_3.classList.add('line_3');
document.body.appendChild(line_3);
let line_4 = document.createElement('div');
line_4.classList.add('line_4');
document.body.appendChild(line_4);

// insert a start table
let parsedStartTable = imptTblFormat(startTable, ';');
insertTable(parsedStartTable);


/**
 * Creates tab buttons under the parent element which link to the tab contents. 
 * @param {*} parent element
 * @param {*} tbNames array of tab names
 */
function createTabs(parent, tbNames){
    let divTabs = document.createElement('div');
    divTabs.classList.add('tab');
    parent.appendChild(divTabs);

    for (let i = 0; i < tbNames.length; i++){
        let tabBtn = document.createElement('button');
        tabBtn.id ='tbBtn' + i;
        tabBtn.classList.add('tablinks', tbNames[i].toLowerCase() + 'TabBtn');
        tabBtn.onclick = (event) => openTab(event, tbNames[i]);
        tabBtn.innerHTML = tbNames[i];
        divTabs.appendChild(tabBtn);
    }
}


/**
 * Creates the div containers for the tab contents.
 * @param {*} parent 
 * @param {*} tbNames 
 * @returns array of the content divs
 */
function createTabContent(parent, tbNames){
    let divContent = [];
    for (let i = 0; i < tbNames.length; i++){
        divContent[i] = document.createElement('div');
        divContent[i].id = tbNames[i];
        divContent[i].classList.add('tabcontent');
        parent.appendChild(divContent[i]);
    }
    return divContent;
}


/**
 * Deactivates all tab buttons and hides their content. Then activates the triggering 
 * tab button and displays the tab content.   
 * see https://www.w3schools.com/howto/howto_js_tabs.asp
 * @param {*} evt 
 * @param {*} tabName 
 */
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    activeTab = tabName; //set indicator variable for the active tab
    evt.currentTarget.className += " active";
  }


/**
 * Clicks the tab button with the given name, thus activates it. Sets the variable indicating
 * the active tab.
 * @param {*} tabName the tab that becomes activated
 */
function clickTab(tabName){
    if (tabName == 'Table'){
        document.getElementById('tbBtn1').click();
        activeTab = tabName;
    } else if (tabName == 'Data'){
        document.getElementById('tbBtn0').click();
        activeTab = tabName;
    } else {
        document.getElementById('tbBtn2').click();
        activeTab = tabName;
    }
}

export { clickTab, activeTab };