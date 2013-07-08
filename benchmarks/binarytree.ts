/// <reference path="../memory.ts" />

class BinaryTreeTester extends Tester {

    start() {
        this.exexute("binarytreeA", this.binarytreeA);
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

};
