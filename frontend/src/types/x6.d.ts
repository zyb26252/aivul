declare module '@antv/x6' {
  export class Graph {
    constructor(options: any)
    zoom(factor?: number): number
    zoomToFit(options?: { padding?: number }): void
    resize(width: number, height: number): void
    on(eventName: string, callback: (args: any) => void): void
    trigger(eventName: string, ...args: any[]): void
    dispose(): void
    clientToLocal(point: { x: number; y: number }): { x: number; y: number }
    addNode(options: any): Cell
    select(node: Cell | Cell[]): void
    clearSelection(): void
    unselect(node?: Cell | Cell[]): void
    getCellById(id: string): Cell | null
    getSelectedCells(): Cell[]
    addCell(cell: Cell): Cell
    removeCell(cell: Cell): Cell
    getNodes(): Cell[]
    getEdges(): Cell[]
    fromJSON(json: any): void
    toJSON(): any
    centerContent(): void
    getCellsBBox(cells: Cell[]): BBox | null
  }

  export class Shape {
    static Rect: any
    static Circle: any
  }

  export class Cell {
    id: string
    data: {
      type: string
      properties: Record<string, any>
      parent?: string
    }
    isNode(): boolean
    isEdge(): boolean
    getData(): any
    setData(data: any): this
    getZIndex(): number
    setZIndex(z: number): this
    getAttrs(): any
    setAttrs(attrs: any): this
    position(x: number, y: number): this
    resize(width: number, height: number): this
  }

  export interface BBox {
    x: number
    y: number
    width: number
    height: number
  }

  export namespace Graph {
    export interface Node {
      id: string
      attrs?: {
        label?: {
          text: string
        }
        body?: {
          stroke?: string
          fill?: string
          rx?: number
          ry?: number
        }
      }
      data?: {
        type: string
        properties: Record<string, any>
        parent?: string
      }
      position?: {
        x: number
        y: number
      }
      size?: {
        width: number
        height: number
      }
      children?: string[]
      parent?: string
      zIndex?: number
    }

    export interface Edge {
      id: string
      source: string
      target: string
    }
  }
} 