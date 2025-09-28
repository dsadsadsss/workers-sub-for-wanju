#### 在woker搭建订阅服务器，配合我的玩具脚本，自动生成节点订阅

玩具脚本地址:https://github.com/dsadsadsss/java-wanju.git

使用方法:

1.创建名称为kv的kv空间

2.复制woker脚本内容到woker，更改密钥，添加自定义节点

3.woker设置里面绑定上面的kv空间，变量名称URL_STORE

4.把上传节点地址填入玩具脚本变量SUB_URL里面

节点上传地址格式;

https://woker域名/upload-上传密钥

订阅地址格式(支持v2rayn):

https://woker域名/token=订阅密钥?cf_ip=ip.sb&cf_port=443

注意:原始节点优选ip必须为ip.sb，端口443或80，才能自动更换优选和端口

# R2存储版

https://github.com/dsadsadsss/workers-sub-R2-wanju.git
