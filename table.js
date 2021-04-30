/**
 * Класс рисования таблицы
 * @param {string} name Имя таблицы
 * @param {string} appChild Куда будем вставлять таблицу, false - таблица некуда не будет вставлена
 * @this {table}
 * @constructor
 */
 function table(name, appChild){

    this.column=1;
    this.row=1;
    this.class='';
    this.td_class='';
    this.td_align='';
    this.name = name;
    this.rowspan = {};
    this.colspan = {};
    this.id_span = [];
    let count_column = 1,
    qSelector = '',
    count_row = 1,
    width_td = '',
    inner = 'innerText',
    sort = false,
    filter = false,
    scroll=false,
    container='';
    this.appChild='';

    if (document.querySelector('#'+appChild+' #'+name) == null) {
        var d=document.createElement('table');
        d.id=name;
        container=document.querySelector('#'+appChild);
        container.appendChild(d);
        // $('#'+name).fadeIn(300);
    }
    qSelector='#'+appChild+' #'+name;
    this.table=document.querySelector('#'+appChild+' #'+name);
    this.table.style.display = '';
    this.appChild='#'+appChild;
    this.table.innerHTML='';
     
    var self = this;

    /**Функция создания scroll таблицы
     * @param {boolean} data True||False
     */
    this.scroll_table=function(data){
        if (!arguments.length) return scroll;
        if (data==true){
            if (scroll==true) return scroll;
            let tr=document.querySelectorAll(qSelector+' > tr');
            let main=document.querySelector(qSelector);
            if (tr.length<=1) throw new Error("Отсутвуют данные, создание прокрутки невозможно");

            let head_div=document.createElement('div');
            let head_table=document.createElement('table');
            let main_div=document.createElement('div');
            let main_table=document.createElement('table');
            head_div.id='table_head';
            main_div.id='table_main';
            tr.forEach(function(item, i, arr) {
                if (item.id!=='rowTH') {
                    main_table.appendChild(item);
                }else{
                    head_table.appendChild(item);
                }
            })

            let main_tr=document.createElement('tr');
            let head_tr=document.createElement('tr');
            let head_td=head_tr.appendChild(document.createElement('td'));
            let main_td=main_tr.appendChild(document.createElement('td'));
            main_tr.id='tr_main';
            head_tr.id='tr_head';

            head_div.appendChild(head_table);
            main_div.appendChild(main_table);
            head_td.appendChild(head_div);
            main_td.appendChild(main_div);

            main.appendChild(head_tr);
            main.appendChild(main_tr);

            // head_table.width=main_table.scrollWidth;

            let th=document.querySelectorAll(qSelector+' #table_head th');
            th.forEach(function(item) {
                if (document.querySelector(qSelector+' [id=row1'+item.id.replace('rowTH','')+']')) {
                    td=document.querySelector(qSelector+' [id=row1'+item.id.replace('rowTH','')+']');
                    if(item.style.width.replace('px','')<td.scrollWidth && item.width==''){
                        item.width=td.scrollWidth+'px';
                    }else{
                        td.width=item.width;
                    }
                    // td.width=item.scrollWidth;
                }else{
                    td=document.querySelector(qSelector+' [id$='+item.id+']');
                    if(item.style.width.replace('px','')<td.scrollWidth && item.width==''){
                        item.width=td.scrollWidth+'px';
                    }else{
                        td.width=item.width;
                    }
                    // td.width=item.scrollWidth;
                }
            })

            scroll=true;
        }else if(data==false){
            scroll=false;
        }else{
            throw new Error("Значение должно быть true/false");
        }
    }

    /**Функция создания сортировки таблицы
     * @param {boolean} data True||False
     */
    this.sorting=function(data){
        if (!arguments.length) return sort;
        let th=document.querySelector(qSelector+ ' #rowTH').childNodes;
        if (data==true){
            if (sort==true) return sort;
            if (th) {
                th.forEach(function(item, i, arr) {
                    item.style.cursor='pointer';
                    item.onclick=function(e) {
                        // console.log(e.target.id);
                        // console.log(document.querySelector(qSelector+ ' #rowTH'+e.target.id));
                        if (item.sorting==false) {
                            item.sorting='up';
                            item.textContent=item.textContent+' ▼';
                            let th=document.querySelector(qSelector+ ' #rowTH').childNodes;
                            th.forEach(function(obj) {
                                if (obj.id!==item.id) {
                                    obj.textContent=obj.textContent.replace(' ▼', '');
                                    obj.textContent=obj.textContent.replace(' ▲', '');
                                    obj.sorting=false;
                                };
                            });
                        }else if(item.sorting=='up'){
                            item.sorting='down';
                            item.textContent=item.textContent.replace(' ▼', ' ▲');
                        }else if(item.sorting=='down'){
                            item.sorting=false;
                            item.textContent=item.textContent.replace(' ▲','');
                        };
                        sorting_grid(item);

                    }
                })
                sort=true;
            }else{
                throw new Error("Сортировка не может быть установлена, отсутсвуют заголовки у таблицы");
            };

        }else if(data==false){
            if (sort==false) return sort;
            th.forEach(function(item, i, arr) {
                item.style.cursor='default';
                item.onclick='';
            })
            sort=false;
        }else{
            throw new Error("Значение должно быть true/false");
        }
    }

    /**Функция создания фильтра таблицы
     * @param {boolean} data True||False
     */
    this.filtering=function(data){
        if (!arguments.length) return filter;
        if (data==true){
            if (filter==true) return filter;
            let th=document.querySelector(qSelector+ ' #rowTH').childNodes;
            if (th) {
                th.forEach(function(item, i, arr) {
                    item.oncontextmenu=function(e) {
                        let menu=(document.getElementById('ContextMenu_filterTable'))?document.getElementById('ContextMenu_filterTable'):createContextMenu('ContextMenu_filterTable');
                        // e.cancelBubble = true;
                        th=e.target;
                        console.log(th);
                        let td=document.querySelectorAll(qSelector+ ' [id$='+th.id+']:not(th)');//.childNodes;
                        let value=[];
                        td.forEach(function(item, i, arr) {
                            value.push(item.innerText);
                        })
                        value=unique(value);
                        let html='<table>';
                        value.forEach(function(item, i, arr) {
                            html+='<tr><td><input type=checkbox value="'+item+'"></td><td>'+item+'</td></tr>';
                        })
                        html+='</table>';
                
                        menu.innerHTML = html;
                        position=get_CursorPosition(e);
                        cm_width=menu.style.width;;
                        window_width=Math.max(document.documentElement["clientWidth"], document.body["scrollWidth"], document.documentElement["scrollWidth"], document.body["offsetWidth"], document.documentElement["offsetWidth"]);

                        if ((window_width-position.x)<cm_width) {
                            position.x=position.x-cm_width;
                        };
                        menu.style.top = position.y + "px";
                        menu.style.left = position.x + "px";
                        menu.style.display = "";


                        return false;
                    }
                })
                filter=true;
            }else{
                throw new Error("Фильтрация не может быть установлена, отсутсвуют заголовки у таблицы");
            };

        }else if(data==false){
            filter=false;
        }else{
            throw new Error("Значение должно быть true/false");
        }
    }    

    /**Функция создания контекстного меню
     * @param {string} id ID меню
     */
    function createContextMenu(id) {
        let menu=document.createElement('div');
        menu.id = id;
        menu.style="z-index: 9999;padding: 5px; position:absolute; top:0; left:0; border:1px solid #DBDBDB; background-color:#EBEBEB; display:none; float:left; box-shadow: rgba(0,0,0,1) 0 2px 2px;";
        container.appendChild(menu);

        addHandler(document, "contextmenu", function() {
            if (document.getElementById(id) !== null)
                document.getElementById(id).style.display = "none";
        });
        addHandler(document, "click", function() {
            if (document.getElementById(id) !== null)
                document.getElementById(id).style.display = "none";
        });
        return menu;
    }

    /**Функция создания обработчика событий
     * @param {string} object Объект
     * @param {string} event Событие
     * @param {function} handler Функция при событии
     */
    function addHandler(object, event, handler, useCapture) {
        if (object.addEventListener) {
            object.addEventListener(event, handler, useCapture ? useCapture : false);
        } else if (object.attachEvent) {
            object.attachEvent('on' + event, handler);
        } else throw new Error("Add handler is not supported");
    }

    /**Сортировка по столбцу
     * @param {string} column ID столбца который сортируем 
     */
    function sorting_grid(column) {
        let tr='';
        let trth;
        if (scroll==true) {
            tr=document.querySelectorAll(qSelector+ ' #table_main table')[0];
        }else{
            tr=document.querySelectorAll(qSelector)[0];
        };

        let rowsArray = [].slice.call(tr.rows);
        if(rowsArray[0].id=='rowTH')
            trth=rowsArray.shift();
        let compare;
        let colNum=(column.id.substr(-1))-1;
        compare = function(rowA, rowB) {
            nameA=rowA.cells[colNum].innerHTML;
            nameB=rowB.cells[colNum].innerHTML;
            if (isInt(parseInt(nameA)) && isInt(parseInt(nameB))) {
                return nameA - nameB;
            }else{
                if (nameA < nameB) //сортируем строки по возрастанию
                    return -1
                if (nameA > nameB)
                    return 1
                return 0 // Никакой сортировки
            }
        };
        
        rowsArray.sort(compare);
        if (column.sorting=='up')
            rowsArray.reverse();
        if (trth) tr.appendChild(trth); 
        for (var i = 0; i < rowsArray.length; i++) {
            tr.appendChild(rowsArray[i]);
        }

    }

    /**Добавление значения
     * @param {string} data Значение которое добавляем 
     */
    this.add_data=function(data){
    	data = (typeof data !== 'undefined' && data!==null)?  data : '';
        // let qs=document.querySelector('#'+this.name+' > #row'+this.row+' > #row'+this.row+'col'+this.column);
        if (this.id_span.length!=0) {
            this.calcspan();
            // if (this.rowspan) {};
            // this.nextCol(this.colspan);
        };
        if (document.querySelector(this.appChild +' #'+this.name+' > #row'+this.row+' > #row'+this.row+'col'+this.column) == null) 
            add_td('row'+this.row+'col'+this.column);
        this.td[this.inner()]=data;
        this.column++;
        let sel_return='[id="'+this.name+'"] > #row'+this.row+' > #'+this.td.id;
        if (this.column>this.count_column()) {
            this.nextRow();        
        }
        return (sel_return);
    }

    /**Функция подсчета кол-ва объеденения colspan|rowspan
     */
    this.calcspan=function() {
        let isin=true;
        while(isin){
            for (let i = 0; i < this.id_span.length; i++) {
                if (this.row.between(this.rowspan[this.id_span[i]])){
                    if(this.column.between(this.colspan[this.id_span[i]])){
                        this.nextCol();
                    }else{
                        isin=false;
                    }
                }else{
                    isin=false;
                };
                if (this.rowspan[this.id_span[i]]['max']<this.row) {
                    delete(this.rowspan[this.id_span[i]]);
                    delete(this.colspan[this.id_span[i]]);
                    // this.id_span.remove(i);
                    this.id_span.splice(i, 1);
                    i--;

                };

            };
        }
        if (this.column>this.count_column()) {
            this.nextRow();        
        }
    }


    /**Добавление заголовка
     * @param {string} data Название заголовка 
     */
    this.add_title=function(data){
        data = typeof data !== 'undefined' ?  data : null;
        // let qs=document.querySelector('#'+this.name+' > #row'+this.row+' > #row'+this.row+'col'+this.column);
        if (document.querySelector(this.appChild +' #'+this.name+' > #rowTH > #rowTHcol'+this.column) == null) 
            add_th('rowTHcol'+this.column);
        this.th[this.inner()]=data;
        this.column++;
        let sel_return='[id="'+this.name+'"] > #row'+this.row+' > #'+this.th.id;
        if (this.column>this.count_column()) {
            this.column=1;            
        }
        return (sel_return);
    }

    /**Функция добавления <TH>
     * @param {string} name Значение <TH>
     */
    function add_th(name){
        if (document.querySelector(self.appChild +' [id="'+self.name+'"] > #rowTH') == null)
            add_tr('rowTH');

        var d=document.createElement('th');
        d.id=name;
        self.tr.appendChild(d);
        self.th=document.querySelector(self.appChild+' [id="'+self.name+'"] > #rowTH > #'+name);
        if (self.td_class!=='')
            self.th.className = self.td_class;
        if (self.td_align!=='')
            self.th.align=self.td_align;
        if (self.width_td()!=='')
            self.th.style.width=self.width_td()+'px';
        self.th.style.display = '';
        self.th.sorting=false;
    }

    /**Функция добавления <TD>
     * @param {string} name Значение <TD>
     */
    function add_td(name){
        if (document.querySelector(self.appChild+' [id="'+self.name+'"] > #row'+self.row) == null)
            add_tr('row'+self.row);

        var d=document.createElement('td');
        d.id=name;
        self.tr.appendChild(d);
        self.td=document.querySelector(self.appChild+' [id="'+self.name+'"] > #row'+ self.row+' > #'+name);
        if (self.td_class!=='')
            self.td.className = self.td_class;
        if (self.td_align!=='')
            self.td.align=self.td_align;
        if (self.width_td!=='')
            self.td.style.width=self.width_td+'px';
        self.td.style.display = '';
    }

    /**Функция добавления <TR>
     * @param {string} name Значение <TR>
     */
    function add_tr(name){
        var d=document.createElement('tr');
        d.id=name;
        self.table.appendChild(d);
        self.tr=document.querySelector(self.appChild+' [id="'+self.name+'"] > #'+name);
        self.tr.style.display = '';
        // $('#'+this.name+' #'+name).fadeIn(300);
    }

    /**Функция возвращает/присваивает значение this.rowspan
     * @param {string} value Значение rowspan
     */
    this.setRowspan=function(value) {
        if (!arguments.length || value==1) return;
        this.td.setAttribute('rowspan', value);
        // this.columnspan=this.column-1;
        this.rowspan[this.td.id]={'min':this.row,'max':this.row-1+value};
        if (!this.colspan[this.td.id]) this.colspan[this.td.id]={'min':this.column-1,'max':this.column-1};
        if (!this.id_span.in_array([this.td.id])) this.id_span.push(this.td.id);

    }

    /**Функция возвращает/присваивает значение this.colspan
     * @param {string} value Значение colspan
     */
    this.setColspan=function(value) {
        if (!arguments.length || value==1) return;
        this.td.setAttribute('colspan', value);
        // this.nextCol(value);
        this.colspan[this.td.id]={'min':this.column-1,'max':this.column-2+value};
        if (!this.rowspan[this.td.id]) this.rowspan[this.td.id]={'min':this.row,'max':this.row};
        if (!this.id_span.in_array([this.td.id])) this.id_span.push(this.td.id);
    }

    /**Функция перехода к следующей строке
     */
    this.nextRow=function(){
        this.row++;
        this.column=1;
        this.count_row(this.count_row()+1)
    }
    /**Функция перехода к следующему столбцу
     */
    this.nextCol=function(i){
        if (!arguments.length || i==1) this.column++;
        let c=1;
        while(c<i){
            this.column++;
            c++;
        }
    }

    /**Функция расчета ширины столбцов на основе передаваемого значения
     * @param {string} availWidth Значение в px
     */
    this.calc_column=function(availWidth) {
        if (!arguments.length) return this.count_column;
        var count_column=availWidth/this.width_td();
        this.count_column((count_column<=1)?1:parseInt(count_column));
        if (this.count_column()==1) 
            this.width_td(availWidth);
    }

    /**Функция возвращает/присваивает значение count_column
     * @param {string} newValue Кол-во столбцов
     */
    this.count_column=function(newValue) {
        if (!arguments.length) return count_column;
        if (newValue < 0)
            throw new Error("Значение должно быть положительным");
        count_column = newValue;
    }

    /**Функция возвращает/присваивает значение className таблице
     * @param {string} newValue Имя класса
     */
    this.class=function(newValue) {
        if (!arguments.length) return this.class;
        this.class = newValue;
        this.table.className = newValue;
    }

    /**Функция возвращает/присваивает значение inner таблице
     * @param {string} newValue innerHTML|innerText
     */
    this.inner=function(newValue) {
        if (!arguments.length) return inner;
        inner = newValue;
    }    
    /**Функция возвращает/присваивает значение count_row таблице
     * @param {string} newValue Ограниченвает кол-во строк в таблице
     */
    this.count_row=function(newValue) {
        if (!arguments.length) return count_row;
        count_row = newValue;
    }

    /**Функция возвращает/присваивает значение width_td столбцу
     * @param {string} newValue Ширина столбца в пикселях
     */
    this.width_td=function(newValue) {
        if (!arguments.length) return width_td;
        width_td=newValue;
    }

    /**Функция проверяет на Int значение
     * @param {string} value Проверяемое значение
     * @returns {boolean} 
     */
    function isInt(value) {
        var x = parseFloat(value);
        return !isNaN(value) && (x | 0) === x;
    }

    if ('NodeList' in window && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function (callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++)
                callback.call(thisArg, this[i], i, this);
        };
    }

    /**Функция определяет положения курсора
     * @param {event} event 
     * @returns {Array} Массив координат X:Y 
     */
    function get_CursorPosition(event) {
        var x = y = 0;
        if (document.attachEvent != null) {
            x = window.event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
            y = window.event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
        } else if (!document.attachEvent && document.addEventListener) {
            x = event.clientX;
            y = event.clientY;
        } else {
        }
        return {x:x, y:y};
    }

    Number.prototype.between = function(a) { 
        return this >= a['min'] && this <= a['max']; 
 
    } 
    if (!Array.prototype.in_array) {
        Array.prototype.in_array = function(p_val) {
            for(var i = 0, l = this.length; i < l; i++) {
                if(this[i] == p_val) {
                    return true;
                }
            }
            return false;
        };
    }

    if (!Array.prototype.remove) {
        Array.prototype.remove = function(value) {
            var idx = this.indexOf(value);
            if (idx != -1) {
                // Второй параметр - число элементов, которые необходимо удалить
                return this.splice(idx, 1);
            }
            return false;
        }
    }
}