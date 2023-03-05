import { selectedCols } from './table.js';

let colors = ['#FF6600', '#008000', '#0000FF', '#FFD700', '#FF0000', '#66FF33', '#993333', '#EEE8AA', 
'#4B0082', '#5F9EA0', '#778899', '#A0522D', '#98FB98', '#B0C4DE', '#F4A460', '#7FFFD4', '#DC143C', 
'#FFE4B5', '#3CB371', '#D3D3D3'];
let modalOpen = false; //indicates open Modal Box


/**
 * Creates a modal box containing the canvas. 
 * @param {*} id of the canvas
 * @param {*} parent element
 * @param {*} width of the canvas
 * @param {*} height of the canvas
 * @returns 
 */
function createModal(id, parent, width, height) {
    let divModal = document.createElement('div');
    let divModCanvas = document.createElement('div');
    let closeBtn = document.createElement('span');
    let canvasElem = document.createElement('canvas');
    divModal.classList.add('modal');
    divModal.id = 'divModal';
    divModCanvas.classList.add('divCanvas');
    closeBtn.id = 'closeBtn';
    closeBtn.classList.add('closeBtn');
    closeBtn.innerHTML = '&times';

    // events to close the modal box
    closeBtn.onclick = function(){
        divModal.style.display = "none";
        modalOpen = false;
    }
    window.onclick = function(e){
        if (modalOpen){
            if(e.target == divModal){
                divModal.style.display = "none"
                modalOpen = false;
            }
        }
    }   
    parent.appendChild(divModal);
    divModal.appendChild(divModCanvas);
    divModCanvas.appendChild(closeBtn);
    divModCanvas.appendChild(canvasElem);

    canvasElem.id = id;
    canvasElem.classList.add('canvas');
    canvasElem.width = width;
    canvasElem.height = height;

    return canvasElem.id;
}


/**
 * Appends a pie chart button to the parent element. By clicking, if a single
 * column is selected opens the modal with the canvas, calculates the occurences
 * of the column values (items) and draws the pie chart.
 * @param {*} parent element
 * @param {*} canvasId id of the canvas to draw the pie chart in
 * @param {*} id of the chart button
 */
function insertChartBtn(parent, canvasId, id){
    let chartBtn = document.createElement('button');
    parent.appendChild(chartBtn);
    chartBtn.id = id;
    chartBtn.type = 'button';
    chartBtn.classList.add('btn', 'chartBtn', id);
    chartBtn.innerHTML = 'draw pie chart';
    chartBtn.disabled = false;
    chartBtn.addEventListener('click', function () {
        
        let col;
        if (selectedCols.length === 1){
            col = getColumnArr('table', selectedCols[0]);
        } else {
            alert('Select a single column.')
            return
        }

        let modal = document.getElementById('divModal');
        modal.style.display = "block";
        modalOpen = true;

        let cpyColors = colors.slice();
        let canvas = document.getElementById(canvasId);
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        const counts = {};
        const results = [];
        let sortedCounts, sumSC, diff;

        // fills the object with the unique item as key and the count as value
        for (const item of col) {
        counts[item] = counts[item] ? counts[item] + 1 : 1;
        }
        // pie chart of max 20 parts
        if (Object.keys(counts).length > 18){
            sortedCounts = sortObjectEntries(counts, 19);// sort of reduced counts [[ item, count], [ , ]]
            sumSC = sortedCounts.reduce((sum, value) => sum + value[1], 0); //sum of the remaining counts
            diff = col.length - sumSC; // difference - the omitted counts
        } else {
            sortedCounts = sortObjectEntries(counts);
        }
        
        for (let arr of sortedCounts){
            results.push(new Piece(arr[0], arr[1], cpyColors.shift())); 
        }
        
        if (diff){
            results.push(new Piece('other', diff, cpyColors.pop())); // adds a merge of the smaller counts
        }       

        let sum = 0;
        let totalCounts = results.reduce((sum, {count}) => sum + count, 0);
        let currentAngle = -Math.PI/2;
        let inc = 0;

        for (let itm of results) {
            //calculating the angle the slice (portion) will take in the chart
            let portionAngle = (itm.count / totalCounts) * 2 * Math.PI;
            //drawing an arc and a line to the center to differentiate the slice from the rest
            ctx.beginPath();
            ctx.arc(150, 150, 150, currentAngle, currentAngle + portionAngle);
            currentAngle += portionAngle;
            ctx.lineTo(150, 150);
            //filling the slices with the corresponding color
            ctx.fillStyle = itm.colour;
            ctx.fill();
            ctx.fillRect(320, 2 + inc, 15, 7);
            ctx.fillStyle = "#000000";
            let val;
            if(itm.item == ''){
                val = 'undefined';
            } else {
                val = itm.item;
            }
            ctx.fillText(val, 340, 10 + inc);
            inc += 15;
        }
    
    })
}


/**
 * creates an object representing a part of the pie chart
 * @param {*} item the item (unique value in the column) that the piece of the pie chart represents
 * @param {*} count occurences of the item
 * @param {*} colour colour of the piece of the pie chart
 */
function Piece(item, count, colour) {
    this.item = item;
    this.count = count;
    this.colour = colour;
  }

/**
 * Sorts an objects k,v pairs first by value and then by key if values are the same.
 * see https://medium.com/@gmcharmy/sort-objects-in-javascript-e-c-how-to-get-sorted-values-from-an-object-142a9ae7157c
 * @param {*} obj the object to sort
 * @param {*} n the number of sorted k,v pairs
 * @returns array of n sorted arrays [[k, v], ...]
 */
function sortObjectEntries(obj, n){
   
    let sortedList = []//Sorting by values asc
    sortedList = Object.entries(obj).sort((a,b)=>{
        if(b[1] > a[1]) return 1;
        else if(b[1] < a[1]) return -1;
        //if values are same do edition checking if keys are in the right order
        else {
            if(a[0] > b[0]) return 1;
            else if(a[0] < b[0]) return -1;
            else return 0
        }
    })
    return sortedList.slice(0,n)
}

  /**
   * Returns the values of a certain column (without header) in a table 
   * as an array.
   * @param {*} table_id the id of the table to get the column from
   * @param {*} col the number of the table column to return 
   * @returns table column as an array
   */
function getColumnArr(table_id, col) {
    let tab = document.getElementById(table_id);
    let n = tab.rows.length;
    let tr, td;
    let cArr = [];

    if (col < 0) {
        return null;
    }

    for (let i = 1; i < n; i++) { //excluding header
        tr = tab.rows[i];
        if (tr.cells.length > col) { 
            td = tr.cells[col];      
            cArr[i-1] = td.innerText;
        }
    }
    return cArr;
}

export { createModal, insertChartBtn };