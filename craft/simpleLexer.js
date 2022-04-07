const TokenType = require('./tokenType')

const DfaState = {
    Initial: "Initial",
    If:"If",
    Id_if1: "Id_if1", 
    Id_if2:"Id_if2",
    Else:"Else", 
    Id_else1: "Id_else1", 
    Id_else2: "Id_else2", 
    Id_else3: "Id_else3",
    Id_else4: "Id_else4", 
    Int: "Int", 
    Id_int1: "Id_int1",
    Id_int2: "Id_int2", 
    Id_int3: "Id_int3", 
    Id: "Id", 
    GT: "GT", 
    GE: "GE",
    Assignment: "Assignment",
    Plus: "Plus",
    Minus: "Minus",
    Star: "Star",
    Slash: "Slash",
    SemiColon: "SemiColon",
    LeftParen: "LeftParen",
    RightParen: "RightParen",
    IntLiteral: "IntLiteral"
}


class SimpleLexer{
    tokenText = ''
    tokens = []
    token = {}

    isAlpha(c){
        return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z';
    }

    isDigit(c){
        return c >= '0' && c <= '9';
    }

    isBlank(c){
        return c == ' ' || c == '\t' || c == '\n';
    }

    initToken(c){
        if (this.tokenText.length > 0) {
            this.token.text = this.tokenText;
            this.tokens.push(this.token);

            this.tokenText = '';
            this.token = {};
        }
        let newState = DfaState.Initial;

        if (this.isAlpha(c)) {              
            if (c === 'i') {
                newState = DfaState.Id_int1;
            } else {
                newState = DfaState.Id; 
            }
            this.token.type = TokenType.Identifier;
            this.tokenText += c;
        } else if (this.isDigit(c)) {       //第一个字符是数字
            newState = DfaState.IntLiteral;
            this.token.type = TokenType.IntLiteral;
            this.tokenText += c;
        } else if (c === '>') {         //第一个字符是>
            newState = DfaState.GT;
            this.token.type = TokenType.GT;
            this.tokenText += c;
        } else if (c === '+') {
            newState = DfaState.Plus;
            this.token.type = TokenType.Plus;
            this.tokenText += c;
        } else if (c === '-') {
            newState = DfaState.Minus;
            this.token.type = TokenType.Minus;
            this.tokenText += c;
        } else if (c === '*') {
            newState = DfaState.Star;
            this.token.type = TokenType.Star;
            this.tokenText += c;
        } else if (c === '/') {
            newState = DfaState.Slash;
            this.token.type = TokenType.Slash;
            this.tokenText += c;
        } else if (c === ';') {
            newState = DfaState.SemiColon;
            this.token.type = TokenType.SemiColon;
            this.tokenText += c;
        } else if (c === '(') {
            newState = DfaState.LeftParen;
            this.token.type = TokenType.LeftParen;
            this.tokenText += c;
        } else if (c === ')') {
            newState = DfaState.RightParen;
            this.token.type = TokenType.RightParen;
            this.tokenText += c;
        } else if (c == '=') {
            newState = DfaState.Assignment;
            this.token.type = TokenType.Assignment;
            this.tokenText += c;
        } else {
            newState = DfaState.Initial; // skip all unknown patterns
        }
        return newState;
    }

    tokenize(code){
        let state = DfaState.Initial
        try{
            for(let ch of code) {
                switch (state) {
                case 'Initial':
                    state = this.initToken(ch);    
                    break;
                case 'Id':
                    if (this.isAlpha(ch) || this.isDigit(ch)) {
                        this.tokenText += ch       
                    } else {
                        state = this.initToken(ch);   
                    }
                    break;
                case 'GT':
                    if (ch === '=') {
                        this.token.type = TokenType.GE;  
                        state = DfaState.GE;
                        this.tokenText += ch 
                    } else {
                        state = this.initToken(ch);     
                    }
                    break;
                case 'GE':
                case 'Assignment':
                case 'Plus':
                case 'Minus':
                case 'Star':
                case 'Slash':
                case 'SemiColon':
                case 'LeftParen':
                case 'RightParen':
                    state = this.initToken(ch);          
                    break;
                case 'IntLiteral':
                    if (this.isDigit(ch)) {
                        this.tokenText += ch      
                    } else {
                        state = this.initToken(ch);      
                    }
                    break;
                case 'Id_int1':
                    if (ch === 'n') {
                        state = DfaState.Id_int2;
                        this.tokenText += ch
                    }
                    else if (this.isDigit(ch) || this.isAlpha(ch)){
                        state = DfaState.Id;   
                        this.tokenText += ch
                    }
                    else {
                        state = this.initToken(ch);
                    }
                    break;
                case 'Id_int2':
                    if (ch === 't') {
                        state = DfaState.Id_int3;
                        this.tokenText += ch
                    }
                    else if (this.isDigit(ch) || this.isAlpha(ch)){
                        state = DfaState.Id;    //切换回id状态
                        this.tokenText += ch
                    }
                    else {
                        state = this.initToken(ch);
                    }
                    break;
                case 'Id_int3':
                    if (this.isBlank(ch)) {
                        this.token.type = TokenType.Int;
                        state = this.initToken(ch);
                    }
                    else{
                        state = DfaState.Id;    //切换回Id状态
                        this.tokenText += ch
                    }
                    break;
                default:

                }

            }
            // 把最后一个token送进去
            if (this.tokenText.length > 0) {
                //this.initToken(ch);
            }
        }catch(e){
            console.log(e)
        }

        return new SimpleTokenReader(this.tokens)
    }
}

class SimpleTokenReader{
    constructor(tokens=[]){
        this.tokens = tokens
    }
    pos = 0
    read() {
        if (this.pos < this.tokens.length) {
            return this.tokens[this.pos++];
        }
        return null;
    }

    peek() {
        if (this.pos < this.tokens.length) {
            return this.tokens[this.pos];
        }
        return null;
    }

    unread() {
        if (this.pos > 0) {
            this.pos--;
        }
    }

    getPosition() {
        return this.pos;
    }

    setPosition(position) {
        if (position >=0 && position < this.tokens.length){
            this.pos = position;
        }
    }

}

module.exports = SimpleLexer