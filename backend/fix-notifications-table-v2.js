const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Script para arreglar la tabla notifications en producción
const dbPath = path.join(__dirname, 'spainrp.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('✅ Conectado a la base de datos');

    db.serialize(() => {
        // Verificar estructura actual
        db.all("PRAGMA table_info(notifications)", (err, columns) => {
            if (err) {
                console.error('Error obteniendo esquema de notifications:', err.message);
                return;
            }
            console.log('📋 Estructura actual de la tabla notifications:');
            columns.forEach(col => console.log(`  - ${col.name} (${col.type})`));

            const hasUserId = columns.some(col => col.name === 'userId');
            const hasPriority = columns.some(col => col.name === 'priority');
            const hasCreatedAt = columns.some(col => col.name === 'createdAt');

            console.log('\n🔍 Análisis:');
            console.log(`  - Tiene columna 'userId': ${hasUserId}`);
            console.log(`  - Tiene columna 'priority': ${hasPriority}`);
            console.log(`  - Tiene columna 'createdAt': ${hasCreatedAt}`);

            // Agregar columna priority si no existe
            if (!hasPriority) {
                console.log('➕ Añadiendo columna priority...');
                db.run("ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal'", (err) => {
                    if (err) console.error('Error añadiendo priority:', err.message);
                    else console.log('✅ Columna priority añadida.');
                    checkCreatedAt();
                });
            } else {
                checkCreatedAt();
            }

            function checkCreatedAt() {
                // Verificar si createdAt existe
                if (!hasCreatedAt) {
                    console.log('➕ Añadiendo columna createdAt...');
                    db.run("ALTER TABLE notifications ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP", (err) => {
                        if (err) console.error('Error añadiendo createdAt:', err.message);
                        else console.log('✅ Columna createdAt añadida.');
                        finalizeSchemaCheck();
                    });
                } else {
                    finalizeSchemaCheck();
                }
            }

            function finalizeSchemaCheck() {
                db.all("PRAGMA table_info(notifications)", (err, finalColumns) => {
                    if (err) {
                        console.error('Error obteniendo esquema final:', err.message);
                        return;
                    }
                    console.log('\n📋 Estructura final de la tabla notifications:');
                    finalColumns.forEach(col => console.log(`  - ${col.name} (${col.type})`));
                    console.log('\n✅ Proceso completado - La tabla notifications está lista');
                    db.close();
                });
            }
        });
    });
});
