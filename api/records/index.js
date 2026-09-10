const { auth, sb } = require('../_lib');

module.exports = async (req, res) => {

  // =========================
  // GET RECORDS
  // =========================
  if (req.method === 'GET') {
    if (!auth(req, res)) return;

    try {
      const MAX_RECORDS = 10000;
      const BATCH_SIZE = 1000;

      let allRows = [];

      for (let start = 0; start < MAX_RECORDS; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE - 1, MAX_RECORDS - 1);

        const r = await sb(
          'mdrrmo_records?select=data&order=created_at.desc',
          {
            headers: {
              Range: `${start}-${end}`
            }
          }
        );

        if (!r.ok) {
          const errorText = await r.text();
          console.error('Supabase error:', r.status, errorText);

          return res.status(r.status).send(errorText);
        }

        const rows = await r.json();

        if (!Array.isArray(rows)) {
          break;
        }

        allRows.push(...rows);

        // No more records available
        if (rows.length < BATCH_SIZE) {
          break;
        }
      }

      return res.json(
        allRows
          .slice(0, MAX_RECORDS)
          .map(row => row.data)
      );

    } catch (error) {
      console.error('Records API error:', error);

      return res.status(500).json({
        error: 'Unable to load records.',
        details: error.message
      });
    }
  }


  // =========================
  // ADD RECORD
  // =========================
  if (req.method === 'POST') {
    if (!auth(req, res, true)) return;

    try {
      const d = req.body || {};

      const r = await sb(
        'mdrrmo_records',
        {
          method: 'POST',
          headers: {
            Prefer: 'return=representation'
          },
          body: JSON.stringify({
            id: String(d.id),
            data: d
          })
        }
      );

      if (!r.ok) {
        return res.status(r.status).send(await r.text());
      }

      const row = (await r.json())[0];

      return res.status(201).json(row.data);

    } catch (error) {
      console.error('Create record error:', error);

      return res.status(500).json({
        error: 'Unable to save record.',
        details: error.message
      });
    }
  }


  // =========================
  // DELETE RECORDS
  // =========================
  if (req.method === 'DELETE') {
    if (!auth(req, res, true)) return;

    try {
      const ids = Array.isArray(req.body?.ids)
        ? req.body.ids.map(x => String(x)).filter(Boolean)
        : [];

      if (!ids.length) {
        return res.status(400).json({
          error: 'No record IDs supplied.'
        });
      }

      const filter = 'in.(' + ids.join(',') + ')';

      const r = await sb(
        'mdrrmo_records?id=' + encodeURIComponent(filter),
        {
          method: 'DELETE'
        }
      );

      if (!r.ok) {
        return res.status(r.status).send(await r.text());
      }

      return res.json({
        ok: true,
        ids
      });

    } catch (error) {
      console.error('Delete record error:', error);

      return res.status(500).json({
        error: 'Unable to delete records.',
        details: error.message
      });
    }
  }


  return res.status(405).end();
};
