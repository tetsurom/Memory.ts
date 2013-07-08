var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../memory.ts" />
var BinaryTreeTester = (function (_super) {
    __extends(BinaryTreeTester, _super);
    function BinaryTreeTester() {
        _super.apply(this, arguments);
    }
    BinaryTreeTester.prototype.start = function () {
        this.exexute("binarytreeA", this.binarytreeA);
    };

    //---------------------------------------------------------------------------------------
    // binarytree.c
    //---------------------------------------------------------------------------------------
    BinaryTreeTester.prototype.binarytreeA = function () {
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
        var NewTreeNode = function (left, right, item) {
            var node;

            node = __Memory.AllocHeap(20);

            node.SetPointerValue(left);
            node.SetPointerValueOffset(8, right);
            node.SetInt32ValueOffset(16, item);

            // node-> left = left;
            // node-> right = right;
            // node-> item = item;
            return node;
        };

        function ItemCheck(tree) {
            if (tree.GetPointerValue() === null) {
                return tree.GetInt32ValueOffset(16);
            }
            return tree.GetInt32ValueOffset(16) + ItemCheck(tree.GetPointerValue()) - ItemCheck(tree.GetPointerValueOffset(8));
        }

        function BottomUpTree(item, depth) {
            if (depth > 0) {
                return NewTreeNode(BottomUpTree(2 * item - 1, depth - 1), BottomUpTree(2 * item, depth - 1), item);
            }
            return NewTreeNode(null, null, item);
        }

        function DeleteTree(tree) {
            if (tree.GetPointerValue() !== null) {
                DeleteTree(tree.GetPointerValue());
                DeleteTree(tree.GetPointerValueOffset(8));
            }

            __Memory.Free(tree);
        }

        function main(argc, argv) {
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
            printf("stretch tree of depth %u\t check: %d\n", stretchDepth, ItemCheck(stretchTree));

            DeleteTree(stretchTree);

            var longLivedTree = BottomUpTree(0, maxDepth);

            for (depth = minDepth; depth <= maxDepth; depth += 2) {
                var i, iterations, check;

                iterations = Math.pow(2, maxDepth - depth + minDepth);

                check = 0;

                for (i = 1; i <= iterations; i++) {
                    var tempTree = BottomUpTree(i, depth);
                    check += ItemCheck(tempTree);
                    DeleteTree(tempTree);

                    tempTree = BottomUpTree(-i, depth);
                    check += ItemCheck(tempTree);
                    DeleteTree(tempTree);
                }

                printf("%d\t trees of depth %u\t check: %d\n", iterations * 2, depth, check);
            }

            printf("long lived tree of depth %u\t check: %d\n", maxDepth, ItemCheck(longLivedTree));

            return 0;
        }

        var args = __Memory.AllocStack(16);

        var num = __Memory.AllocStack(20);

        num.SetCStringValueOffset(0, "10");
        args.SetPointerValueOffset(8, num);

        main(2, args);
    };
    return BinaryTreeTester;
})(Tester);
;
//@ sourceMappingURL=binarytree.js.map
