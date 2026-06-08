const { httpError } = require('../utils/httpError');

async function getAddressByCep(req, res, next) {
  try {
    const cleanCep = String(req.params.cep || '').replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      throw httpError(404, 'CEP não encontrado', 'CEP_NOT_FOUND');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

    if (!response.ok) {
      throw httpError(404, 'CEP não encontrado', 'CEP_NOT_FOUND');
    }

    const address = await response.json();

    if (address.erro) {
      throw httpError(404, 'CEP não encontrado', 'CEP_NOT_FOUND');
    }

    res.json({
      cep: address.cep,
      logradouro: address.logradouro || '',
      bairro: address.bairro || '',
      localidade: address.localidade || '',
      uf: address.uf || '',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAddressByCep };
