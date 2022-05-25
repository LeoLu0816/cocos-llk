
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('btnControl')
export class btnControl extends Component {

    public x: number = 0;
    public y: number = 0;
    public type: number = 0;

    public onClick: Function = () => { }

    start() {
        this.node.on(Node.EventType.TOUCH_END, e => {
            console.log(`${this.x},${this.y}`);
            this.onClick();
        });
    }

}