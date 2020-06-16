function Mine(tr, td, mineNum){
    this.tr = tr;//行
    this.td = td;//列
    this.mineNum = mineNum;//雷数

    this.squares = [];//存放每个单元格的位置
    this.tds = [];//储存所有单元格的dom
    this.parent = document.getElementsByClassName('contentMine')[0];//取到格子的父集，以便存放格子
    // this.allRight = false;//小红旗所标是否全为雷

    this.surplusMineNum = mineNum;//剩余雷数
}


//随机生成雷
Mine.prototype.randomMine = function() {
    var square = new Array(this.tr * this.td);//生成一个数组，长度为格子总数
    for(var i = 0; i < square.length; i ++){
        square[i] = i;                      //给数组每一位赋值
    }   
    square.sort(function(){return 0.5 - Math.random()});//打乱数组顺序

    var rn = square.slice(0, this.mineNum);////雷的数组赋给rn（0~雷数）
    var n = 0;                      //用来找到雷格子对应的索引
    for(var i = 0; i < this.tr; i ++){
        this.squares[i] = [];
        for(var j = 0; j < this.td; j ++){
            n ++;
            //取一个方块在数组里的数据要使用行与列的形式去取。找方块周围的方块要用坐标去取。行与列和坐标正好是相反的。
            
            if(rn.indexOf(n) != -1){
                //如果  这个条件成立，说明这个索引对应的是雷
                this.squares[i][j] = {type:'mine',x:j,y:i};//则这个格子被定义为雷
            }else{//否则 这个格子被定义为数字0
                this.squares[i][j] = {type:'number',x:j,y:i,value:0};
            }
        }
    }
}

//雷的初始化
Mine.prototype.init = function() {

    mine.creatDomAndClick();//创建格子
    mine.randomMine();//随机生成雷
    mine.updateNum();//更新不是雷格子的数字
    
    
    
    this.parent.oncontextmenu = function(){
        return false;
    }//阻止鼠标右键的默认事件
    
    this.mineNumDom = document.querySelector('.mineNum');//取到存放雷数的dom
    this.mineNumDom.innerHTML=this.mineNum;//将雷数放到dom里
}

//创建格子
Mine.prototype.creatDomAndClick = function(){
    var This = this;//将this存一下
    var table = document.createElement("table");//创建一个表格元素
    for(var i = 0; i < this.tr; i ++){
        var domTr = document.createElement('tr');//创建this.tr个tr（行）元素

        this.tds[i] = [];                        //并让每个tr元素在tds占位
        for(var j = 0; j < this.td; j ++){    
            var domTd = document.createElement('td');//创建this.td个td（列）元素

            this.tds[i][j] = domTd;             //并将td元素填充到tds中  （tds为表格dom的存放地）
            domTd.pos = [i,j];                  //给每个td元素一个位置
            domTd.onmousedown = function(){     //当td元素被点击时，执行play函数
                
                This.play(event,this);      //this指domTd,event是事件对象
                This.gamePass();  //每点击一次判断 是否通关
            }
            // if(this.squares[i][j].type =='mine'){
            //     domTd.className = 'mine';
            // }
            // if(this.squares[i][j].type =='number'){
            //     domTd.innerHTML = this.squares[i][j].value;
            // }

            domTr.appendChild(domTd);//将td元素添加到tr元素里
        }
        table.appendChild(domTr);//将tr元素添加到table元素里
    }

    this.parent.innerHTML='';  //重新开始时先清空上一局数据
    this.parent.appendChild(table);//将table元素添加到页面中
}


//找某个格子周围的八个方格（过滤周围是雷）
//重点
//用于找雷周围的八个格子
//用于找空白格子周围的八个格子（扩散算法）
Mine.prototype.getAround = function(square){
    var x = square.x;
    var y = square.y;
    var result = [];  //该数组用于存放筛选出来的格子

    /*
        x-1,y-1  x,y-1  x+1,y-1
        x-1,y    x,y    x+1,y
        x-1,y+1  x,y+1  x+1,y+1
     */

    for(var i = x-1; i <= x+1; i ++){
        for(var j = y-1; j <= y+1; j ++){
            if(                                 //筛选
                i < 0 ||  //左边不能超出范围
                j < 0 ||    //上边不能超出范围
                i > this.td - 1 ||  //右边不能超出范围
                j > this.tr - 1 ||  //下边不能超出范围
                (i==x && j==y) ||   //排除自身
                this.squares[j][i].type == 'mine'  //周围不能是雷

            ){
                continue;
            }
            result.push([j,i]);

        }
    }
    return result;//运行该函数得到这个筛选后数组
}
//更新数字（value）（更新数字但不放入）
Mine.prototype.updateNum = function(){
    for(var i = 0; i < this.tr; i ++){
        for(var j = 0; j < this.td; j ++){
            //只更新的是雷周围的数字，不是雷周围的格子不更新
            if(this.squares[i][j].type == 'number'){
                continue;
            }//找到雷周围的格子
            var num = this.getAround(this.squares[i][j]);//获取到每个雷周围格子（除了雷）的数字（是一个数组）

            for(var k = 0; k < num.length; k ++){
                this.squares[num[k][0]][num[k][1]].value += 1;//雷周围的格子数字都加个1
            }
        }
    }
}

//用户点击格子（玩）的函数
Mine.prototype.play = function(ev,obj){//obj为每个格子（td），因为用户点击的是每个格子
                                        //ev是每个格子（td）点击的事件对象
    var This = this;//将Mine的this存一下
    if(ev.which==1 && obj.className!='flag'){//如果用户点击的是左键，用户点击的不能是带有旗帜的格子

        var curSquare = this.squares[obj.pos[0]][obj.pos[1]]//squares的i，j坐标
        var cl = ['zero','one','two','three','four','five','six','seven','eight']//将数字样式对应的class存放在一个数组中
        if(curSquare.type == 'number'){
            obj.innerHTML = curSquare.value;  //updateNum更新数字函数已经执行，value已经更行，根据value值更新数字
            obj.className = cl[curSquare.value];//给格子加上value值对应class（样式）；

            if(curSquare.value == 0){
                obj.innerHTML = '';//如果数字为0，不显示
                //递归方式找四周，扩散算法
                //重点
                //1、找到数字为0周围的八个格子并判断是否为0
                //2、为0则（自动展开）并判断周围的八个格子是否为0（由来的那个格子除外）
                   //不为0则（自动展开）但不再判断周围格子
                //3、递归上面操作
                function getAllZero(square){
                    var around = This.getAround(square);//得到数字为0周围的八个格子

                    for(var i = 0; i < around.length; i ++){
                        var x = around[i][0];//取出格子的x坐标
                        var y = around[i][1];//取出格子的y坐标
    
                        This.tds[x][y].className = cl[This.squares[x][y].value];//将格子的数字对应的class赋给格子
                        
                        if(This.squares[x][y].value == 0){//若格子的数字为零
                            if(!This.tds[x][y].check){    //并且不是判断过的格子
                                This.tds[x][y].check=true;
                                getAllZero(This.squares[x][y]);//则递归
                            }
                        }else{
                            This.tds[x][y].innerHTML=This.squares[x][y].value;//将格子的数字赋给格子
                        }
                    }
                }
                getAllZero(curSquare);   
            }

        }else{//否则点到的是雷，则game over
            this.gameOver(obj);
        }
        
    }

    //鼠标右键给未点开格子插旗帜
    if(ev.which==3){//如果鼠标点击的是右键

        if(obj.className && obj.className!='flag'){//如果该格子已被点开 
           return;
        }
        obj.className=obj.className=='flag'?'':'flag';//如果已有旗帜则再次点击右键会取消，没有旗帜则插旗帜

        // if(this.squares[obj.pos[0]][obj.pos[1]].type=='mine'){
        //     this.allRight=true;
        // }else{
        //     this.allRight=false;
        // }

        if(obj.className=='flag'){
            this.mineNumDom.innerHTML=--this.surplusMineNum;//使用一个旗帜，雷数减一
        }else{
            this.mineNumDom.innerHTML=++this.surplusMineNum;//取消一个旗帜，雷数加一
        }

        // if(this.surplusMineNum==0){
        //     if(this.allRight){
        //         alert('恭喜你，游戏通过')
        //     }else{
        //         alert('恭喜你，你是个憨批')
        //     }
        // }
    }
};

//游戏结束
Mine.prototype.gameOver=function(clickTd){
    for(var i = 0; i<this.tr;i ++){
        for(var j = 0; j<this.td;j ++){
            if(this.squares[i][j].type=='mine'){//游戏结束时把雷的样式给雷 也就是显示所有雷
                this.tds[i][j].className='mine';
            }
            this.tds[i][j].onmousedown=null;//解除点击事件
        }
    }
    if(clickTd){
        clickTd.style.backgroundColor='#f00';//在点击的那个雷上加红色
    }

}
//游戏胜利
Mine.prototype.gamePass=function(){
    var num = 0;
    for(var i = 0; i<this.tr;i ++){
        for(var j = 0; j<this.td;j ++){
            if(this.squares[i][j].type == 'mine' && this.tds[i][j].className == 'flag'){
                num ++;
            }else if(this.squares[i][j].type == 'number' && this.tds[i][j].className =='flag'){
                num --;
            }
        }
    }

    if(num == this.mineNum){
        for(var i = 0; i<this.tr;i ++){
            for(var j = 0; j<this.td; j ++){
                this.tds[i][j].onmousedown = null;//解除点击事件
            }
        }
        alert('游戏通关');
    }
}


//上边button的功能
var btns = document.querySelectorAll('.ceiling button');
var mine = null;//扫雷的实型
var arr = [[9,9,10],[16,16,40],[28,28,99]];//游戏的难易程度（格式）

for(let i = 0; i < btns.length-1; i ++){
    btns[i].onclick=function(){
        for(var j = 0; j < btns.length-1; j ++){
            btns[j].className='';
        }                       //点击时先将选中按钮样式清除，再给点击按钮加样式
        this.className='active';

        mine = new Mine(...arr[i]); //点哪个按钮对应哪个难度
        mine.init();  //初始化
    }
}
btns[0].onclick();  //默认难度为简单
btns[3].onclick=function(){  //重新开始按钮
    mine.init();
}
