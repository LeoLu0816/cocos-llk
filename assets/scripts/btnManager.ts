
import { _decorator, Component, Node, Prefab, instantiate, Button, Label, Sprite, director, Graphics } from 'cc';
import { btnControl } from './btnControl';
import LLKPathCheck, { Point, FLAG, CheckState } from './libs/llk-path-check';
import store from './store';
const { ccclass, property } = _decorator;

interface Item {
  node: Node,
  x: number,
  y: number,
  type: number,
}

@ccclass('btnManager')
export class btnManager extends Component {

  @property(Prefab)
  btnTmpl: Prefab;

  @property(Prefab)
  linePre: Prefab;
  line: Graphics;

  @property(Button)
  btnTips: Button;

  @property(Button)
  btnNewGame: Button;

  @property(Button)
  goMenu: Button;

  MAX_X: number = 10;
  MAX_Y: number = 10;

  /** 總共幾種牌 */
  MAX_TYPE: number = 50;

  /** 牌組 */
  types: number[] = [];

  btns: Node[] = [];

  map: Array<Array<Item>> = [];

  b1: Node = null;
  b2: Node = null;

  llk: LLKPathCheck;

  isShowLine: boolean = false;

  typeMap: Array<Point[]> = [];

  canShowTips = true;
  nextCanLinePoint: Point[] = [];

  getRandom(items: number[]) {
    var item = items[Math.floor(Math.random() * items.length)];
    return item;
  }

  start() {

    this.MAX_TYPE = store.MaxType;

    this.llk = new LLKPathCheck(2 + this.MAX_X, 2 + this.MAX_Y);

    const total = this.MAX_X * this.MAX_Y;
    const t = total / this.MAX_TYPE;

    // 塞入牌組
    const typeArr = [...Array(this.MAX_TYPE).keys()];
    for (let i = 0; i < t; i++) {
      this.types.push(...typeArr)
    }
    this.types.sort(() => 0.5 - Math.random());
    // console.log(this.types);

    this.typeMap = Array(this.MAX_TYPE).fill(null);
    for (let i = 0; i < this.typeMap.length; i++) {
      this.typeMap[i] = [];
    }

    const map: Array<Array<Item>> = new Array(2 + this.MAX_Y).fill(null);
    for (let x = 0; x < map.length; x++) {
      map[x] = new Array(2 + this.MAX_X).fill(null);
      for (let y = 0; y < map[x].length; y++) {
        const item: Item = {
          node: null,
          x: 0,
          y: 0,
          type: FLAG.EMPTY,
        };
        map[x][y] = item;
      }
    }
    this.map = map;

    for (let x = 1; x <= this.MAX_X; x++) {
      for (let y = 1; y <= this.MAX_Y; y++) {
        const node = instantiate(this.btnTmpl);
        const btnBg = node.getComponent(Sprite);
        const bm = node.getComponent(btnControl);
        bm.x = x;
        bm.y = y;
        bm.onClick = () => {
          if (this.isShowLine) return;
          if (!this.b1) {
            this.b1 = node;
            bm.isSelect = true;
            this.llk.setPoint({ x, y }, FLAG.POINT);
          }
          else {
            this.b2 = node;
            bm.isSelect = true;
            this.llk.setPoint({ x, y }, FLAG.POINT);

            const b1C = this.b1.getComponent(btnControl);
            const b2C = this.b2.getComponent(btnControl);

            if (b1C.type === b2C.type && b1C.uuid !== b2C.uuid) {
              const state = this.llk.check();
              if (state.isOK) {
                // console.log(`連線成功`);
                this.llk.setPoint({ x: b1C.x, y: b1C.y }, FLAG.EMPTY);
                this.llk.setPoint({ x: b2C.x, y: b2C.y }, FLAG.EMPTY);

                this.isShowLine = true;
                this.showLine(state);
                setTimeout(() => {
                  this.b1.active = false;
                  this.b2.active = false;
                  this.b1 = null;
                  this.b2 = null;
                  this.line.clear();
                  this.isShowLine = false;
                  b1C.isSelect = false;
                  b2C.isSelect = false;

                  this.checkNextCanLine();
                }, 250);

                return;
              }
            }

            b1C.isSelect = false;
            b2C.isSelect = false;
            this.llk.setPoint({ x: b1C.x, y: b1C.y }, FLAG.BLOCK);
            this.llk.setPoint({ x: b2C.x, y: b2C.y }, FLAG.BLOCK);

            this.b1 = null;
            this.b2 = null;
          }
        }

        node.setParent(this.node);
        node.setPosition(x * 50, y * 50, 0);

        const thisType = this.types.pop();
        this.setBtnText(node, `${thisType}`);
        this.map[x][y].x = x;
        this.map[x][y].y = y;
        this.map[x][y].node = node;
        this.map[x][y].type = 10 * thisType;

        bm.type = this.map[x][y].type;
        this.llk.setPoint({ x, y }, FLAG.BLOCK);
        this.node.addChild(node);
        this.btns.push(node);
      }
    }

    const lineNode = instantiate(this.linePre);
    this.line = lineNode.getComponent(Graphics);
    this.node.addChild(lineNode);

    this.saveTypeMap();
    this.checkNextCanLine();

    this.btnTips.node.on(Node.EventType.TOUCH_END, () => {
      this.showTipsPoint();
    });

    this.btnNewGame.node.on(Node.EventType.TOUCH_END, () => {
      this.newGame();
    });

    this.goMenu.node.on(Node.EventType.TOUCH_END, () => {
      director.loadScene("welcome");
    });
  }

  newGame() {
    this.b1 = null;
    this.b2 = null;

    const total = this.MAX_X * this.MAX_Y;
    const t = total / this.MAX_TYPE;

    const typeArr = [...Array(this.MAX_TYPE).keys()];
    const types = [];
    for (let i = 0; i < t; i++) { types.push(...typeArr) }
    types.sort(() => 0.5 - Math.random());

    this.llk.resetMap();

    for (let x = 1; x <= this.MAX_X; x++) {
      for (let y = 1; y <= this.MAX_Y; y++) {
        const thisType = types.pop();
        const { node } = this.map[x][y];
        node.active = true;
        this.setBtnText(node, `${thisType}`);
        this.map[x][y].type = 10 * thisType;
        node.getComponent(btnControl).type = this.map[x][y].type;
        this.llk.setPoint({ x, y }, FLAG.BLOCK);
      }
    }

    this.saveTypeMap();
    this.checkNextCanLine();
  }

  showLine(state: CheckState) {
    const g = this.line;
    g.clear();
    g.lineWidth = 10;
    g.fillColor.fromHEX('#ff0000');

    state.turnPoints.forEach((p, i) => {
      if (i === 0) {
        g.moveTo(25 + 50 * p.x, 25 + 50 * p.y);
      } else {
        g.lineTo(25 + 50 * p.x, 25 + 50 * p.y);
      }
    });

    g.stroke();
    // g.fill();
  }

  setBtnText(node: Node, text: string) {
    const lb = node.getChildByName("Label").getComponent(Label);
    lb.string = text;
    return lb;
  }

  checkNextCanLine() {
    const nextCanLine = this.getOneCanLinePoint();
    this.nextCanLinePoint = nextCanLine;
    if (nextCanLine.length === 0) {
      this.randomPointType();
      setTimeout(() => {
        this.checkNextCanLine();
      }, 500);
    }
  }

  saveTypeMap() {
    this.typeMap.forEach(function (x, i, arr) { arr[i] = []; })
    for (let x = 1; x <= this.MAX_X; x++) {
      for (let y = 1; y <= this.MAX_Y; y++) {
        const { node, type } = this.map[x][y];
        if (node.active) {
          this.typeMap[type / 10].push({ x, y });
        }
      }
    }
  }

  /** 取得可以連線的點 */
  getOneCanLinePoint() {
    let checkType = []; // 已確認過的Type
    for (let x = 1; x <= this.MAX_X; x++) {
      for (let y = 1; y <= this.MAX_Y; y++) {
        const { node, type } = this.map[x][y];
        const btn = node.getComponent(btnControl);
        if (!node.active) continue;
        if (checkType.indexOf(btn.type) >= 0) continue;
        const points = this.typeMap[btn.type / 10];
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (p.x === x && p.y === y) continue;
          const { active } = this.map[p.x][p.y].node;
          if (active) {
            this.llk.setPoint([{ x: btn.x, y: btn.y }, p], FLAG.POINT);
            const state = this.llk.check();
            this.llk.setPoint([{ x: btn.x, y: btn.y }, p], FLAG.BLOCK);
            if (state.isOK) {
              return [{ x: btn.x, y: btn.y }, p]
            }
          }

        }
      }
    }
    return [];
  }

  /** 打亂牌 */
  randomPointType() {
    const types = [];

    // 1. 取出所有還在上面的牌資訊
    const points = this.llk.getPoints(FLAG.BLOCK);
    points.forEach(p => {
      types.push(this.map[p.x][p.y].type);
    });

    types.sort(() => 0.5 - Math.random());
    points.forEach(p => {
      const thisType = types.pop();
      let item = this.map[p.x][p.y];
      item.type = thisType;
      this.setBtnText(item.node, `${thisType / 10}`);
      const btn = item.node.getComponent(btnControl);
      btn.type = thisType;
    });
    this.saveTypeMap();

  }

  showTipsPoint() {
    this.nextCanLinePoint.forEach(({ x, y }) => {
      const btn = this.map[x][y].node.getComponent(btnControl);
      btn.isTips = true;
    });
  }

}
