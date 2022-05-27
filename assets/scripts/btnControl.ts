
import { _decorator, Component, Node, Sprite, Button, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('btnControl')
export class btnControl extends Component {

  private _sprite: Sprite;
  private _btn: Button;

  private _isTips: boolean = false;
  get isTips() { return this._isTips; }
  set isTips(isTips) {
    this._isTips = isTips;
    if (isTips) {
      clearTimeout(this._tipsTimer);
      this.changeColor(Color.CYAN);
      this._tipsTimer = setTimeout(() => {
        this.resetColor();
        this._isTips = false;
      }, 500);
    } else {
      this.resetColor();
    }
  }

  private _isSelect: boolean;
  get isSelect() { return this._isSelect; }
  set isSelect(isSelect) { this._isSelect = isSelect; }

  private _tipsTimer = 0

  public x: number = 0;
  public y: number = 0;
  public type: number = 0;

  public onClick: Function = () => { }

  start() {

    this._sprite = this.node.getComponent(Sprite);
    this._btn = this.node.getComponent(Button);

    this.node.on(Node.EventType.TOUCH_END, e => {
      clearTimeout(this._tipsTimer);
      this.changeColor(Color.GREEN);
      this.onClick();
    });
  }

  changeColor(color: Color) {
    this._sprite.color = color;
  }

  resetColor() {
    this.changeColor(this._isSelect ? Color.GREEN : Color.WHITE);
  }

}