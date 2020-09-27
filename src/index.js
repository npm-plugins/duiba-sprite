#!/usr/bin/env node

const program = require('commander');
const nodeImages = require('images');
const path = require('path');
const fs = require('fs');
const config = require('../package.json');

// 获取目录下的图片数组
function getImgs(input) {
    if (!fs.existsSync(input)) {
        console.warn('路径不存在');
        return [];
    }
    const files = fs.readdirSync(input);
    const imgs = [];
    for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (file.indexOf('png') !== -1 && file.indexOf('sprite') === -1) {
            imgs.push(path.resolve(input, file));
        }
    }
    return imgs;
}

// 生成雪碧图
function createSprite(input, output, mode) {
    const imgs = getImgs(input);
    if (imgs.length === 0) {
        return console.warn('无可用图片资源');
    }
    const img = nodeImages(imgs[0]);
    const width = img.width();
    const height = img.height();
    const data = [];
    let cw = 0, ch = 0;
    const l = getLine(imgs.length);
    
    switch (mode) {
        case 0:
            cw = width;
            ch = height * imgs.length;
            for (let index = 0; index < imgs.length; index++) {
                const img = imgs[index];
                data.push({
                    img: nodeImages(img),
                    x: 0,
                    y: index * height
                })
            }
            break;
        case 1:
            cw = width * imgs.length;
            ch = height;
            for (let index = 0; index < imgs.length; index++) {
                const img = imgs[index];
                data.push({
                    img: nodeImages(img),
                    x: index * width,
                    y: 0
                })
            }
            break;
        case 2:
            cw = width * l;
            ch = height * l;
            for (let index = 0; index < imgs.length; index++) {
                const img = imgs[index];
                const i = index % l;
                const x = i * width;
                const y = parseInt(index / l) * height
                data.push({
                    img: nodeImages(img),
                    x: x,
                    y: y
                })
            }
            break;
        case 3:
            cw = width * l;
            ch = height * l;
            for (let index = 0; index < imgs.length; index++) {
                const img = imgs[index];
                const i = index % l;
                const x = parseInt(index / l) * width;
                const y = i * height;
                data.push({
                    img: nodeImages(img),
                    x: x,
                    y: y
                })
            }
            break;
    }
    
    const canvas = nodeImages(cw, ch);
    for (let index = 0; index < data.length; index++) {
        const item = data[index];
        canvas.draw(item.img, item.x, item.y);
    }
    canvas.saveAsync(output + '/sprite.png', function() {
        console.log('雪碧图已生成');
        createCss(output, data, mode);
    });
}

// 雪碧图几行显示
function getLine(nums) {
    const i = 9;
    let l = 1;
    for (let index = 1; index < i; index++) {
        if (index * index - nums >= 0) {
            l = index;
            return l;
        }
    }
    return l;
}

// 生成css文件
function createCss(out, data, mode) {
    let tpl = '@keyframes duiba-sprite {';

    const guld = (100 / (data.length-1)).toFixed(2)

    for (let index = 0; index < data.length; index++) {
        const item = data[index];
        if (mode === 0) {
            tpl += '\r\r\n   '+(index * guld)+'% {\r\n        background-position: ' + item.x + 'px -' + item.y + 'px;\r\n    }';
        } else if (mode === 1) {
            tpl += '\r\r\n   '+(index * guld)+'% {\r\n        background-position: -' + item.x + 'px ' + item.y + 'px;\r\n    }';
        } else if (mode === 2) {
            tpl += '\r\r\n   '+(index * guld)+'% {\r\n        background-position: -' + item.x + 'px -' + item.y + 'px;\r\n    }';
        } else if (mode === 3) {
            tpl += '\r\r\n   '+(index * guld)+'% {\r\n        background-position: -' + item.x + 'px -' + item.y + 'px;\r\n    }';
        } else {

        };
    }

    tpl += '\r\n}';

    fs.writeFile(out + '/sprite.less', tpl, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("less已生成");
    });
}

// 开始
function start(input, output, model) {
    createSprite(input, output, model);
}

// 命令行
program
    .version(config.version, '-v, --version')
    .option('-m, --model <n>', 'sprite models', parseInt, 0)
    .option('-o, --output <string>', 'output directory', null, 'img')
    .option('-i, --input <string>', 'input directory', null, 'img')
    .parse(process.argv);

if (!program.output) {
    program.output = program.input;
}

start(program.input, program.output, program.model);