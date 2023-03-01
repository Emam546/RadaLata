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
            throw Error("Queue has reached max capacity, you cannot add more items");
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