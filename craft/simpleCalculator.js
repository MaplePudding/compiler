const SimpleLexer = require('./simpleLexer')
const ASTNodeType = require('./ASTNodeType')
const TokenType = require('./tokenType')

class SimpleCalculator{
    evaluate(script){
        try{
            tree = this.parse(script)
            dumpAST(tree, "")
            this._evaluate(tree, "")
        }catch(e){
            console.log(e)
        }
    }

    parse(script){
        let lexer = new SimpleLexer()
        let tokens = lexer.tokenize(script)
        let rootNode = this.prog(tokens)
        return rootNode
    }

    prog(tokens){
        let node = new SimpleASTNode(ASTNodeType.Program, "Calculator")
        let child = this.additive(tokens)

        if (child) {
            node.children.push(child);
        }
        return node;
    }

    additive(tokens){
        let child1 = this.multiplicative(tokens)
        console.error(child1)
        let node = child1;
        let token = tokens.peek();
        if (child1 && token) {
            if (token.type == TokenType.Plus || token.type == TokenType.Minus) {
                token = tokens.read();
                let child2 = additive(tokens);
                if (child2) {
                    node = new SimpleASTNode(ASTNodeType.Additive, token.text);
                    node.children.push(child1);
                    node.children.push(child2);
                } else {
                    throw new Error("invalid additive expression, expecting the right part.");
                }
            }
        }
        return node;
    }

    multiplicative(tokens){
        let child1 = this.primary(tokens)
        let node = child1

        let token = tokens.peek()
        console.error(tokens)
        if(child1 && token){
            if (token.type == TokenType.Star || token.type == TokenType.Slash) {
                token = tokens.read();
                let child2 = multiplicative(tokens);
                if (child2 != null) {
                
                    node = new SimpleASTNode(ASTNodeType.Multiplicative, token.text);
                    node.children.push(child1);
                    node.children.push(child2);
                } else {
                    throw new Error("invalid multiplicative expression, expecting the right part.");
                }
            }
        }

        return node
    }

    primary(tokens){
        let node = null
        let token = tokens.peek()
        if(token !== null){
            if (token.type == TokenType.IntLiteral) {
                token = tokens.read();
                node = new SimpleASTNode(ASTNodeType.IntLiteral, token.text);
            } else if (token.type == TokenType.Identifier) {
                token = tokens.read();
                node = new SimpleASTNode(ASTNodeType.Identifier, token.text);
            } else if (token.type == TokenType.LeftParen) {
                tokens.read();
                node = additive(tokens);
                if (node != null) {
                    token = tokens.peek();
                    if (token != null && token.type == TokenType.RightParen) {
                        tokens.read();
                    } else {
                        throw new Error("expecting right parenthesis");
                    }
                } else {
                    throw new Error("expecting an additive expression inside parenthesis");
                }
            }
        }
        return node
    }
}

class SimpleASTNode{
    parent = null
    children = []
    
    constructor(nodeType, text){
        this.nodeType = nodeType,
        this.text = text
    }

    getParent(){
        return this.parent
    }

    getChildren(){
        return this.children
    }

    getType(){
        return this.nodeType
    }

    getText(){
        return this.text
    }

    addChild(child){
        this.children.push(child)
        child.parent = this
    }
}

function dumpAST(node, indent) {
    console.warn(indent + node.getType() + " " + node.getText());
    for (let child of node.getChildren()) {
        dumpAST(child, indent + "\t");
    }
}

function test(){
    return new SimpleCalculator().parse("1 * 111 ")
}

console.log(test())