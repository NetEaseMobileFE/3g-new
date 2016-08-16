# 新闻客户端回流页

### Startup

```
git clone https://github.com/NetEaseMobileFE/3g-new.git
cd 3g-new
npm i
npm i -g eslint
touch .profile

// dev
npm start

// test
gulp test            // all files
gulp test -w article // single file

// deploy
gulp deploy            // all files
gulp deploy -w article // single file

// lint 
npm run lint
```

### Notes
1. 开发中启动服务后，访问地址为`http://localhost:3100/page/:type`, type取值为`src/:folder`，一般一个src下的文件夹对应一个页面，`common`和`img`例外
2. 开发中，通过代理工具将线上地址重定向到本地，如： `http://c.m.163.com/news/v/VBOOFPEVP.html -> http://localhost:3100/page/video`
3. `src/common`中存放公用模块，`src/img`中存放图片
4. 如需增加页面，需要在`package.json`中，为`pages`属性数组中增加一个元素，元素名称为增加的文件夹名

### Others
Eslint： [airbnb](https://github.com/airbnb/javascript) && [eslint rules](http://eslint.org/docs/rules/)

