/**Класс подсветки синтаксиса
 * @param {string} language название вкладки, с расширением для определения типа языка
 */
 function syntax(name_lang){
    // * @param {object} HTMLDivElement div элемент 
    const states = {
        NONE           : 0,
        SINGLE_QUOTE   : 1, // 'string'
        DOUBLE_QUOTE   : 2, // "string"
        ML_QUOTE       : 3, // `string`
        REGEX_LITERAL  : 4, // /regex/
        SL_COMMENT     : 5, // // single line comment
        ML_COMMENT     : 6, // /* multiline comment */
        NUMBER_LITERAL : 7, // 123
        STRING_LITERAL : 8, // 123
        KEYWORD        : 9, // function, var etc.
        ACTION         : 10  // action sql
    }, colors = {
        NONE           : '#000',
        SINGLE_QUOTE   : '#aaa', // 'string'
        DOUBLE_QUOTE   : '#aaa', // "string"
        ML_QUOTE       : '#aaa', // `string`
        REGEX_LITERAL  : '#707', // /regex/
        SL_COMMENT     : '#0a0', // // single line comment
        ML_COMMENT     : '#0a0', // /* multiline comment */
        NUMBER_LITERAL : '#a00', // 123
        STRING_LITERAL : '#a00', // 123
        KEYWORD        : '#00a', // function, var etc.
        ACTION         : '#808080', // action sql
        OPERATOR       : '#07f'  // null, true etc.
    };
    let keywords,
    actions;

    this.language=name_lang.split('.')[1];
    this.active=false;
    let self = this;

    if (this.language==undefined) {
        return function(){
            return false;
        }
    }

    /** Функция по подсвечиванию кода SQL
     * @param {string} code 
     */
    this.syntax_sql=function(code){
        keywords = 'SELECT|DECLARE|CREATE|DISTINCT|INSERT|INSERT INTO|HAVING|GROUP BY|IS NULL|IS NOT NULL|WITH|AS|COUNT|CASE|WHEN|ELSE|END|TABLE|INTO|UPDATE|SET|FROM|WHERE|NOLOCK|TOP|LOWWER|UPPER'.split('|');
        actions = 'ON|AND|OR|LIKE|JOIN|INNER|INNER JOIN|LEFT OUTER JOIN|LEFT JOIN|RIGHT JOIN|RIGHT OUTER JOIN|FULL JOIN'.split('|');
        return highlight(code)
    }

    function highlight(code) {
        let output = '';
        let state = states.NONE;
        for (let i = 0; i < code.length; i++) {
                let char = code[i], prev = code[i-1], next = code[i+1];
                const closingCharNotEscaped = prev != '\\' || prev == '\\' && code[i-2] == '\\';
                if (state == states.NONE && ((char == '/' && next == '/') || (char == '-' && next == '-'))) {
                    state = states.SL_COMMENT;
                    output += '<text style="color: ' + colors.SL_COMMENT + '">' + char;
                    continue;
                }
                if (state == states.SL_COMMENT && char == '\n') {
                    state = states.NONE;
                    output += char + '</text>';
                    continue;
                }
                if (state == states.NONE && (char == '\'' )) {
                    state = (self.language=='sql')?states.STRING_LITERAL:states.SINGLE_QUOTE;
                    color = (self.language=='sql')?colors.STRING_LITERAL:colors.SINGLE_QUOTE;
                    output += '<text style="color: ' + color + '">' + char;
                    continue;
                }
                if (state == states.STRING_LITERAL && (char == '\'')) {
                    state = states.NONE;
                    output += char + '</text>';
                    continue;
                }
                if (state == states.SINGLE_QUOTE && ((char == '\'' && closingCharNotEscaped) )) {
                    state = states.NONE;
                    output += char + '</text>';
                    continue;
                }
                
                if (state == states.NONE && char == '"') {
                    state = states.DOUBLE_QUOTE;
                    output += '<text style="color: ' + colors.DOUBLE_QUOTE + '">' + char;
                    continue;
                }
                if (state == states.DOUBLE_QUOTE && char == '"' && prev != '\\') {
                    state = states.NONE;
                    output += char + '</text>';
                    continue;
                }
               
                if (state == states.NONE && (char == '`' || (char == '/' && next == '*'))) {
                    state = states.ML_QUOTE;
                    output += '<text style="color: ' + colors.ML_QUOTE + '">' + char;
                    continue;
                }
                if (state == states.ML_QUOTE && ((char == '`'  && prev != '\\') || (char == '/' && prev == '*'))) {
                    state = states.NONE;
                    output += char + '</text>';
                    continue;
                }
                if (state == states.NONE && char == '/') {
                    let word = '', j = 0, isRegex = true;
                    while (i + j >= 0) {
                        j--;
                        // перед делением не может быть другого оператора
                        if ('+/-*=|&<>%,({[?:;'.indexOf(code[i+j]) != -1) break;
                        // пытаемся собрать слово; неалфавитный символ - прерываем цикл
                        if (!/[0-9a-z$_]/i.test(code[i+j]) && word.length > 0) break;
                        // собираем слово, которое идет перед слэшем
                        if (/[0-9a-z$_]/i.test(code[i+j])) word = code[i+j] + word;
                        // закрывающая скобка - деление, а не начало регэкспа
                        if (')]}'.indexOf(code[i+j]) != -1) {
                                isRegex = false;
                                break;
                        }
                    }
                    // если перед слэшем ключевое слово - это однозначно регэксп
                    // для сравнения: return /test/g - регэксп, plainWord /test/g - деление
                    if (word.length > 0 && !keywords.includes(word)) isRegex = false;
                    if (isRegex) {
                            state = states.REGEX_LITERAL;
                            output += '<span style="color: ' + colors.REGEX_LITERAL + '">' + char;
                            continue;
                    }
           
                }
                if (state == states.REGEX_LITERAL && char == '/' && prev != '\\') {
                    state = states.NONE;
                    output += char + '</text>';
                    continue;
                }
                if (state == states.NONE && /[0-9]/.test(char) && !/[0-9a-z$_]/i.test(prev)) {
                    state = states.NUMBER_LITERAL;
                    output += '<text style="color: ' + colors.NUMBER_LITERAL + '">' + char;
                    continue;
                }
                if (state == states.NUMBER_LITERAL && !/[0-9a-fnx]/i.test(char)) {
                    state = states.NONE;
                    output += '</text>'
                }
                if (state == states.NONE && !/[a-z0-9$_]/i.test(prev)) {
                    let word = '', j = 0;
                    while (code[i + j] && /[a-z]/i.test(code[i + j])) {
                            word += code[i + j];
                            j++;
                    }
                    if (keywords.includes(word)) {
                        state = states.KEYWORD;
                        output += '<text style="color: ' + colors.KEYWORD + '">';
                    }
                    if (actions.includes(word)) {
                        state = states.ACTION;
                        output += '<text style="color: ' + colors.ACTION + '">';
                    }
                }
                if ((state == states.KEYWORD || state == states.ACTION) && !/[a-z]/i.test(char)) {
                    state = states.NONE;
                    output += '</text>';
                }                         
                if (state == states.NONE && '+-/*=&|%!<>?:'.indexOf(char) != -1) {
                    output += '<text style="color: ' + colors.OPERATOR + '">' + char + '</text>';
                    continue;
                }
                output += char.replace('<', '&' + 'lt;'); // через + потому что хабр заменяет 
           

                          
                          
        }
        return output;
   }
   
    //object.syntax=
    return function(boolean){
        let jqCode = this,
        code = jqCode.innerText;
        self.active=boolean
        if (boolean) {
            code=self['syntax_'+self.language](code);
        }
        jqCode.innerHTML=code;
    }


}