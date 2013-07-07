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
        var typedArray = new Float64Array(this.DataViewRef.buffer, this.Index +Offset +4, this.MemoryBlockRef.Size -Offset);
        typedArray.set(Value, Offset);
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

    //---------------------------------------------------------------------------------------
    // binarytree.c
    //---------------------------------------------------------------------------------------

    binarytreeA(): void {
        /* The Computer Language Benchmarks Game
         * http://benchmarksgame.alioth.debian.org/
        
         contributed by Kevin Carson
        compilation:
        gcc -O3 -fomit-frame-pointer -funroll-loops -static binary-trees.c -lm
        icc -O3 -ip -unroll -static binary-trees.c -lm
        */
        /*
        typedef struct tn {
            Pointer left; 0
            Pointer right; 8
            int          item; 16
        } treeNode; size 20
        */

        var NewTreeNode = (left: Pointer, right: Pointer, item: number) => {
            var node: Pointer;

            node = __Memory.AllocHeap(20);

            node.SetPointerValue(left);
            node.SetPointerValueOffset(8, right);
            node.SetInt32ValueOffset(16, item);
            // node-> left = left;
            // node-> right = right;
            // node-> item = item;

            return node;
        } /* NewTreeNode() */


        function ItemCheck(tree: Pointer): number {
            if (tree.GetPointerValue() === null) {
                return tree.GetInt32ValueOffset(16);
            }
            return tree.GetInt32ValueOffset(16) + ItemCheck(tree.GetPointerValue()) - ItemCheck(tree.GetPointerValueOffset(8));
        } /* ItemCheck() */


        function BottomUpTree(item: number, depth: number): Pointer {
            if (depth > 0) {
                return NewTreeNode(BottomUpTree(2 * item - 1, depth - 1), BottomUpTree(2 * item, depth - 1), item);
            }
            return NewTreeNode(null, null, item);
        } /* BottomUpTree() */


        function DeleteTree(tree: Pointer): void {
            if (tree.GetPointerValue() !== null) {
                DeleteTree(tree.GetPointerValue());
                DeleteTree(tree.GetPointerValueOffset(8));
            }

            __Memory.Free(tree);
        } /* DeleteTree() */

        function main(argc: number, argv: Pointer): number {
            var depth, maxDepth;
            var N = atol(argv.GetPointerValueOffset(8));
            var minDepth = 4;

            if ((minDepth + 2) > N) {
                maxDepth = minDepth + 2;
            } else {
                maxDepth = N;
            }

            var stretchDepth = maxDepth + 1;
            var stretchTree = BottomUpTree(0, stretchDepth);
            printf(
                 "stretch tree of depth %u\t check: %d\n",
                 stretchDepth,
                 ItemCheck(stretchTree)
                );

            DeleteTree(stretchTree);

            var longLivedTree = BottomUpTree(0, maxDepth);

            for (depth = minDepth; depth <= maxDepth; depth += 2) {
                var    i, iterations, check;

                iterations = Math.pow(2, maxDepth - depth + minDepth);

                check = 0;

                for (i = 1; i <= iterations; i++) {
                    var tempTree = BottomUpTree(i, depth);
                    check += ItemCheck(tempTree);
                    DeleteTree(tempTree);

                    tempTree = BottomUpTree(-i, depth);
                    check += ItemCheck(tempTree);
                    DeleteTree(tempTree);
                } /* for(i = 1...) */

                printf(
                     "%d\t trees of depth %u\t check: %d\n",
                     iterations * 2,
                     depth,
                     check
                    );
            } /* for(depth = minDepth...) */

            printf(
                 "long lived tree of depth %u\t check: %d\n",
                 maxDepth,
                 ItemCheck(longLivedTree)
                );

            return 0;
        } /* main() */

        var args = __Memory.AllocStack(16);

        var num = __Memory.AllocStack(20);

        num.SetCStringValueOffset(0, "10");
        args.SetPointerValueOffset(8, num);

        main(2, args);
    }

    //---------------------------------------------------------------------------------------
    // fannkuchredux.c
    //---------------------------------------------------------------------------------------

    fannkuchreduxA(): void {
        /* The Computer Language Benchmarks Game
         * http://benchmarksgame.alioth.debian.org/
         *
         * contributed by Ledrug Katz
         *
         */

        //#include < stdio.h >
        //#include < stdlib.h >
        //#include < stdint.h >

        /* this depends highly on the platform.  It might be faster to use
           char type on 32-bit systems; it might be faster to use unsigned. */

        //int s[16], t[16];
        var s = __Memory.AllocStack(16 * 4);
        var t = __Memory.AllocStack(16 * 4);

        var maxflips = 0;
        var max_n;
        var odd = 0;
        var checksum = 0;

        function flip(): number {
            var i;
            var x: Pointer, y: Pointer, c: number;

            for (x = t, y = s, i = max_n; i--;) {
                //* x++ = * y++;
                x.SetInt32Value(y.GetInt32Value());
                x = x.Add(4);
                y = y.Add(4);
            }
            i = 1;
            do {
                for (x = t, y = t + t[0]; x < y;) {
                    //c = * x, * x++ = * y, * y-- = c;
                    c = x.GetInt32Value();
                    x.SetInt32Value((y.GetInt32Value()));
                    x = x.Add(4);
                    y.SetInt32Value(c);
                    y = y.Add(-4);
                }
                i++;
            } while (t.GetInt32ValueOffset(t.GetInt32Value()) != 0/*t[t[0]]*/);
            return i;
        }

        function rotate(n: number): void {
            var c;
            var i;
            c = s.GetInt32Value();
            for (i = 1; i <= n; i++) {
                //s[i - 1] = s[i];
                s.SetInt32ValueOffset(i - 1, s.GetInt32ValueOffset(i));
            }
            //s[n] = c;
            s.SetInt32ValueOffset(n, c);
        }

        /* Tompkin-Paige iterative perm generation */
        function tk(n: number): void {
            var __stacktop = __Memory.GetStackTop();
            var i = 0, f;
            //int c[16] = { 0 };
            var c = __Memory.AllocStack(4 * 16);

            while (i < n) {
                rotate(i);
                if (c.GetInt16ValueOffset(i) >= i) {
                    c.SetInt32ValueOffset(i++, 0);
                    continue;
                }

                c.InclInt32ValueOffset(i);
                i = 1;
                odd = ~odd;
                if (s.GetInt32Value() != 0) {
                    f = (s.GetInt32ValueOffset(s.GetInt32Value()) != 0)/*s[s[0]]*/ ? flip() : 1;
                    if (f > maxflips) {
                        maxflips = f;
                    }
                    checksum += odd ? -f : f;
                }
            }
            __Memory.SetStackTop(__stacktop);
        }

        function main(argc: number, v: Pointer): number {
            var i;

            if (argc < 2) {
                printf("usage: %s number\n", v.GetPointerValue());
                return 1;
            }

            max_n = atol(v.GetPointerValueOffset(8));
            if (max_n < 3 || max_n > 15) {
                printf("range: must be 3 <= n <= 12\n");
                return 1;
            }

            for (i = 0; i < max_n; i++) {
                s.SetInt32ValueOffset(i, i);
            }
            tk(max_n);

            printf("%d\nPfannkuchen(%d) = %d\n", checksum, max_n, maxflips);

            return 0;
        }

        var args = __Memory.AllocStack(16);

        var num = __Memory.AllocStack(20);

        num.SetCStringValueOffset(0, "5");
        args.SetPointerValueOffset(8, num);

        main(2, args);
    }

    //---------------------------------------------------------------------------------------
    // spectralnorm.c
    //---------------------------------------------------------------------------------------

    spectralnormA(): void {
        /* The Computer Language Benchmarks Game
         * http://benchmarksgame.alioth.debian.org/
         *
         * Contributed by Mr Ledrug
         *
         * Algorithm lifted from Intel Fortran #2 code by Steve Decker et al.
        */

        //#include < stdio.h >
        //#include < stdlib.h >
        //#include < math.h >

        function A(i: number, j: number): number {
            return (((i + j) * (i + j + 1) / 2) | 0 + i + 1);
        }

        function dot(v: Pointer, u: Pointer, n: number): number {
            var i;
            var sum = 0;
            for (i = 0; i < n; i++)
                sum += v.GetFloat64ValueOffset(i) * u.GetFloat64ValueOffset(i);
            return sum;
        }

        function mult_Av(v: Pointer, out: Pointer, n: number): void {
            var i, j;
            var sum;
            for (i = 0; i < n; i++) {
                for (sum = j = 0; j < n; j++) {
                    sum += v.GetFloat64ValueOffset(j) / A(i, j);
                }
                out.SetFloat64ValueOffset(i, sum);
            }
        }

        function mult_Atv(v: Pointer, out: Pointer, n: number): void {
            var i, j;
            var sum;
            for (i = 0; i < n; i++) {
                for (sum = j = 0; j < n; j++) {
                    sum += v.GetFloat64ValueOffset(j) / A(j, i);
                }
                out.SetFloat64ValueOffset(i, sum);
            }
        }

        var tmp: Pointer;

        function mult_AtAv(v: Pointer, out: Pointer, n: number): void {
            mult_Av(v, tmp, n);
            mult_Atv(tmp, out, n);
        }

        function main(argc: number, argv: Pointer): number {
            var n = atol(argv.GetPointerValueOffset(8));
            if (n <= 0) n = 2000;

            var u = __Memory.AllocHeap(n * 8);
            var v = __Memory.AllocHeap(n * 8);
            var tmp = __Memory.AllocHeap(n * 8);

            var i;
            for (i = 0; i < n; i++) {
                u.SetFloat64ValueOffset(i, 1);
            }
            for (i = 0; i < 10; i++) {
                mult_AtAv(u, v, n);
                mult_AtAv(v, u, n);
            }

            printf("%.9f\n", Math.sqrt(dot(u, v, n) / dot(v, v, n)));

            return 0;
        }
        var args = __Memory.AllocStack(16);

        var num = __Memory.AllocStack(20);

        num.SetCStringValueOffset(0, "2000");
        args.SetPointerValueOffset(8, num);
    }

    //---------------------------------------------------------------------------------------
    // nbody.c
    //---------------------------------------------------------------------------------------

//    nbodyA() {
//        /* The Computer Language Benchmarks Game
//        * http://benchmarksgame.alioth.debian.org/
//        *
//        * contributed by Christoph Bauer
//        *
//        */

//        //#include <math.h>
//        //#include <stdio.h>
//        //#include <stdlib.h>

//        var pi = 3.141592653589793;
//        var solar_mass = (4 * pi * pi);
//        var days_per_year = 365.24;
///*
//        struct planet {
//            double x, y, z;    : 0, 8, 16,
//            double vx, vy, vz; : 24, 32, 40
//            double mass;       : 48
//        };
//*/
//        var planet_offsets = {x: 0, y: 8, z: 16, vx: 24, vy: 32, vz: 40, mass: 48};
//        var sizeof_planet = 56;

//        function advance(nbodies: number, bodies: Pointer, dt: number): void{
//            var i: number, j: number;

//            for (i = 0; i < nbodies; i++) {
//                var b = bodies.Add(i*sizeof_planet);
//                for (j = i +1; j < nbodies; j++) {
//                    var b2 = bodies.Add(j*sizeof_planet);
//                    var dx = b.GetFloat64ValueOffset(planet_offsets.x) - b2.GetFloat64ValueOffset(planet_offsets.x);
//                    var dy = b.GetFloat64ValueOffset(planet_offsets.y) - b2.GetFloat64ValueOffset(planet_offsets.y);
//                    var dz = b.GetFloat64ValueOffset(planet_offsets.z) - b2.GetFloat64ValueOffset(planet_offsets.z);
//                    var distance = Math.sqrt(dx * dx +dy * dy +dz * dz);
//                    var mag = dt / (distance * distance * distance);
//                    b.SetFloat64ValueOffset(planet_offsets.vx, b.GetFloat64ValueOffset(planet_offsets.vx) - dx * b2.GetFloat64ValueOffset(planet_offsets.mass) * mag);
//                    b.SetFloat64ValueOffset(planet_offsets.vy, b.GetFloat64ValueOffset(planet_offsets.vy) - dy * b2.GetFloat64ValueOffset(planet_offsets.mass) * mag);
//                    b.SetFloat64ValueOffset(planet_offsets.vz, b.GetFloat64ValueOffset(planet_offsets.vz) - dz * b2.GetFloat64ValueOffset(planet_offsets.mass) * mag);
//                    b2.SetFloat64ValueOffset(planet_offsets.vx, b2.GetFloat64ValueOffset(planet_offsets.vx) + dx * b.GetFloat64ValueOffset(planet_offsets.mass) * mag);
//                    b2.SetFloat64ValueOffset(planet_offsets.vy, b2.GetFloat64ValueOffset(planet_offsets.vy) + dy * b.GetFloat64ValueOffset(planet_offsets.mass) * mag);
//                    b2.SetFloat64ValueOffset(planet_offsets.vz, b2.GetFloat64ValueOffset(planet_offsets.vz) + dz * b.GetFloat64ValueOffset(planet_offsets.mass) * mag);
//                }
//               }
//            for (i = 0; i < nbodies; i++) {
//                var b = bodies.Add(i*sizeof_planet);
//                b2.SetFloat64ValueOffset(planet_offsets.x, b2.GetFloat64ValueOffset(planet_offsets.x) + dt * b.GetFloat64ValueOffset(planet_offsets.vx));
//                b2.SetFloat64ValueOffset(planet_offsets.y, b2.GetFloat64ValueOffset(planet_offsets.y) + dt * b.GetFloat64ValueOffset(planet_offsets.vy));
//                b2.SetFloat64ValueOffset(planet_offsets.z, b2.GetFloat64ValueOffset(planet_offsets.z) + dt * b.GetFloat64ValueOffset(planet_offsets.vz));
//            }
//        }

//        function energy(nbodies: number, bodies: Pointer): number {
//            var e: number;
//            var i: number, j: number;

//            e = 0.0;
//            for (i = 0; i < nbodies; i++) {
//                var b = bodies.Add(i*sizeof_planet);
//                e += 0.5 * b.GetFloat64ValueOffset(planet_offsets.mass) *
//                    (b.GetFloat64ValueOffset(planet_offsets.vx) * b.GetFloat64ValueOffset(planet_offsets.vx) +
//                    b.GetFloat64ValueOffset(planet_offsets.vy) * b.GetFloat64ValueOffset(planet_offsets.vy) +
//                    b.GetFloat64ValueOffset(planet_offsets.vz) * b.GetFloat64ValueOffset(planet_offsets.vz));
//                for (j = i +1; j < nbodies; j++) {
//                    var b2 = bodies.Add(j*sizeof_planet);
//                    var dx = b.GetFloat64ValueOffset(planet_offsets.x) -b2.GetFloat64ValueOffset(planet_offsets.x);
//                    var dy = b.GetFloat64ValueOffset(planet_offsets.y) -b2.GetFloat64ValueOffset(planet_offsets.y);
//                    var dz = b.GetFloat64ValueOffset(planet_offsets.z) -b2.GetFloat64ValueOffset(planet_offsets.z);
//                    var distance = Math.sqrt(dx * dx +dy * dy +dz * dz);
//                    e -= (b.GetFloat64ValueOffset(planet_offsets.mass) * b2.GetFloat64ValueOffset(planet_offsets.mass)) / distance;
//                }
//            }
//            return e;
//        }

//        function offset_momentum(nbodies: number, bodies: Pointer): void {
//            var px = 0.0, py = 0.0, pz = 0.0;
//            for (var i = 0; i < nbodies; i++) {
//                var b = bodies.Add(i*sizeof_planet);
//                px += b.GetFloat64ValueOffset(planet_offsets.vx) * b.GetFloat64ValueOffset(planet_offsets.mass);
//                py += b.GetFloat64ValueOffset(planet_offsets.vy) * b.GetFloat64ValueOffset(planet_offsets.mass);
//                pz += b.GetFloat64ValueOffset(planet_offsets.vz) * b.GetFloat64ValueOffset(planet_offsets.mass);
//            }
//            bodies.SetFloat64ValueOffset(planet_offsets.vx, -px / solar_mass);
//            bodies.SetFloat64ValueOffset(planet_offsets.vy, -py / solar_mass);
//            bodies.SetFloat64ValueOffset(planet_offsets.vz, -pz / solar_mass);
//        }

//        var NBODIES = 5;
//        var bodies = __Memory.AllocHeap(NBODIES * sizeof_planet);
//        bodies = 
//struct planet bodies[NBODIES]= {
//{                               /* sun */
//        0, 0, 0, 0, 0, 0, solar_mass
//},
//{                               /* jupiter */
//        4.84143144246472090e+00,
//        -1.16032004402742839e+00,
//        -1.03622044471123109e-01,
//        1.66007664274403694e-03 * days_per_year,
//        7.69901118419740425e-03 * days_per_year,
//        -6.90460016972063023e-05 * days_per_year,
//        9.54791938424326609e-04 * solar_mass
//},
//{                               /* saturn */
//        8.34336671824457987e+00,
//        4.12479856412430479e+00,
//        -4.03523417114321381e-01,
//        -2.76742510726862411e-03 * days_per_year,
//        4.99852801234917238e-03 * days_per_year,
//        2.30417297573763929e-05 * days_per_year,
//        2.85885980666130812e-04 * solar_mass
//},
//{                               /* uranus */
//        1.28943695621391310e+01,
//        -1.51111514016986312e+01,
//        -2.23307578892655734e-01,
//        2.96460137564761618e-03 * days_per_year,
//        2.37847173959480950e-03 * days_per_year,
//        -2.96589568540237556e-05 * days_per_year,
//        4.36624404335156298e-05 * solar_mass
//},
//{                               /* neptune */
//        1.53796971148509165e+01,
//        -2.59193146099879641e+01,
//        1.79258772950371181e-01,
//        2.68067772490389322e-03 * days_per_year,
//        1.62824170038242295e-03 * days_per_year,
//        -9.51592254519715870e-05 * days_per_year,
//        5.15138902046611451e-05 * solar_mass
//}
//};

//int main(int argc, char ** argv)
//{
//    int n = atoi(argv[1]);
//    int i;

//    offset_momentum(NBODIES, bodies);
//    printf ("%.9f\n", energy(NBODIES, bodies));
//    for (i = 1; i <= n; i++)
//        advance(NBODIES, bodies, 0.01);
//    printf ("%.9f\n", energy(NBODIES, bodies));
//    return 0;
//}

//    }

    start() {
        //this.exexute("spectralnormA", this.binarytreeA);
        this.exexute("fannkuchreduxA", this.binarytreeA);
        //this.exexute("test1B", this.test1B);
    }

}

window.onload = () => {
    var el = document.getElementById('content');
    var tester = new Tester(el);
    tester.start();
};
