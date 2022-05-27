

class Store {

  private MAX_TYPE: number = 10;
  get MaxType(): number { return this.MAX_TYPE; }
  // set MaxType(mt: number) { this.MAX_TYPE = mt; }

  public setMaxType(mt: number) {
    this.MAX_TYPE = mt;
  }
}

export default new Store();