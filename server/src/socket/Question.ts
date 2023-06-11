import { Queue } from "../utils/queue";


export class Questions<T> extends Queue<T> {
    dequeue(): T | undefined {
        if (this.size() < this.capacity) {
            const res = super.dequeue();
            if (res) this.enqueue(res);
            return res;
        } else return this.dequeue();
    }
}
