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

    Free(p: Pointer): void {
        //TODO implement free.
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
    Size: number;
    Index: number;
    Offset: number;

    constructor(MemoryBlockRef: MemoryBlock, Offset: number) {
        this.Index = MemoryBlockRef.BeginIndex;
        this.Offset = Offset;
        this.MemoryBlockRef = MemoryBlockRef;
        this.DataViewRef = MemoryBlockRef.DataViewRef;
        this.Size = this.DataViewRef.getInt32(this.Index);
    }

    GetSize(): number {
        return this.Size;
    }

    CheckRange(Offset: number, Size: number) {
        if (this.Offset + Offset < 0 || this.Offset + Offset + Size > this.Size) throw new RangeError("Segmentation fault");
    }

    GetInt32ValueOffset(Offset: number): number {
        this.CheckRange(Offset, 4);
        return this.DataViewRef.getInt32(this.Index + this.Offset + 4 + Offset);
    }

    SetInt32ValueOffset(Offset: number, Value: number): void {
        this.CheckRange(Offset, 4);
        this.DataViewRef.setInt32(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetUint32ValueOffset(Offset: number): number {
        this.CheckRange(Offset, 4);
        return this.DataViewRef.getUint32(this.Index + this.Offset + 4 + Offset);
    }

    SetUint32ValueOffset(Offset: number, Value: number): void {
        this.CheckRange(Offset, 4);
        this.DataViewRef.setUint32(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetInt16ValueOffset(Offset: number): number {
        this.CheckRange(Offset, 2);
        return this.DataViewRef.getInt16(this.Index + this.Offset + 4 + Offset);
    }

    SetInt16ValueOffset(Offset: number, Value: number): void {
        this.CheckRange(Offset, 2);
        this.DataViewRef.setInt16(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetUint16ValueOffset(Offset: number): number {
        this.CheckRange(Offset, 2);
        return this.DataViewRef.getUint16(this.Index + this.Offset + 4 + Offset);
    }

    SetUint16ValueOffset(Offset: number, Value: number): void {
        this.CheckRange(Offset, 2);
        this.DataViewRef.setUint16(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetInt8ValueOffset(Offset: number): number {
        this.CheckRange(Offset, 1);
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4 + Offset);
    }

    SetInt8ValueOffset(Offset: number, Value: number): void {
        this.CheckRange(Offset, 1);
        this.DataViewRef.setUint8(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetUint8ValueOffset(Offset: number): number {
        this.CheckRange(Offset, 1);
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4 + Offset);
    }

    SetUint8ValueOffset(Offset: number, Value: number): void {
        this.CheckRange(Offset, 1);
        this.DataViewRef.setUint8(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetFloat32ValueOffset(Offset: number): number {
        this.CheckRange(Offset, 4);
        return this.DataViewRef.getFloat32(this.Index + this.Offset + 4 + Offset);
    }

    SetFloat32ValueOffset(Offset: number, Value: number): void {
        this.CheckRange(Offset, 4);
        this.DataViewRef.setFloat32(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetFloat64ValueOffset(Offset: number): number {
        this.CheckRange(Offset, 8);
        return this.DataViewRef.getFloat64(this.Index + this.Offset + 4 + Offset);
    }

    SetFloat64ValueOffset(Offset: number, Value: number): void {
        this.CheckRange(Offset, 8);
        this.DataViewRef.setFloat64(this.Index + this.Offset + 4 + Offset, Value);
    }

    GetPointerValueOffset(Offset: number): Pointer {
        this.CheckRange(Offset, 8);
        var BeginIndex = this.GetInt32ValueOffset(Offset);
        var _Offset = this.GetInt32ValueOffset(4 + Offset);
        if (BeginIndex == 0 && _Offset == 0) {
            return null;
        }
        var MemoryRef = this.MemoryBlockRef.MemoryRef;
        var ByteArrayRef = BeginIndex < 0 ? MemoryRef.Stack : MemoryRef.Heap;
        BeginIndex = BeginIndex < 0 ? -BeginIndex : BeginIndex;
        var Size = new DataView(ByteArrayRef).getInt32(BeginIndex);
        var block = new MemoryBlock(MemoryRef, this.DataViewRef, BeginIndex, Size);
        return new Pointer(block, _Offset);
    }

    SetPointerValueOffset(Offset: number, Value: Pointer) {
        this.CheckRange(Offset, 8);
        if (Value == null) {
            this.SetFloat64ValueOffset(Offset, 0);
        } else {
            var index = Value.MemoryBlockRef.BeginIndex;
            if (Value.DataViewRef.buffer == Value.MemoryBlockRef.MemoryRef.Stack) {
                index = -index;
            }
            this.SetInt32ValueOffset(Offset, index);
            this.SetInt32ValueOffset(Offset + 4, Value.Offset);
        }
    }

    GetInt32Value(): number {
        this.CheckRange(0, 4);
        return this.DataViewRef.getInt32(this.Index + this.Offset + 4);
    }

    SetInt32Value(Value: number): void {
        this.CheckRange(0, 4);
        this.DataViewRef.setInt32(this.Index + this.Offset + 4, Value);
    }

    GetUint32Value(): number {
        this.CheckRange(0, 4);
        return this.DataViewRef.getUint32(this.Index + this.Offset + 4);
    }

    SetUint32Value(Value: number): void {
        this.CheckRange(0, 4);
        this.DataViewRef.setUint32(this.Index + this.Offset + 4, Value);
    }

    GetInt16Value(): number {
        this.CheckRange(0, 2);
        return this.DataViewRef.getInt16(this.Index + this.Offset + 4);
    }

    SetInt16Value(Value: number): void {
        this.CheckRange(0, 2);
        this.DataViewRef.setInt16(this.Index + this.Offset + 4, Value);
    }

    GetUint16Value(): number {
        this.CheckRange(0, 2);
        return this.DataViewRef.getUint16(this.Index + this.Offset + 4);
    }

    SetUint16Value(Value: number): void {
        this.CheckRange(0, 2);
        this.DataViewRef.setUint16(this.Index + this.Offset + 4, Value);
    }

    GetInt8Value(): number {
        this.CheckRange(0, 1);
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4);
    }

    SetInt8Value(Value: number): void {
        this.CheckRange(0, 1);
        this.DataViewRef.setUint8(this.Index + this.Offset + 4, Value);
    }

    GetUint8Value(): number {
        this.CheckRange(0, 1);
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4);
    }

    SetUint8Value(Value: number): void {
        this.CheckRange(0, 1);
        this.DataViewRef.setUint8(this.Index + this.Offset + 4, Value);
    }

    GetFloat32Value(): number {
        this.CheckRange(0, 4);
        return this.DataViewRef.getFloat32(this.Index + this.Offset + 4);
    }

    SetFloat32Value(Value: number): void {
        this.CheckRange(0, 4);
        this.DataViewRef.setFloat32(this.Index + this.Offset + 4, Value);
    }

    GetFloat64Value(): number {
        this.CheckRange(0, 8);
        return this.DataViewRef.getFloat64(this.Index + this.Offset + 4);
    }

    SetFloat64Value(Value: number): void {
        this.CheckRange(0, 8);
        this.DataViewRef.setFloat64(this.Index + this.Offset + 4, Value);
    }

    GetPointerValue(): Pointer {
        this.CheckRange(0, 8);
        return this.GetPointerValueOffset(0);
    }

    SetPointerValue(Value: Pointer) {
        this.CheckRange(0, 8);
        this.SetPointerValueOffset(0, Value);
    }

    //GetCStringValueOffset(Offset: number): string {
    //    //return this.DataViewRef.
    //}

    SetCStringValueOffset(Offset: number, Value: string) {
        var length = 0, n = Value.length;
        for (var i = 0; i < n; i++) {
            var val = Value.charCodeAt(i);
            if (val >= 128) {
                if (val >= 2048) {
                    length += 3;
                } else {
                    length += 2;
                }
            } else {
                length += 1;
            }
        }
        length += 1; // for '\0'
        this.CheckRange(0, length);

        var typedArray = new Uint8Array(this.DataViewRef.buffer, this.Index + 4, this.MemoryBlockRef.Size), j = 0;
        for (var i = 0; i < n; i++) {
            var val = Value.charCodeAt(i);
            if (val >= 128) {
                if (val >= 2048) {
                    typedArray[j] = ((val >>> 6) | 192);
                    typedArray[j + 1] = (val & 63) | 128;
                    j += 2;
                } else {
                    typedArray[j] = (val >>> 12) | 224;
                    typedArray[j + 1] = ((val >>> 6) & 63) | 128;
                    typedArray[j + 2] = (val & 63) | 128;
                    j += 3;
                }
            } else {
                typedArray[j++] = val;
            }
        }
        typedArray[j++] = 0;
    }

    SetFloat64ArrayOffset(Offset: number, Value: number[]) {
        this.CheckRange(Offset, Value.length * 8);
        for (var i = 0; i < Value.length; i++) {
            this.SetFloat32ValueOffset(i * 8, Value[i]);
        }
    }

    InclInt32ValueOffset(Offset: number): number {
        var pre = this.GetInt32ValueOffset(Offset);
        this.SetInt32ValueOffset(Offset, pre + 1);
        return pre;
    }

    InclInt32Value(): number {
        var pre = this.GetInt32Value();
        this.SetInt32Value(pre + 1);
        return pre;
    }

    Add(n: number): Pointer {
        return new Pointer(this.MemoryBlockRef, this.Offset + n);
    }

}

var __Memory: Memory;


// tiny sprintf
// http://d.hatena.ne.jp/uupaa/20080301/1204380616

if (!(<any>String.prototype).sprintf) {
    (<any>String.prototype).sprintf = function (args___) {
        var rv = [], i = 0, v, width, precision, sign, idx, argv = arguments, next = 0;
        var s = (this + "     ").split(""); // add dummy 5 chars.
        var unsign = function (val) { return (val >= 0) ? val : val % 0x100000000 + 0x100000000; };
        var getArg = function () { return argv[idx ? idx - 1 : next++]; };

        for (; i < s.length - 5; ++i) {
            if (s[i] !== "%") { rv.push(s[i]); continue; }

            ++i, idx = 0, precision = undefined;

            // arg-index-specifier
            if (!isNaN(parseInt(s[i])) && s[i + 1] === "$") { idx = parseInt(s[i]); i += 2; }
            // sign-specifier
            sign = (s[i] !== "#") ? <any>false : ++i, true;
            // width-specifier
            width = (isNaN(parseInt(s[i]))) ? 0 : parseInt(s[i++]);
            // precision-specifier
            if (s[i] === "." && !isNaN(parseInt(s[i + 1]))) { precision = parseInt(s[i + 1]); i += 2; }

            switch (s[i]) {
                case "d": v = parseInt(getArg()).toString(); break;
                case "u": v = parseInt(getArg()); if (!isNaN(v)) { v = unsign(v).toString(); } break;
                case "o": v = parseInt(getArg()); if (!isNaN(v)) { v = (sign ? "0" : "") + unsign(v).toString(8); } break;
                case "x": v = parseInt(getArg()); if (!isNaN(v)) { v = (sign ? "0x" : "") + unsign(v).toString(16); } break;
                case "X": v = parseInt(getArg()); if (!isNaN(v)) { v = (sign ? "0X" : "") + unsign(v).toString(16).toUpperCase(); } break;
                case "f": v = parseFloat(getArg()).toFixed(precision); break;
                case "c": width = 0; v = getArg(); v = (typeof v === "number") ? <any>String.fromCharCode(v) : NaN; break;
                case "s": width = 0; v = getArg().toString(); if (precision) { v = v.substring(0, precision); } break;
                case "%": width = 0; v = s[i]; break;
                default: width = 0; v = "%" + ((width) ? width.toString() : "") + s[i].toString(); break;
            }
            if (isNaN(v)) { v = v.toString(); }
            (v.length < width) ? rv.push((<any>" ").repeat(width - v.length), v) : rv.push(v);
        }
        return rv.join("");
    };
}
if (!(<any>String.prototype).repeat) {
    (<any>String.prototype).repeat = function (n) {
        var rv = [], i = 0, sz = n || 1, s = this.toString();
        for (; i < sz; ++i) { rv.push(s); }
        return rv.join("");
    };
}

function sprintf(...args: any[]) {
    var args = []
    for (var i = 1; i < arguments.length; ++i) {
        args.push(arguments[i]);
    }
    return (<any>String.prototype).sprintf.apply(arguments[0], args);
}

var printf = function(...args: any[]) {
    console.log(sprintf.apply(null, arguments));
}

function isspace(s: Pointer): number {
    return s.GetInt8Value() == 0x20 ? 1 : 0;
}

function isdigit(s: Pointer): number {
    var code = s.GetInt8Value();
    return (0x30 <= code && code <= 0x39) ? 1 : 0;
}

function atol(s: Pointer): number
{
    while (isspace(s)) {
        s = s.Add(1);
    }
    var sign = 0;
    switch (s.GetInt8Value()) {
        case 0x2d /*'-'*/:
            sign = -1;
        case 0x2b/*'+'*/:
            s = s.Add(1);
            break;
    }
    var result;
    for (result = 0; isdigit(s); s = s.Add(1)) {
        result = result * 10 + s.GetInt8Value() - 0x30;
    }
    if (sign != 0) {
        result = -result;
    }
    return result;
}

class Tester {
    element: HTMLElement;
    span: HTMLElement;
    mem: Memory;

    constructor(element: HTMLElement) {
        this.element = element;
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.mem = new Memory(1024 * 1024 * 20, 1024 * 1024 * 8);
        __Memory = this.mem;

        printf = (...args: any[]) => {
            this.println(sprintf.apply(null, arguments));
        }
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

    start() {

    }

}
