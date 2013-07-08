var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../memory.ts" />
var FannkuchreduxTester = (function (_super) {
    __extends(FannkuchreduxTester, _super);
    function FannkuchreduxTester() {
        _super.apply(this, arguments);
    }
    FannkuchreduxTester.prototype.start = function () {
        this.exexute("fannkuchredux", this.fannkuchreduxA);
    };

    //---------------------------------------------------------------------------------------
    // fannkuchredux.c
    //---------------------------------------------------------------------------------------
    FannkuchreduxTester.prototype.fannkuchreduxA = function () {
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

        function flip() {
            var i;
            var x, y, c;

            for (x = t, y = s, i = max_n; i--; ) {
                //* x++ = * y++;
                x.SetInt32Value(y.GetInt32Value());
                x = x.Add(4);
                y = y.Add(4);
            }
            i = 1;
            do {
                for (x = t, y = t.Add(t.GetInt32Value() * 4); x.Offset < y.Offset; ) {
                    //c = * x, * x++ = * y, * y-- = c;
                    c = x.GetInt32Value();
                    x.SetInt32Value((y.GetInt32Value()));
                    x = x.Add(4);
                    y.SetInt32Value(c);
                    y = y.Add(-4);
                }
                i++;
            } while(t.GetInt32ValueOffset(t.GetInt32Value()) != 0);
            return i;
        }

        function rotate(n) {
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
        function tk(n) {
            var __stacktop = __Memory.GetStackTop();
            var i = 0, f;

            //int c[16] = { 0 };
            var c = __Memory.AllocStack(4 * 16);
            for (var k = 0; k < 16; ++k) {
                c.SetInt32ValueOffset(k * 4, 0);
            }

            while (i < n) {
                rotate(i);
                if (c.GetInt32ValueOffset(i) >= i) {
                    c.SetInt32ValueOffset(i++, 0);
                    continue;
                }

                c.InclInt32ValueOffset(i);
                i = 1;
                odd = ~odd;
                if (s.GetInt32Value() != 0) {
                    f = (s.GetInt32ValueOffset(s.GetInt32Value()) != 0) ? flip() : 1;
                    if (f > maxflips) {
                        maxflips = f;
                    }
                    checksum += odd ? -f : f;
                }
            }
            __Memory.SetStackTop(__stacktop);
        }

        function main(argc, v) {
            if (argc < 2) {
                printf("usage: %s number\n", v.GetPointerValue());
                return 1;
            }

            max_n = atol(v.GetPointerValueOffset(8));
            if (max_n < 3 || max_n > 15) {
                printf("range: must be 3 <= n <= 12\n");
                return 1;
            }

            for (var i = 0; i < max_n; i++) {
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
    };
    return FannkuchreduxTester;
})(Tester);
//@ sourceMappingURL=fannkuchredux.js.map
