const addressesByCep = {
  '01001000': {
    cep: '01001-000',
    logradouro: 'Praca da Se',
    bairro: 'Se',
    localidade: 'Sao Paulo',
    uf: 'SP',
  },
  '01310930': {
    cep: '01310-930',
    logradouro: 'Avenida Paulista',
    bairro: 'Bela Vista',
    localidade: 'Sao Paulo',
    uf: 'SP',
  },
  '20040002': {
    cep: '20040-002',
    logradouro: 'Rua Primeiro de Marco',
    bairro: 'Centro',
    localidade: 'Rio de Janeiro',
    uf: 'RJ',
  },
  '30140071': {
    cep: '30140-071',
    logradouro: 'Avenida Afonso Pena',
    bairro: 'Centro',
    localidade: 'Belo Horizonte',
    uf: 'MG',
  },
  '70040900': {
    cep: '70040-900',
    logradouro: 'Praca dos Tres Poderes',
    bairro: 'Zona Civico-Administrativa',
    localidade: 'Brasilia',
    uf: 'DF',
  },
};

function getLocalAddressByCep(cep) {
  return addressesByCep[cep] || null;
}

module.exports = { getLocalAddressByCep };
