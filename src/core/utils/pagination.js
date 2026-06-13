'use strict';

/**
 * بيبني metadata الـ pagination من query params
 * @param {object} query  - req.query
 * @param {number} total  - العدد الكلي من DB
 * @returns {{ limit: number, offset: number, meta: object }}
 */
const paginate = (query, total) => {
  const page  = Math.max(1, parseInt(query.page,  10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  const meta = {
    page,
    limit,
    total,
    totalPages,
  };

  return { limit, offset, meta };
};

module.exports = paginate;
