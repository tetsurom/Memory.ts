var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../memory.ts" />
var SpectralnormTester = (function (_super) {
    __extends(SpectralnormTester, _super);
    function SpectralnormTester() {
        _super.apply(this, arguments);
    }
    SpectralnormTester.prototype.start = function () {
        this.exexute("SpectralnormA", this.spectralnormA);
    };

    //---------------------------------------------------------------------------------------
    // spectralnorm.c
    //---------------------------------------------------------------------------------------
    SpectralnormTester.prototype.spectralnormA = function () {
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
        function A(i, j) {
            return (((i + j) * (i + j + 1) / 2) | 0 + i + 1);
        }

        function dot(v, u, n) {
            var i;
            var sum = 0;
            for (i = 0; i < n; i++)
                sum += v.GetFloat64ValueOffset(i) * u.GetFloat64ValueOffset(i);
            return sum;
        }

        function mult_Av(v, out, n) {
            var i, j;
            var sum;
            for (i = 0; i < n; i++) {
                for (sum = j = 0; j < n; j++) {
                    sum += v.GetFloat64ValueOffset(j) / A(i, j);
                }
                out.SetFloat64ValueOffset(i, sum);
            }
        }

        function mult_Atv(v, out, n) {
            var i, j;
            var sum;
            for (i = 0; i < n; i++) {
                for (sum = j = 0; j < n; j++) {
                    sum += v.GetFloat64ValueOffset(j) / A(j, i);
                }
                out.SetFloat64ValueOffset(i, sum);
            }
        }

        var tmp;

        function mult_AtAv(v, out, n) {
            mult_Av(v, tmp, n);
            mult_Atv(tmp, out, n);
        }

        function main(argc, argv) {
            var n = atol(argv.GetPointerValueOffset(8));
            if (n <= 0)
                n = 2000;

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
    };
    return SpectralnormTester;
})(Tester);
//@ sourceMappingURL=spectralnorm.js.map
