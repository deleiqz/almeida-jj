const individualS = {
  evolucao: { mensal: 189, trimestral: 537, semestral: 1014, anual: 1919 },
  performance: { mensal: 229, trimestral: 651, semestral: 1230, anual: 2316 }
};

function calculateFamilyPrice(basePrice, numPeople) {
  const discount = numPeople * 0.05;
  return Math.floor((basePrice * numPeople) * (1 - discount));
}

console.log("| Membros | Plano | Estilo | Total Família | Desc % |");
console.log("|---------|-------|--------|---------------|--------|");

[2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(n => {
  ['evolucao', 'performance'].forEach(estilo => {
    ['mensal', 'anual'].forEach(plano => {
      const base = individualS[estilo][plano];
      const total = calculateFamilyPrice(base, n);
      const desc = n * 5;
      console.log(`| ${n} | ${plano.toUpperCase()} | ${estilo.toUpperCase()} | R$ ${total},00 | ${desc}% |`);
    });
  });
});
