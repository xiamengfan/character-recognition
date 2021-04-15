
cc.Class({
    extends: cc.Component,

    properties: {
        MoveContent: cc.Node,
        Graphics: cc.Graphics,
        NumLabel: cc.Label,
    },

    ctor() {
        this.MIN_LEN = 7;
        this.trail = [];
        this.refVec = cc.v2(1, 0);
        this.DirectionMap = {
            '0': '1',
            '45': '2',
            '90': '3',
            '135': '4',
            '180': '5',
            '-180': '5',
            '-135': '6',
            '-90': '7',
            '-45': '8',
        };
        this.NumberMap = {
            '6781234': 0,
            '456781234': 0,
            '7': 1,
            '6': 1,
            '218761': 2,
            '218765187654': 3,
            '617': 4,
            '71876541': 5,
            '678123456': 6,
            '16': 7,
            '17': 7,
            '2345678765432': 8,
            '45678126': 9,
            '45678127': 9
        }
    },

    onLoad() {
        this.MoveContent.on('touchstart', this.onTouchStart, this);
        this.MoveContent.on('touchmove', this.onTouchMove, this);
        this.MoveContent.on('touchcancel', this.onTouchCancel, this);
        this.MoveContent.on('touchend', this.onTouchEnd, this);
        this.NumLabel.string = '';
    },

    radianToAngle(rad) {
        return rad / Math.PI * 180;
    },

    getDirection(angle) {
        let key = null;
        let differ = 180;
        for (let k in this.DirectionMap) {
            let temp = Math.abs(angle - Number(k));
            if (temp < differ) {
                differ = temp;
                key = k;
            }
        }
        return this.DirectionMap[key];
    },

    onTouchStart(e) {
        let location = e.getLocation();
        let pos = this.MoveContent.convertToNodeSpaceAR(location);
        this.Graphics.moveTo(pos.x, pos.y);
    },

    onTouchMove(e) {
        let vec = e.getDelta();
        let length = vec.len();
        // cc.log('length:', length);
        // cc.log(vec.x, vec.y);
        if (vec.x === 0 && vec.y === 0) return;
        let location = e.getLocation();
        let pos = this.MoveContent.convertToNodeSpaceAR(location);
        this.Graphics.lineTo(pos.x, pos.y);
        this.Graphics.stroke();
        let rad = vec.angle(this.refVec);
        let angle = this.radianToAngle(rad);
        angle *= vec.y > 0 ? 1 : -1;
        // cc.log('angle:', angle);
        let direction = this.getDirection(angle);
        // cc.log('direction:', direction);
        this.trail.push({ direction, length });
        this.onBtnCheck();
    },

    onTouchCancel(e) {
        this.moveOver();
    },

    onTouchEnd(e) {
        this.moveOver();
    },

    moveOver() {

    },

    onBtnCheck() {
        // this.merge();
        // this.filter();

        let trail = this.trail.concat([]);
        let len = trail.length;
        for (let i = len - 1; i > 0; --i) {
            let cur = trail[i];
            let last = trail[i - 1];
            if (cur.direction === last.direction) {
                last.length += cur.length;
                trail.splice(i, 1);
            }
        }

        len = trail.length;
        for (let i = len - 1; i >= 0; --i) {
            let cur = trail[i];
            if (cur.length < this.MIN_LEN) {
                trail.splice(i, 1);
            }
        }

        let s1 = '';
        for (let i = 0; i < trail.length; ++i) {
            s1 += String(trail[i]['direction']);
        }
        cc.log('trail:', s1);
        let differ = null;
        let index = null;
        for (let key in this.NumberMap) {
            let temp = this.minDistance(s1, key);
            cc.log('temp:', temp);
            if (differ === null || temp < differ) {
                differ = temp;
                index = key;
            }
        }
        let result = this.NumberMap[index];
        this.NumLabel.string = result;
        // this.trail = [];
    },

    onBtnClear() {
        this.trail = [];
        this.Graphics.clear();
        this.NumLabel.string = '';
    },

    //合并连续路径
    merge() {
        let trail = this.trail;
        let len = trail.length;
        for (let i = len - 1; i > 0; --i) {
            let cur = trail[i];
            let last = trail[i - 1];
            if (cur.direction === last.direction) {
                last.length += cur.length;
                trail.splice(i, 1);
            }
        }
    },

    //过滤极小路径，小于MIN_LEN
    filter() {
        let trail = this.trail;
        let len = trail.length;
        for (let i = len - 1; i >= 0; --i) {
            let cur = trail[i];
            if (cur.length < this.MIN_LEN) {
                trail.splice(i, 1);
            }
        }
    },

    /** 编辑距离算法 */

    minDistance(s1, s2) {
        let m = s1.length, n = s2.length;
        let dp = new Array(m + 1);
        for (let i = 0; i < dp.length; ++i) {
            dp[i] = new Array(n + 1);
            for (let j = 0; j < dp[i].length; ++j) {
                dp[i][j] = 0;
            }
        }
        // base case 
        for (let i = 1; i <= m; i++)
            dp[i][0] = i;
        for (let j = 1; j <= n; j++)
            dp[0][j] = j;
        // 自底向上求解
        for (let i = 1; i <= m; i++)
            for (let j = 1; j <= n; j++)
                if (s1[i - 1] == s2[j - 1])
                    dp[i][j] = dp[i - 1][j - 1];
                else
                    dp[i][j] = this.min(
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1,
                        dp[i - 1][j - 1] + 1
                    );
        // 储存着整个 s1 和 s2 的最小编辑距离
        return dp[m][n];
    },

    min(a, b, c) {
        return Math.min(a, Math.min(b, c));
    }

});
