const { httpError } = require('../utils/httpError');
const { getLocalAddressByCep } = require('../data/localCep');

async function getAddressByCep(req, res, next) {
  try {
    const cleanCep = String(req.params.cep || '').replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      throw httpError(404, 'CEP não encontrado', 'CEP_NOT_FOUND');
    }

    let address = null;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      address = response.ok ? await response.json() : null;
    } catch {
      address = null;
    }

    if (!address || address.erro) {
      address = getLocalAddressByCep(cleanCep);
    }

    if (!address || address.erro) {
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
