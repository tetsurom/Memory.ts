/// <reference path="../memory.ts" />

class SpectralnormTester extends Tester {

    start() {
        this.exexute("SpectralnormA", this.spectralnormA);
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

        main(2, args);
    }


}