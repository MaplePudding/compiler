const SimpleLexer = require('./simpleLexer')
const ASTNodeType = require('./ASTNodeType')
const TokenType = require('./tokenType')


class SimpleParser{
    parse(script){
        let lexer = new SimpleLexer()
        let tokens = lexer.tokenize(script)
        let rootNode = this.prog(tokens)
        return rootNode
    }

    prog(tokens){
        let node = new SimpleASTNode(ASTNodeType.Program, "pwc")

        while(tokens.peek()){
            let child = this.intDeclare(tokens)
            console.log(child)
            if(child){
                child = this.expressionStatement(tokens)
            }

            if(child){
                child = this.assignmentStatement(tokens)
            }

            if (child) {
                node.children.push(child);
            } else {
                return new Error("unknown statement");
            }
            return child
        }
        return node
    }

    intDeclare(tokens){
        let node = null
        let token = tokens.peek()
        if(token && token.type === TokenType.Int){
            token = tokens.read()
            if(tokens.peek() && tokens.peek().type === TokenType.Identifier){
                token = tokens.read()
                node = new SimpleASTNode(ASTNodeType.IntDeclaration, token.text)
                if(tokens.peek() && tokens.peek().type === TokenType.Assignment){
                    tokens.read()
                    let child = this.additive(tokens)
                    if(!child){
                        return new Error("invalide variable initialization, expecting an expression")
                    }else{
                        node.children.push(child)
                    }
                }
            }else{
                return new Error("variable name expected")
            }

            if (node) {
                let token = tokens.peek();
                if (token && token.type === TokenType.SemiColon) {
                    tokens.read();
                } else {
                    throw new Error("invalid statement, expecting semicolon");
                }
            }
        }
        return node
    }

    expressionStatement(tokens){
        let pos = tokens.getPosition()
        let node = this.additive(tokens)
        if(node){
            let token = tokens.peek()
            if(token && token.type === TokenType.SemiColon){
                tokens.read()
            }else {
                node = null
                tokens.setPosition(pos)
            }
        }
        return node
    }

    assignmentStatement(tokens){
        let node = null
        let token = tokens.peek()
        if(token && token.type === TokenType.Identifier){
            token = tokens.read()
            node = SimpleASTNode(ASTNodeType.AssignmentStmt, token.text)
            token = tokens.peek()
            if(token && token.type === TokenType.Assignment){
                tokens.read()
                let child = this.additive(tokens)
                if(!child){
                    return new Error("invalide assignment statement, expecting an expression");
                }else{
                    node.children.push(child)
                    token = tokens.peek()
                    if(token && token.type === TokenType.SemiColon){
                        tokens.read()
                    }else{
                        return new Error("invalid statement, expecting semicolon")
                    }
                }
            }else{
                tokens.unread()
                node = null
            }
        }
        return node;
    }

    additive(tokens){
        let child1 = this.multiplicative(tokens)
        let node = child1
        if(child1){
            while(true){
                let token = tokens.peek()
                if(token && (token.type === TokenType.Plus || token.type === TokenType.Minus)){
                    token = tokens.read()
                    let child2 = this.multiplicative(tokens)
                    if(child2){
                        node = new SimpleASTNode(ASTNodeType.Additive, token.text)
                        node.children.push(child1)
                        node.children.push(child2)
                        child1 = node
                    }else{
                        return new Error("invalid additive expression, expecting the right part.");
                    }
                }else{
                    break;
                }
            }
        }
        return node
    }

    multiplicative(tokens){
        let child1 = this.primary(tokens)
        let node = child1

        while(true){
            let token = tokens.peek()
            if(token && (token.Type === TokenType.Star || token.Type === TokenType.Slash)){
                token = tokens.read()
                let child2 = this.primary(tokens)
                if(child2){
                    node = new SimpleASTNode(ASTNodeType.Multiplicative, token.text)
                    node.children.push(child1)
                    node.children.push(child2)
                    child1 = node
                }else{
                    return new Error("invalid multiplicative expression, expecting the right part.")
                }
            }else{
                break;
            }
        }

        return node
    }

    primary(tokens){
        let node = null
        let token = tokens.peek()
        if(token){
            if(token.type === TokenType.IntLiteral){
                token = tokens.read()
                node = new SimpleASTNode(ASTNodeType.IntLiteral, token.text)
            }else if(token.type === TokenType.Identifier){
                token = tokens.read()
                node = new SimpleASTNode(ASTNodeType.Identifier, token.text)
            }else if(token.type === TokenType.LeftParen){
                tokens.read()
                node = this.additive(tokens)
                if(node){
                    token = tokens.peek()
                    if(token && token.type === TokenType.RightParen){
                        tokens.read()
                    }else{
                        return new Error("expecting right parenthesis");
                    }
                }else{
                    return new Error("expecting an additive expression inside parenthesis")
                }
            }
        }
        return node
    }

    dumpAST(node, indent){
        console.log(indent + node.type + " " + node.text);
        for (let child of node.children) {
            dumpAST(child, indent + "\t");
        }
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


module.exports = SimpleParser
