import * as esprima from 'esprima';
/*TODO*/

/*
* IfElseStatment
* binaryExpression with left side as literal
* ForStatment
* Function exsepssion
*
* */
var parsedNodesData = [];
var vairables = [];
const parseCode = (codeToParse) => {
    /*
    let parsed  = esprima.parseScript(codeToParse,{loc: true}, function(node, metadata){
        console.log(metadata.start.line, node.type, node.name, node.value, node.params, node.right); // eslint-disable-line no-console
    });
    */
    parsedNodesData = [];
    esprima.parseScript(codeToParse,{loc: true}, function(node,metadata){
        if (node.type === 'FunctionDeclaration'){ parseFunctionDeclaration(node,metadata);}
        if(node.type ==='VariableDeclaration'){ parseVariableDeclaration(node, metadata);}
        if (node.type === 'ExpressionStatement') { parseExpressionStatement(node,metadata);}
        else{
            mainParseFunction(node,metadata);
        }
    });
    parsedNodesData.sort((a, b) => Number(a.Line) - Number(b.Line));
    return parsedNodesData;
};

function mainParseFunction(node,metadata){
    if (node.type === 'WhileStatement') { parseWhileStatement(node,metadata);}
    if(node.type === 'IfStatement'){ parseIfStatement(node,'IfStatement',metadata.start.line);}
    if(node.type === 'ForStatement'){ parseForStatement(node,metadata);}
    if(node.type === 'ReturnStatement'){ parseReturnStatement(node,metadata);}
}

function parseFunctionDeclaration(node,metadata){
    parsedNodesData.push({ Line: metadata.start.line, Type: node.type, Name: node.id.name ,Cond:'', Value: ''});
    parseParam(node,metadata);

}

function parseParam(node,metadata){
    for (var i in node.params) {
        parsedNodesData.push({ Line: metadata.start.line, Type: 'Param', Name: node.params[i].name ,Cond:'', Value: ''});
        vairables.push({Name: node.params[i].name, Value: node.params[i].name});
    }
}

function parseVariableDeclaration(node,metadata){
    for (var i in node.declarations) {
        var value ='';
        value = parseRightBinaryExpression(node.declarations[i].init);
        parsedNodesData.push({ Line: metadata.start.line, Type: node.declarations[i].type, Name: node.declarations[i].id.name ,Cond:'', Value: value});
        vairables.push({Name: node.declarations[i].id.name, Value: node.declarations[i].id.name});
    }
}


function parseExpressionStatement(node,metadata) {
    var value, name;
    var righType = node.expression.right.type;
    if(node.expression.left.type === 'MemberExpression'){
        name = parseMemberExpression(node.expression.left);}
    else{
        name = node.expression.left.name;}
    if(righType === 'UnaryExpression'){
        value = parseUnaryExpression(node.expression.right);}
    else { value = parseRightBinaryExpression(node.expression.right); }
    parsedNodesData.push({Line: metadata.start.line, Type: node.expression.type, Name: name, Cond: '', Value: value});
}
/*
function findAssignmentExpression(){
    for(var i in vairables){
        console.log(vairables[i]); // eslint-disable-line no-console
    }
}

function setVairablesValuePerRow(){
    var lineValues =[];
    lineValues =initlineValues();
    for(var i in parsedNodesData){
        //console.log(parsedNodesData[i].Name + parsedNodesData[i].Type);// eslint-disable-line no-console
        if(parsedNodesData[i].Type === 'AssignmentExpression' || (parsedNodesData[i].Type === 'VariableDeclarator' && parsedNodesData[i].Value!='')){
            //console.log('insid!' + parsedNodesData[i].Name + parsedNodesData[i].Type);// eslint-disable-line no-console
            lineValues =[];
            var name = parsedNodesData[i].Name;
            for(var j in vairables){
                if (vairables[j].Name === name){
                    vairables[j].Value = spliteVaribaleValue(parsedNodesData[i].Value, parsedNodesData[i].Line);
                }
                lineValues.push({Name: vairables[j].Name, Value:  vairables[j].Value});
            }
        }
        vairablesValuePerRow.push({Line: parsedNodesData[i].Line, vairablesValues: lineValues});
        var stringParsedCode = JSON.stringify(lineValues);
        console.log('Line: '+parsedNodesData[i].Line+ stringParsedCode); // eslint-disable-line no-console
    }
}

function spliteVaribaleValue(value, line){
    var curr;
    var final='';
    for (var i = 0; i < value.length; i++) {
        curr = value.charAt(i);
        for (var j in vairablesValuePerRow){
            if(vairablesValuePerRow[j].Line == line -1){
                for(var k in vairablesValuePerRow[j].vairablesValues){
                    //console.log('vairablesValuePerRow[j].vairablesValues[k].Name '+ vairablesValuePerRow[j].vairablesValues[k].Name +' curr: ' + curr); // eslint-disable-line no-console
                    if(vairablesValuePerRow[j].vairablesValues[k].Name === curr){
                        //console.log('in if vairablesValuePerRow[j].vairablesValues[k].Name ==curr'); // eslint-disable-line no-console
                        curr = vairablesValuePerRow[j].vairablesValues[k].Value;
                    }
                }
            }
        }
        final = final + curr;
        //console.log('final: ' + final); // eslint-disable-line no-console

    }
    return final;
}

function initlineValues(){
    var lineValues =[];
    for(var j in vairables){
        lineValues.push({Name: vairables[j].Name, Value:  vairables[j].Value});
    }
    return lineValues;
}
*/
function parseBinaryExpression(node){
    var operator = node.operator;
    var left,right;
    left = parseLeftBinaryExpression(node.left);
    right = parseRightBinaryExpression(node.right);
    return left + ' ' + operator + ' ' + right;
}

function parseLeftBinaryExpression(node){
    var left;
    if (node.type === 'BinaryExpression'){left = parseBinaryExpression(node);}
    if (node.type === 'Literal'){ left = node.value;}
    if (node.type === 'MemberExpression'){ left = parseMemberExpression(node);}
    if (node.type === 'Identifier'){left = node.name;}
    return left;
}

function parseRightBinaryExpression(node){
    var right;
    if (node.type === 'BinaryExpression'){ right = parseBinaryExpression(node);}
    else if (node.type === 'MemberExpression') { right = parseMemberExpression(node);}
    else if (node.type === 'Identifier'){ right = node.name;}
    else { right = node.value;}
    return right;
}

function  parseForStatement(node,metadata){
    var update ,test, init;
    for(var i in node.init.declarations){
        init = node.init.declarations[i].id.name; //+ '=' + node.init.declarations[i].init.value;
    }
    if(node.update.type ==='UpdateExpression'){ update  = parseUpdateExpression(node.update); }
    else if (node.update.type ==='AssignmentExpression'){
        update = parseBinaryExpression(node.update);}
    if (node.test.type ==='BinaryExpression'){
        test = parseBinaryExpression(node.test);}
    var _cond  = init + '; ' + test + '; ' + update + ';';
    parsedNodesData.push({  Line: metadata.start.line, Type: node.type, Name: _cond,Cond:'', Value:''});
}

function parseUpdateExpression(node){
    return  node.argument.name + node.operator;
}

function parseWhileStatement(node,metadata){
    var _cond = parseBinaryExpression(node.test);
    parsedNodesData.push({  Line: metadata.start.line, Type: node.type, Name: '',Cond:_cond, Value:''});
}

function checkIfElseStatement(line){
    for(var i = 0; i < parsedNodesData.length; i++){
        if(parsedNodesData[i].Type === 'IfStatement' && parsedNodesData[i].Line === line) {
            parsedNodesData[i].Type = 'IfElseStatement';
        }
    }
}

function parseIfStatement(node,type, line){
    var _cond = parseBinaryExpression(node.test);
    parsedNodesData.push({  Line: line, Type: type, Name: '',Cond:_cond, Value:''});
    if(node.alternate != null) {
        if (node.alternate.type === 'IfStatement') {
            checkIfElseStatement(node.alternate.loc.start.line);
        }
    }
}

function parseUnaryExpression(node){
    var exp;
    exp = node.operator + node.argument.value;
    return exp;
}

function parseMemberExpression(node){
    var property;
    if(node.property.type ==='BinaryExpression'){
        property = parseBinaryExpression(node.property);
    }
    else if(node.property.type==='Identifier'){
        property = node.property.name;
    }
    else{
        property = node.property.value;
    }
    return node.object.name +'[' + property +']';
}

function parseReturnStatement(node,metadata){
    var _value;
    if(node.argument.type === 'UnaryExpression'){
        _value = parseUnaryExpression(node.argument);
    }
    else{
        _value = parseRightBinaryExpression(node.argument);
    }
    parsedNodesData.push({  Line: metadata.start.line, Type: node.type, Name: '',Cond:'', Value: _value});
}

export {parseCode};
