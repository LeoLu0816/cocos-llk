
import { _decorator, Component, Node, Prefab, instantiate, Button, Label, Color, Layers, Sprite } from 'cc';
import { btnControl } from './btnControl';
import LLKPathCheck, { Point, FLAG } from './libs/llk-path-check';
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

  MAX_X: number = 10;
  MAX_Y: number = 10;

  /** 總共幾種牌 */
  MAX_TYPE: number = 10;

  /** 牌組 */
  types: number[] = [];

  btns: Node[] = [];

  map: Array<Array<Item>> = [];

  b1: Node = null;
  b2: Node = null;

  llk: LLKPathCheck;

  getRandom(items: number[]) {
    var item = items[Math.floor(Math.random() * items.length)];
    return item;
  }

  start() {

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

    const map: Array<Array<Item>> = new Array(2 + this.MAX_Y).fill(null);
    for (let x = 0; x < map.length; x++) {
      const item: Item = {
        node: null,
        x: 0,
        y: 0,
        type: FLAG.EMPTY,
      };
      map[x] = new Array(2 + this.MAX_X).fill(item);
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
          if (!this.b1) {
            this.b1 = node;
            btnBg.color = Color.BLUE;
            this.llk.setPoint({ x, y }, FLAG.POINT);
          }
          else {
            this.b2 = node;
            btnBg.color = Color.BLUE;
            this.llk.setPoint({ x, y }, FLAG.POINT);

            const b1C = this.b1.getComponent(btnControl);
            const b2C = this.b2.getComponent(btnControl);

            if (b1C.type === b2C.type && b1C.uuid !== b2C.uuid) {
              const state = this.llk.check();
              if (state.isOK) {
                console.log(`連線成功`);
                this.b1.active = false;
                this.b2.active = false;
                this.llk.setPoint({ x: b1C.x, y: b1C.y }, FLAG.EMPTY);
                this.llk.setPoint({ x: b2C.x, y: b2C.y }, FLAG.EMPTY);
                this.b1 = null;
                this.b2 = null;
                return;
              }
            }

            this.b1.getComponent(Sprite).color = Color.WHITE;
            this.b2.getComponent(Sprite).color = Color.WHITE;
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

  }

  setBtnText(node: Node, text: string) {
    const lb = node.getChildByName("Label").getComponent(Label);
    lb.string = text;
    return lb;
  }

}
