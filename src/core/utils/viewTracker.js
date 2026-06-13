'use strict';

/**
 * View Tracker — تتبع مشاهدات الفصول بالـ session
 *
 * بيستخدم Map في الذاكرة (In-Memory) عشان يعرف مين شاف إيه
 * Key:   `${sessionId}:${chapterId}`
 * Value: timestamp اللي شافه فيه
 *
 * القاعدة: نفس الجهاز لا يُحسب أكتر من مرة في 24 ساعة لنفس الفصل
 */

const TTL_MS = 24 * 60 * 60 * 1000; // 24 ساعة بالميلي ثانية

/** @type {Map<string, number>} */
const store = new Map();

// ─── تنظيف تلقائي كل ساعة لمنع تراكم البيانات في الذاكرة ──────────────────
setInterval(() => {
  const now = Date.now();
  let deleted = 0;
  for (const [key, ts] of store.entries()) {
    if (now - ts > TTL_MS) {
      store.delete(key);
      deleted++;
    }
  }
  if (deleted > 0) {
    console.log(`[ViewTracker] تم مسح ${deleted} سجل قديم`);
  }
}, 60 * 60 * 1000).unref(); // unref() عشان ما يمنعش السيرفر من الإقفال لو محتاج

/**
 * بيقرر هل نعد المشاهدة دي ولا لا
 *
 * @param {string|undefined} sessionId  — الـ ID الجاي من الفرونت
 * @param {string}           chapterId  — معرف الفصل
 * @returns {boolean} true = نعد المشاهدة | false = نتجاهلها
 */
const shouldCount = (sessionId, chapterId) => {
  // لو مفيش session_id — نعد دايماً (مش هنعاقب الزوار اللي ماعندهمش)
  if (!sessionId) return true;

  const key = `${sessionId}:${chapterId}`;
  const lastSeen = store.get(key);
  const now = Date.now();

  // لو ماشافهاش قبل كده أو فات أكتر من 24 ساعة
  if (!lastSeen || now - lastSeen > TTL_MS) {
    store.set(key, now);
    return true;   // ← نعد المشاهدة
  }

  return false;    // ← نتجاهلها
};

/**
 * للتشخيص فقط — بيرجع عدد السجلات الموجودة في الذاكرة
 */
const getStoreSize = () => store.size;

module.exports = { shouldCount, getStoreSize };
