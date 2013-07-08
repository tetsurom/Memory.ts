/// <reference path="memory.ts" />
/// <reference path="benchmarks/nbody.ts" />
/// <reference path="benchmarks/fannkuchredux.ts" />
window.onload = function () {
    var el = document.getElementById('content');
    var tester = new FannkuchreduxTester(el);
    tester.start();
};
//@ sourceMappingURL=main.js.map
