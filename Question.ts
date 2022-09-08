import { Queue, IQueue } from "./utils/queue"
class QueueLooping<T> extends Queue<T>{
    dequeue(): T | undefined {
        let res = super.dequeue();
        if (res)
            this.enqueue(res);
        return res;
    }
}
function removeItemAll<T>(arr: Array<T>, value: T) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}

export class Questions<T> extends Queue<T> {
    private SecondStorage = new QueueLooping<T>();;
    removeIf(action: (value: T) => boolean) {

        for (let i = 0; i < this.length; i++)
            if (action(this[i]))
                this.splice(i, 1);
        for (let i = 0; i < this.SecondStorage.length; i++)
            if (action(this.SecondStorage[i]))
                this.SecondStorage.splice(i, 1);


    }
    enqueue(item: T): void {
        if (this.size() < this.capacity)
            return super.enqueue(item)
        else
            return this.SecondStorage.enqueue(item)

    }
    dequeue(): T | undefined {
        if (this.size()) {
            let res: T | undefined = super.dequeue();
            if (res)
                this.SecondStorage.enqueue(res)
            return res
        } else
            return this.SecondStorage.dequeue();
    }

}