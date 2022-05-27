
import { _decorator, Component, Node, Button, director } from 'cc';
import store from './store';
const { ccclass, property } = _decorator;

@ccclass('welcome')
export class welcome extends Component {
  @property(Button)
  btn1: Button;
  @property(Button)
  btn2: Button;
  @property(Button)
  btn3: Button;
  start() {
    director.preloadScene("llkGame", function () {
      console.log('llkGame scene preloaded');
    });
    this.btn1.node.on(Node.EventType.TOUCH_END, () => { this.enterGame(10); })
    this.btn2.node.on(Node.EventType.TOUCH_END, () => { this.enterGame(20); })
    this.btn3.node.on(Node.EventType.TOUCH_END, () => { this.enterGame(50); })
  }

  enterGame(maxType: number) {
    store.setMaxType(maxType);
    director.loadScene("llkGame");
  }

}
