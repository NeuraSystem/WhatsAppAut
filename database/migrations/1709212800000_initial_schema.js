exports.up = (pgm) => {
  pgm.createTable("reparaciones", {
    id: "id",
    device: { type: "varchar(255)", notNull: true },
    service: { type: "varchar(255)", notNull: true },
    price: { type: "decimal(10, 2)", notNull: true },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("reparaciones", ["device", "service"], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable("reparaciones");
};
