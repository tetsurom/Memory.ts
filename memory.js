var Memory = (function () {
    function Memory(HeapSize, StackSize) {
        this.Heap = new ArrayBuffer(HeapSize);
        this.Stack = new ArrayBuffer(StackSize);
        this.HeapDataView = new DataView(this.Heap);
        this.StackDataView = new DataView(this.Stack);
        this.CurrentHeapPos = 0;
        this.CurrentStackPos = 0;
    }
    Memory.prototype.AllocHeap = function (Size, Num) {
        if (!Num) {
            Num = Size;
            Size = 1;
        }
        var TotalSize = 4 + Size * Num;
        var block = new MemoryBlock(this, this.HeapDataView, this.CurrentHeapPos, TotalSize);
        this.CurrentHeapPos += TotalSize;
        return block.GetPointer(0);
    };

    Memory.prototype.AllocStack = function (Size, Num) {
        if (!Num) {
            Num = Size;
            Size = 1;
        }
        var TotalSize = 4 + Size * Num;
        var block = new MemoryBlock(this, this.StackDataView, this.CurrentStackPos, TotalSize);
        this.CurrentStackPos += TotalSize;
        return block.GetPointer(0);
    };

    Memory.prototype.GetStackTop = function () {
        return this.CurrentStackPos;
    };

    Memory.prototype.SetStackTop = function (top) {
        this.CurrentStackPos = top;
    };

    Memory.prototype.Free = function (p) {
    };
    return Memory;
})();

var MemoryBlock = (function () {
    function MemoryBlock(MemoryRef, DataViewRef, BeginIndex, Size) {
        this.MemoryRef = MemoryRef;
        this.BeginIndex = BeginIndex;
        this.Size = Size;
        this.DataViewRef = DataViewRef;
        DataViewRef.setInt32(BeginIndex, Size);
    }
    MemoryBlock.prototype.GetPointer = function (Offset) {
        return new Pointer(this, Offset);
    };
    return MemoryBlock;
})();

var Pointer = (function () {
    function Pointer(MemoryBlockRef, Offset) {
        this.Index = MemoryBlockRef.BeginIndex;
        this.Offset = Offset;
        this.MemoryBlockRef = MemoryBlockRef;
        this.DataViewRef = MemoryBlockRef.DataViewRef;
        this.Size = this.DataViewRef.getInt32(this.Index);
    }
    Pointer.prototype.GetSize = function () {
        return this.Size;
    };

    Pointer.prototype.CheckRange = function (Offset, Size) {
        if (this.Offset + Offset < 0 || this.Offset + Offset + Size > this.Size)
            throw new RangeError("Segmentation fault");
    };

    Pointer.prototype.GetInt32ValueOffset = function (Offset) {
        this.CheckRange(Offset, 4);
        return this.DataViewRef.getInt32(this.Index + this.Offset + 4 + Offset);
    };

    Pointer.prototype.SetInt32ValueOffset = function (Offset, Value) {
        this.CheckRange(Offset, 4);
        this.DataViewRef.setInt32(this.Index + this.Offset + 4 + Offset, Value);
    };

    Pointer.prototype.GetUint32ValueOffset = function (Offset) {
        this.CheckRange(Offset, 4);
        return this.DataViewRef.getUint32(this.Index + this.Offset + 4 + Offset);
    };

    Pointer.prototype.SetUint32ValueOffset = function (Offset, Value) {
        this.CheckRange(Offset, 4);
        this.DataViewRef.setUint32(this.Index + this.Offset + 4 + Offset, Value);
    };

    Pointer.prototype.GetInt16ValueOffset = function (Offset) {
        this.CheckRange(Offset, 2);
        return this.DataViewRef.getInt16(this.Index + this.Offset + 4 + Offset);
    };

    Pointer.prototype.SetInt16ValueOffset = function (Offset, Value) {
        this.CheckRange(Offset, 2);
        this.DataViewRef.setInt16(this.Index + this.Offset + 4 + Offset, Value);
    };

    Pointer.prototype.GetUint16ValueOffset = function (Offset) {
        this.CheckRange(Offset, 2);
        return this.DataViewRef.getUint16(this.Index + this.Offset + 4 + Offset);
    };

    Pointer.prototype.SetUint16ValueOffset = function (Offset, Value) {
        this.CheckRange(Offset, 2);
        this.DataViewRef.setUint16(this.Index + this.Offset + 4 + Offset, Value);
    };

    Pointer.prototype.GetInt8ValueOffset = function (Offset) {
        this.CheckRange(Offset, 1);
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4 + Offset);
    };

    Pointer.prototype.SetInt8ValueOffset = function (Offset, Value) {
        this.CheckRange(Offset, 1);
        this.DataViewRef.setUint8(this.Index + this.Offset + 4 + Offset, Value);
    };

    Pointer.prototype.GetUint8ValueOffset = function (Offset) {
        this.CheckRange(Offset, 1);
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4 + Offset);
    };

    Pointer.prototype.SetUint8ValueOffset = function (Offset, Value) {
        this.CheckRange(Offset, 1);
        this.DataViewRef.setUint8(this.Index + this.Offset + 4 + Offset, Value);
    };

    Pointer.prototype.GetFloat32ValueOffset = function (Offset) {
        this.CheckRange(Offset, 4);
        return this.DataViewRef.getFloat32(this.Index + this.Offset + 4 + Offset);
    };

    Pointer.prototype.SetFloat32ValueOffset = function (Offset, Value) {
        this.CheckRange(Offset, 4);
        this.DataViewRef.setFloat32(this.Index + this.Offset + 4 + Offset, Value);
    };

    Pointer.prototype.GetFloat64ValueOffset = function (Offset) {
        this.CheckRange(Offset, 8);
        return this.DataViewRef.getFloat64(this.Index + this.Offset + 4 + Offset);
    };

    Pointer.prototype.SetFloat64ValueOffset = function (Offset, Value) {
        this.CheckRange(Offset, 8);
        this.DataViewRef.setFloat64(this.Index + this.Offset + 4 + Offset, Value);
    };

    Pointer.prototype.GetPointerValueOffset = function (Offset) {
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
    };

    Pointer.prototype.SetPointerValueOffset = function (Offset, Value) {
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
    };

    Pointer.prototype.GetInt32Value = function () {
        this.CheckRange(0, 4);
        return this.DataViewRef.getInt32(this.Index + this.Offset + 4);
    };

    Pointer.prototype.SetInt32Value = function (Value) {
        this.CheckRange(0, 4);
        this.DataViewRef.setInt32(this.Index + this.Offset + 4, Value);
    };

    Pointer.prototype.GetUint32Value = function () {
        this.CheckRange(0, 4);
        return this.DataViewRef.getUint32(this.Index + this.Offset + 4);
    };

    Pointer.prototype.SetUint32Value = function (Value) {
        this.CheckRange(0, 4);
        this.DataViewRef.setUint32(this.Index + this.Offset + 4, Value);
    };

    Pointer.prototype.GetInt16Value = function () {
        this.CheckRange(0, 2);
        return this.DataViewRef.getInt16(this.Index + this.Offset + 4);
    };

    Pointer.prototype.SetInt16Value = function (Value) {
        this.CheckRange(0, 2);
        this.DataViewRef.setInt16(this.Index + this.Offset + 4, Value);
    };

    Pointer.prototype.GetUint16Value = function () {
        this.CheckRange(0, 2);
        return this.DataViewRef.getUint16(this.Index + this.Offset + 4);
    };

    Pointer.prototype.SetUint16Value = function (Value) {
        this.CheckRange(0, 2);
        this.DataViewRef.setUint16(this.Index + this.Offset + 4, Value);
    };

    Pointer.prototype.GetInt8Value = function () {
        this.CheckRange(0, 1);
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4);
    };

    Pointer.prototype.SetInt8Value = function (Value) {
        this.CheckRange(0, 1);
        this.DataViewRef.setUint8(this.Index + this.Offset + 4, Value);
    };

    Pointer.prototype.GetUint8Value = function () {
        this.CheckRange(0, 1);
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4);
    };

    Pointer.prototype.SetUint8Value = function (Value) {
        this.CheckRange(0, 1);
        this.DataViewRef.setUint8(this.Index + this.Offset + 4, Value);
    };

    Pointer.prototype.GetFloat32Value = function () {
        this.CheckRange(0, 4);
        return this.DataViewRef.getFloat32(this.Index + this.Offset + 4);
    };

    Pointer.prototype.SetFloat32Value = function (Value) {
        this.CheckRange(0, 4);
        this.DataViewRef.setFloat32(this.Index + this.Offset + 4, Value);
    };

    Pointer.prototype.GetFloat64Value = function () {
        this.CheckRange(0, 8);
        return this.DataViewRef.getFloat64(this.Index + this.Offset + 4);
    };

    Pointer.prototype.SetFloat64Value = function (Value) {
        this.CheckRange(0, 8);
        this.DataViewRef.setFloat64(this.Index + this.Offset + 4, Value);
    };

    Pointer.prototype.GetPointerValue = function () {
        this.CheckRange(0, 8);
        return this.GetPointerValueOffset(0);
    };

    Pointer.prototype.SetPointerValue = function (Value) {
        this.CheckRange(0, 8);
        this.SetPointerValueOffset(0, Value);
    };

    //GetCStringValueOffset(Offset: number): string {
    //    //return this.DataViewRef.
    //}
    Pointer.prototype.SetCStringValueOffset = function (Offset, Value) {
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
        length += 1;
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
    };

    Pointer.prototype.SetFloat64ArrayOffset = function (Offset, Value) {
        this.CheckRange(Offset, Value.length * 8);
        for (var i = 0; i < Value.length; i++) {
            this.SetFloat32ValueOffset(i * 8, Value[i]);
        }
    };

    Pointer.prototype.InclInt32ValueOffset = function (Offset) {
        var pre = this.GetInt32ValueOffset(Offset);
        this.SetInt32ValueOffset(Offset, pre + 1);
        return pre;
    };

    Pointer.prototype.InclInt32Value = function () {
        var pre = this.GetInt32Value();
        this.SetInt32Value(pre + 1);
        return pre;
    };

    Pointer.prototype.Add = function (n) {
        return new Pointer(this.MemoryBlockRef, this.Offset + n);
    };
    return Pointer;
})();

var __Memory;

if (!(String.prototype).sprintf) {
    (String.prototype).sprintf = function (args___) {
        var rv = [], i = 0, v, width, precision, sign, idx, argv = arguments, next = 0;
        var s = (this + "     ").split("");
        var unsign = function (val) {
            return (val >= 0) ? val : val % 0x100000000 + 0x100000000;
        };
        var getArg = function () {
            return argv[idx ? idx - 1 : next++];
        };

        for (; i < s.length - 5; ++i) {
            if (s[i] !== "%") {
                rv.push(s[i]);
                continue;
            }

            ++i, idx = 0, precision = undefined;

            if (!isNaN(parseInt(s[i])) && s[i + 1] === "$") {
                idx = parseInt(s[i]);
                i += 2;
            }

            // sign-specifier
            sign = (s[i] !== "#") ? false : ++i, true;

            // width-specifier
            width = (isNaN(parseInt(s[i]))) ? 0 : parseInt(s[i++]);

            if (s[i] === "." && !isNaN(parseInt(s[i + 1]))) {
                precision = parseInt(s[i + 1]);
                i += 2;
            }

            switch (s[i]) {
                case "d":
                    v = parseInt(getArg()).toString();
                    break;
                case "u":
                    v = parseInt(getArg());
                    if (!isNaN(v)) {
                        v = unsign(v).toString();
                    }
                    break;
                case "o":
                    v = parseInt(getArg());
                    if (!isNaN(v)) {
                        v = (sign ? "0" : "") + unsign(v).toString(8);
                    }
                    break;
                case "x":
                    v = parseInt(getArg());
                    if (!isNaN(v)) {
                        v = (sign ? "0x" : "") + unsign(v).toString(16);
                    }
                    break;
                case "X":
                    v = parseInt(getArg());
                    if (!isNaN(v)) {
                        v = (sign ? "0X" : "") + unsign(v).toString(16).toUpperCase();
                    }
                    break;
                case "f":
                    v = parseFloat(getArg()).toFixed(precision);
                    break;
                case "c":
                    width = 0;
                    v = getArg();
                    v = (typeof v === "number") ? String.fromCharCode(v) : NaN;
                    break;
                case "s":
                    width = 0;
                    v = getArg().toString();
                    if (precision) {
                        v = v.substring(0, precision);
                    }
                    break;
                case "%":
                    width = 0;
                    v = s[i];
                    break;
                default:
                    width = 0;
                    v = "%" + ((width) ? width.toString() : "") + s[i].toString();
                    break;
            }
            if (isNaN(v)) {
                v = v.toString();
            }
            (v.length < width) ? rv.push((" ").repeat(width - v.length), v) : rv.push(v);
        }
        return rv.join("");
    };
}
if (!(String.prototype).repeat) {
    (String.prototype).repeat = function (n) {
        var rv = [], i = 0, sz = n || 1, s = this.toString();
        for (; i < sz; ++i) {
            rv.push(s);
        }
        return rv.join("");
    };
}

function sprintf() {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        args[_i] = arguments[_i + 0];
    }
    var args = [];
    for (var i = 1; i < arguments.length; ++i) {
        args.push(arguments[i]);
    }
    return (String.prototype).sprintf.apply(arguments[0], args);
}

var printf = function () {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        args[_i] = arguments[_i + 0];
    }
    console.log(sprintf.apply(null, arguments));
};

function isspace(s) {
    return s.GetInt8Value() == 0x20 ? 1 : 0;
}

function isdigit(s) {
    var code = s.GetInt8Value();
    return (0x30 <= code && code <= 0x39) ? 1 : 0;
}

function atol(s) {
    while (isspace(s)) {
        s = s.Add(1);
    }
    var sign = 0;
    switch (s.GetInt8Value()) {
        case 0x2d:
            sign = -1;
        case 0x2b:
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

var Tester = (function () {
    function Tester(element) {
        var _this = this;
        this.element = element;
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.mem = new Memory(1024 * 1024 * 20, 1024 * 1024 * 8);
        __Memory = this.mem;

        printf = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            _this.println(sprintf.apply(null, arguments));
        };
    }
    Tester.prototype.println = function (text) {
        this.span.innerText += text.toString() + "\n";
    };

    Tester.prototype.exexute = function (name, func) {
        var t0 = new Date();
        func.apply(this);
        var t1 = new Date();
        var diff = t1.getMilliseconds() - t0.getMilliseconds();
        this.println(name + "\t" + diff);
    };

    Tester.prototype.start = function () {
    };
    return Tester;
})();
//@ sourceMappingURL=memory.js.map
