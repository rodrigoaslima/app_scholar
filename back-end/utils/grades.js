function calculateAverage(nota1, nota2) {
  return Number(((Number(nota1) + Number(nota2)) / 2).toFixed(1));
}

function getSituation(media) {
  if (media >= 7) {
    return 'Aprovado';
  }

  if (media >= 5) {
    return 'Recuperacao';
  }

  return 'Reprovado';
}

module.exports = { calculateAverage, getSituation };
