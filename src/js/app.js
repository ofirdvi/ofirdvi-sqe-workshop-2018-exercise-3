import $ from 'jquery';
//import {parseCode} from './code-analyzer';
//import {startSymbolicSubstitution} from './symbolic-substitution';
import {startCFG} from './CFG';
import * as flowchart from 'flowchart.js';

let GraphString = '';
let RulsString = '';

$(document).ready(function () {
    $('#addArg').click(() => {
        let argName = '<td><label>Arg name: <input id="name" type="text"></label></td>';
        let argValue = '<td><label>Arg value: <input id="value" type="text"></label></td>';
        $('#argsTable').append('<tr class="arg">' + argName + argValue + '</tr>');});
    $('#RunCfgButton').click(() => {
        let argsNameAndValue = getArgesValue();
        let codeToParse = $('#codePlaceholder').val();
        let graphFinalDetailes = startCFG(codeToParse, argsNameAndValue);
        let g = JSON.stringify(graphFinalDetailes);
        console.log(g); // eslint-disable-line no-console
        createGraphString(1, graphFinalDetailes);
        console.log(GraphString); // eslint-disable-line no-console
        createRulsString(1, graphFinalDetailes);
        console.log(RulsString); // eslint-disable-line no-console
        let GraphRepresentation = GraphString + '\n';
        GraphRepresentation += RulsString;
        DrawGraph(GraphRepresentation);
        $('#parsedCode').val(JSON.stringify(graphFinalDetailes, null, 2));});
});

function createGraphString(index, graphFinalDetailes){
    if (index<graphFinalDetailes.length){
        let curr = graphFinalDetailes[index];
        let node_color = checkNodeColor(curr);
        if(curr.detailes.isCond)
            GraphString += index + '=>condition: ' + curr.detailes.Contant + '' + '\n' + ' '+ index+ '' + node_color + '\n';
        else{
            if (GraphString =='')
                GraphString += '1=>start: ' + curr.detailes.Contant+ '' + '\n' + ''+ index + ' ' + node_color + '\n';
            else if(curr.detailes.Type=='StartWhile')
                GraphString += index + '=>start: Null' + '' + '\n' + ''+ index + ' |True' + '\n';
            else
                GraphString +=  index+ '=>operation: ' + curr.detailes.Contant + '' + '\n' + ' '+ index + '' + node_color + '\n';
        }
        createGraphString(index+1, graphFinalDetailes);
    }
}

function checkNodeColor(curr){
    if(curr.detailes.Value)
        return '|True';
    else
        return '|False';
}

function createRulsString(index, graphFinalDetailes) {
    if (index < graphFinalDetailes.length - 1) {
        let curr = graphFinalDetailes[index];
        if(curr.detailes.isCond) {
            if (curr.detailes.TrueDirc)
                RulsString += index + '(yes)->' + curr.detailes.TrueDirc + '\n';
            if (curr.detailes.FalseDirc)
                RulsString += index + '(no)->' + curr.detailes.FalseDirc + '\n';
        }
        else {
            RulsString += index + '->' + curr.detailes.TrueDirc + '\n';
        }
        createRulsString(index + 1,graphFinalDetailes);
    }
}

function getArgesValue(){
    let argsNameAndValue = {};
    $('tr.arg').each(function() {
        let _name = $(this).find('#name').val();
        let _value = $(this).find('#value').val();
        if(_value.charAt(0) == '['){
            let array = _value.substring(1, _value.length - 1).replace(/ /g,'').split(',');
            _value = array;
        }
        argsNameAndValue[_name] = [];
        argsNameAndValue[_name].push({'line': 0, 'conditions': [], 'value': _value});
    });
    return argsNameAndValue;
}


function DrawGraph(GraphRepresentation){
    let code = GraphRepresentation;
    let chart = flowchart.parse(code);
    chart.drawSVG('Graph', {
        'line-width': 5, 'maxWidth': 6, 'line-length': 100, 'text-margin': 12, 'font-size': 16, 'font': 'normal', 'font-family': 'Helvetica',
        'font-weight': 'normal', 'font-color': 'black', 'line-color': 'black', 'element-color': 'black', 'fill': 'white', 'yes-text': 'True', 'no-text': 'False',
        'arrow-end': 'block', 'scale': 1, 'symbols': {'start': {'font-color': 'black', 'element-color': 'black', 'fill': 'green'}, 'end': {'class': 'end-element'}},
        'flowstate': {
            'True': {'fill': 'green'},
            'False': {'fill': 'red'},

        }
    });
}
