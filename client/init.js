// IIFE om de game te starten
(async function () {
    const game = await new Game();
    await game.init();
})();