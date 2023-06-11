export interface IQueue<T> {
    enqueue(...item: T[]): void;
    dequeue(): ReturnType<Array<T>["shift"]>;
    size(): number;
}
export class Queue<T = unknown> extends Array<T> implements IQueue<T> {
    constructor(protected capacity: number = Infinity) {
        super();
    }

    enqueue(...item: T[]): void {
        if (this.size() === this.capacity) {
            item.forEach(() => this.shift());
        }

        this.push(...item);
    }
    dequeue(): T | undefined {
        return this.shift();
    }
    size(): number {
        return this.length;
    }
}
