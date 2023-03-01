export interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | undefined;
    size(): number;
}
export class Queue<T> extends Array implements IQueue<T> {
    constructor(protected capacity: number = Infinity) {
        super();
    }

    enqueue(item: T): void {
        if (this.size() === this.capacity) {
            this.shift();
        }
        this.push(item);
    }
    dequeue(): T | undefined {
        return this.shift();
    }
    size(): number {
        return this.length;
    }
}
