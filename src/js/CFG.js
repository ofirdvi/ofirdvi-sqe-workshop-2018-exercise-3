import * as esprima from 'esprima';
import {startSymbolicSubstitution} from './symbolic-substitution';

let condsElseIf = {};
let _line = 0;
let typeToHandlerMapping = new Map();
let strPerRowCFG = [];
let inputVector = new Set([]);
let condsValue = [];
let inputParamArray = {};
let cuur_node_Id = -1;
let curr_parent_Id = -1;
let depthCounter = -1;
let counter =-1;
let last_node_type = false;
let last_cond_id = -1;
let else_child = false;
let whileStartEnd= [];

//parsind the code by esprime to get the code tree with the line of each row ({loc: true})
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

export function startCFG(codeToParse, argsNameAndValue){
    setGlobalParams();
    inputParamArray = createInputParamArray(argsNameAndValue);
    condsElseIf = {};
    _line = 0;
    typeToHandlerMapping =initiateMap();
    let parsedCode = parseCode(codeToParse);
    inputVector = new Set([]);
    let functionItem;
    parsedCode.body.forEach(node => {
        //if(node.type === 'FunctionDeclaration')
        functionItem = node;
        /*else
            functionMappingByType(node, argsNameAndValue, false, [], false, null,null, null);*/
    });
    functionMappingByType(functionItem, argsNameAndValue, false, [], false, null,null, null);
    return createFinalCodeOutput(argsNameAndValue);
}

function  setGlobalParams(){
    condsElseIf = {};
    _line = 0;
    typeToHandlerMapping = new Map();
    strPerRowCFG = [];
    inputVector = new Set([]);
    condsValue = [];
    inputParamArray = {};
    cuur_node_Id = -1;
    curr_parent_Id = -1;
    depthCounter = -1;
    counter =-1;
    last_node_type = false;
    last_cond_id = -1;
    else_child = false;
    whileStartEnd= [];
}

function createInputParamArray(argsNameAndValue){
    let inputParamArray = {};
    for (var name in argsNameAndValue){
        inputParamArray[name] = [];
        inputParamArray[name].push(argsNameAndValue[name]);
    }
    return inputParamArray;
}

function initiateMap() {
    let typeToHandlerMapping = {
        'FunctionDeclaration': parseFunctionDeclaration, 'BlockStatement': parseBlockStatement, 'ReturnStatement':parseReturnStatement,
        'VariableDeclaration': parseVariableDeclaration, 'ExpressionStatement': parseExpressionStatement, 'WhileStatement': parseWhileStatement,
        'AssignmentExpression': parseAssignmentExpression, 'BinaryExpression': parseBinaryExpression, 'MemberExpression': parseMemberExpression,
        'UnaryExpression': parseUnaryExpression, 'IfStatement': parseIfStatement, 'Identifier':parseIdentifierExpression,
        'Literal': parseLiteralExpression, 'ArrayExpression': parseArrayExpression, 'LogicalExpression': parseLogicalExpression,
        'UpdateExpression': parseUpdateExpression
    };
    return typeToHandlerMapping;
}


function functionMappingByType(node, argsNameAndValue, insideFunction, conds, dirc){
    return typeToHandlerMapping[node.type](node, argsNameAndValue, insideFunction, conds, dirc);
}

function parseFunctionDeclaration(node, argsNameAndValue, inFunctionBody, conds,dirc){
    _line = node.loc.start.line;
    addTostrPerRowCFG( _line, '', 0, dirc, 'FunctionDeclaration');
    strPerRowCFG[0].detailes.Value = true;
    for (var i in node.params) {
        inputVector.add(node.params[i].name);
    }
    dirc = null;
    depthCounter++;
    curr_parent_Id=cuur_node_Id;
    functionMappingByType(node.body, argsNameAndValue, true, conds, dirc);
}


function addTostrPerRowCFG(line, contant, isCond, dirc,type){
    if(cuur_node_Id >0 &&  checkIfSameNode(line, contant, isCond,type)){
        strPerRowCFG[counter].detailes.Contant += ' ' +  contant;
        return;
    }
    if(else_child){
        dirc = false;
        else_child = false;}
    last_node_type = isCond;
    let previous_Id = setPrevious();
    counter++;
    cuur_node_Id++;
    if(isCond)
        last_cond_id = cuur_node_Id;
    strPerRowCFG.push({ID: cuur_node_Id, detailes:{Line: line, Depth: depthCounter,Type: type, Contant: contant,isCond: isCond, Previous: previous_Id, Perant: curr_parent_Id, Dirc: dirc, Value: false, TrueDirc: null, FalseDirc: null }});
}

function checkIfSameNode(line, contant, isCond, type){
    if(subCheckSameNode(isCond) && !else_child && strPerRowCFG[counter].detailes.Perant == curr_parent_Id && checkType(type))
        return true;
    return false;
}

function checkType(type){
    if(type !='StartWhile' && type!= 'ReturnStatement')
        return true;
    return false;
}

function subCheckSameNode(isCond){
    if(!last_node_type && !isCond && !else_child)
        return true;
    return false;
}

function setPrevious(){
    if (counter == -1)
        return null;
    let index = counter;
    while(index > -1){
        if(strPerRowCFG[index].detailes.Depth == depthCounter && strPerRowCFG[index].detailes.Perant == curr_parent_Id)
            return strPerRowCFG[index].ID;
        index--;
    }

    return null;
}

function parseBlockStatement(node, argsNameAndValue, inFunctionBody, conds, dirc){
    _line = node.loc.start.line;
    for( var i in node.body){
        functionMappingByType(node.body[i], argsNameAndValue, inFunctionBody, conds, dirc);
    }
}

function parseReturnStatement(node, argsNameAndValue, inFunctionBody, conds, dirc){
    _line = node.loc.start.line;
    let value = functionMappingByType(node.argument, argsNameAndValue, inFunctionBody, conds, dirc);
    let returnStaterntRow = value;
    addTostrPerRowCFG(node.loc.start.line, returnStaterntRow, false, dirc, 'ReturnStatement');
}

function parseVariableDeclaration(node, argsNameAndValue, inFunctionBody, conds, dirc){
    _line = node.loc.start.line;
    let i = -1;
    node.declarations.forEach(declaration => {
        i = i+1;
        let _name = declaration.id.name;
        let _value = null;
        //if(declaration.init != null)
        _value = functionMappingByType(declaration.init, argsNameAndValue, inFunctionBody, conds, dirc);
        addTostrPerRowCFG(_line, _name + '=' + _value, false, dirc, 'VariableDeclaration');
        addToArgsNameAndValue( node, argsNameAndValue,_name, _value, conds);
    });
}

function addToArgsNameAndValue( node, argsNameAndValue,name, value, conds){
    if(!(name in argsNameAndValue))
        argsNameAndValue[name] = [];
    argsNameAndValue[name].push({'line':node.loc.start.line, 'conditions': [...conds], 'value': value});
}

function parseExpressionStatement(node, argsNameAndValue, inFunctionBody, conds, dirc){
    let _expressionToParse = node.expression;
    return functionMappingByType(_expressionToParse, argsNameAndValue, inFunctionBody, conds, dirc);
}


function parseWhileStatement(node, argsNameAndValue, inFunctionBody, conds, dirc){
    _line = node.loc.start.line;
    createWhileDeclarRow( node, argsNameAndValue, inFunctionBody, conds,dirc);
    conds.push(_line);
    dirc = true;
    //if (node.body) {
    let tempDepth = depthCounter;
    let tempParent = curr_parent_Id;
    depthCounter++;
    curr_parent_Id  = cuur_node_Id;
    let start_while = cuur_node_Id;
    functionMappingByType(node.body, argsNameAndValue, inFunctionBody, conds,dirc);
    whileStartEnd.push({start:start_while, end: cuur_node_Id, nullId: start_while-1});
    curr_parent_Id = tempParent;
    depthCounter = tempDepth;
    //}
    conds.pop();
}

function createWhileDeclarRow(node, argsNameAndValue, inFunctionBody, conds,dirc){
    let whileDeclarRow = 'while(';
    let condition = functionMappingByType(node.test, argsNameAndValue, inFunctionBody, conds);
    whileDeclarRow += condition + ')';
    addTostrPerRowCFG( node.loc.start.line , cuur_node_Id + 2, false, null,'StartWhile');
    addTostrPerRowCFG( node.loc.start.line , condition, true, dirc,'WhileDeclar');
    return whileDeclarRow;
}

function parseAssignmentExpression(node, argsNameAndValue, inFunctionBody, conds,dirc){
    _line = node.loc.start.line;
    let left = node.left.name;
    let right = functionMappingByType(node.right, argsNameAndValue, inFunctionBody, conds, dirc);
    let signmentExprRow = left + '=' + right;
    addToArgsNameAndValue( node, argsNameAndValue,left, right, conds);
    addTostrPerRowCFG(node.loc.start.line , signmentExprRow, false, dirc, 'AssignmentExpression');
}

function parseMemberExpression(node, argsNameAndValue, inFunctionBody, conds, dirc){
    let variable = node.object.name;
    let property = functionMappingByType(node.property, argsNameAndValue, inFunctionBody, conds, dirc);
    /*if(!inputVector.has(variable)){
        if(node.property.type == 'Literal') {
            variable = getArrayLastValue(_line, argsNameAndValue[variable], property);
            return variable;
        }
        else
            variable =  getvariableLastValue(_line, argsNameAndValue[variable], conds);
    }*/
    return variable + '[' + property + ']';
}

function parseLogicalExpression(node, argsNameAndValue, inFunctionBody, conds, dirc){
    let operator = node.operator;
    let left = functionMappingByType(node.left, argsNameAndValue, inFunctionBody, conds, dirc);
    let right = functionMappingByType(node.right, argsNameAndValue, inFunctionBody, conds, dirc);
    return left  + operator  + right;
}

function parseBinaryExpression(node, argsNameAndValue, inFunctionBody, conds,dirc){
    let operator = node.operator;
    let left = functionMappingByType(node.left, argsNameAndValue, inFunctionBody, conds,dirc);
    let right = functionMappingByType(node.right, argsNameAndValue, inFunctionBody, conds, dirc);
    return left  + operator  + right;
}

function parseUnaryExpression(node, argsNameAndValue, inFunctionBody, conds, dirc){
    let operator = node.operator;
    let arg = node.argument;
    arg = functionMappingByType(arg, argsNameAndValue, inFunctionBody, conds, dirc);
    return operator + arg;
}

function parseUpdateExpression(node, argsNameAndValue, inFunctionBody, conds, dirc){
    let operator = node.operator;
    let arg = functionMappingByType(node.argument,argsNameAndValue, inFunctionBody, conds, dirc);
    addTostrPerRowCFG(node.loc.start.line , arg + operator, false, dirc, 'UpdateExpression');
    return arg + operator;
}

function parseIfStatement(node, argsNameAndValue, inFunctionBody, conds, dirc, type = 'if'){
    _line = node.loc.start.line;
    let ifStatmentRow = createIfStatmentRow(type, node, argsNameAndValue, inFunctionBody, conds, dirc);
    conds.push(_line);
    dirc = true;
    if(node.consequent.body.length>0) {
        let tempDepth = depthCounter;
        let tempParent = curr_parent_Id;
        depthCounter++;
        curr_parent_Id  = cuur_node_Id;
        functionMappingByType(node.consequent, argsNameAndValue, inFunctionBody, conds, dirc);
        depthCounter = tempDepth;
        curr_parent_Id = tempParent;
    }
    pushCondelseIf(type, node.loc.start.line);
    conds.pop();
    if(node.alternate != undefined)
        parseIfElseOrElseStatment(node, argsNameAndValue, inFunctionBody, type, conds,  false);
    return ifStatmentRow;
}

function createIfStatmentRow(type, node, argsNameAndValue, inFunctionBody, conds, dirc){
    let cond = functionMappingByType(node.test, argsNameAndValue, inFunctionBody, conds);
    let ifStatmentRow = type + '(' + cond + ')';
    addTostrPerRowCFG(node.loc.start.line , cond, true,dirc,type);
    return ifStatmentRow;
}

function parseIfElseOrElseStatment(node, argsNameAndValue, inFunctionBody, type, conds,dirc){
    if(node.alternate.type === 'IfStatement') { parseIfStatement(node.alternate, argsNameAndValue, inFunctionBody, conds, dirc, 'else if');}
    else {parseElseStatment(type, node, argsNameAndValue, inFunctionBody, conds,  dirc);}
}

function parseElseStatment(type, node, argsNameAndValue, inFunctionBody, conds,  dirc) {
    _line = node.consequent.loc.end.line;
    conds.push(_line);
    //if (node.alternate.type === 'BlockStatement') {
    let tempDepth = depthCounter;
    let tempParent = curr_parent_Id;
    depthCounter++;
    curr_parent_Id  = last_cond_id;
    else_child = true;
    dirc = null;
    functionMappingByType(node.alternate, argsNameAndValue, inFunctionBody, conds, dirc);
    else_child = false;
    depthCounter = tempDepth;
    curr_parent_Id = tempParent;
    conds.pop();
    //}
}

function pushCondelseIf(type, line) {
    condsElseIf[line] = [];
    if (type == 'else if') {
        let lastCondition = Object.keys(condsElseIf)[Object.keys(condsElseIf).length - 2];
        condsElseIf[line].push(lastCondition);
        condsElseIf[line].push(...condsElseIf[lastCondition]);
    }
}

function parseIdentifierExpression(node, argsNameAndValue, inFunctionBody, conds, dirc) {
    let identifier = node.name;
    let identifierValue = node.name;
    if (!inputVector.has(identifier)) {
        identifierValue = getvariableLastValue(_line, argsNameAndValue[node.name], conds, dirc);
        if (identifierValue.length > 2) {
            identifierValue = '(' + identifierValue + ')';
        }
    }
    return identifier;
}

function parseLiteralExpression(node) {
    return node.raw;
}

function parseArrayExpression(node, argsNameAndValue, inFunctionBody, conds, dirc) {
    let arrayElements = [];
    for (var i in node.elements) {
        let currElement = functionMappingByType(node.elements[i], argsNameAndValue, true, conds, dirc);
        //let currElementAns = eval(currElement);
        arrayElements.push(currElement);

    }
    return arrayElements;
}

/**crating the output - select witch line to print, bild the lines and choose color if needed**/
function createFinalCodeOutput(argsNameAndValue) {
    checkCondsValue(argsNameAndValue);
    if(strPerRowCFG.length>2) {
        setTrueFalseDirc(2, strPerRowCFG[2]);
        setIfFalseDirc();
        setNodesValue(1);
    }
    return strPerRowCFG;
}

function checkCondsValue(argsNameAndValue) {
    let index = 0;
    while (index < strPerRowCFG.length){
        if (strPerRowCFG[index].detailes.isCond) {
            let cond = ' if( ' + strPerRowCFG[index].detailes.Contant + '){}\n}';
            let funcStr = setVariabledeclStr(strPerRowCFG[index].detailes.Line, argsNameAndValue);
            let evalString = funcStr + cond;
            let value = startSymbolicSubstitution(evalString, inputParamArray);
            condsValue.push({ID: strPerRowCFG[index].ID, Value: value});
        }
        index++;
    }
}

function setTrueFalseDirc(index, node) {
    let perant_index = strPerRowCFG[index].detailes.Perant;
    let previos_index = strPerRowCFG[index].detailes.Previous;
    if (!strPerRowCFG[index].detailes.isCond){
        if (!checkTypeRorW(index, node, previos_index, perant_index))
            setTrueFalseDircIfNotCond(node,index,perant_index);
    }
    if (strPerRowCFG[index].detailes.isCond) {
        setTrueFalseDircIfCond(node,index,previos_index, perant_index);
    }
    if(index+1 < strPerRowCFG.length)
        setTrueFalseDirc(index+1, strPerRowCFG[index+1]);
    else
        updateTrueDirc();
}

function checkTypeRorW(index, node, previos_index, perant_index){
    if(node.detailes.Type == 'StartWhile'){
        setTrueFalseDircIfCond(node,index,previos_index, perant_index);
        return true;
    }
    if(node.detailes.Type == 'ReturnStatement' && index ==2){
        setTrueFalseDircIfCond(node,index,previos_index, perant_index);
        return true;
    }
    return false;
}

function checkIfWhileBody(index,perant_index){//, isCond){
    //if(perant_index != null && perant_index!= undefined ){
    //if(perant_index!= undefined ){
    if(strPerRowCFG[perant_index].detailes.Type == 'WhileDeclar' ){
        if(strPerRowCFG[perant_index].detailes.FalseDirc==null)
            setWhileFalseDirc(index, perant_index);
        //if(!isCond)
        return setDircForWhileBody(index);
        //return true;
    }
    //}
    return false;
}

function setDircForWhileBody(index){
    let i= 0;
    while (i< whileStartEnd.length){
        if( whileStartEnd[i].end== index){
            strPerRowCFG[index].detailes.TrueDirc = whileStartEnd[i].nullId;
            return true;
        }
        i++;
    }
    return false;
    //setTrueFalseDircIfNotCond(strPerRowCFG[index],index,perant_index);
}


function setTrueFalseDircIfNotCond(node,index,perant_index){
    if(checkIfWhileBody(index,perant_index, false))
        setWhileTrueFalseDirc(node,index,perant_index);
    else{
        if (strPerRowCFG[index].detailes.Dirc == false && strPerRowCFG[perant_index].detailes.FalseDirc == null)
            strPerRowCFG[perant_index].detailes.FalseDirc = node.ID;
        else if (checkIfNullOrTrueDirc(index, perant_index) )
            strPerRowCFG[perant_index].detailes.TrueDirc = node.ID;
    }
}

function setWhileTrueFalseDirc(node,index){
    let parent_id = strPerRowCFG[index].detailes.Perant;
    if(strPerRowCFG[parent_id].detailes.TrueDirc == null)
        strPerRowCFG[parent_id].detailes.TrueDirc = node.ID;
    let depth =  strPerRowCFG[parent_id].detailes.Depth;
    setWhileFalseDirc(index++, depth, parent_id);
}

function  setWhileFalseDirc(index, parent_id){
    let depth =  strPerRowCFG[parent_id].detailes.Depth;
    index++;
    while(index< strPerRowCFG.length){
        if(strPerRowCFG[index].detailes.Depth == depth) {
            strPerRowCFG[parent_id].detailes.FalseDirc = strPerRowCFG[index].ID;
            return;
        }
        index++;
    }
}
function checkIfNullOrTrueDirc(index, perant_index){
    if ((strPerRowCFG[index].detailes.Dirc == null || strPerRowCFG[index].detailes.Dirc == true) && strPerRowCFG[perant_index].detailes.TrueDirc == null)
        return true;
    return false;
}

function setTrueFalseDircIfCond(node,index,previos_index, perant_index) {
    if(previos_index == null)
        setTrueFalseDircIfNotCond(node,index,perant_index);
    else {
        if (strPerRowCFG[index].detailes.Dirc == false)
            strPerRowCFG[previos_index].detailes.FalseDirc = node.ID;
        //else if (ifTrueOrNull(index))
        if( strPerRowCFG[previos_index].detailes.TrueDirc==null)
            strPerRowCFG[previos_index].detailes.TrueDirc = node.ID;
    }
}

/*
function ifTrueOrNull(index) {
    if (strPerRowCFG[index].detailes.Dirc == null || strPerRowCFG[index].detailes.Dirc == true)
        return true;
    return false;
}*/



function updateTrueDirc(){
    let index =0;
    while(index < strPerRowCFG.length){
        let perant_index = strPerRowCFG[index].detailes.Perant;
        if(ifUpdateLegal(index)) {
            if(!checkIfInsideWhile(index, strPerRowCFG)) {
                ifInsideWhile(index, perant_index);
            }
        }
        index++;
    }
}

function ifInsideWhile(index, perant_index) {
    let parent_depth = strPerRowCFG[perant_index].detailes.Depth;
    while (strPerRowCFG[index].detailes.TrueDirc == null && parent_depth > -1) {
        let _temp = index + 1;
        while (!checkIfNextIsTrueDirc(_temp, parent_depth, index)) {
            _temp = _temp + 1;
        }
        parent_depth--;
    }
}

function checkIfInsideWhile(index, strPerRowCFG){
    let i= 0;
    while (i< whileStartEnd.length){
        if(whileStartEnd[i].start< index && whileStartEnd[i].end>= index){
            strPerRowCFG[index].detailes.TrueDirc = whileStartEnd[i].nullId;
            return true;
        }
        i++;
    }
    return false;
}
function ifUpdateLegal(index){
    if(index>1 && strPerRowCFG[index].detailes.TrueDirc==null && !(strPerRowCFG[index].detailes.Type =='ReturnStatement')){
        return true;
    }
    return false;
}

function checkIfNextIsTrueDirc(_temp,parent_depth, index){
    if(strPerRowCFG[index].detailes.TrueDirc == null && _temp< strPerRowCFG.length){
        let next = strPerRowCFG[_temp];
        if (next.detailes.Depth == parent_depth && next.detailes.Type != 'else if'){
            strPerRowCFG[index].detailes.TrueDirc= next.ID;
            return true;
        }
        return false;
    }
    return true;
}

function setIfFalseDirc(){
    let index =1;
    while (index < strPerRowCFG.length){
        let perant_id = strPerRowCFG[index].detailes.Perant;
        if (strPerRowCFG[perant_id].detailes.Type == 'if' && strPerRowCFG[perant_id].detailes.FalseDirc == null)
            strPerRowCFG[perant_id].detailes.FalseDirc = strPerRowCFG[index].detailes.TrueDirc;
        index++;
    }

}


function getvariableLastValue(baseL, variableValues) {
    let lastLine = '';
    for (let i in variableValues) {
        if (baseL > variableValues[i].line) {
            let value = variableValues[i].value;
            lastLine = value;
            /*if (!(Array.isArray(value)))
                lastLine = value;
            else
                lastLine = '[' + value + ']';*/
        }
    }
    return lastLine;
}

/*function getArrayLastValue(baseL, variableValues, property) {
    let lastLine = '';
    for (let i in variableValues) {
        let value = variableValues[i].value;
        lastLine = value[property];
    }
    return lastLine;
}*/

function setNodesValue(index){
    //if(index < strPerRowCFG.length ) {
    if (!strPerRowCFG[index].detailes.isCond )
        setNodesValueCond(index);
    else{ //if(strPerRowCFG[index].detailes.isCond){
        if(checkCondForLint(index))
            setNodesValue(strPerRowCFG[index].detailes.FalseDirc);
        ifCondButNotWhile(index);
    }
    //}
}

function checkCondForLint(index){
    if(strPerRowCFG[index].detailes.Type == 'WhileDeclar' && strPerRowCFG[strPerRowCFG[index].detailes.FalseDirc].detailes.Dirc !=false)
        return true;
    return false;
}

function ifCondButNotWhile(index){
    if (checkInCondsValue(index)) {
        strPerRowCFG[index].detailes.Value = true;
        let trueDirc = strPerRowCFG[index].detailes.TrueDirc;
        //if(!strPerRowCFG[trueDirc].detailes.Type =='StartWhile' || strPerRowCFG[trueDirc].detailes.Line >= strPerRowCFG[index].detailes.Line)----TO ADD BEFORE TEST!!!
        setNodesValue(trueDirc);
    }
    else {
        let falseDirc = strPerRowCFG[index].detailes.FalseDirc;
        if(falseDirc)
            setNodesValue(falseDirc);
    }
}

function setNodesValueCond(index){
    strPerRowCFG[index].detailes.Value = true;
    if(strPerRowCFG[index].detailes.TrueDirc != null) {
        let trueDirc = strPerRowCFG[index].detailes.TrueDirc;
        if(strPerRowCFG[trueDirc].detailes.Line >= strPerRowCFG[index].detailes.Line)
            setNodesValue(trueDirc);
    }
}
function checkInCondsValue(index){
    let i = 0;
    while (i< condsValue.length){
        if(condsValue[i].ID == index) {
            let ans = condsValue[i].Value;
            return ans;
        }
        i++;
    }
}

function setVariabledeclStr(line, argsNameAndValue) {
    /*let declStr = 'function foo(';
    let index = 0;
    for(let input in inputParamArray){
        declStr+=input;
        if (index< numberOfParam-1)
            declStr+=',';
        index++;
    }
    declStr+='){\n';*/
    let declStr = 'function foo(x,y,z){\n';
    for (let varb in argsNameAndValue) {
        if (!inputVector.has(varb)) {
            let lastVal = getvariableLastValue(line, argsNameAndValue[varb]);
            let letStatment = 'let ' + varb + ' = ' + lastVal + ';\n';
            declStr += letStatment;
        }
    }
    return declStr;
}

