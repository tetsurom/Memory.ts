var Memory = (function () {
    function Memory(HeapSize, StackSize) {
        this.Heap = new ArrayBuffer(HeapSize);
        this.Stack = new ArrayBuffer(StackSize);
        this.HeapDataView = new DataView(this.Heap);
        this.StackDataView = new DataView(this.Stack);
        this.CurrentHeapPos = 0;
        this.CurrentStackPos = 0;
    }
    Memory.prototype.AllocaHeap = function (Size, Num) {
        if(!Num) {
            Num = Size;
            Size = 1;
        }
        var TotalSize = 4 + Size * Num;
        var block = new MemoryBlock(this, this.HeapDataView, this.CurrentHeapPos, TotalSize);
        this.CurrentHeapPos += TotalSize;
        return block.GetPointer(0);
    };
    Memory.prototype.AllocaStack = function (Size, Num) {
        if(!Num) {
            Num = Size;
            Size = 1;
        }
        var TotalSize = 4 + Size * Num;
        var block = new MemoryBlock(this, this.StackDataView, this.CurrentHeapPos, TotalSize);
        this.CurrentStackPos += TotalSize;
        return block.GetPointer(0);
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
    }
    Pointer.prototype.GetSize = function () {
        return this.DataViewRef.getInt32(this.Index - 4);
    };
    Pointer.prototype.GetInt32ValueOffset = function (Offset) {
        return this.DataViewRef.getInt32(this.Index + this.Offset + 4 + Offset);
    };
    Pointer.prototype.SetInt32ValueOffset = function (Offset, Value) {
        this.DataViewRef.setInt32(this.Index + this.Offset + 4 + Offset, Value);
    };
    Pointer.prototype.GetUint32ValueOffset = function (Offset) {
        return this.DataViewRef.getUint32(this.Index + this.Offset + 4 + Offset);
    };
    Pointer.prototype.SetUint32ValueOffset = function (Offset, Value) {
        this.DataViewRef.setUint32(this.Index + this.Offset + 4 + Offset, Value);
    };
    Pointer.prototype.GetInt16ValueOffset = function (Offset) {
        return this.DataViewRef.getInt16(this.Index + this.Offset + 4 + Offset);
    };
    Pointer.prototype.SetInt16ValueOffset = function (Offset, Value) {
        this.DataViewRef.setInt16(this.Index + this.Offset + 4 + Offset, Value);
    };
    Pointer.prototype.GetUint16ValueOffset = function (Offset) {
        return this.DataViewRef.getUint16(this.Index + this.Offset + 4 + Offset);
    };
    Pointer.prototype.SetUint16ValueOffset = function (Offset, Value) {
        this.DataViewRef.setUint16(this.Index + this.Offset + 4 + Offset, Value);
    };
    Pointer.prototype.GetInt8ValueOffset = function (Offset) {
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4 + Offset);
    };
    Pointer.prototype.SetInt8ValueOffset = function (Offset, Value) {
        this.DataViewRef.setUint8(this.Index + this.Offset + 4 + Offset, Value);
    };
    Pointer.prototype.GetUint8ValueOffset = function (Offset) {
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4 + Offset);
    };
    Pointer.prototype.SetUint8ValueOffset = function (Offset, Value) {
        this.DataViewRef.setUint8(this.Index + this.Offset + 4 + Offset, Value);
    };
    Pointer.prototype.GetFloat32ValueOffset = function (Offset) {
        return this.DataViewRef.getFloat32(this.Index + this.Offset + 4 + Offset);
    };
    Pointer.prototype.SetFloat32ValueOffset = function (Offset, Value) {
        this.DataViewRef.setFloat32(this.Index + this.Offset + 4 + Offset, Value);
    };
    Pointer.prototype.GetFloat64ValueOffset = function (Offset) {
        return this.DataViewRef.getFloat64(this.Index + this.Offset + 4 + Offset);
    };
    Pointer.prototype.SetFloat64ValueOffset = function (Offset, Value) {
        this.DataViewRef.setFloat64(this.Index + this.Offset + 4 + Offset, Value);
    };
    Pointer.prototype.GetPointerValueOffset = function (Offset) {
        var BeginIndex = this.GetInt32Value();
        var Offset = this.GetInt32ValueOffset(4);
        var MemoryRef = this.MemoryBlockRef.MemoryRef;
        var ByteArrayRef = BeginIndex < 0 ? MemoryRef.Stack : MemoryRef.Heap;
        BeginIndex = BeginIndex < 0 ? -BeginIndex : BeginIndex;
        var Size = new DataView(ByteArrayRef).getInt32(BeginIndex);
        var block = new MemoryBlock(MemoryRef, this.DataViewRef, BeginIndex, Size);
        return new Pointer(block, Offset);
    };
    Pointer.prototype.SetPointerValueOffset = function (Offset, Value) {
        var index = Value.MemoryBlockRef.BeginIndex;
        if(Value.DataViewRef.buffer == Value.MemoryBlockRef.MemoryRef.Stack) {
            index = -index;
        }
        this.SetInt32Value(index);
        this.SetInt32ValueOffset(Offset + 4, Value.Offset);
    };
    Pointer.prototype.GetInt32Value = function () {
        return this.DataViewRef.getInt32(this.Index + this.Offset + 4);
    };
    Pointer.prototype.SetInt32Value = function (Value) {
        this.DataViewRef.setInt32(this.Index + this.Offset + 4, Value);
    };
    Pointer.prototype.GetUint32Value = function () {
        return this.DataViewRef.getUint32(this.Index + this.Offset + 4);
    };
    Pointer.prototype.SetUint32Value = function (Value) {
        this.DataViewRef.setUint32(this.Index + this.Offset + 4, Value);
    };
    Pointer.prototype.GetInt16Value = function () {
        return this.DataViewRef.getInt16(this.Index + this.Offset + 4);
    };
    Pointer.prototype.SetInt16Value = function (Value) {
        this.DataViewRef.setInt16(this.Index + this.Offset + 4, Value);
    };
    Pointer.prototype.GetUint16Value = function () {
        return this.DataViewRef.getUint16(this.Index + this.Offset + 4);
    };
    Pointer.prototype.SetUint16Value = function (Value) {
        this.DataViewRef.setUint16(this.Index + this.Offset + 4, Value);
    };
    Pointer.prototype.GetInt8Value = function () {
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4);
    };
    Pointer.prototype.SetInt8Value = function (Value) {
        this.DataViewRef.setUint8(this.Index + this.Offset + 4, Value);
    };
    Pointer.prototype.GetUint8Value = function () {
        return this.DataViewRef.getUint8(this.Index + this.Offset + 4);
    };
    Pointer.prototype.SetUint8Value = function (Value) {
        this.DataViewRef.setUint8(this.Index + this.Offset + 4, Value);
    };
    Pointer.prototype.GetFloat32Value = function () {
        return this.DataViewRef.getFloat32(this.Index + this.Offset + 4);
    };
    Pointer.prototype.SetFloat32Value = function (Value) {
        this.DataViewRef.setFloat32(this.Index + this.Offset + 4, Value);
    };
    Pointer.prototype.GetFloat64Value = function () {
        return this.DataViewRef.getFloat64(this.Index + this.Offset + 4);
    };
    Pointer.prototype.SetFloat64Value = function (Value) {
        this.DataViewRef.setFloat64(this.Index + this.Offset + 4, Value);
    };
    Pointer.prototype.GetPointerValue = function () {
        return this.GetPointerValueOffset(0);
    };
    Pointer.prototype.SetPointerValue = function (Value) {
        this.SetPointerValueOffset(0, Value);
    };
    Pointer.prototype.Add = function (n) {
        return new Pointer(this.MemoryBlockRef, this.Offset + n);
    };
    return Pointer;
})();
var Greeter = (function () {
    function Greeter(element) {
        this.element = element;
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.mem = new Memory(1024, 1024);
    }
    Greeter.prototype.println = function (text) {
        this.span.innerText += text.toString() + "\n";
    };
    Greeter.prototype.start = function () {
        var intPtr = this.mem.AllocaHeap(4);
        intPtr.SetInt32Value(12345678);
        this.println(intPtr.GetInt32Value());
        var intPtrPtr = this.mem.AllocaHeap(8);
        intPtrPtr.SetPointerValue(intPtr);
        this.println(intPtrPtr.GetPointerValue().GetInt32Value());
        var charPtr = this.mem.AllocaHeap(1);
        charPtr.SetInt8Value(1.2);
        this.println(charPtr.GetInt8Value());
    };
    return Greeter;
})();
window.onload = function () {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    greeter.start();
};
//@ sourceMappingURL=app.js.map
