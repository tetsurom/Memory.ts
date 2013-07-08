/// <reference path="../memory.ts" />

class FannkuchreduxTester extends Tester {
    start() {
        this.exexute("fannkuchredux", this.fannkuchreduxA);
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
                for (x = t, y = t.Add(t.GetInt32Value() * 4); x.Offset < y.Offset;) {
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
            var i = 0, f: number;
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
    }

}
