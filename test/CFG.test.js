import assert from 'assert';
import {startCFG} from '../src/js//CFG';

describe('The cfg tests', () => {
    it('cfg with simple if', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   if(y>x){\n' + '      x=y;\n' + '   }\n' + '   return x;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[1].detailes.Contant,'y>x');
    });

    it('cfg with number of  VariableDeclaration as cfg block', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a=x;\n'+'   let b=y;\n'+'   let c=0;\n'+'   if(y>x){\n' + '      a++;\n' + '   }\n' + '   return x;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[1].detailes.Contant,'a=x b=y c=0');
    });
    it('cfg with simple if and if else statment', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a=x;\n'+'   if (a < z) {\n'+'   a = y + 5;\n'+'    } else if (a > z) {\n' + '       y =5;\n' + '   }\n' + '   return y;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[2].detailes.Contant,'a<z');
    });
    it('cfg with simple while statment', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a = x + 1;\n'+'   let b = a + y;\n'+'   let c = 0;\n'+'   while (a < z) {\n'+'   c = a + b;\n'+ '   }\n' + '   return z;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[3].detailes.Contant,'a<z');
    });
    it('cfg with simple while statment and logical expression', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a = x + 1;\n'+'   let b = a + y;\n'+'   let c = 0;\n'+'   while (a < z && z>y) {\n'+'   c = a + b;\n'+ '   }\n' + '   return z;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[3].detailes.Contant,'a<z&&z>y');
    });
    it('cfg with simple if with unary expression', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   if(y>x){\n' + '      x=y;\n' + '   }\n' + '   return -1;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[3].detailes.Contant,'-1');
    });
    it('cfg with simple if with unary expression', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a = x + 1;\n'+'   let b = a + y;\n'+'let c = 0;\n'+'while (a < z) {\n'+'c = a + b;\n'+'a = a + 1;\n'+'if(a<z){\n'+'a=a+10}\n' + '}\n' + 'if(b<z){\n' + 'b=b+10}\n' +'return z;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[6].detailes.Contant,'a=a+10');
    });
    it('cfg with simple if , if else, else statments', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a = x + 1;\n'+'   let b = a + y;\n'+'let c = 0;\n'+'if (b < z) {\n'+'c = c + 5;\n'+' } else if (b < z * 2) {\n'+'c = c + x + 5\n'+'} else {\n' + 'c = c + z + 5;\n' + '}\n' +'return c;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[6].detailes.Contant,'c=c+z+5');
    });
    it('cfg with simple if as while body', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a = x + 1;\n'+'   let b = a + y;\n'+'let c = 0;\n'+'while(c==0){\n'+'if (b < z) {\n'+'c = c + 5;\n'+' } else if (b < z * 2) {\n'+'c = c + x + 5\n'+'} else {\n' + 'c = c + z + 5;\n'+'if(c==2){\n'+ '} else if(c==5){ \n'+ 'c=8;\n'+ '}\n' +'}\n' +'}\n' +'return c;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[12].detailes.Contant,'c');
    });
    it('cfg with simple if without if consequent', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a = x + 1;\n'+'   let b = a + y;\n'+'let c = 0;\n'+'if (b < z) {\n'+' }' + 'return c;\n' + '}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[1].detailes.Contant,'a=x+1 b=a+y c=0');
    });
    it('cfg with simple if and else if with unary expression', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a = x + 1;\n'+'   let b = a + y;\n'+'let c = 0;\n'+'let d = 2;\n'+'while(c==0) {\n'+'if (b < z) {\n' + 'c = c + 5;\n'+'}\n'+'else if (b < z * 2) {\n'+'c = c + x + 5;\n'+'if(c==7){\n'+'d=3;\n'+'}\n'+'else if(c==6){\n'+'d=4;\n'+'}\n'+'else{\n'+'d=2;\n'+'}\n'+'}\n'+'else {\n'+'c = c + z + 5;\n'+'if(c==-2){\n'+'c=5;\n'+'}\n'+'else if(c==5){\n'+'c=8;\n'+'}\n'+'}\n'+'}\n'+'return c;\n'+'}\n',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[13].detailes.Contant,'c=c+z+5');
    });
    it('cfg with simple member expression', () => {
        let g = startCFG('function foo(x,y,z){\n' +'let a=x[1];\n'+'return a;\n'+'}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[1].detailes.Contant,'a=x[1]');
    });
    it('cfg with simple array statment', () => {
        let g = startCFG('function foo(x,y,z){\n' +'let a=[1,2,3];\n'+'return a[1];\n'+'}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[1].detailes.Contant,'a=1,2,3');
    });
    it('cfg with only return statment', () => {
        let g = startCFG('function foo(x,y,z){\n' +'return x;\n'+'}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[1].detailes.Contant,'x');
    });
    it('cfg while statment that contain if and then assinment expression', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a = x + 1;\n'+'   let b = a + y;\n'+'let c = 0;\n'+ 'while(x>y){\n'+'if(x==1){\n'+'c = c + 5;\n'+'}\n'+'let b=x-1;\n'+'}\n'+ 'return x;\n'+'}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[3].detailes.Contant,'x>y');
    });
    it('cfg if inside if statment without if else or else', () => {
        let g = startCFG('function foo(x,y,z){\n' +'   let a = x + 1;\n'+'   let b = a + y;\n'+'let c = 0;\n'+ 'if(a<1){\n'+'b=b+1;\n'+'if(a<1){\n'+'a=a+7;\n'+'}\n'+'}\n'+ 'return x;\n'+'}',   {'x':[{'line':0,'conditions':[],'value':'1'}],'y':[{'line':0,'conditions':[],'value':'2'}],'z':[{'line':0,'conditions':[],'value':'3'}]});
        console.log(g); // eslint-disable-line no-console
        assert.equal(g[4].detailes.Contant,'a<1');
    });

});
