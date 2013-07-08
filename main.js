/// <reference path="memory.ts" />
/// <reference path="benchmarks/nbody.ts" />
window.onload = function () {
    var el = document.getElementById('content');
    var tester = new NBodyTester(el);
    tester.start();
};
//@ sourceMappingURL=main.js.map
