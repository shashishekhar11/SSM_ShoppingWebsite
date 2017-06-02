Date.prototype.format = function(format){ 
    var o =  { 
    "M+" : this.getMonth()+1, //month 
    "d+" : this.getDate(), //day 
    "h+" : this.getHours(), //hour 
    "m+" : this.getMinutes(), //minute 
    "s+" : this.getSeconds(), //second 
    "q+" : Math.floor((this.getMonth()+3)/3), //quarter 
    "S" : this.getMilliseconds() //millisecond 
    };
    if(/(y+)/.test(format)){ 
    	format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    }
    for(var k in o)  { 
	    if(new RegExp("("+ k +")").test(format)){ 
	    	format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length)); 
	    } 
    } 
    return format; 
};

var TT = ENJOYSHOP = {
	// 编辑器参数
	kingEditorParams : {
		filePostName  : "uploadFile", //上传表单名称
		uploadJson : '/rest/pic/upload', // 上传的路径
		dir : "image" //类型
	},
	// 格式化时间
	formatDateTime : function(val,row){
		var now = new Date(val);
    	return now.format("yyyy-MM-dd hh:mm:ss");
	},
	// 格式化连接
	formatUrl : function(val,row){
		if(val){
			return "<a href='"+val+"' target='_blank'>查看</a>";			
		}
		return "";
	},
	// 格式化价格
	formatPrice : function(val,row){
		return (val/100).toFixed(2);
	},
	// 格式化商品的状态
	formatItemStatus : function formatStatus(val,row){
        if (val == 1){
            return '正常';
        } else if(val == 2){
        	return '<span style="color:red;">下架</span>';
        } else {
        	return '未知';
        }
    },
    
    init : function(data){
    	this.initPicUpload(data);
    	this.initItemCat(data);
    },
    // 初始化图片上传组件
    initPicUpload : function(data){
    	//$(".picFileUpload")找到所有 class="picFileUpload" 的元素
    	//each作遍历
    	$(".picFileUpload").each(function(i,e){
    		var _ele = $(e);//获取按钮
    		_ele.siblings("div.pics").remove();
    		//siblings方法用来查找同级元素，参数div.pics指明查找的条件：div下存在class为pics
    		// .remove表示移除上面查到的class
    		
    		//重新添加div元素内容。先删除在添加，其实就是初始化
    		//jquery中的反斜杠表示字符串未写完
    		_ele.after('\
    			<div class="pics">\
        			<ul></ul>\
        		</div>');
    		// 回显图片
        	if(data && data.pics){
        		var imgs = data.pics.split(",");
        		for(var i in imgs){
        			if($.trim(imgs[i]).length > 0){
        				_ele.siblings(".pics").find("ul").append("<li><a href='"+imgs[i]+"' target='_blank'><img src='"+imgs[i]+"' width='80' height='50' /></a></li>");
        			}
        		}
        	}
        	$(e).unbind('click').click(function(){
        		//$(this)把当前对象转为一个jquery对象,拿到了之前的那个按钮
        		//.parentsUntil("form")查找其所有的父辈元素，直到匹配。这时返回的对象并不是查到的对象（form），而是其一级子对象。这里对应的是table
        		//.parent("form")通过这个操作才得到正真的form对象
        		var form = $(this).parentsUntil("form").parent("form");
        		
        		KindEditor.editor(TT.kingEditorParams).loadPlugin('multiimage',function(){
        			var editor = this;
        			editor.plugin.multiImageDialog({
						clickFn : function(urlList) { //点击“全部插入”执行
							var imgArray = [];
							KindEditor.each(urlList, function(i, data) {
								imgArray.push(data.url);
								form.find(".pics ul").append("<li><a href='"+data.url+"' target='_blank'><img src='"+data.url+"' width='80' height='50' /></a></li>");
							});
							form.find("[name=image]").val(imgArray.join(","));
							editor.hideDialog();
						}
					});
        		});
        	});
    	});
    },
    
    // 初始化选择类目组件
    initItemCat : function(data){
    	//i : index 
    	//e : ele 元素
    	$(".selectItemCat").each(function(i,e){
    		var _ele = $(e);
    		if(data && data.cid){
    			_ele.after("<span style='margin-left:10px;'>"+data.cid+"</span>");
    		}else{
    			_ele.after("<span style='margin-left:10px;'></span>");
    		}
    		//为了防止多次绑定事件
    		_ele.unbind('click').click(function(){
    			$("<div>").css({padding:"5px"}).html("<ul>")
    			.window({
    				width:'500',
    			    height:"450",
    			    modal:true,
    			    closed:true,
    			    iconCls:'icon-save',
    			    title:'选择类目',
    			    onOpen : function(){
    			    	var _win = this;
    			    	//在当前div中查找ul
    			    	$("ul",_win).tree({
    			    		url:'/rest/item/cat',
    			    		animate:true,
    			    		method : "GET",
    			    		onClick : function(node){
    			    			if($(this).tree("isLeaf",node.target)){
    			    				// 填写到cid中
    			    				_ele.parent().find("[name=cid]").val(node.id);
    			    				_ele.next().text(node.text).attr("cid",node.id);
    			    				$(_win).window('close');
    			    				if(data && data.fun){
    			    					//通过.call执行传入的function
    			    					//第一个参数必须传入，一般都为this, 从第二个参数开始是function的参数
    			    					data.fun.call(this,node);
    			    				}
    			    			}
    			    		}
    			    	});
    			    },
    			    onClose : function(){
    			    	$(this).window("destroy");
    			    }
    			}).window('open');
    		});
    	});
    },
    
    createEditor : function(select){
    	// 第一个参数是：多行文本的选择器
    	// 第二个参数是：富文本编辑器的参数
    	return KindEditor.create(select, TT.kingEditorParams);
    },
    
    /**
     * 创建一个窗口，关闭窗口后销毁该窗口对象。<br/>
     * 
     * 默认：<br/>
     * width : 80% <br/>
     * height : 80% <br/>
     * title : (空字符串) <br/>
     * 
     * 参数：<br/>
     * width : <br/>
     * height : <br/>
     * title : <br/>
     * url : 必填参数 <br/>
     * onLoad : function 加载完窗口内容后执行<br/>
     * 
     * 
     */
    createWindow : function(params){
    	$("<div>").css({padding:"5px"}).window({
    		width : params.width?params.width:"80%",
    		height : params.height?params.height:"80%",
    		modal:true,
    		title : params.title?params.title:" ",
    		href : params.url,
		    onClose : function(){
		    	$(this).window("destroy");
		    },
		    onLoad : function(){
		    	if(params.onLoad){
		    		params.onLoad.call(this);
		    	}
		    }
    	}).window("open");
    },
    
    closeCurrentWindow : function(){
    	$(".panel-tool-close").click();
    },
    
    changeItemParam : function(node,formId){
    	
    	$.ajax({
			   type: "GET",
			   url: "/rest/item/param/" + node.id,
			   statusCode : {
				   200 : function(data){
					   $("#"+formId+" .params").show();
						 var paramData = JSON.parse(data.paramData);
						 var html = "<ul>";
						 for(var i in paramData){
							 var pd = paramData[i];
							 html+="<li><table>";
							 html+="<tr><td colspan=\"2\" class=\"group\">"+pd.group+"</td></tr>";
							 
							 for(var j in pd.params){
								 var ps = pd.params[j];
								 html+="<tr><td class=\"param\"><span>"+ps+"</span>: </td><td><input autocomplete=\"off\" type=\"text\"/></td></tr>";
							 }
							 
							 html+="</li></table>";
						 }
						 html+= "</ul>";
						 $("#"+formId+" .params td").eq(1).html(html);
				   },
				   404 : function(){
					   $("#"+formId+" .params").hide();
						 $("#"+formId+" .params td").eq(1).empty();
				   },
				   500 : function(){
					   alert("error");
				   }
			   }
			});
    },
    getSelectionsIds : function (select){
    	var list = $(select);
    	var sels = list.datagrid("getSelections");
    	var ids = [];
    	for(var i in sels){
    		ids.push(sels[i].id);
    	}
    	ids = ids.join(",");
    	return ids;
    },
    
    /**
     * 初始化单图片上传组件 <br/>
     * 选择器为：.onePicUpload <br/>
     * 上传完成后会设置input内容以及在input后面追加<img> 
     */
    initOnePicUpload : function(){
    	$(".onePicUpload").click(function(){
			var _self = $(this);
			KindEditor.editor(TT.kingEditorParams).loadPlugin('image', function() {
				this.plugin.imageDialog({
					showRemote : false,
					clickFn : function(url, title, width, height, border, align) {
						var input = _self.siblings("input");
						input.parent().find("img").remove();
						input.val(url);
						input.after("<a href='"+url+"' target='_blank'><img src='"+url+"' width='80' height='50'/></a>");
						this.hideDialog();
					}
				});
			});
		});
    }
};
