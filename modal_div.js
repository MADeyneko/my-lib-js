/** Класс модального окна
 * @param {string} name Имя модального окна (обязательный параметр) 
 * @param {string} type Тип модального окна (необязательный параметр, может быть prompt)
 * @param {object} param Параметры модального окна, обязателен при type='prompt'
 */
 function modal_div(name, type, param){

    let dialogHeight=200;
    let dialogHeightMin=680;
    let dialogWidth=700;
    let maskHeight=0;
    let maskWidth=0;
    let fade = {fade_in_from: 0, fade_out_from: 10}
    let loopTimer;
    this.name = name;
    this.modal;
    this.dialog;/**Модальное окно */
    this.mask;/**Маска на заднем плане окна */
    this.dialogLeft=0;
    this.dialogTop=0;
    this.children;

    let self = this;

    type = (typeof type !== 'undefined')?type:null;
    param = (typeof param !== 'undefined')?param:null;


    if (document.getElementById(name) == null) {
        let d=document.createElement('div');
        d.id=name;
        this.modal=document.body.appendChild(d);
        this.modal.hidden=true;
        this.dialog=appendChildToModal('dialog', 'div');
        this.dialog.className = 'window';
        this.mask=appendChildToModal('mask', 'div');
    }else{
        this.modal=document.getElementById(name);
        this.dialog=document.querySelector('[id="'+name+'"] > #dialog');
        this.mask=document.querySelector('[id="'+name+'"] > #mask');
    }

    if (type) {
        if (type=='prompt') {
            if (param) {
                this.dialog.innerHTML=param['message'];               
            }
            this.dialog.style.cssText='z-index: 9091;';
            this.mask.style.cssText='z-index: 9090;';
        };
    };

    maskWidth=Math.max(document.documentElement["clientWidth"], document.body["scrollWidth"], document.documentElement["scrollWidth"], document.body["offsetWidth"], document.documentElement["offsetWidth"]);
    maskHeight=Math.max(document.documentElement["clientHeight"], document.body["scrollHeight"], document.documentElement["scrollHeight"], document.body["offsetHeight"], document.documentElement["offsetHeight"]);

    this.childrenDiv=function(newValue) {
        if (document.querySelector('[id="'+name+'"] > #'+ newValue) == null) {
            return appendChildToModal(newValue, 'div');
        }else{
            return document.querySelector('[id="'+name+'"] > #'+ newValue);
        }
    }  
    
    /** Get|Set функция высоты маски
     * @param {int} newValue новое значение, если пусто вернёт существующее
     * @returns 
     */
    this.maskHeight=function(newValue){
        if (!arguments.length) return document.documentElement["clientHeight"];
        maskHeight = newValue;
    }
     /** Get|Set функция ширины маски
     * @param {int} newValue новое значение, если пусто вернёт существующее
     * @returns 
     */
    this.maskWidth=function(newValue){
        if (!arguments.length) return document.documentElement["clientWidth"];
        maskWidth = newValue;
    }
    /** Get|Set функция высоты диалогового окна
     * @param {int} newValue новое значение, если пусто вернёт существующее
     * @returns 
     */
    this.dialogHeight=function(newValue) {
        if (!arguments.length) return dialogHeight;
        if (newValue.toString().indexOf('%')+1) {
            let h = window.innerHeight;
            if (h*newValue.replace('%','')/100<dialogHeightMin) {
                dialogHeight=dialogHeightMin;                
            }else{
                dialogHeight=h*newValue.replace('%','')/100;
            }
        }else{
	        dialogHeight = newValue;
        }
    }  
    /**Функция присвоениея ширины окна, если без параметров, то получишь текущую ширину
     * @param {string} newValue ширина (200 или 20%) 
     * @param {string} minValue если указывается в процентах, то минимальная ширина 
     */
    this.dialogWidth=function(newValue, minValue) {
        if (!arguments.length) return dialogWidth;
        if (newValue.toString().indexOf('%')+1) {
			let w=maskWidth;
			dialogWidth=w*newValue.replace('%','')/100;
        }else{
	        dialogWidth = newValue;
        }
        if (minValue!=undefined) {
            dialogWidth=(dialogWidth<minValue)?minValue:dialogWidth;
        }
    }      
    /**Присвоение действия при нажатии на маску
     * @param {boolean} param если true то при нажатие на маску модальное окно закроется
     * @param {function} funct если нужно выполнить что то после закрытия окна
     */
    this.back_click_hide=function(param, funct) {
        if (param==true) {
            this.mask.onclick=function(){
                self.hide_modal();
                if (funct!==undefined)
                    funct();
            }
        }else{
            this.mask.onclick='';
        }   
    }
    /**Функция отображения модального окна.
     * @param {int} time если указан, то модальное через время закроется
     * @param {funct} funct функция при закрытии, работает при time
     */
    this.show_modal=function(time, funct) {
        if (time==undefined) time=null;
        // this.maskWidth((($(window).width()-$(document).width())<0)?$(document).width():$(window).width());
        // this.maskHeight(($(window).height()>$(document).height())?$(document).height():$(window).height());
        // this.dialogHeight(this.maskHeight()-20);
        this.modal.hidden=false;


        this.mask.style.width=this.maskWidth()+'px';
        this.mask.style.height=this.maskHeight()+'px';
        // $('#'+this.name+' #mask').css({'width':this.maskWidth(),'height':this.maskHeight()});
        // $('#'+this.name+' #back').css({'width':backWidth,'height':backHeight});
        // $('#'+this.name+' #delg').css({'width':delgWidth,'height':delgHeight,'left':delgWidth});

        // this.mask.style.opacity=0.8;
        // this.mask.style.display='block';
        fadeIn('mask', 0.8);
        // $('#'+this.name+' #mask').fadeIn(300); 
        // $('#'+this.name+' #mask').fadeTo("slow",0.8); 
        // $('#'+this.name+' #back').fadeTo("fast",0); 
        // $('#'+this.name+' #delg').fadeTo("fast",0); 

        if ((this.maskHeight()/2-this.dialogHeight()/2)>0)
            this.dialogTop=this.maskHeight()/2-this.dialogHeight()/2;
        this.dialogLeft=this.maskWidth()/2-this.dialogWidth()/2;

        this.dialog.style.height=this.dialogHeight()+'px';
        this.dialog.style.width= this.dialogWidth()+'px';
        this.dialog.style.top=this.dialogTop+'px';
        this.dialog.style.left=this.dialogLeft+'px';
        // $('#'+this.name+' #dialog').css({'width': this.dialogWidth(), 'height':this.dialogHeight()});
        // $('#'+this.name+' #dialog').css({'top': this.dialogTop, 'left': this.dialogLeft});
        // this.dialog.style.display='block';
        fadeIn('dialog', 1);
        if (time) setTimeout(
            function() { 
                self.hide_modal();                 
                if (funct!==undefined) funct();
            }, time);
    }

    /**Прячем модальное окно
     */
    this.hide_modal=function() {
        this.modal.hidden=true;
        this.dialog['innerHTML']='';
        fade.fade_in_from = 0;
    }    

    /**Функция плавного показа маски
     * @param {string} elem элемент который показываем  
     * @param {int} op до какой прозрачнойти
     * @returns 
     */
    function fadeIn(elem, op){
        // this.fadeIn=function(elem){
        let target=document.querySelector('[id="'+self.name+'"] > #'+elem);
        target.style.opacity = 0;
        if(getComputedStyle(target, "")["opacity"]==op) return;
        target.style.display = "block";
        var newSetting = fade.fade_in_from / 10;
        target.style.opacity = newSetting;
        fade.fade_in_from++;

        if (fade.fade_in_from > 9) {
            target.style.opacity = op;

            clearTimeout(loopTimer);

            
            return false;
        }

        loopTimer = setTimeout(fadeIn, 50, elem, op);
    }
    /**Добавление потомков в модальное, возвращает объект
     * @param {string} id 
     * @param {string} type 
     * @returns 
     */
    function appendChildToModal(id, type){
        d=document.createElement(type);
        d.id=id;
        return self.modal.appendChild(d);
    }

}