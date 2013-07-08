/// <reference path="../memory.ts" />

class NBodyTester extends Tester {

    start() {
        this.exexute("NBodyA", this.NBodyA);
    }


    //---------------------------------------------------------------------------------------
    // nbody.c
    //---------------------------------------------------------------------------------------

    NBodyA() {
        /* The Computer Language Benchmarks Game
        * http://benchmarksgame.alioth.debian.org/
        *
        * contributed by Christoph Bauer
        *
        */

        //#include <math.h>
        //#include <stdio.h>
        //#include <stdlib.h>

        var pi = 3.141592653589793;
        var solar_mass = (4 * pi * pi);
        var days_per_year = 365.24;
/*
        struct planet {
            double x, y, z;    : 0, 8, 16,
            double vx, vy, vz; : 24, 32, 40
            double mass;       : 48
        };
*/
        var planet_offsets = {x: 0, y: 8, z: 16, vx: 24, vy: 32, vz: 40, mass: 48};
        var sizeof_planet = 56;

        function advance(nbodies: number, bodies: Pointer, dt: number): void{
            var i: number, j: number;

            for (i = 0; i < nbodies; i++) {
                var b = bodies.Add(i*sizeof_planet);
                for (j = i +1; j < nbodies; j++) {
                    var b2 = bodies.Add(j*sizeof_planet);
                    var dx = b.GetFloat64ValueOffset(planet_offsets.x) - b2.GetFloat64ValueOffset(planet_offsets.x);
                    var dy = b.GetFloat64ValueOffset(planet_offsets.y) - b2.GetFloat64ValueOffset(planet_offsets.y);
                    var dz = b.GetFloat64ValueOffset(planet_offsets.z) - b2.GetFloat64ValueOffset(planet_offsets.z);
                    var distance = Math.sqrt(dx * dx +dy * dy +dz * dz);
                    var mag = dt / (distance * distance * distance);
                    b.SetFloat64ValueOffset(planet_offsets.vx, b.GetFloat64ValueOffset(planet_offsets.vx) - dx * b2.GetFloat64ValueOffset(planet_offsets.mass) * mag);
                    b.SetFloat64ValueOffset(planet_offsets.vy, b.GetFloat64ValueOffset(planet_offsets.vy) - dy * b2.GetFloat64ValueOffset(planet_offsets.mass) * mag);
                    b.SetFloat64ValueOffset(planet_offsets.vz, b.GetFloat64ValueOffset(planet_offsets.vz) - dz * b2.GetFloat64ValueOffset(planet_offsets.mass) * mag);
                    b2.SetFloat64ValueOffset(planet_offsets.vx, b2.GetFloat64ValueOffset(planet_offsets.vx) + dx * b.GetFloat64ValueOffset(planet_offsets.mass) * mag);
                    b2.SetFloat64ValueOffset(planet_offsets.vy, b2.GetFloat64ValueOffset(planet_offsets.vy) + dy * b.GetFloat64ValueOffset(planet_offsets.mass) * mag);
                    b2.SetFloat64ValueOffset(planet_offsets.vz, b2.GetFloat64ValueOffset(planet_offsets.vz) + dz * b.GetFloat64ValueOffset(planet_offsets.mass) * mag);
                }
               }
            for (i = 0; i < nbodies; i++) {
                var b = bodies.Add(i*sizeof_planet);
                b2.SetFloat64ValueOffset(planet_offsets.x, b2.GetFloat64ValueOffset(planet_offsets.x) + dt * b.GetFloat64ValueOffset(planet_offsets.vx));
                b2.SetFloat64ValueOffset(planet_offsets.y, b2.GetFloat64ValueOffset(planet_offsets.y) + dt * b.GetFloat64ValueOffset(planet_offsets.vy));
                b2.SetFloat64ValueOffset(planet_offsets.z, b2.GetFloat64ValueOffset(planet_offsets.z) + dt * b.GetFloat64ValueOffset(planet_offsets.vz));
            }
        }

        function energy(nbodies: number, bodies: Pointer): number {
            var e: number;
            var i: number, j: number;

            e = 0.0;
            for (i = 0; i < nbodies; i++) {
                var b = bodies.Add(i*sizeof_planet);
                e += 0.5 * b.GetFloat64ValueOffset(planet_offsets.mass) *
                    (b.GetFloat64ValueOffset(planet_offsets.vx) * b.GetFloat64ValueOffset(planet_offsets.vx) +
                    b.GetFloat64ValueOffset(planet_offsets.vy) * b.GetFloat64ValueOffset(planet_offsets.vy) +
                    b.GetFloat64ValueOffset(planet_offsets.vz) * b.GetFloat64ValueOffset(planet_offsets.vz));
                for (j = i +1; j < nbodies; j++) {
                    var b2 = bodies.Add(j*sizeof_planet);
                    var dx = b.GetFloat64ValueOffset(planet_offsets.x) -b2.GetFloat64ValueOffset(planet_offsets.x);
                    var dy = b.GetFloat64ValueOffset(planet_offsets.y) -b2.GetFloat64ValueOffset(planet_offsets.y);
                    var dz = b.GetFloat64ValueOffset(planet_offsets.z) -b2.GetFloat64ValueOffset(planet_offsets.z);
                    var distance = Math.sqrt(dx * dx +dy * dy +dz * dz);
                    e -= (b.GetFloat64ValueOffset(planet_offsets.mass) * b2.GetFloat64ValueOffset(planet_offsets.mass)) / distance;
                }
            }
            return e;
        }

        function offset_momentum(nbodies: number, bodies: Pointer): void {
            var px = 0.0, py = 0.0, pz = 0.0;
            for (var i = 0; i < nbodies; i++) {
                var b = bodies.Add(i*sizeof_planet);
                px += b.GetFloat64ValueOffset(planet_offsets.vx) * b.GetFloat64ValueOffset(planet_offsets.mass);
                py += b.GetFloat64ValueOffset(planet_offsets.vy) * b.GetFloat64ValueOffset(planet_offsets.mass);
                pz += b.GetFloat64ValueOffset(planet_offsets.vz) * b.GetFloat64ValueOffset(planet_offsets.mass);
            }
            bodies.SetFloat64ValueOffset(planet_offsets.vx, -px / solar_mass);
            bodies.SetFloat64ValueOffset(planet_offsets.vy, -py / solar_mass);
            bodies.SetFloat64ValueOffset(planet_offsets.vz, -pz / solar_mass);
        }

        var NBODIES = 5;
        var bodies = __Memory.AllocHeap(NBODIES * sizeof_planet);
        bodies.SetFloat64ArrayOffset(0, [0, 0, 0, 0, 0, 0, solar_mass]); /* sun */
        bodies.SetFloat64ArrayOffset(1 * sizeof_planet, [ /* jupiter */
            4.84143144246472090e+00,
            -1.16032004402742839e+00,
            -1.03622044471123109e-01,
            1.66007664274403694e-03 * days_per_year,
            7.69901118419740425e-03 * days_per_year,
            -6.90460016972063023e-05 * days_per_year,
            9.54791938424326609e-04 * solar_mass
        ]);
        bodies.SetFloat64ArrayOffset(2 * sizeof_planet, [ /* saturn */
            8.34336671824457987e+00,
            4.12479856412430479e+00,
            -4.03523417114321381e-01,
            -2.76742510726862411e-03 * days_per_year,
            4.99852801234917238e-03 * days_per_year,
            2.30417297573763929e-05 * days_per_year,
            2.85885980666130812e-04 * solar_mass
        ]);
        bodies.SetFloat64ArrayOffset(3 * sizeof_planet, [ /* uranus */
            1.28943695621391310e+01,
            -1.51111514016986312e+01,
            -2.23307578892655734e-01,
            2.96460137564761618e-03 * days_per_year,
            2.37847173959480950e-03 * days_per_year,
            -2.96589568540237556e-05 * days_per_year,
            4.36624404335156298e-05 * solar_mass
        ]);
        bodies.SetFloat64ArrayOffset(4 * sizeof_planet, [ /* neptune */
            1.53796971148509165e+01,
            -2.59193146099879641e+01,
            1.79258772950371181e-01,
            2.68067772490389322e-03 * days_per_year,
            1.62824170038242295e-03 * days_per_year,
            -9.51592254519715870e-05 * days_per_year,
            5.15138902046611451e-05 * solar_mass
        ]);

        function main(argc: number, argv: Pointer): number {
            var n = atol(argv.GetPointerValueOffset(8));

            offset_momentum(NBODIES, bodies);
            printf ("%.9f\n", energy(NBODIES, bodies));
            for (var i = 1; i <= n; i++) {
                advance(NBODIES, bodies, 0.01);
            }
            printf ("%.9f\n", energy(NBODIES, bodies));
            return 0;
        }

        var args = __Memory.AllocStack(16);

        var num = __Memory.AllocStack(20);

        num.SetCStringValueOffset(0, "20000");
        args.SetPointerValueOffset(8, num);

        main(2, args);
    }
}
