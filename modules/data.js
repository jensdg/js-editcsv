import { insertTable } from './table.js';


/**
 * Adds the import CSV button represented ba a label under the parent element.
 * By clicking a CSV file can be selected which is then imported, parsed and 
 * inserted into the document body as a html table.
 * @param {*} parent parent element
 */
function importCVSBtn(parent){
    let importBtn = document.createElement('input');
    importBtn.id = 'imptBtn';
    importBtn.type = 'file';
    importBtn.classList.add('btn', 'imptBtn');

    // label visible instead of input type file button
    let impLabel = document.createElement('label');
    impLabel.for = 'imptBtn';
    impLabel.classList.add('btn', 'impLabel');
    impLabel.innerHTML = 'import CSV';
    impLabel.onclick = function(){
        importBtn.click();
    }
    parent.appendChild(importBtn);
    parent.appendChild(impLabel);    
    let impLImg = document.createElement('span');// span for the button/label icon
    impLImg.classList.add('btn', 'impLImg');
    impLabel.appendChild(impLImg);
    
    importBtn.addEventListener('change', function () {
        let fr=new FileReader();
        fr.onload = function() {
            let parsedRowCellsArr = imptTblFormat(fr.result, ';');
            insertTable(parsedRowCellsArr);
            importBtn.value = '';//clear filepath for reload 
        }    
        fr.readAsText(this.files[0]);
        
    });
  }

/** 
 * Splits rows of a csv by line feed \n, then reformats the resulting 
 * rows with falsly splitted lines due to line feeds \n in text cells.
 * Afterwards the reformatted rows are split by the given 'separator'. 
 * Falsly splitted lines with separator (i.e. ;) in quotes then are 
 * corrected by invoking the function 'ignoreInQuotes' on each row.
 * @param {string} data - the read csv
 * @param {string} separator - the separator to split the lines with
 * @returns array of array of row cells 
 */
function imptTblFormat(data, separator){
    //see https://stackoverflow.com/a/60981376
    let allLines = data.split(/\r\n|\n/).filter(Boolean); //.filter treats line feed at the end of text
    let reformattedRows = [];
    const parts = [];

    for (const line of allLines) {
        const quoteMatches = line.match(/"/g);
        const isEvenNumberOfQuotes = !quoteMatches || quoteMatches.length % 2 == 0;
        const noPartialRowsYet = !parts.length;

        if (noPartialRowsYet)
        {
            if (isEvenNumberOfQuotes) // normal row
            {
                reformattedRows.push(line);
            }
            else // this is a partial row
            {
                parts.push(line);
            }
        }
        else // continuation of a partial row
        {
            parts.push(line);
            if (!isEvenNumberOfQuotes) // we got all of the parts
            {                
                // replaces \n with html line feed <br>
                reformattedRows.push(parts.join('<br>'));
                parts.length = 0;
            }
        }
    }
    let arrRowCells = [];
    // treats the reformatted rows by splitting them by the separator ignoring 
    // separators inside quotes
    for (let i = 0; i < reformattedRows.length; i++){    
        let rowCells = ignoreInQuotes(reformattedRows[i], separator);
        arrRowCells.push(rowCells);
    }
    return arrRowCells;
}
    
/**
 * Splits csv's ignoring separators in double quotes, i.e. ("...; ...").
 * see https://stackoverflow.com/a/30081966
 * @param {string} text - comma separated text or row
 * @param {string} separator
 * @returns array of text splitted by separator except separator in quotes
 */

function ignoreInQuotes(text, separator){
    const textArray = Array.from(text);
    let dataArray = new Array();
    let arrayIndex = 0;
    let quotesSeen = false;
    for (let char = 0; char < textArray.length; char++){
    if ((textArray[char] != separator || quotesSeen) && textArray[char] != '"'){
        if (dataArray[arrayIndex] == undefined){
        dataArray[arrayIndex] = textArray[char];
        } else {
        dataArray[arrayIndex] += textArray[char];
        }
        
    }
    else if (textArray[char] == '"'){
        if (quotesSeen){
        quotesSeen = false;
        if (dataArray[arrayIndex] == undefined){
            dataArray[arrayIndex] = textArray[char];
        } else {
            dataArray[arrayIndex] += textArray[char];
        }
        }
        else{
        quotesSeen = true;
        if (dataArray[arrayIndex] == undefined){
            dataArray[arrayIndex] = textArray[char];
        } else {
            dataArray[arrayIndex] += textArray[char];
        }
        }
    }
    else if (textArray[char] == separator && !quotesSeen){
        arrayIndex++;
    }
    }
    return dataArray;
}


/**
 * Adds the export CSV button under the parent element. By clicking
 * converts the html table into the CSV format and downloads it as a file.
 * @param {*} parent element
 */
function downloadCSVBtn(parent) {
    // see https://www.geeksforgeeks.org/how-to-export-html-table-to-csv-using-javascript/

    let exportBtn = document.createElement('button');
    exportBtn.id = 'downlBtn';
    exportBtn.type = 'button';
    exportBtn.classList.add('btn', 'exportBtn')
    exportBtn.innerHTML = 'export CSV';
    parent.appendChild(exportBtn);
    
    let exportBImg = document.createElement('span');//span for the button icon
    exportBImg.classList.add('btn', 'exportBImg');
    exportBtn.appendChild(exportBImg);

    
    exportBtn.addEventListener('click', function () {
        let csv_data = [];
        // Get each row data
        let rows = document.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
    
            // Get each column data
            let cols = rows[i].querySelectorAll('td,th');
    
            // Stores each csv row data
            let csvrow = [];
            for (let j = 1; j < cols.length; j++) {
    
                // Get the text data of each cell of
                // a row and push it to csvrow
                let col = cols[j].innerText;
                csvrow.push(col);
            }    
            // Combine each column value with comma
            csv_data.push(csvrow.join(";"));
        }
        // combine each row data with new line character
        csv_data = csv_data.join('\n');
        downloadFile(csv_data);
    })
}


/**
 * Create a CSV file, feeds the data into it, and triggers the browser to download it.
 * @param {*} csv_data the data for the CSV file
 */
function downloadFile(csv_data) {
// see https://www.geeksforgeeks.org/how-to-export-html-table-to-csv-using-javascript/
    // Create CSV file object and feed our
    // csv_data into it
    let CSVFile = new Blob([csv_data], { type: "text/csv" });

    // Create to temporary link to initiate
    // download process
    let temp_link = document.createElement('a');

    // Download csv file
    temp_link.download = "Export.csv";
    let url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;

    // This link should not be displayed
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);

    // Automatically click the link to trigger download
    temp_link.click();
    document.body.removeChild(temp_link);
}

export { importCVSBtn, downloadCSVBtn, imptTblFormat, ignoreInQuotes };