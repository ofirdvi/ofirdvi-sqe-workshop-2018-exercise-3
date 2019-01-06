/*import assert from 'assert';
import {startSymbolicSubstitution} from '../src/js/symbolic-substitution';


describe('The symbol substitution', () => {
    it('symbolic substitution of global variables', () => {
        assert.equal(
            startSymbolicSubstitution('let a = 3;', {'':[{'line':0,'conditions':[],'value':''}]}),
            ''
        );
    });

    it('replace local variables', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a=x;\n' + 'return a;\n' +'}', {'':[{'line':0,'conditions':[],'value':''}]}),
            '<pre>function foo(x){</pre><pre>return x;</pre><pre> }</pre>'
        );
    });

    it('replace global variables', () => {
        assert.equal(
            startSymbolicSubstitution('let a=0;\n' + 'function foo(x){\n' + 'a=x;\n' + 'return a;\n' +'}', {}),
            '<pre>function foo(x){</pre><pre>return x;</pre><pre> }</pre>'
        );
    });

    it('replace local variables with binary expression', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a=x + 1 ;\n' + 'return a;\n' +'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre>return (x + 1);</pre><pre> }</pre>'
        );
    });

    it('replace local variables member expression', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a=x[1] ;\n' + 'return a;\n' +'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre>return (x[1]);</pre><pre> }</pre>'
        );
    });
    it('replace local variables unary expression', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a=-1 ;\n' + 'return a;\n' +'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre>return -1;</pre><pre> }</pre>'
        );
    });
    it('symbolic substitution of  simple if statment', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a = x;\n' + 'if (a == x) {\n' + 'return x;\n'+'}\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre class=green>if(x == x)  {</pre><pre>return x;</pre><pre> }</pre><pre> }</pre>'
        );
    });
    it('symbolic substitution of simple if statment with binary expressen', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a = x;\n' + 'if (a + 1 > x) {\n' + 'return x;\n'+'}\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre class=green>if(x + 1 > x)  {</pre><pre>return x;</pre><pre> }</pre><pre> }</pre>'
        );
    });
    it('symbolic substitution of simple function with two params', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x,y){\n' + 'let a = x;\n' + 'let b = y\n' + 'return a+b;\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}]}),
            '<pre>function foo(x,y){</pre><pre>return x + y;</pre><pre> }</pre>'
        );
    });
    it('symbolic substitution of simple if, if else statment', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a = x;\n' + 'if (a + 1 > x) {\n' + 'return x;\n'+'} else if (a > x) {\n'+ 'return a;\n'+'}\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre class=green>if(x + 1 > x)  {</pre><pre>return x;</pre><pre class=red> } else if(x > x) {</pre><pre>return x;</pre><pre> }</pre><pre> }</pre>'
        );
    });
    it('symbolic substitution of simple if, else statment', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a = x;\n' + 'if (a + 1 > x) {\n' + 'return x;\n'+'} else {\n'+ 'return a;\n'+'}\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre class=green>if(x + 1 > x)  {</pre><pre>return x;</pre><pre> } else{</pre><pre>return x;</pre><pre> }</pre><pre> }</pre>'
        );
    });
    it('symbolic substitution of simple while statment', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'while (x > 1) {\n' + 'x = 1 * 2;\n'+'}\n'+'return x;\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre>while(x > 1)  {</pre><pre>x = 1 * 2;</pre><pre> }</pre><pre>return x;</pre><pre> }</pre>'
        );
    });
    it('symbolic substitution of simple function with array as param', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a = x;\n' + 'return a;\n'+'}', {'x':[{'line':0,'conditions':[],'value':['1','2','3']}]}),
            '<pre>function foo(x){</pre><pre>return x;</pre><pre> }</pre>'
        );
    });
    it('symbolic substitution of simple function with array assignment', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a = [1,2,3];\n' + 'return a;\n'+'}', {}),
            '<pre>function foo(x){</pre><pre>return ([1,2,3]);</pre><pre> }</pre>'
        );
    });
    it('symbolic substitution of simple function with global param', () => {
        assert.equal(
            startSymbolicSubstitution('let a = 1;\n' +'function foo(x){\n' + 'let b = x + a;\n' + 'return b;\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre>return (x + 1);</pre><pre> }</pre>'
        );
    });

    it('symbolic substitution of simple verable declaration without init value', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x){\n' + 'let a;\n' + 'a=x;\n'+ 'return a;\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre>return x;</pre><pre> }</pre>'
        );
    });

    it('symbolic substitution of two simple global verable declaration without init value in the same row', () => {
        assert.equal(
            startSymbolicSubstitution('let a; let b;\n' + 'function foo(x){\n' + 'a=x;\n'+ 'b= a + 1;\n' + 'return b;\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre>return (x + 1);</pre><pre> }</pre>'
        );
    });

    it('symbolic substitution of two assinment expression in the same row', () => {
        assert.equal(
            startSymbolicSubstitution('let a; let b;\n' + 'function foo(x){\n' + 'a=x;\n'+ 'b= a + 1; a = b + 2;\n' + 'return a;\n'+'}', {'x':[{'line':0,'conditions':[],'value':'1'}]}),
            '<pre>function foo(x){</pre><pre>return ((x + 1) + 2);</pre><pre> }</pre>'
        );
    });

    it('symbolic substitution of two assinment of local variable in the same row', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x,y){\n' + 'y = x; x = y + 2;\n' + 'return x;\n'+'}',  {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}]}),
            '<pre>function foo(x,y){</pre><pre>y = x; x = y + 2;</pre><pre>return x;</pre><pre> }</pre>'
        );
    });

    it('symbolic substitution of member expression with variable as local virable', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x,y){\n' +'let b= x;\n' + 'let a = b[y];\n' + 'return a;\n'+'}',  {'x':[{'line':0,'conditions':[],'value':'[1,2,3]'}],'y':[{'line':0,'conditions':[],'value':'2'}]}),
            '<pre>function foo(x,y){</pre><pre>return (x[y]);</pre><pre> }</pre>'
        );
    });

    it('symbolic substitution if and else function', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x,y){\n' + 'let a = x + 1;\n' +'let b = a + x;\n'+'if (b < 6) {\n'+'b = a + 5;\n'+'return b;\n'+'} else {\n'+'a = b + y;\n'+'return a;\n'+'}\n'+'}',  {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}]}),
            '<pre>function foo(x,y){</pre><pre class=green>if(((x + 1) + x) < 6){</pre><pre>return ((x + 1) + 5);</pre><pre> } else{</pre><pre>return (((x + 1) + x) + y);</pre><pre> }</pre><pre> }</pre>'
        );
    });

    it('symbolic substitution of logical expression', () => {
        assert.equal(
            startSymbolicSubstitution('function foo(x,y) {\n' + 'let a = 1 + x;\n' +'let b = y + a;\n\n'+'if (b<a || x!=1){\n'+'return true;\n'+'} else\n'+'return false;\n'+'}',  {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}]}),
            '<pre>function foo(x,y) {</pre><pre class=red>if((y + (1 + x)) < (1 + x) || x != 1){</pre><pre>return true;</pre><pre> } else</pre><pre>return false;</pre><pre> }</pre>'
        );
    });

    it('symbolic substitution with member expression as literal', () => {
        assert.equal(
            startSymbolicSubstitution('function f() {\n' + 'let a = [1,true];\n' +'if (a[0] == 1){\n'+'return true;\n'+'} else if (a[1]) {\n'+'return true;\n'+'} else\n'+'return false;\n'+'}',   {'':[{'line':0,'conditions':[],'value':''}]}),
            '<pre>function f() {</pre><pre class=green>if(1 == 1)    {</pre><pre>return true;</pre><pre class=green> } else if(true) {</pre><pre>return true;</pre><pre> } else</pre><pre>return false;</pre><pre> }</pre>'
        );
    });
});
*/