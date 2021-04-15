

cc.Class({
    extends: cc.Component,

    properties: {
        MoveContent: cc.Node,
        Graphics: cc.Graphics,
        NumLabel: cc.Label,
        MyCamera: cc.Camera,
    },



    onLoad() {
        this.NumberMap = {
            '0': [0, 8, 197, 103, 0, 0, 170, 0, 162, 0, 0, 161, 0, 159, 0, 0, 128, 131, 155, 0, 0, 0, 48, 0, 0],
            '1': [0, 0, 94, 0, 0, 0, 0, 157, 0, 0, 0, 0, 159, 0, 0, 0, 0, 164, 0, 0, 0, 0, 52, 0, 0],
            '2': [0, 86, 162, 84, 0, 0, 82, 0, 158, 0, 0, 0, 22, 151, 0, 0, 210, 341, 158, 24, 0, 0, 0, 0, 0],
            '3': [0, 54, 202, 0, 0, 0, 76, 172, 0, 0, 0, 23, 260, 122, 0, 0, 86, 170, 130, 0, 0, 0, 0, 0, 0],
            '4': [0, 0, 34, 0, 0, 0, 123, 197, 0, 0, 0, 252, 316, 121, 0, 0, 0, 161, 0, 0, 0, 0, 50, 0, 0],
            '5': [0, 0, 69, 0, 0, 0, 27, 283, 100, 0, 0, 111, 166, 129, 0, 0, 113, 44, 164, 0, 0, 70, 126, 0, 0],
            '6': [0, 13, 105, 0, 0, 0, 179, 0, 0, 0, 0, 291, 185, 65, 0, 0, 167, 10, 158, 0, 0, 56, 157, 0, 0],
            '7': [0, 71, 156, 196, 0, 0, 0, 0, 168, 0, 0, 0, 99, 73, 0, 0, 0, 171, 0, 0, 0, 0, 35, 0, 0],
            '8': [0, 114, 167, 147, 0, 0, 164, 9, 201, 0, 0, 87, 397, 109, 0, 0, 191, 164, 191, 0, 0, 0, 0, 0, 0],
            '9': [0, 145, 166, 131, 0, 0, 160, 203, 131, 0, 0, 99, 294, 0, 0, 0, 69, 104, 0, 0, 0, 68, 0, 0, 0]

        }
        this.MoveContent.on('touchstart', this.onTouchStart, this);
        this.MoveContent.on('touchmove', this.onTouchMove, this);
        this.MoveContent.on('touchcancel', this.onTouchCancel, this);
        this.MoveContent.on('touchend', this.onTouchEnd, this);
        this.NumLabel.string = '';
    },

    onTouchStart(e) {
        let location = e.getLocation();
        let pos = this.MoveContent.convertToNodeSpaceAR(location);
        this.Graphics.moveTo(pos.x, pos.y);
    },

    onTouchMove(e) {
        let vec = e.getDelta();
        if (vec.x === 0 && vec.y === 0) return;
        let location = e.getLocation();
        let pos = this.MoveContent.convertToNodeSpaceAR(location);
        this.Graphics.lineTo(pos.x, pos.y);
        this.Graphics.stroke();
    },

    onTouchCancel(e) {
        this.moveOver();
    },

    onTouchEnd(e) {
        this.moveOver();
    },

    moveOver() {

    },

    getDistance(srcList, targetList) {
        let num = 0;
        let len = srcList.length;
        for (let i = 0; i < len; ++i) {
            let a = srcList[i];
            let b = targetList[i];
            num += ((a - b) ** 2);
        }
        return Math.sqrt(num);
    },

    onBtnCheck() {
        // let camera = this.MyCamera;
        let node = new cc.Node();
        // node.parent = cc.director.getScene();
        node.parent = this.MoveContent;
        let camera = node.addComponent(cc.Camera);
        camera.alignWithScreen = false;
        camera.orthoSize = this.MoveContent.width / 2;
        // node.position = cc.v2(this.MoveContent.x, this.MoveContent.y);
        camera.backgroundColor = cc.Color.TRANSPARENT
        camera.clearFlags = cc.Camera.ClearFlags.DEPTH | cc.Camera.ClearFlags.STENCIL;
        //cc.Camera.ClearFlags.COLOR
        // 设置你想要的截图内容的 cullingMask
        camera.cullingMask = 1 << this.MoveContent.groupIndex;

        // 新建一个 RenderTexture，并且设置 camera 的 targetTexture 为新建的 RenderTexture，这样 camera 的内容将会渲染到新建的 RenderTexture 中。
        let texture = new cc.RenderTexture();
        let gl = cc.game._renderContext;
        // 如果截图内容中不包含 Mask 组件，可以不用传递第三个参数
        texture.initWithSize(this.MoveContent.width, this.MoveContent.height, gl.STENCIL_INDEX8);
        camera.targetTexture = texture;

        // 渲染一次摄像机，即更新一次内容到 RenderTexture 中
        camera.render();

        // 这样我们就能从 RenderTexture 中获取到数据了
        let data = texture.readPixels();

        let width = texture.width;
        let height = texture.height;

        let tempArray = [];
        let index = 0;
        let rowBytes = width * 4;
        for (let row = 0; row < height; row++) {
            let startRow = height - 1 - row;
            let start = startRow * width * 4;
            for (let i = 0; i < rowBytes; i += 4) {
                tempArray[index] = data[start + i] < 255 ? 1 : 0;
                index++;
            }
        }
        // 10 * 10
        let resArray = [];
        let s = 80;
        for (let i = 0; i < 5; ++i) {
            for (let j = 0; j < 5; ++j) {
                let start_row = i * s;
                let end_row = i * s + s;
                let start_col = j * s;
                let end_col = j * s + s;
                let count = 0;
                for (let k = start_row; k < end_row; ++k) {
                    for (let m = start_col; m < end_col; ++m) {
                        let id = k * width + m;
                        count += tempArray[id];
                    }
                }
                resArray.push(count);
            }
        }
        console.log(resArray);

        let min = 1600;
        let resultKey = 0;
        for (let key in this.NumberMap) {
            let targetList = this.NumberMap[key];
            let distance = this.getDistance(resArray, targetList);
            if (distance < min) {
                min = distance;
                resultKey = key;
            }
        }
        this.NumLabel.string = resultKey;
        // return;

        // 接下来就可以对这些数据进行操作了
        // let canvas = document.createElement('canvas');
        // let ctx = canvas.getContext('2d');
        // let width = canvas.width = texture.width;
        // let height = canvas.height = texture.height;

        // canvas.width = texture.width;
        // canvas.height = texture.height;

        // let rowBytes = width * 4;
        // for (let row = 0; row < height; row++) {
        //     let startRow = height - 1 - row;
        //     let imageData = ctx.createImageData(width, 1);
        //     let start = startRow * width * 4;
        //     for (let i = 0; i < rowBytes; i++) {
        //         imageData.data[i] = data[start + i];
        //     }

        //     ctx.putImageData(imageData, 0, row);
        // }

        // let dataURL = canvas.toDataURL("image/jpeg");
        // let img = document.createElement("img");
        // img.src = dataURL;
        // let myTexture = new cc.Texture2D();
        // myTexture.initWithElement(img);
        // let spriteFrame = new cc.SpriteFrame();
        // spriteFrame.setTexture(myTexture);
        // this.NumLabel.node.parent.getComponent(cc.Sprite).spriteFrame = spriteFrame;

        node.destroy();
    },

    onBtnClear() {
        this.Graphics.clear();
        this.NumLabel.string = '';
    },

});
