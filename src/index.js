#!/usr/bin/env node

const nodeImages = require("images");
const path = require('path');
const fs = require('fs');

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
        case '0':
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
        case '1':
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
        case '2':
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
        case '3':
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
    canvas.save(output + '/sprite.png');
    console.log('雪碧图已生成');
    createCss(output, data, mode);
}

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

function createCss(out, data, mode) {
    let tpl = '.sprite {';
    switch (mode) {
        case '0':
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                tpl += '\r\r\n   .frame-'+index+' {\r\n        background-position: ' + item.x + 'px -' + item.y + 'px;\r\n    }'
            }
            tpl += '\r\n}';
            break;
        case '1':
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                tpl += '\r\r\n   .frame-'+index+' {\r\n        background-position: -' + item.x + 'px ' + item.y + 'px;\r\n    }'
            }
            tpl += '\r\n}';
            break;
        case '2':
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                tpl += '\r\r\n   .frame-'+index+' {\r\n        background-position: -' + item.x + 'px -' + item.y + 'px;\r\n    }'
            }
            tpl += '\r\n}';
            break;
        case '3':
            for (let index = 0; index < data.length; index++) {
                const item = data[index];
                tpl += '\r\r\n   .frame-'+index+' {\r\n        background-position: -' + item.x + 'px -' + item.y + 'px;\r\n    }'
            }
            tpl += '\r\n}';
            break;
    }
    fs.writeFile(out + '/sprite.less', tpl, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("less已生成");
    });
}

function start() {
    const args = process.argv.slice(2);
    let input = 'img', output = 'img', mode = 0;
    if (args.length) {
        for (let index = 0; index < args.length; index += 2) {
            const key = args[index];
            if (key === '-i' || key === '-input') {
                input = output = args[index + 1];
            }
            if (key === '-o' || key === '-output') {
                output = args[index + 1];
            }
            if (key === '-m' || key === '-mode') {
                mode = args[index + 1];
            }
        }
    }
    createSprite(input, output, mode);
}

start()