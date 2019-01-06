import * as esprima from 'esprima';

let condsElseIf = {};
let _line = 0;
let strPerRow = {};
let typeToHandlerMapping = new Map();

//parsind the code by esprime to get the code tree with the line of each row ({loc: true})
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true});
};

export function startSymbolicSubstitution(codeToParse, argsNameAndValue){
    strPerRow = {};
    condsElseIf = {};
    _line = 0;
    typeToHandlerMapping =initiateMap();
    let parsedCode = parseCode(codeToParse);
    let inputVector = new Set([]);
    let functionItem;
    parsedCode.body.forEach(node => {
        //if(node.type === 'FunctionDeclaration')
        functionItem = node;
        /*else
            functionMappingByType(node, inputVector, argsNameAndValue, false, []);*/
    });
    functionMappingByType(functionItem, inputVector, argsNameAndValue, false, []);
    return createFinalCodeOutput(argsNameAndValue, inputVector);
}

function initiateMap() {
    let typeToHandlerMapping = {
        'FunctionDeclaration': parseFunctionDeclaration,
        'BlockStatement': parseBlockStatement,
        //'ReturnStatement':parseReturnStatement,
        'VariableDeclaration': parseVariableDeclaration,
        //'ExpressionStatement': parseExpressionStatement,
        //'WhileStatement': parseWhileStatement,
        //'AssignmentExpression': parseAssignmentExpression,
        'BinaryExpression': parseBinaryExpression,
        //'MemberExpression': parseMemberExpression,
        'UnaryExpression': parseUnaryExpression,
        'IfStatement': parseIfStatement,
        'Identifier':parseIdentifierExpression,
        'Literal': parseLiteralExpression,
        //'ArrayExpression': parseArrayExpression,
        'LogicalExpression': parseLogicalExpression
    };
    return typeToHandlerMapping;
}


function functionMappingByType(node, inputVector, argsNameAndValue, insideFunction, conds){
    return typeToHandlerMapping[node.type](node, inputVector, argsNameAndValue, insideFunction, conds);
}

function parseFunctionDeclaration(node,inputVector, argsNameAndValue, inFunctionBody, conds){
    _line = node.loc.start.line;
    let functionDeclarRow = createFunDeclarRow(node);
    for (var i in node.params) {
        inputVector.add(node.params[i].name);
    }
    //console.log('functionDeclarRow ' + functionDeclarRow); // eslint-disable-line no-console
    //if(!(_line in strPerRow)) {strPerRow[_line] = {};}
    strPerRow[_line] = {};
    strPerRow[_line][node.loc.start.column] = functionDeclarRow;
    functionMappingByType(node.body, inputVector, argsNameAndValue, true, conds);
}

function createFunDeclarRow(node){
    let functionDeclarRow = 'function ' + node.id.name + '(';
    /*if(node.params.length == 0){
        functionDeclarRow +=  ')';
        return functionDeclarRow;
    }*/
    for (var i in node.params) {
        if(i< node.params.length-1)
            functionDeclarRow += node.params[i].name+ ',';
        else
            functionDeclarRow += node.params[i].name+ ')';
    }
    return functionDeclarRow;
}

function parseBlockStatement(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    _line = node.loc.start.line;
    addTostrPerRow(node.loc.start.line, node.loc.start.column, '{');
    for( var i in node.body){
        functionMappingByType(node.body[i], inputVector, argsNameAndValue, inFunctionBody, conds);
    }
    addTostrPerRow(node.loc.end.line, node.loc.end.column, '}');
}

function addTostrPerRow(line, column, str){
    if(!(line in strPerRow))
        strPerRow[line] = {};
    strPerRow[line][column] = str;
}

/*function parseReturnStatement(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    _line = node.loc.start.line;
    let value = functionMappingByType(node.argument, inputVector, argsNameAndValue, inFunctionBody, conds);
    let returnStaterntRow = 'return ' + value + ';';
    //if(!(node.loc.start.line in strPerRow))
    strPerRow[node.loc.start.line] = {};
    strPerRow[node.loc.start.line][node.loc.start.column] = returnStaterntRow;
}*/

function parseVariableDeclaration(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    _line = node.loc.start.line;
    node.declarations.forEach(declaration => {
        let _name = declaration.id.name;
        let _value = null;
        //if(declaration.init != null)
        _value = functionMappingByType(declaration.init, inputVector, argsNameAndValue, inFunctionBody, conds);
        addToArgsNameAndValue( node, argsNameAndValue,_name, _value, conds);
    });
    /*if(!inFunctionBody) {
        if(!(node.loc.start.line in strPerRow))
            strPerRow[node.loc.start.line] = {};
        strPerRow[node.loc.start.line][node.loc.start.column] = node.kind + ' ';
    }*/
}

function addToArgsNameAndValue( node, argsNameAndValue,name, value, conds){
    if(!(name in argsNameAndValue))
        argsNameAndValue[name] = [];
    argsNameAndValue[name].push({'line':node.loc.start.line, 'conditions': [...conds], 'value': value});
}

/*function parseExpressionStatement(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    let _expressionToParse = node.expression;
    return functionMappingByType(_expressionToParse, inputVector, argsNameAndValue, inFunctionBody, conds);
}*/


/*function parseWhileStatement(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    _line = node.loc.start.line;
    let whileDeclarRow = createWhileDeclarRow(node, inputVector, argsNameAndValue, inFunctionBody, conds);
    conds.push(_line);
    //if(!(_line in strPerRow))
    strPerRow[_line] = {};
    strPerRow[_line][node.loc.start.column] = whileDeclarRow;
    functionMappingByType(node.body, inputVector, argsNameAndValue, inFunctionBody, conds);
    conds.pop();
}

function createWhileDeclarRow(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    let whileDeclarRow = 'while(';
    let condition = functionMappingByType(node.test, inputVector, argsNameAndValue, inFunctionBody, conds);
    whileDeclarRow += condition + ')';
    return whileDeclarRow;
}

function parseAssignmentExpression(node,inputVector, argsNameAndValue, inFunctionBody, conds){
    _line = node.loc.start.line;
    let left = node.left.name;
    let right = functionMappingByType(node.right, inputVector, argsNameAndValue, inFunctionBody, conds);
    if(inputVector.has(left)){
        let signmentExprRow = left + ' = ' + right + ';';
        if(!(node.loc.start.line in strPerRow))
            strPerRow[node.loc.start.line] = {};
        strPerRow[node.loc.start.line][node.loc.start.column] = signmentExprRow;
    }
    addToArgsNameAndValue( node, argsNameAndValue,left, right, conds);
}

function parseMemberExpression(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    let variable = node.object.name;
    let property = functionMappingByType(node.property, inputVector, argsNameAndValue, inFunctionBody, conds);
    if(!inputVector.has(variable)){
        if(node.property.type == 'Literal') {
            //variable = getArrayLastValue(_line, argsNameAndValue[variable], property, conds);
            variable = getArrayLastValue(_line, argsNameAndValue[variable], property);
            return variable;
        }
        else
            variable =  getvariableLastValue(_line, argsNameAndValue[variable], conds);
    }
    return variable + '[' + property + ']';
}*/

function parseLogicalExpression(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    let operator = node.operator;
    let left = functionMappingByType(node.left, inputVector, argsNameAndValue, inFunctionBody, conds);
    let right = functionMappingByType(node.right, inputVector, argsNameAndValue, inFunctionBody, conds);
    return left + ' ' + operator + ' ' + right;
}

function parseBinaryExpression(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    let operator = node.operator;
    let left = functionMappingByType(node.left, inputVector, argsNameAndValue, inFunctionBody, conds);
    let right = functionMappingByType(node.right, inputVector, argsNameAndValue, inFunctionBody, conds);
    return left + ' ' + operator + ' ' + right;
}

function parseUnaryExpression(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    let operator = node.operator;
    let arg = node.argument;
    arg = functionMappingByType(arg, inputVector, argsNameAndValue, inFunctionBody, conds);
    return operator + arg;
}

function parseIfStatement(node, inputVector, argsNameAndValue, inFunctionBody, conds, type = 'if'){
    _line = node.loc.start.line;
    let ifStatmentRow = createIfStatmentRow(type, node, inputVector, argsNameAndValue, inFunctionBody, conds);
    conds.push(_line);
    strPerRow[_line] = {};
    //if(!(_line in strPerRow)) {strPerRow[_line] = {};}
    /*if(type === 'if'){
        strPerRow[_line][node.loc.start.column] = ifStatmentRow;
    }
    else{
        strPerRow[_line][node.loc.start.column - 4] = ifStatmentRow;
    }*/
    strPerRow[_line][node.loc.start.column] = ifStatmentRow;
    functionMappingByType(node.consequent, inputVector, argsNameAndValue, inFunctionBody, conds);
    pushCondelseIf(type, node.loc.start.line);
    conds.pop();
    /*if(node.alternate != undefined)
        parseIfElseOrElseStatment(node, inputVector, argsNameAndValue, inFunctionBody, type, conds);*/
    return ifStatmentRow;
}

function createIfStatmentRow(type, node, inputVector, argsNameAndValue, inFunctionBody, conds){
    let cond = functionMappingByType(node.test, inputVector, argsNameAndValue, inFunctionBody, conds);
    let ifStatmentRow = type + '(' + cond + ')';
    return ifStatmentRow;
}

/*function parseIfElseOrElseStatment(node, inputVector, argsNameAndValue, inFunctionBody, type, conds){
    if(node.alternate.type === 'IfStatement') { parseIfStatement(node.alternate, inputVector, argsNameAndValue, inFunctionBody, conds, 'else if');}
    else {parseElseStatment(type, node,inputVector, argsNameAndValue, inFunctionBody, conds);}
}

function parseElseStatment(type, node, inputVector, argsNameAndValue, inFunctionBody, conds){
    _line = node.consequent.loc.end.line;
    strPerRow[_line][node.consequent.loc.end.column + 2] = 'else';
    conds.push(_line);
    functionMappingByType(node.alternate, inputVector, argsNameAndValue, inFunctionBody, conds);
    conds.pop();
}*/

function pushCondelseIf(type, line){
    condsElseIf[line] = [];
    /*if(type == 'else if'){
        let lastCondition = Object.keys(condsElseIf)[Object.keys(condsElseIf).length-2];
        condsElseIf[line].push(lastCondition);
        condsElseIf[line].push(...condsElseIf[lastCondition]);
    }*/
}

function parseIdentifierExpression(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    let identifier = node.name;
    if (!inputVector.has(identifier)){
        let identifierValue = getvariableLastValue(_line, argsNameAndValue[node.name], conds);
        if(identifierValue.length > 2) { identifierValue = '(' + identifierValue + ')'; }
        return identifierValue;
    }
    return identifier;
}

function parseLiteralExpression(node){
    return node.raw;
}

/*function parseArrayExpression(node, inputVector, argsNameAndValue, inFunctionBody, conds){
    let arrayElements = [];
    //let funcStr = setVariabledeclStr(argsNameAndValue, inputVector);
    for(var i in node.elements){
        let currElement = functionMappingByType(node.elements[i], inputVector, argsNameAndValue, true, conds);
        //let currElementAns = eval(currElement);
        arrayElements.push(currElement);

    }
    return arrayElements;
}*/

/**crating the output - select witch line to print, bild the lines and choose color if needed**/
function createFinalCodeOutput(argsNameAndValue, inputVector){
    let funcStr = setVariabledeclStr(argsNameAndValue, inputVector);
    let lineCondAns;
    for(let line in strPerRow){
        let lineOutput = createRowWithSpaces(strPerRow[line]);
        if(lineToPrint(lineOutput)){
            if(lineOutput.includes('if')){
                lineCondAns = getCondAns(lineOutput, inputVector, argsNameAndValue, funcStr);}
        }
    }
    return lineCondAns;
}

/*function createFinalCodeOutput(argsNameAndValue, inputVector){
    let finalCodeOutput = ''; // String with color classes
    let funcStr = setVariabledeclStr(argsNameAndValue, inputVector);
    for(let line in strPerRow){
        let lineCondAns;
        let lineOutput = createRowWithSpaces(strPerRow[line]);
        if(lineToPrint(lineOutput)){
            if(lineOutput.includes('if')){ lineCondAns = getCondAns(lineOutput, inputVector, argsNameAndValue, funcStr);}
            //if(lineOutput.includes('if') || lineOutput.includes('while')){ lineCondAns = getCondAns(lineOutput, inputVector, argsNameAndValue, funcStr);}
            else { funcStr += lineOutput;}

        }
        if(notDeclarationRow(lineOutput))
            finalCodeOutput += chooseCondColor(lineCondAns, lineOutput);
    }
    return finalCodeOutput;
}*/


/*
function notDeclarationRow(lineOutput){
    if(!lineOutput.trim().startsWith('let') && !lineOutput.trim().startsWith('const') && !lineOutput.trim().startsWith('var'))
        return true;
    else
        return false;
}*/
function getCondAns(lineOutput, inputVector, argsNameAndValue, funcStr){
    let cond = getCond(lineOutput, inputVector, argsNameAndValue);
    let evalString = funcStr + cond;
    return eval(evalString);
}

export function getvariableLastValue(baseL, variableValues, conds){
    let lastLine = '';
    let minDiffValue = setMinDiffValue(-1,-1);
    for(let i in variableValues){
        if(baseL - variableValues[i].line < minDiffValue && isCond(conds, variableValues[i].conditions)){
            let value = variableValues[i].value;
            lastLine = value;
            /*if(!(Array.isArray(value)))
                lastLine = value;
            else
                lastLine = '[' + value + ']';*/
            minDiffValue = setMinDiffValue(baseL,variableValues[i].line);
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
/*
function getArrayLastValue(baseL, variableValues, property, conds){
    let lastLine = '';
    let minDiffValue = setMinDiffValue(-1,-1);
    for(let i in variableValues){
        if(baseL - variableValues[i].line < minDiffValue && isCond(conds, variableValues[i].conditions)){
            let value = variableValues[i].value;
            lastLine = value[property]
            minDiffValue = setMinDiffValue(baseL,variableValues[i].line);
        }
    }
    return lastLine;
}*/

function setMinDiffValue(sourceLine, currLine){
    if(sourceLine == -1){ return 10000;}
    else{return Math.abs(sourceLine - currLine);}
}



function lineToPrint(lineOutput){
    console.log('lineToPrint: ' + lineOutput); // eslint-disable-line no-console
    return !lineOutput.trim().startsWith('var') && !lineOutput.trim().startsWith('function') && !lineOutput.trim().startsWith('return') && !lineOutput.trim().startsWith('let') && !lineOutput.trim().startsWith('const');
}

function getCond(condLine, inputVector, symbolTable, conditions){
    console.log('getCondition: ' + condLine); // eslint-disable-line no-console
    let condStart = findCondStart(condLine);
    condLine = condLine.substring(condStart); //+ '}';
    //condLine += condLine.endsWith('{') ? '}' : '{}';
    console.log('row before parse: ' + condLine); // eslint-disable-line no-console
    let condLineAfterParse = parseCode(condLine);
    let cond = condLineAfterParse.body[0].test;
    return functionMappingByType(cond, inputVector, symbolTable, false, conditions);

}

function findCondStart(line){
    let currLoc = 0;
    while (currLoc < line.length && line.charAt(currLoc) != 'i' && line.charAt(currLoc) != 'w') {
        currLoc++;
    }
    return currLoc;
}

function createRowWithSpaces(lineElements){
    console.log('createRowString' ); // eslint-disable-line no-console
    let line = '';
    for(let i in lineElements){
        //add spaces until we get to the column where the text start
        while(line.length < i)
            line += ' ';
        console.log('lineElements[column]: ' + lineElements[i] ); // eslint-disable-line no-console
        line += lineElements[i];
    }
    //return full line to print with spaces
    return line;
}

function setVariabledeclStr(argsNameAndValue, inputVector){
    let declStr = '';
    inputVector.forEach(varb => {
        let lastVal = argsNameAndValue[varb][0][0].value;
        let letStatment = 'let ' + varb + ' = ' + lastVal + '; ';
        declStr += letStatment;
    });
    return declStr;
}

function isCond(){
    return true;
}
/*
function isCond(source, target){
    if(source == undefined)
        return true;
    for(let condition in target){
        if(!source.includes(target[condition]))
            return false;
    }
    return true;
}*/
/*
function chooseCondColor(lineCondAns, lineString){
    if(lineCondAns == true) { return '<pre class=green>' + lineString + '</pre>'; }
    else if(lineCondAns == false) {return '<pre class=red>' + lineString + '</pre>';}
    else {return '<pre>' + lineString + '</pre>';}
}*/
