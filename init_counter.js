import('mysql2/promise').then(async (mysql2) => {
  const mysql = mysql2.default;
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '@Carcasona041705',
      database: 'poink_database'
    });
    
    // Check if weight_id_counter exists
    const [tables] = await conn.execute('SHOW TABLES LIKE "weight_id_counter"');
    if (tables.length === 0) {
      console.log('Creating weight_id_counter table...');
      await conn.execute(`CREATE TABLE IF NOT EXISTS weight_id_counter (
        counter_id INT PRIMARY KEY DEFAULT 1,
        next_id INT DEFAULT 1
      )`);
      await conn.execute('INSERT INTO weight_id_counter (counter_id, next_id) VALUES (1, 1)');
      console.log('Table created successfully');
    }
    
    const [counter] = await conn.execute('SELECT * FROM weight_id_counter');
    console.log('Counter table:', JSON.stringify(counter, null, 2));
    
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}).catch(err => { console.error('Import error:', err); process.exit(1); })
