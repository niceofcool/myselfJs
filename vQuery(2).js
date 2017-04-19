// JavaScript Document
//添加事件myAddEvent(对象, 事件, 函数)    解决触发一个事件同时调用多个函数   --->更新2013.3-21
function myAddEvent(obj, sEv, fn)
{
   if(obj.attachEvent)
   {
       obj.attachEvent('on'+sEv, function (){
           if(false==fn.call(obj))//解决IE this的问题this->obj
           {
               event.cancelBubble=true;//阻止冒泡
               return false;//阻止默认事件
           }
       });
   }
   else
   {
       obj.addEventListener(sEv, function (ev){
           if(false==fn.call(obj))
           {
               ev.cancelBubble=true;//阻止冒泡
               ev.preventDefault();//阻止默认事件
           }
       }, false);
   }
}
function moreSelector(select){
		//个个击破法则 -- 寻找击破点
		var sel = trim(select).split(' '); // 用空格分为数组
		//参数 分开 例如function moreSelector('#container p span'){} //'#div','ui li','p'
		var result=[];
		var context=[];
		for(var i = 0, len = sel.length; i < len; i++){ // 遍历数组
			var first = sel[i].charAt(0) //去每个 的index=1的字符串未知的字符
			var index = trim(sel[i]).indexOf(first)
			if(first ==='#'){
				//如果是#，找到该元素，
				pushArray([$$.$id(item.slice(index + 1))]);
				context = result;
			}else if(first ==='.'){
				//如果是.
				//如果是.
				//找到context中所有的class为【s-1】的元素 --context是个集合
				if(context.length){
					for(var j = 0, contextLen = context.length; j < contextLen; j++){
						pushArray(getByclass(item.slice(index + 1), context[j]));
					}
				}else{
					pushArray(getByclass(item.slice(index + 1)));
				}
				context = result;
			}else{
				//如果是标签
				//遍历父亲，找到父亲中的元素==父亲都存在context中
				if(context.length){
					for(var j = 0, contextLen = context.length; j < contextLen; j++){
						pushArray($$.$tag(item, context[j]));
					}
				}else{
					pushArray($$.$tag(item));
				}
				context = result;
			}
		}

		return context;

		
	}
//封装重复的代码
function pushArray(doms){
	var result=[];
	for(var j= 0, domlen = doms.length; j < domlen; j++){
		result.push(doms[j]);
		
	}
}
//CLASS选择器getByClass(父级对象, class名)   --->更新2013.4-8
function getByClass(oParent, sClass)
{
   var aEle=oParent.getElementsByTagName('*');
   var aResult=[];
   var re=new RegExp('\\b'+sClass+'\\b','i');            //单词边界   \b
   var i=0;
   
   for(i=0;i<aEle.length;i++)
   {
       //if(aEle[i].className==sClass)
       if(re.test(aEle[i].className))
       {
           aResult.push(aEle[i]);
       }
   }
   
   return aResult;
}

//获取样式getStyle(对象, 属性)   --->更新2013.3-21
function getStyle(obj, attr)
{
   if(obj.currentStyle)
   {
       return obj.currentStyle[attr];
   }
   else
   {
       return getComputedStyle(obj, false)[attr];
   }
}




//远动框架startMove(对象, {'width':100,'height':100}, 执行后的再调用的函数)   --->更新2013.3-21
function startMove(obj, json, fn)
   {
       clearInterval(obj.timer);
       obj.timer=setInterval(function (){
           var bStop=true;        //这一次运动就结束了——所有的值都到达了
           for(var attr in json)
           {
               //1.取当前的值
               var iCur=0;
               
               if(attr=='opacity')
               {
                   iCur=parseInt(parseFloat(getStyle(obj, attr))*100);
               }
               else
               {
                   iCur=parseInt(getStyle(obj, attr));
               }
               
               //2.算速度
               var iSpeed=(json[attr]-iCur)/8;
               iSpeed=iSpeed>0?Math.ceil(iSpeed):Math.floor(iSpeed);
               
               //3.检测停止
               if(iCur!=json[attr])
               {
                   bStop=false;
               }
               
               if(attr=='opacity')
               {
                   obj.style.filter='alpha(opacity:'+(iCur+iSpeed)+')';
                   obj.style.opacity=(iCur+iSpeed)/100;
               }
               else
               {
                   obj.style[attr]=iCur+iSpeed+'px';
               }
           }
           
           if(bStop)
           {
               clearInterval(obj.timer);
               
               if(fn)
               {
                   fn();
               }
           }
       }, 30)
   }

// 消除空格
function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g, '');
}




//改变前面字符   --->更新2013.3-21
function $(vArg){
   return new VQuery(vArg);
   }


//面向对象VQuery  选择器   --->更新2013.3-21
function VQuery(vArg)
{
   //用来保存选中的元素
   this.elements=[];
   
   switch(typeof vArg)
   {
       case 'function':
           //window.onload=vArg;
           myAddEvent(window, 'load', vArg);
           break;
       case 'string':
           switch(vArg.charAt(0))
           {
               case '#':    //ID
                   var obj=document.getElementById(vArg.substring(1));
                   
                   this.elements.push(obj);
                   break;
               case '.':    //class
                   this.elements=getByClass(document, vArg.substring(1));
                   break;
               default:    //tagName
                   this.elements=document.getElementsByTagName(vArg);
           }
           break;
       case 'object':
           this.elements.push(vArg);
   }2
}

//在原型中添加一个点击事件click(function(){})   --->更新2013.3-21
VQuery.prototype.click=function(fn)
{
   var i=0;
   for(i=0;i<this.elements.length;i++)
   {
       myAddEvent(this.elements[i], 'click', fn);
   }
   return this;    
}

//show(function(){})   --->更新2013.3-21
VQuery.prototype.show=function()
{
   var i=0;
   
   for(i=0;i<this.elements.length;i++)
   {
       this.elements[i].style.display='block';
   }
   return this;    
}

//hide(function(){})   --->更新2013.3-21
VQuery.prototype.hide=function()
{
   var i=0;
   
   for(i=0;i<this.elements.length;i++)
   {
       this.elements[i].style.display='none';
   }
   return this;    
}


//hover(function(){鼠标移入事件},function(){鼠标移出事件})   --->更新2013.3-21
VQuery.prototype.hover=function(fnover,fnout)
{
   var i=0;
   
   for(i=0;i<this.elements.length;i++)
   {
       
       myAddEvent(this.elements[i],'mouseover',fnover);
       myAddEvent(this.elements[i],'mouseout',fnout);
   }
   return this;    
}


//设置样式  css(属性,值)    获取样式 css(属性)   --->更新2013.3-21
VQuery.prototype.css=function(attr,value){
   if(arguments.length==2)
       {
           var i=0;
           for(i=0;i<this.elements.length;i++)
           {
               this.elements[i].style[attr]=value;
           }
       }
       else{
               if(typeof attr=='string')
                   {
                       return getStyle(this.elements[0],attr)
                   }
               else{
                       for(i=0;i<this.elements.length;i++)
                       {
                               var k='';
                               for(k in attr)
                               {
                                   this.elements[i].style[k]=attr[k];    
                               }
                       }
                   }    
           
           }
       return this;    
}


//点击多个函数循环使用  toggle(function(){},function(){})   --->更新2013.3-21
VQuery.prototype.toggle=function()
{
   var i=0;
   var _arguments=arguments;
   
   for(i=0;i<this.elements.length;i++)
   {
       addToggle(this.elements[i]);
   }
   
   function addToggle(obj)
   {
       var count=0;
       myAddEvent(obj, 'click', function (){
           _arguments[count++%_arguments.length].call(obj);
       });
   }
   return this;    
};

//attr(属性,值)->attr('className','over')设置Class为over   --->更新2013.3-21
VQuery.prototype.attr=function(attr,value){
   if(arguments.length==2)
       {
           var i=0;
           for(i=0;i<this.elements.length;i++)
           {
               this.elements[i][attr]=value;
           }
       }
       else{
           return this.elements[0][attr];
           }
       return this;        
}

//eq(n)同级中的第n个   --->更新2013.3-21
VQuery.prototype.eq=function(n){
   return $(this.elements[n]);
}


function appendArr(arr1, arr2)
{
   var i=0;
   
   for(i=0;i<arr2.length;i++)
   {
       arr1.push(arr2[i]);
   }
   return this;    
}

//find('str')查询对象   --->更新2013.3-21
VQuery.prototype.find=function (str)
{
   var i=0;
   var aResult=[];
   
   for(i=0;i<this.elements.length;i++)
   {
       switch(str.charAt(0))
       {
           case '.':    //class
               var aEle=getByClass(this.elements[i], str.substring(1));
               
               aResult=aResult.concat(aEle);
               break;
           default:    //标签
               var aEle=this.elements[i].getElementsByTagName(str);
               
               //aResult=aResult.concat(aEle);
               appendArr(aResult, aEle);//appendArr把数组连接起来类似concat的效果
       }
   }
   
   var newVquery=$();
   
   newVquery.elements=aResult;
   
   return newVquery;    
};

function getIndex(obj)
{
   var aBrother=obj.parentNode.children;//获取节点数
   var i=0;
   
   for(i=0;i<aBrother.length;i++)
   {
       if(aBrother[i]==obj)
       {
           return i;
       }
   }    
}

//index()获取下标   --->更新2013.3-21
VQuery.prototype.index=function ()
{
   return getIndex(this.elements[0]);
   return this;    
};


//bind('事件',事件触发的函数)   --->更新2013.3-21
VQuery.prototype.bind=function(sEv,fn)
{
   var i=0;
   for(i=0;i<this.elements.length;i++)
   {
       myAddEvent(this.elements[i], sEv, fn)
   }
}


//VQuery插件扩充extend   --->更新2013.3-21
VQuery.prototype.extend=function(name,fn)
{
   VQuery.prototype[name]=fn;
}


//插件的扩充例子   size()  获取个数->$('div').size()   --->更新2013.3-21
$().extend('size',function(){
   return this.elements.length;
   })


//插件的扩充例子   animate({'width':100,'height':200})   --->更新2013.3-21
$().extend('animate', function (json){
   var i=0;
   
   for(i=0;i<this.elements.length;i++)
   {
       startMove(this.elements[i], json);
   }
})



//插件的扩充例子 拖拽drag()   --->更新2013.3-22
$().extend('drag', function (){
   var i=0;
   
   for(i=0;i<this.elements.length;i++)
   {
       this.elements[i].style.position='absolute';//拖拽的物体必须得绝对定位
       drag(this.elements[i]);
   }
   
   function drag(oDiv)
   {    
       oDiv.onmousedown=function (ev)
       {
           var oEvent=ev||event;
           var disX=oEvent.clientX-oDiv.offsetLeft;
           var disY=oEvent.clientY-oDiv.offsetTop;
           
           if(oDiv.setCapture){
                   oDiv.setCapture();//IE 获取捕获
                   oDiv.onmousemove=fnMove;
                   oDiv.onmouseup=fnUp;
               }
           else{
                   document.onmousemove=fnMove;
                   document.onmouseup=fnUp;
               }
           
           //鼠标移动    
           function fnMove(ev)
           {
               var oEvent=ev||event;
               
               this.style.left=oEvent.clientX-disX+'px';
               this.style.top=oEvent.clientY-disY+'px';
           };
           
           
           //鼠标提起
           function fnUp()
           {
               this.onmousemove=null;
               this.onmouseup=null;
               
               if(this.releaseCapture)
               {
                   this.releaseCapture();//IE 取消捕获
               }
                   
           };
           
           
           return false;//阻止默认行为    解决FF低版本空DIV推拽出现bug    
       };
   }
})