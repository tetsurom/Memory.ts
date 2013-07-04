class Memory {
    Heap: ArrayBuffer;
    Stack: ArrayBuffer;
    Data: Array;
    HeapDataView: DataView;
    StackDataView: DataView;
    CurrentHeapPos: number;
    CurrentStackPos: number;

    constructor(HeapSize: number, StackSize: number) {
        this.Heap = new ArrayBuffer(HeapSize);
        this.Stack = new ArrayBuffer(StackSize);
        this.HeapDataView = new DataView(this.Heap);
        this.StackDataView = new DataView(this.Stack);
        this.CurrentHeapPos = 0;
        this.CurrentStackPos = 0;
    }

    AllocHeap(Size: number): Pointer;
    AllocHeap(Size: number, Num?: number): Pointer {
        if (!Num) {
            Num = Size;
            Size = 1;
        }
        var TotalSize = 4 + Size * Num;
        var block = new MemoryBlock(this, this.HeapDataView, this.CurrentHeapPos, TotalSize);
        this.CurrentHeapPos += TotalSize;
        return block.GetPointer(0);
    }

    AllocStack(Size: number): Pointer;
    AllocStack(Size: number, Num?: number): Pointer {
        if (!Num) {
            Num = Size;
            Size = 1;
        }
        var TotalSize = 4 + Size * Num;
        var block = new MemoryBlock(this, this.StackDataView, this.CurrentStackPos, TotalSize);
        this.CurrentStackPos += TotalSize;
        return block.GetPointer(0);
    }

    GetStackTop(): number {
        return this.CurrentStackPos;
    }

    SetStackTop(top: number): void {
        this.CurrentStackPos = top;
    }
}

class MemoryBlock {
    MemoryRef: Memory;
    BeginIndex: number;
    Size: number;
    DataViewRef: DataView;

    constructor(MemoryRef: Memory, DataViewRef: DataView, BeginIndex: number, Size: number) {
        this.MemoryRef = MemoryRef;
        this.BeginIndex = BeginIndex;
        this.Size = Size;
        this.DataViewRef = DataViewRef;
        DataViewRef.setInt32(BeginIndex, Size);
    }

    GetPointer(Offset: number): Pointer {
        return new Pointer(this, Offset);
    }
}


class Pointer {
    MemoryBlockRef: MemoryBlock;
    DataViewRef: DataView;
    Index: number;
    Offset: number;

    constructor(MemoryBlockRef: MemoryBlock, Offset: number) {
        this.Index = MemoryBlockRef.BeginIndex;
        this.Offset = Offset;
        this.MemoryBlockRef = MemoryBlockRef;
        this.DataViewRef = MemoryBlockRef.DataViewRef;
    }

    GetSize(): number {
        return this.DataViewRef.getInt32(this.Index - 4);
    }

    GetInt32ValueOffset(Offset: number): number {
        return this.DataViewRef.getInt32(this.Index + this.Offset + 4 + Offset);
    }

    SetInt32ValueOffset(Offset: number, Value: number): void {
        this.DataViewRef.setInt32(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetUint32ValueOffset(Offset: number): number {
        return this.DataViewRef.getUint32(this.Index + this.Offset + 4 + Offset);
    }

    SetUint32ValueOffset(Offset: number, Value: number): void {
        this.DataViewRef.setUint32(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetInt16ValueOffset(Offset: number): number {
        return this.DataViewRef.getInt16(this.Index + this.Offset + 4 + Offset);
    }

    SetInt16ValueOffset(Offset: number, Value: number): void {
        this.DataViewRef.setInt16(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetUint16ValueOffset(Offset: number): number {
        return this.DataViewRef.getUint16(this.Index + this.Offset + 4 + Offset);
    }

    SetUint16ValueOffset(Offset: number, Value: number): void {
        this.DataViewRef.setUint16(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetInt8ValueOffset(Offset: number): number {
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4 + Offset);
    }

    SetInt8ValueOffset(Offset: number, Value: number): void {
        this.DataViewRef.setUint8(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetUint8ValueOffset(Offset: number): number {
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4 + Offset);
    }

    SetUint8ValueOffset(Offset: number, Value: number): void {
        this.DataViewRef.setUint8(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetFloat32ValueOffset(Offset: number): number {
        return this.DataViewRef.getFloat32(this.Index + this.Offset + 4 + Offset);
    }

    SetFloat32ValueOffset(Offset: number, Value: number): void {
        this.DataViewRef.setFloat32(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetFloat64ValueOffset(Offset: number): number {
        return this.DataViewRef.getFloat64(this.Index + this.Offset + 4 + Offset);
    }

    SetFloat64ValueOffset(Offset: number, Value: number): void {
        this.DataViewRef.setFloat64(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetPointerValueOffset(Offset: number): Pointer {
        var BeginIndex = this.GetInt32Value();
        var Offset = this.GetInt32ValueOffset(4);
        var MemoryRef = this.MemoryBlockRef.MemoryRef;
        var ByteArrayRef = BeginIndex < 0 ? MemoryRef.Stack : MemoryRef.Heap;
        BeginIndex = BeginIndex < 0 ? -BeginIndex : BeginIndex;
        var Size = new DataView(ByteArrayRef).getInt32(BeginIndex);
        var block = new MemoryBlock(MemoryRef, this.DataViewRef, BeginIndex, Size);
        return new Pointer(block, Offset);
    }

    SetPointerValueOffset(Offset: number, Value: Pointer) {
        var index = Value.MemoryBlockRef.BeginIndex;
        if (Value.DataViewRef.buffer == Value.MemoryBlockRef.MemoryRef.Stack) {
            index = -index;
        }
        this.SetInt32Value(index);
        this.SetInt32ValueOffset(Offset + 4, Value.Offset);
    }

    GetInt32Value(): number {
        return this.DataViewRef.getInt32(this.Index + this.Offset + 4);
    }

    SetInt32Value(Value: number): void {
        this.DataViewRef.setInt32(this.Index + this.Offset + 4, Value);
    }

    GetUint32Value(): number {
        return this.DataViewRef.getUint32(this.Index + this.Offset + 4);
    }

    SetUint32Value(Value: number): void {
        this.DataViewRef.setUint32(this.Index + this.Offset + 4, Value);
    }

    GetInt16Value(): number {
        return this.DataViewRef.getInt16(this.Index + this.Offset + 4);
    }

    SetInt16Value(Value: number): void {
        this.DataViewRef.setInt16(this.Index + this.Offset + 4, Value);
    }

    GetUint16Value(): number {
        return this.DataViewRef.getUint16(this.Index + this.Offset + 4);
    }

    SetUint16Value(Value: number): void {
        this.DataViewRef.setUint16(this.Index + this.Offset + 4, Value);
    }

    GetInt8Value(): number {
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4);
    }

    SetInt8Value(Value: number): void {
        this.DataViewRef.setUint8(this.Index + this.Offset + 4, Value);
    }

    GetUint8Value(): number {
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4);
    }

    SetUint8Value(Value: number): void {
        this.DataViewRef.setUint8(this.Index + this.Offset + 4, Value);
    }

    GetFloat32Value(): number {
        return this.DataViewRef.getFloat32(this.Index + this.Offset + 4);
    }

    SetFloat32Value(Value: number): void {
        this.DataViewRef.setFloat32(this.Index + this.Offset + 4, Value);
    }

    GetFloat64Value(): number {
        return this.DataViewRef.getFloat64(this.Index + this.Offset + 4);
    }

    SetFloat64Value(Value: number): void {
        this.DataViewRef.setFloat64(this.Index + this.Offset + 4, Value);
    }

    GetPointerValue(): Pointer {
        return this.GetPointerValueOffset(0);
    }

    SetPointerValue(Value: Pointer) {
        this.SetPointerValueOffset(0, Value);
    }

    Add(n: number): Pointer {
        return new Pointer(this.MemoryBlockRef, this.Offset + n);
    }

}

var __Memory: Memory;

class Tester {
    element: HTMLElement;
    span: HTMLElement;
    mem: Memory;

    constructor(element: HTMLElement) {
        this.element = element;
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.mem = new Memory(1024 * 1024 * 8, 1024 * 1024 * 8);
        __Memory = this.mem;
    }

    println(text: any) {
        this.span.innerText += text.toString() + "\n";
    }

    exexute(name: string, func: () => void ): void {
        var t0 = new Date;
        func.apply(this);
        var t1 = new Date;
        var diff = t1.getMilliseconds() - t0.getMilliseconds();
        this.println(name + "\t" + diff);
    }

    test1(): void {
        var intPtr: Pointer = this.mem.AllocStack(4);
        intPtr.SetInt32Value(12345678);
        this.println(intPtr.GetInt32Value());
        var intPtr2: Pointer = this.mem.AllocStack(4);
        intPtr2.SetInt32Value(12345678);
        this.println(intPtr2.GetInt32Value());

        var intPtrPtr: Pointer = this.mem.AllocStack(8);
        intPtrPtr.SetPointerValue(intPtr);
        this.println(intPtrPtr.GetPointerValue().GetInt32Value());

        var charPtr: Pointer = this.mem.AllocStack(1);
        charPtr.SetInt8Value(1.2);
        this.println(charPtr.GetInt8Value());
    }

    test1A(): void {
        var fibo = function (n) {
            if (n < 3) {
                return 1;
            }
            return fibo(n - 1) + fibo(n - 2);
        }
        this.println(fibo(32));
    }

    test1B(): void {
        var fibo = function (__n) {
            var __stacktop = __Memory.GetStackTop();
            var n = __Memory.AllocStack(4); n.SetInt32Value(__n);
            if (n.GetInt32Value() < 3) {
                var __ret = 1;
                __Memory.SetStackTop(__stacktop);
                return __ret;
            }
            var __ret = (fibo((n.GetInt32Value() - 1) & 0xFFFFFFFF) + fibo((n.GetInt32Value() - 2) & 0xFFFFFFFF)) & 0xFFFFFFFF;
            __Memory.SetStackTop(__stacktop);
            return __ret;
        }
        this.println(fibo(32));
    }

    test2A(): void {
        var a = [5, 3, 1, 9, 8, 7, 4, 0, 2, 6];

        var swap = (a: number[], i1: number, i2: number) => {
            var temp = a[i1];
            a[i1] = a[i2];
            a[i2] = temp;
        }
        var find_min = (a: number[], begin: number): number => {
            var min_idx = begin;
            for (var j = begin; j < a.length; j++) {
                if (a[j] < a[min_idx]) {
                    min_idx = j;
                }
            }
            return min_idx;
        }

        var selection_sort = (a: number[]) => {
            for (var i = 0; i < a.length; i++) {
                swap(a, i, find_min(a, i));
            }
        }

        selection_sort(a);
    }

    test2B(): void {
        var a = __Memory.AllocStack(40); //[5, 3, 1, 9, 8, 7, 4, 0, 2, 6];

        var swap = (a: number[], i1: number, i2: number) => {
            var temp = a[i1];
            a[i1] = a[i2];
            a[i2] = temp;
        }
        var find_min = (a: number[], begin: number): number => {
            var min_idx = begin;
            for (var j = begin; j < a.length; j++) {
                if (a[j] < a[min_idx]) {
                    min_idx = j;
                }
            }
            return min_idx;
        }

        var selection_sort = (a: Pointer) => {
            for (var i = 0; i < a.length; i++) {
                swap(a, i, find_min(a, i));
            }
        }

        selection_sort(a);
    }

    start() {
        this.exexute("test1A", this.test1A);
        this.exexute("test1B", this.test1B);
    }

}

window.onload = () => {
    var el = document.getElementById('content');
    var tester = new Tester(el);
    tester.start();
};
