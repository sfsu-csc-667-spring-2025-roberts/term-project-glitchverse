import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("users", {
    id: "id",
    email: {
      type: "varchar(100)",
      notNull: true,
      unique: true,
    },
    password: {
      type: "varchar(100)",
      notNull: true,
    },
    username: {
      type: "varchar(50)",
      notNull: false,
      default: null,
    },
    avatar_url: {
      type: "varchar(255)",
      notNull: false,
      default: null, // If null, use gravatar
    },
    games_played: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    games_won: {
      type: "integer",
      notNull: true,
      default: 0,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("users");
}
