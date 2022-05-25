/** 參考: https://www.jianshu.com/p/d11580784d4c */

class LLKPathCheck {

  /** 最大寬度 */
  private MAX_X = 10;
  /** 最大高度 */
  private MAX_Y = 10;
  /** 地圖 */
  private map: Array<Array<number>> = [];

  /** 檢測成功的路徑 水平 */
  private path_check_X: Point[] = [];
  /** 檢測成功的路徑 垂直 */
  private path_check_Y: Point[] = [];
  /** 檢測成功的路徑 單折線*/
  private path_turn_once: Point[] = [];
  /** 檢測成功的路徑 雙折線*/
  private path_turn_twice: Point[] = [];

  constructor(maxX: number, maxY: number) {
    this.MAX_X = maxX;
    this.MAX_Y = maxY;
    this.createMap();
  }

  getMap() {
    return [...this.map];
  }

  /** 產生地圖 */
  createMap(): LLKPathCheck {
    const map = new Array(this.MAX_Y).fill(null);
    for (let x = 0; x < map.length; x++) {
      map[x] = new Array(this.MAX_X).fill(0);
    }
    this.map = map;
    return this;
  }

  /** 地圖重置, 全部改為0 */
  resetMap(): LLKPathCheck {
    for (let y = 0; y < this.MAX_Y; y++) {
      for (let x = 0; x < this.MAX_X; x++) {
        this.setPoint({ x, y }, FLAG.EMPTY);
      }
    }
    return this;
  }

  /** 是否有障礙物 */
  hasBlock(p: Point): boolean {
    const type = this.map[p.x][p.y];
    return type === FLAG.BLOCK;
  }

  /**
   * 水平檢測兩點是否可直連
   * @description 檢測兩點是否可直連
   * @param p1 A點
   * @param p2 B點
   */
  checkX(p1: Point, p2: Point): boolean {
    // 檢查y點是否同一區
    if (p1.y !== p2.y) { return false; }

    /** 鎖定y */
    const y = p1.y;

    // 紀錄檢測經過的路徑點
    const checkPath: Point[] = []

    // 清空紀錄
    this.path_check_X = [];

    // 目標在我左邊 (x比我小)
    if (p1.x > p2.x) {
      for (let x = p1.x; x >= p2.x; x--) {
        if (this.hasBlock({ x, y })) { return false; }
        checkPath.push({ x, y });
      }
    }
    // 目標在我右邊 (x比我大)
    else {
      for (let x = p1.x; x <= p2.x; x++) {
        if (this.hasBlock({ x, y })) { return false; }
        checkPath.push({ x, y });
      }
    }

    // 都通過, 儲存路經點
    this.path_check_X = checkPath;
    return true;
  }

  /**
   * 垂直檢測
   * @description 檢測兩點是否可直連
   * @param p1 A點
   * @param p2 B點
   */
  checkY(p1: Point, p2: Point): boolean {
    // 檢查x點是否同一區
    if (p1.x !== p2.x) { return false; }

    /** 鎖定x */
    const x = p1.x;

    // 紀錄檢測經過的路徑點
    const checkPath: Point[] = []

    // 清空紀錄
    this.path_check_Y = [];

    // 目標在我上面 (y比我小)
    if (p1.y > p2.y) {
      for (let y = p1.y; y >= p2.y; y--) {
        if (this.hasBlock({ x, y })) { return false; }
        checkPath.push({ x, y });
      }
    }
    // 目標在我下面 (y比我大)
    else {
      for (let y = p1.y; y <= p2.y; y++) {
        if (this.hasBlock({ x, y })) { return false; }
        checkPath.push({ x, y });
      }
    }

    // 都通過, 儲存路經點
    this.path_check_Y = checkPath;
    return true;
  }

  /**
   * 單折線檢測
   * @description 檢測兩點是否可折一個彎連線
   * @param p1 A點
   * @param p2 B點
   */
  turn_once(p1: Point, p2: Point): boolean {

    // 清空紀錄
    this.path_turn_once = [];

    // 推算出C點位置
    const c1: Point = { x: p1.x, y: p2.y }
    const c2: Point = { x: p2.x, y: p1.y }

    // C點是否可通行
    const c1OK = !this.hasBlock(c1);
    const c2OK = !this.hasBlock(c2);

    // 是否連線
    let isCheck = false;

    // C1可通過
    if (c1OK) {
      const xOK = this.checkX(c1, p2);
      const yOK = this.checkY(c1, p1);
      isCheck = xOK && yOK;
    }

    // C1點可連線
    if (isCheck) {
      // 儲存路經
      this.path_turn_once.push(...this.path_check_X, ...this.path_check_Y);
      return true;
    }

    // C2可通過
    if (c2OK) {
      const xOK = this.checkX(c2, p1);
      const yOK = this.checkY(c2, p2);
      isCheck = xOK && yOK;
    }

    // C2點可連線
    if (isCheck) {
      // 儲存路經
      this.path_turn_once.push(...this.path_check_X, ...this.path_check_Y);
      return true;
    }

    return false;
  }

  /**
   * 雙折線檢測
   * @description 檢測兩點是否可折兩個彎連線
   * @param p1 A點
   * @param p2 B點
   */
  turn_twice(p1: Point, p2: Point): boolean {

    // 清空紀錄
    this.path_turn_twice = [];

    // 抓出A點所有水平與垂直點
    const path: Point[] = [];

    // 左
    for (let x = p1.x - 1; x >= 0; x--) {
      const p: Point = { x, y: p1.y };
      if (this.hasBlock(p)) break;
      path.push(p);
    }

    // 右
    for (let x = p1.x + 1; x < this.MAX_X; x++) {
      const p: Point = { x, y: p1.y };
      if (this.hasBlock(p)) break;
      path.push(p);
    }

    // 上
    for (let y = p1.y - 1; y >= 0; y--) {
      const p: Point = { x: p1.x, y };
      if (this.hasBlock(p)) break;
      path.push(p);
    }

    // 下
    for (let y = p1.y + 1; y < this.MAX_Y; y++) {
      const p: Point = { x: p1.x, y };
      if (this.hasBlock(p)) break;
      path.push(p);
    }

    // 將這些點 執行單折線檢測, 即可完成雙折線
    for (let i = 0; i < path.length; i++) {
      if (this.turn_once(path[i], p2)) {
        // 儲存該點到A點的路徑點
        if (this.checkX(p1, path[i])) {
          this.path_turn_twice.push(...this.path_check_X);
        }
        else if (this.checkY(p1, path[i])) {
          this.path_turn_twice.push(...this.path_check_Y);
        }
        // 儲存該點到B點的路徑點
        this.path_turn_twice.push(...this.path_turn_once);
        return true;
      }
    }

    return false;

  }

  /** 設定點狀態 */
  setPoint(points: Point | Point[], flag: number) {
    if (!Array.isArray(points)) points = [points];
    points.forEach(({ x, y }) => (this.map[x][y] = flag));
    return this;
  }

  /** 取得點 */
  getPoints(flag: number): Point[] {
    const myPoint: Point[] = [];
    for (let x = 0; x < this.MAX_X; x++) {
      for (let y = 0; y < this.MAX_Y; y++) {
        if (this.map[x][y] === flag) {
          myPoint.push({ x, y })
        }
      }
    }
    return myPoint;
  }

  /**
   * 計算兩點的連線參數
   * @param path 所有路徑
   * @param p A點
   */
  calcLinePoint(path: Point[], p: Point): LineData {
    const points: Point[] = []; // 整理後的路徑點
    const turnPoints: Point[] = []; // 轉彎點

    /** 取得旁邊的點 */
    const getNextPoint = (path: Point[], p: Point) => {
      const { x, y } = p;
      // 水平
      let xPoint = path.filter(p => p.x === x && (p.y === y + 1 || p.y === y - 1));
      if (xPoint.length) return xPoint[0];
      // 水平
      let yPoint = path.filter(p => p.y === y && (p.x === x + 1 || p.x === x - 1));
      if (yPoint.length) return yPoint[0];

      return null;
    }

    /** 檢測兩點是否無法連線, 表示含有轉彎 */
    const isTurn = (p1: Point, p2: Point) => {
      return p1.x !== p2.x && p1.y !== p2.y;
    }

    /** 移除路徑中的某個點 */
    const removePoint = (path: Point[], point: Point) => {
      return path.filter(p => !(p.x === point.x && p.y === point.y));
    }

    let lastPoint: Point | null = null;
    let nextPoint: Point | null = p;
    points.push(p);
    turnPoints.push(p);
    path = removePoint(path, p);

    do {
      const nowPoint = points[points.length - 1];
      nextPoint = getNextPoint(path, nowPoint);
      if (nextPoint !== null) {
        path = removePoint(path, nextPoint);
        if (lastPoint !== null) {
          const turn = isTurn(nextPoint, lastPoint);
          if (turn) turnPoints.push(nowPoint);
        }
        lastPoint = nowPoint;
        points.push({ ...nextPoint });
      } else {
        turnPoints.push(nowPoint);
      }
    }
    while (nextPoint !== null);

    return { points, turnPoints }
  }

  /** 判斷兩點是否可連線 */
  check(): CheckState {

    // 返回值
    const state: CheckState = {
      p1: null,
      p2: null,
      isOK: false,
      points: [],
      turnPoints: [],
    }

    // 檢查端點是否有兩個
    const myPoint = this.getPoints(FLAG.POINT);
    if (myPoint.length < 2) { return state; }

    const p1 = myPoint[0];
    const p2 = myPoint[1];
    const linePoints: Point[] = [];

    // 水平檢測
    if (this.checkX(p1, p2)) {
      linePoints.push(...this.path_check_X)
    }
    // 垂直檢測
    else if (this.checkY(p1, p2)) {
      linePoints.push(...this.path_check_Y)
    }
    // 單折線檢測
    else if (this.turn_once(p1, p2)) {
      linePoints.push(...this.path_turn_once)
    }
    // 雙折線檢測
    else if (this.turn_twice(p1, p2)) {
      linePoints.push(...this.path_turn_twice)
    }

    if (linePoints.length) {
      state.isOK = true;
      const ld = this.calcLinePoint(linePoints, p1);
      state.p1 = p1;
      state.p2 = p2;
      state.points = ld.points;
      state.turnPoints = ld.turnPoints;
    }

    return state;
  }
}

export interface LineData {
  points: Point[];
  turnPoints: Point[];
}

export interface CheckState extends LineData {
  p1: Point | null;
  p2: Point | null;
  isOK: boolean;
}

export interface Point {
  x: number;
  y: number;
}

const FLAG = {
  /** 障礙物 */
  BLOCK: 1,
  /** 空白區 */
  EMPTY: 0,
  /** 端點 */
  POINT: 9,
  /** 路徑 */
  PATH: 5
}
export { FLAG };

export default LLKPathCheck;