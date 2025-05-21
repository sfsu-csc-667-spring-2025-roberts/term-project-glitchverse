import { MigrationBuilder } from "node-pg-migrate";

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("game_users", {
    game_id: {
      type: "integer",
      notNull: true,
      references: "games",
      onDelete: "CASCADE",
    },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    seat: {
      type: "serial",
    },
    is_current: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });

  pgm.sql(
    "INSERT INTO users (id, email, password) VALUES (0, 'deck@skipbo.com', '6X-@sKGi34itlT}o##E~5hRF@A7e:^Vr8*qW>7#6*&:e/ymN[{)DEw-P[Y2!=')",
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("game_users");
}
