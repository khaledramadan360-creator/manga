'use strict';

/**
 * سكربت الهجرة — بيشتغل مرة واحدة بس
 * بيمشي على كل المانجا الموجودة في الداتا بيز اللي مالهاش slug ويولدلها واحد فريد
 *
 * طريقة التشغيل:
 *   node src/core/scripts/migrate-slugs.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const env = require('../config/env');
const { slugify, uniqueSlug } = require('../utils/slugify');

// ─── اتصال مباشر بالداتا بيز ──────────────────────────────────────────────────
const sequelize = new Sequelize(env.db.name, env.db.user, env.db.pass, {
  host: env.db.host,
  port: env.db.port,
  dialect: env.db.dialect,
  logging: false,
  dialectOptions: process.env.DB_SSL === 'true' ? {
    ssl: { rejectUnauthorized: false },
  } : {},
});

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ متصل بالداتا بيز\n');

    // جلب كل المانجا اللي مالهاش slug
    const [mangas] = await sequelize.query(
      'SELECT id, title FROM manga WHERE slug IS NULL ORDER BY created_at ASC'
    );

    if (mangas.length === 0) {
      console.log('✅ كل المانجا عندها slug بالفعل — مفيش حاجة للتحديث.');
      process.exit(0);
    }

    console.log(`📋 هيتم تحديث ${mangas.length} مانجا بالـ Slug...\n`);

    // الـ slugs المستخدمة في نفس الـ session دي (عشان نتجنب التعارض)
    const usedInSession = new Set();

    // التحقق من وجود slug في الداتا بيز أو في الـ session الحالي
    const slugExists = async (slug) => {
      if (usedInSession.has(slug)) return true;
      const [[{ count }]] = await sequelize.query(
        'SELECT COUNT(*) as count FROM manga WHERE slug = ?',
        { replacements: [slug] }
      );
      return parseInt(count, 10) > 0;
    };

    let successCount = 0;
    let failCount = 0;

    for (const manga of mangas) {
      try {
        const base = slugify(manga.title);

        if (!base) {
          console.warn(`⚠️  [SKIP] "${manga.title}" — الـ title مش هيولد slug صالح`);
          failCount++;
          continue;
        }

        const slug = await uniqueSlug(base, slugExists);
        usedInSession.add(slug);

        await sequelize.query(
          'UPDATE manga SET slug = ? WHERE id = ?',
          { replacements: [slug, manga.id] }
        );

        console.log(`✅ "${manga.title}" => "${slug}"`);
        successCount++;
      } catch (err) {
        console.error(`❌ فشل تحديث "${manga.title}":`, err.message);
        failCount++;
      }
    }

    console.log(`\n🎉 انتهى السكربت!`);
    console.log(`   ✅ تم تحديث: ${successCount}`);
    console.log(`   ❌ فشل:      ${failCount}`);
  } catch (err) {
    console.error('❌ خطأ في الاتصال:', err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

run();
