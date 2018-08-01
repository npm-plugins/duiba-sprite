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
        if (file.indexOf('png') !== -1) {
            imgs.push(path.resolve(input, file));
        }
    }
    return imgs;
}

function createSprite(input, out) {
    const imgs = getImgs(input);
    if (imgs.length === 0) {
        return console.warn('无可用图片资源');
    }
    const img = nodeImages(imgs[0]);
    const width = img.width();
    const height = img.height();
    const canvas = nodeImages(width, height * imgs.length);
    for (let index = 0; index < imgs.length; index++) {
        const img = imgs[index];
        canvas.draw(nodeImages(img), 0, index * height);
    }
    canvas.save(out + '/sprite.png');
    const tpl = '.div {\r\n    background-position: 0 0;\r\n    background-position: 0 -' + canvas.height() + 'px;\r\n}';
    createCss(out, tpl);
}

function createCss(out, tpl) {
    fs.writeFile(out + '/sprite.css', tpl, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("写入成功");
    });
}

function start() {
    const args = process.argv.slice(2);
    let input = 'img', output = 'img';
    if (args.length) {
        for (let index = 0; index < args.length; index += 2) {
            const key = args[index];
            if (key === '-i' || key === '-input') {
                input = output = args[index + 1];
            }
            if (key === '-o' || key === '-output') {
                output = args[index + 1];
            }
        }
    }
    createSprite(input, output);
}

start()