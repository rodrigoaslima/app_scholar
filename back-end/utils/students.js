async function createStudentProfile(db, { usuarioId, curso, telefone, cep, endereco, cidade, estado }) {
  const result = await db.run(
    `INSERT INTO alunos
      (usuario_id, matricula, curso, telefone, cep, endereco, cidade, estado)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    usuarioId,
    `pendente-${usuarioId}`,
    curso,
    telefone || '',
    cep || '',
    endereco || '',
    cidade || '',
    estado || ''
  );

  await db.run('UPDATE alunos SET matricula = ? WHERE id = ?', String(result.lastID), result.lastID);

  return result.lastID;
}

module.exports = { createStudentProfile };
