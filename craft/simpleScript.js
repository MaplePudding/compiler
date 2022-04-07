const SimpleParser = require('./simpleParser')

class SimpleScript{
    variables = new Map()
    verbose = false

    evaluate(node, indent){

    }
}

function test(){
    let parser = new SimpleParser();
    let script = new SimpleScript();
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    })

    let scriptText = ''

    readline.question(`enter script:`, line => {
        scriptText += line
        if (line[line.length - 1] === ';') {
            tree = parser.parse(scriptText);
            console.log(tree)
            parser.dumpAST(tree, "");
            script.evaluate(tree, "");  
            scriptText = "";
        }
    }) 
    


}

test()