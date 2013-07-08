/// <reference path="memory.ts" />
/// <reference path="benchmarks/nbody.ts" />

window.onload = () => {
    var el = document.getElementById('content');
    var tester = new NBodyTester(el);
    tester.start();
};
