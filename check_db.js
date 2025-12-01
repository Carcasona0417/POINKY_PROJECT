import mysql from 'mysql2/promise';

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '@Carcasona041705',
      database: 'poink_database'
    });
    
    console.log('\n=== FARMS ===');
    const [farms] = await connection.execute('SELECT FarmID, FarmName FROM farm LIMIT 10');
    console.log('Farms found:', farms.length);
    farms.forEach(f => console.log(`  - ${f.FarmID}: ${f.FarmName}`));
    
    console.log('\n=== PIGS ===');
    const [pigs] = await connection.execute('SELECT PigID, PigName, Breed, FarmID, Weight FROM pig LIMIT 20');
    console.log('Pigs found:', pigs.length);
    pigs.forEach(p => console.log(`  - ${p.PigID}: ${p.PigName} (${p.Breed}) - Farm: ${p.FarmID} - Weight: ${p.Weight}kg`));
    
    console.log('\n=== WEIGHT RECORDS ===');
    const [weights] = await connection.execute('SELECT COUNT(*) as count FROM weight_records');
    console.log('Weight records found:', weights[0].count);
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
