const db = require('../db');

exports.getAllRooms = (req, res) => {
  db.all("SELECT * FROM rooms ORDER BY room_number ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ status: 'ERROR', message: err.message });
    res.json({ status: 'SUCCESS', rooms: rows });
  });
};

exports.updateRoomStatus = (req, res) => {
  const { status } = req.body;
  db.run("UPDATE rooms SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ status: 'ERROR', message: err.message });
    res.json({ status: 'SUCCESS' });
  });
};

exports.checkoutRoom = (req, res) => {
  db.serialize(() => {
    db.run("UPDATE rooms SET status = 'cleaning' WHERE id = ?", [req.params.id]);
    db.run("UPDATE reservations SET status = 'completed' WHERE room_id = ? AND status = 'active'", [req.params.id], (err) => {
      if (err) return res.status(500).json({ status: 'ERROR', message: err.message });
      res.json({ status: 'SUCCESS' });
    });
  });
};

exports.createReservation = (req, res) => {
  const { guest_name, guest_phone, room_id, total_amount, deposit_amount, payment_method, check_in, check_out } = req.body;
  db.serialize(() => {
    db.run(
      `INSERT INTO reservations (guest_name, guest_phone, room_id, total_amount, deposit_amount, payment_method, check_in, check_out, status) VALUES (?,?,?,?,?,?,?,?, 'active')`,
      [guest_name, guest_phone, room_id, total_amount, deposit_amount, payment_method, check_in, check_out]
    );
    db.run("UPDATE rooms SET status = 'occupied' WHERE id = ?", [room_id], (err) => {
      if (err) return res.status(500).json({ status: 'ERROR', message: err.message });
      res.json({ status: 'SUCCESS' });
    });
  });
};

exports.searchReservations = (req, res) => {
  const q = `%${req.query.q || ''}%`;
  db.all(
    `SELECT r.*, rm.room_number FROM reservations r LEFT JOIN rooms rm ON r.room_id = rm.id WHERE r.guest_name LIKE ? OR r.guest_phone LIKE ? ORDER BY r.id DESC`,
    [q, q],
    (err, rows) => {
      if (err) return res.status(500).json({ status: 'ERROR', message: err.message });
      res.json({ status: 'SUCCESS', reservations: rows });
    }
  );
};

exports.addService = (req, res) => {
  const { room_id, service_type, amount } = req.body;
  db.run("INSERT INTO services (room_id, service_type, amount) VALUES (?, ?, ?)", [room_id, service_type, amount], (err) => {
    if (err) return res.status(500).json({ status: 'ERROR', message: err.message });
    db.run("UPDATE reservations SET total_amount = total_amount + ? WHERE room_id = ? AND status = 'active'", [amount, room_id], () => {
      res.json({ status: 'SUCCESS' });
    });
  });
};

exports.getStocks = (req, res) => {
  db.all("SELECT * FROM stocks", [], (err, rows) => {
    if (err) return res.status(500).json({ status: 'ERROR', message: err.message });
    res.json({ status: 'SUCCESS', stocks: rows });
  });
};
// Afficher les chambres disponibles pour le site public (sans authentification requise)
exports.getPublicRooms = (req, res) => {
  db.all("SELECT id, room_number, room_type, status FROM rooms WHERE status = 'available'", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'ERROR', message: err.message });
    }
    res.json({ status: 'SUCCESS', rooms: rows });
  });
};
exports.getStats = (req, res) => {
  db.serialize(() => {
    db.get(`SELECT SUM(total_amount) as rev FROM reservations WHERE status != 'cancelled'`, (err, rowRev) => {
      db.get(`SELECT COUNT(*) as total, SUM(CASE WHEN status='occupied' THEN 1 ELSE 0 END) as occ FROM rooms`, (err, rowRoom) => {
        db.get(`SELECT SUM(total_amount - deposit_amount) as pending FROM reservations WHERE status='active'`, (err, rowPend) => {
          const daily_revenue = rowRev?.rev || 0;
          const occupancy_rate = rowRoom?.total > 0 ? Math.round((rowRoom.occ / rowRoom.total) * 100) : 0;
          const free_rooms = (rowRoom?.total || 0) - (rowRoom?.occ || 0);
          const pending_payments = rowPend?.pending || 0;

          const weekly_stats = [
            { day: 'Lun', total: daily_revenue * 0.1 },
            { day: 'Mar', total: daily_revenue * 0.15 },
            { day: 'Mer', total: daily_revenue * 0.12 },
            { day: 'Jeu', total: daily_revenue * 0.18 },
            { day: 'Ven', total: daily_revenue * 0.2 },
            { day: 'Sam', total: daily_revenue * 0.15 },
            { day: 'Dim', total: daily_revenue * 0.1 }
          ];

          db.all(`SELECT payment_method, SUM(deposit_amount) as total FROM reservations GROUP BY payment_method`, [], (err, payRows) => {
            const payment_breakdown = {};
            payRows?.forEach(p => { payment_breakdown[p.payment_method] = p.total; });

            res.json({
              status: 'SUCCESS',
              daily_revenue,
              occupancy_rate,
              free_rooms,
              pending_payments,
              weekly_stats,
              payment_breakdown
            });
          });
        });
      });
    });
  });
};