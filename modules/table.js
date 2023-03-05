import { clickTab, activeTab } from '../main.js';
import { imptTblFormat } from './data.js';

let divTable;
let selectedRows = [];
let selectedCols = [];
let selStrt = false;
let editCell;
let inEdit = false;

/**
 * Takes the array of array of all row cells, creates the table in the needed format and
 * inserts it into the div for the table under the document body.
 * @param {*} allRowCells array of array of row cells
 */
function insertTable(allRowCells) {
    // see https://code.tutsplus.com/de/tutorials/parsing-a-csv-file-with-javascript--cms-25626
        
    let table = '<table class="table" id="table">';
    for (let singleRow = 0; singleRow < allRowCells.length; singleRow++) {       
    if (singleRow === 0) {
        table += '<thead>';
        table += '<tr>';
    } else {
        table += '<tr>';
    }
    let rowCells = allRowCells[singleRow];   
    rowCells.unshift(singleRow); // adds the row number in the first column
    
    for (let rowCell = 0; rowCell < rowCells.length; rowCell++) {
        if (singleRow === 0) { //first row in table - header
        
          if ( rowCell === 0){ //first cell in table header
              // add column number as id to first cell in row and class 'all' for selection
              table += '<th id=' + rowCell + ' class="edge" contenteditable="false">';
              table += '';
          } else { // other header cells
              // for selection add column number as id to header cells
              table += '<th id=' + rowCell + ' contenteditable="true">';
              if (!rowCells[rowCell]){            
              table += ''; // avoids undefined in table        
              } else {
              table += rowCells[rowCell];
              }
          }           
        table += '</th>';
        } else { // table rows        
        if ( rowCell === 0){   // first column
            table += '<td class="rowNumber" contenteditable="false">'; //row number for selection    
            table += rowCells[rowCell];
        } else { // table cells
            table += '<td contenteditable="false">';
            if (rowCells[rowCell]){
            table += rowCells[rowCell];
            } else {
            table += '';
            }
        }
        table += '</td>';
        }
    }
    if (singleRow === 0) {
        table += '</tr>';
        table += '</thead>';
        table += '<tbody>';
    } else {
        table += '</tr>';
    }
    } 
    table += '</tbody>';
    table += '</table>';
    
    if (!document.getElementById('divTbl')){ // initializes the div for the table if not exists
        divTable = document.createElement('div');
        divTable.id = 'divTbl';
        document.body.appendChild(divTable);
    }
    
    divTable.innerHTML = table; 
    divTable.appendChild(divTable.firstChild); // append table as node
    spreadSheetSelect('table');// adds the spreadsheet like selection to the table
    clickTab('Table'); // opens the table tab content when the table is inserted
}


/**
 * Adds a spread sheet like simple selection (rectangle shape) to a table. Selection by
 * mouse drag or shift key is possible. Multiple rows, columns or table cells can be selected.
 * @param {*} id the table id to add the functionality
 */
function spreadSheetSelect(id){
// see http://jsfiddle.net/vello/qvw0pgcu/
// https://stackoverflow.com/a/31876373
  var table = document.getElementById(id);
  var isMouseDown = false;
  // sets the start row (edge) of the rectangle shape select
  var startRowIndex = null;
  // sets the start column (edge) of the rectangle shape select
  var startCellIndex = null;
  let rowSelected = false; // indicate the kinds of selection
  let colSelected = false;
  let allSelected = false;

  /**
   * Sets the edge opposite to start of the rectangle shape select and
   * adds the selection to the class 'selected'.
   * @param {*} cell the table cell representing the closing edge of the selection
   */
  function selectTo(cell) {

    // the function creates an array with range from start to stop nummber by step
    const arrayRange = (start, stop, step) => Array.from(
      { length: (stop - start) / step + 1 },
      (value, index) => start + index * step
      );

    let row = cell.parentElement;    
    let cellIndex = cell.cellIndex;
    let rowIndex = row.rowIndex;
    
    let rowStart, rowEnd, cellStart, cellEnd;
    
    if (rowIndex < startRowIndex) {
        rowStart = rowIndex;
        rowEnd = startRowIndex;
    } else {
        rowStart = startRowIndex;
        rowEnd = rowIndex;
    }
    
    if (cellIndex < startCellIndex) {
        cellStart = cellIndex;
        cellEnd = startCellIndex;
    } else {
        cellStart = startCellIndex;
        cellEnd = cellIndex;
    }
    
    if (colSelected){
      selectedCols = arrayRange(cellStart, cellEnd, 1);
    } else if (rowSelected){
      selectedRows = arrayRange(rowStart, rowEnd, 1);
    }
        
    for (let i = rowStart; i <= rowEnd; i++) {      
        let rowCells = table.getElementsByTagName("tr")[i].children;
        for (let j = cellStart; j <= cellEnd; j++) {
            rowCells[j].classList.add("selected");
        }        
    }
  }
  
  // event listeners on table with event delegation to cells 
  table.addEventListener('mousedown', function(e){
    if (activeTab != 'Table'){//opens the table tab if table is clicked
      clickTab('Table');
    }

    // for the selection of table cells    
    if(e.target && e.target.nodeName == "TD" && !e.target.matches('td.rowNumber')){
      isMouseDown = true;      
      if (editCell && !e.target.matches('td.edit')){
        inEdit = false;
        clearSelection();
        editCell.setAttribute("contenteditable", false);
        editCell.classList.remove('edit');
        selStrt = false;
      }   
      let cell = e.target;
      removeSelected();

      if (e.shiftKey ) {  
        if (rowSelected||colSelected){ // begin new selection
          startCellIndex = cell.cellIndex;
          startRowIndex = cell.parentElement.rowIndex;
        }     
        selectTo(cell);                
      } else {
        cell.classList.add("selected");
        startCellIndex = cell.cellIndex;
        startRowIndex = cell.parentElement.rowIndex;
      }
      rowSelected = false;
      colSelected = false;
      allSelected = false;                 
      return false; // prevent text selection

    // for the selection of rows on row numbers (first column) 
    } else if (e.target && e.target.nodeName == "TD" && e.target.matches('td.rowNumber')){
      isMouseDown = true;
      let cell = e.target;
      if (editCell){
        inEdit = false;
        clearSelection();
        editCell.setAttribute("contenteditable", false);
        editCell.classList.remove('edit');
        selStrt = false;
      }   
      removeSelected();       
      let siblings = e.target.parentElement.children;

      if (e.shiftKey) {
        if(!rowSelected || colSelected){
          startCellIndex = siblings[siblings.length -1].cellIndex;
          startRowIndex = siblings[siblings.length -1].parentElement.rowIndex;
        }
        selectTo(cell);
      } else {
        startCellIndex = siblings[siblings.length -1].cellIndex;
        startRowIndex = siblings[siblings.length -1].parentElement.rowIndex;
        
        for (let sibling of siblings){
          siblings[sibling] = sibling.classList.add('selected');              
        }
        selectedRows.push(e.target.parentElement.rowIndex);// add to array of selected rows
      }
      rowSelected = true;
      colSelected = false;
      allSelected = false; 
    // for the selection of table columns on table header
    } else if (e.target && e.target.nodeName == "TH" && !e.target.matches('th.edge')){
      isMouseDown = true;
      if (editCell){
        inEdit = false;
        clearSelection();
        editCell.setAttribute("contenteditable", false);
        editCell.classList.remove('edit');
        selStrt = false;
      }
      let cell = e.target;
      let colNumber = cell.cellIndex;       
      let selThTds = table.querySelectorAll('table tr td:nth-child('+(colNumber+1)+'), \
          th:nth-child('+(colNumber+1)+')');
      removeSelected();

      if (e.shiftKey) {
        if(!colSelected || rowSelected){
          startCellIndex = selThTds[selThTds.length -1].cellIndex;
          startRowIndex = selThTds[selThTds.length -1].parentElement.rowIndex;
        }
        selectTo(cell);
      } else { 
        startCellIndex = selThTds[selThTds.length -1].cellIndex;
        startRowIndex = selThTds[selThTds.length -1].parentElement.rowIndex;         
        for (let i=0; i < selThTds.length; i++){
          selThTds[i].classList.add('selected');              
        }
        selectedCols.push(colNumber); // add to array of selected columns
      }
      colSelected = true;
      rowSelected = false;
      allSelected = false; 
      
    // for the selection of the whole table in the upper edge
    } else if (e.target && e.target.nodeName == "TH" && e.target.matches('th.edge')){
      isMouseDown = true;
      if (editCell){
        inEdit = false;
        clearSelection();
        editCell.setAttribute("contenteditable", false);
        editCell.classList.remove('edit');
        selStrt = false;
      }
      let cell = e.target;
      removeSelected();
      if (e.shiftKey) {
        if (!allSelected){
          startCellIndex = 0;
          startRowIndex = 0;
        }        
        selectTo(table.rows[table.rows.length - 1].cells[table.rows[0].cells.length - 1]);                 
      } else {        
      startCellIndex = cell.cellIndex;
      startRowIndex = cell.parentElement.rowIndex;
      selectTo(table.rows[table.rows.length - 1].cells[table.rows[0].cells.length - 1]);
      }
      colSelected = false;
      rowSelected = false;
      allSelected = true;  
    }
  })

  table.addEventListener('mouseover', function (e) {
    if (!isMouseDown) return;
    else if (inEdit) return; // no mouseover selection if a cell is in edit
    
    // over table cells
    else if(!rowSelected && !colSelected && !allSelected && e.target && e.target.nodeName == "TD" 
      && !e.target.matches('td.rowNumber')){
        if (editCell){
          editCell.classList.remove('singleSel');
        }
        removeSelected();
        selectTo(e.target);
    // over row numbers (first column under header)
    } else if (rowSelected && !allSelected && e.target && e.target.nodeName == "TD" && e.target.matches('td.rowNumber')){
        removeSelected();
        selectTo(e.target);
    // over header cells (excluding first cell)
    } else if (colSelected && !allSelected && e.target && e.target.nodeName == "TH" && !e.target.matches('th.edge')){
        removeSelected();
        selectTo(e.target);
    }
  })
  
  document.onselectstart = function () {
      return selStrt;
  };

  // doubleclick to edit table cell
  document.ondblclick = function (e) {
    if (e.target && (e.target.nodeName == ("TH") || e.target.nodeName == ("TD")) && !e.target.matches('th.edge')
      && !e.target.matches('td.rowNumber')){
      isMouseDown = true;
      inEdit = true;
      editCell = e.target;
      editCell.classList.add('edit');
      editCell.setAttribute("contenteditable", true);
      placeCaretAtEnd(e.target);
      selStrt = true;
    }    
  };

  document.onmouseup = function () {
  isMouseDown = false;
  }
}


/**
 * Places the cursor at the end of the text in a html element, i.e. in a table cell.
 * https://stackoverflow.com/a/48299521
 * @param {*} el element
 */
function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection != "undefined"
    && typeof document.createRange != "undefined") {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } 
  else if (typeof document.body.createTextRange != "undefined"){
    var textRange = document.body.createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}


/**
 * Clears a selection.
 */
function clearSelection()
{
 if (window.getSelection) {window.getSelection().removeAllRanges();}
 else if (document.selection) {document.selection.empty();}
}


/**
 * Removes all table cells of the class 'selected' from the class. Clears the arrays
 * containing the selected row numbers and column numbers. 
 */
function removeSelected(){
  selectedRows = []; // clear the selection arrays
  selectedCols = [];
  // remove all from class 'selected'
  let elements = document.getElementsByClassName('selected');
  Array.from(elements).forEach((element) => {
    element.classList.remove('selected');
  })
}


/**
 * Adds the insert rows button unter the parent element. It will be added either 
 * before the currently selected rows after the last rows of the table 
 * if no rows are selected. The number of the selected rows will will also 
 * be added before the selection. If none is selected one rows is added as the last.   
 * @param {*} parent element
 */
function insertRowsBtn(parent){
  let insertBtn = document.createElement('button');
  parent.appendChild(insertBtn);
  insertBtn.id = 'insertBtn';
  insertBtn.type = 'button';
  insertBtn.classList.add('btn', 'insertRowBtn')
  insertBtn.innerHTML = 'rows';

  insertBtn.addEventListener('click', function () {
    let table = document.getElementById('table');
    let tbody = table.getElementsByTagName('tbody')[0];
    let cells = [];
    if (selectedRows.length == 0){
      selectedRows.push(table.rows.length); //insert at the table end
    }
    for (let j = 0; j < selectedRows.length; j++){
      let row = tbody.insertRow(selectedRows[0] - 1);
      for (let i = 0; i < document.getElementById('table').rows[0].cells.length; i++){
        cells[i] = row.insertCell(i);
        cells[i].innerHTML = '';
        if (i==0){
          cells[i].classList.add('rowNumber');
        }
      }
    }
    // update column numbers   
    for (let i = 1; i< table.rows.length; i++){
      table.rows[i].cells[0].innerHTML = i;
    }
  })
}

/**
 * Adds the delete rows button unter the parent element. By clicking the
 * selected table rows will be deleted.
 * @param {*} parent 
 */
function deletRowsBtn(parent){
  let delRowBtn = document.createElement('button');
  parent.appendChild(delRowBtn);
  delRowBtn.id = 'insertBtn';
  delRowBtn.type = 'button';
  delRowBtn.classList.add('btn', 'delRowBtn');
  delRowBtn.innerHTML = 'rows';

  delRowBtn.addEventListener('click', function () {
    let table = document.getElementById('table');
    if (selectedRows){
      for (let i = 0; i < selectedRows.length; i++){
        table.deleteRow(selectedRows[i]);
      }
    }
    // update column numbers   
    for (let i = 1; i< table.rows.length; i++){
      table.rows[i].cells[0].innerHTML = i;
    }
  })
}

/**
 * Adds the delete columns button unter the parent element.
 * Clicking the button deletes the selected columns.
 * @param {*} parent element
 */
function deletColsBtn(parent){
  let delColBtn = document.createElement('button');
  parent.appendChild(delColBtn);
  delColBtn.id = 'insertBtn';
  delColBtn.type = 'button';
  delColBtn.classList.add('btn', 'delColBtn');
  delColBtn.innerHTML = 'columns';

  delColBtn.addEventListener('click', function () {
    let table = document.getElementById('table');
    let rows = table.rows;
    if (selectedCols.length > 0){
      for (let i = 0; i < selectedCols.length; i++) {
        for (let j = 0; j < rows.length; j++){
          rows[j].deleteCell(selectedCols[0]);
        }        
      }
    }
  })
}


/**
 * Adds the insert column button under parent. It will be added either 
 * before the currently selected columns after the last column of the table 
 * if no columns are selected. The number of the selected columns will will also 
 * be added before the selection. If none is selected one column is added as the last.   
 * @param {*} parent 
 */
function insertColsBtn(parent){
  let insrtColBtn = document.createElement('button');
    parent.appendChild(insrtColBtn);
    insrtColBtn.id = 'insrtColBtn';
    insrtColBtn.type = 'button';
    insrtColBtn.classList.add('btn', 'insrtColBtn')
    insrtColBtn.innerHTML = 'columns';
    
    insrtColBtn.addEventListener('click', function () {
    let table = document.getElementById('table');
    let trs = table.getElementsByTagName('tr');
    let cells = [];
    if (selectedCols.length == 0){
      selectedCols.push(trs[0].children.length); //insert as last column
    }      
      for (let j = 0; j < selectedCols.length; j++){
        for (let i = 0; i < trs.length; i++) {        
          if (i !== 0){
            cells[i] = trs[i].insertCell(selectedCols[0]).outerHTML = "<td></td>";
          } else {
            cells[i] = trs[i].insertCell(selectedCols[0]).outerHTML = "<th></th>";
          }          
        }
      }
    
  })
}

/**
 * Adds the cut button under the parent element. By clicking the selection will be written
 * to the clipboard in a format that can then be pasted into LibreOffice Calc, Excel 
 * spreadsheets or into the same table. 
 * @param {*} parent element
 */
function cutSelectBtn(parent){
  let cutBtn = document.createElement('button');
    cutBtn.type = 'button';
    cutBtn.id = 'copyBtn';
    cutBtn.classList.add('btn', 'cutBtn')
    cutBtn.innerHTML = 'cut';
    parent.appendChild(cutBtn);    

    let cutBImg = document.createElement('span');
    cutBImg.classList.add('btn', 'cutBImg');
    cutBtn.appendChild(cutBImg);
    
    cutBtn.addEventListener('click', function(){
      // takes the cells of 'selected' without the first column to first copy
      let selected = document.querySelectorAll('.selected:not(.edge, .rowNumber)');
      copySel(selected);
      for (let i = 0; i < selected.length; i++){
        selected[i].innerHTML = '';
      }
    }, false);
}


/**
 * Adds a 'copy' button under 'parent which copies the selection. 
 * The copied cells can be pasted into LibreOffice Calc, Excel spreadsheets
 * or into the same table.
 * @param {*} parent element
 */
function copySelectBtn(parent){
    let cpyBtn = document.createElement('button');
    cpyBtn.type = 'button';
    cpyBtn.id = 'copyBtn';
    cpyBtn.classList.add('btn', 'copyBtn')
    cpyBtn.innerHTML = 'copy';
    parent.appendChild(cpyBtn);    
  
    let cpyBImg = document.createElement('span');//span for the button icon
    cpyBImg.classList.add('btn', 'cpyBImg');
    cpyBtn.appendChild(cpyBImg);

    cpyBtn.addEventListener('click', function(){
      // takes the cells of 'selected' without the first column for copy
      let selected = document.querySelectorAll('.selected:not(.edge, .rowNumber)');
      copySel(selected);
    }, false);
}


/**
 * Writes the cells of the selection into the clipboard, in a format with Tab between row 
 * values and line feed at the end of each row. This content can then be pasted 
 * into LibreOffice Calc, Excel spreadsheets or into the same table. 
 * @param {*} seltd NodeList of selected table cells
 */
function copySel(seltd) {

  if (seltd.length > 0){
    let firstRowSelected= seltd[0].parentNode.rowIndex;
    let rowArray = [];
    let selections = '';
    for (let i = 0; i < seltd.length; i++){
      let thisRowIndex = seltd[i].parentNode.rowIndex - firstRowSelected;
      if (!rowArray[thisRowIndex]) {
        rowArray[thisRowIndex] = [];
      }
      rowArray[thisRowIndex].push(seltd[i].innerText);
    }
    for (let i = 0; i < rowArray.length; i++){
        //adds Tab \t between row values and line feed \n at the end of each row
        selections += rowArray[i].join('\t') + '\n';
    }
    navigator.clipboard.writeText(selections);
  }
}


/**
 * Adds a 'paste' button under 'parent' to paste the cells copied from LibreOffice Calc,
 * from Excel spreadsheets or from the same page into the table. The clipboard content is pasted 
 * once starting at the first cell of the selection.
 * 
 * Does currently not work with Firefox due to the navigator.clipboard is not working
 * with readText().
 */
function pasteInTblBtn(parent){
  let pstBtn = document.createElement('button');
  pstBtn.type = 'button';
  pstBtn.id = 'pasteBtn';
  pstBtn.classList.add('btn', 'pasteBtn');
  pstBtn.innerHTML = 'paste';
  parent.appendChild(pstBtn);

  /**
   * The function reads the format from the clipboard and imports it by
   * splitting rows by line feed '\n' and cells in rows by tab '\t'. Then
   * pastes it into the table.
   */
  pstBtn.addEventListener('click', function () {
    let table = document.getElementById('table');
    let selected = document.querySelectorAll('.selected');
    
    let firstRowSelected = selected[0].parentNode.rowIndex;
    let firstColSelected = selected[0].cellIndex;

    //setTimeout(async() => navigator.clipboard.readText() // workaround to use clipboard with Devtools
    navigator.clipboard.readText() 
      .then(
        (clipText) => {
          let clipRowCells = imptTblFormat(clipText, '\t');
          
          for (let i = 0; i < clipRowCells.length; i++) {
            let clipRow = clipRowCells[i];
            for (let j = 0; j < clipRow.length; j++){
              table.rows[firstRowSelected + i].cells[firstColSelected +j].innerHTML = clipRow[j];
            }
          }
        }
      ).catch((err) => {
        alert('Failed to read clipboard contents: ' + err);
    })
    //, 2000)// workaround to use clipboard with Devtools
  })
}

export { insertTable, insertRowsBtn, insertColsBtn, deletRowsBtn, deletColsBtn, cutSelectBtn, 
  copySelectBtn, pasteInTblBtn, selectedCols };