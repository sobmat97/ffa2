// src/elo.js

/**
 * Oblicza oczekiwany wynik A przeciwko B
 * @param {number} rA rating A
 * @param {number} rB rating B
 * @returns {number} oczekiwany wynik (0..1)
 */
export function expectedScore(rA, rB) {
    return 1 / (1 + Math.pow(10, (rB - rA) / 400));
  }
  
  /**
   * Aktualizuje ratingi A i B po pojedynku
   * @param {number} rA rating gracza A
   * @param {number} rB rating gracza B
   * @param {number} scoreA rzeczywisty wynik A (1/0.5/0)
   * @param {number} K współczynnik K (np. 32)
   * @returns {[number, number]} nowe ratingi [rA', rB']
   */
  export function updateRatings(rA, rB, scoreA, K = 32) {
    const E_A = expectedScore(rA, rB);
    const E_B = 1 - E_A;
    const scoreB = 1 - scoreA;
    const newRA = Math.round(rA + K * (scoreA - E_A));
    const newRB = Math.round(rB + K * (scoreB - E_B));
    return [newRA, newRB];
  }
  